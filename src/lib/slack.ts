import "server-only";

/**
 * お問い合わせを Slack へ流す。
 *
 * Incoming Webhook に POST するだけ。管理画面を開いていないときでも
 * 気づけるようにするための補助で、記録そのものは DB に残っている。
 * 送信に失敗しても問い合わせ自体は成立させたいので、この関数は投げない。
 */

export type ContactForSlack = {
  id: number;
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  service?: string | null;
  message: string;
  country?: string | null;
  countryCode?: string | null;
  city?: string | null;
  ip?: string | null;
  attachmentName?: string | null;
  attachmentUrl?: string | null;
  createdAt?: Date | string | null;
};

/**
 * ISO の 2 文字コードを旗の絵文字にする。管理画面と同じ見え方に揃える。
 * 各文字を「地域表示記号」へ移すと、2 文字の並びが旗として描画される。
 */
function flagOf(code: string | null | undefined): string {
  if (!code || !/^[A-Za-z]{2}$/.test(code)) return "";
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

/** 設定済みかどうか。未設定なら通知処理そのものを飛ばす。 */
export function isSlackConfigured(): boolean {
  return Boolean(process.env.SLACK_WEBHOOK_URL);
}

/** Slack の mrkdwn で意味を持つ文字を落とす。 */
function escape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * 本文。Slack のブロックは 3000 文字までなので、そこに収まる範囲で
 * できるだけ載せる。管理画面を開かずに読み切れるようにするため、
 * 見出しなどの前置き分を差し引いた 2800 文字を上限にする。
 */
function excerpt(text: string, max = 2800): string {
  const t = text.trim();
  return t.length > max
    ? `${t.slice(0, max)}\n…（長いため以降は管理画面でご確認ください）`
    : t;
}

/** 受信日時。Slack では読み手のタイムゾーンで出せる。 */
function receivedAt(at: Date | string | null | undefined): string {
  if (!at) return "";
  const d = at instanceof Date ? at : new Date(at);
  if (Number.isNaN(d.getTime())) return "";
  // <!date^...> は Slack が各自の地域時刻に直して表示してくれる。
  const unix = Math.floor(d.getTime() / 1000);
  return `<!date^${unix}^{date_num} {time}|${d.toISOString()}>`;
}

export async function notifyContact(row: ContactForSlack): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;

  // 管理画面への導線。環境変数が無ければ相対パスのままにして、
  // せめてどこを見ればよいかは伝える。
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  const adminUrl = `${base}/admin/contacts`;

  // 管理画面に出している項目はすべて載せる。Slack だけを見て判断できる
  // ようにするため、ログインしないと分からない情報を残さない。
  const who = [row.company, row.name].filter(Boolean).join(" / ");
  const where = [flagOf(row.countryCode), row.country, row.city]
    .filter(Boolean)
    .join(" ");

  const fields: { type: "mrkdwn"; text: string }[] = [
    { type: "mrkdwn", text: `*お名前*\n${escape(who || row.name)}` },
    // メールはそのまま押して返信できるようにする。
    {
      type: "mrkdwn",
      text: `*メール*\n<mailto:${row.email}|${escape(row.email)}>`,
    },
  ];
  if (row.phone) {
    fields.push({ type: "mrkdwn", text: `*電話*\n${escape(row.phone)}` });
  }
  if (row.service) {
    fields.push({
      type: "mrkdwn",
      text: `*ご相談内容*\n${escape(row.service)}`,
    });
  }
  if (where) {
    fields.push({ type: "mrkdwn", text: `*送信元*\n${escape(where)}` });
  }
  if (row.ip) {
    fields.push({
      type: "mrkdwn",
      text: `*IPアドレス*\n\`${escape(row.ip)}\``,
    });
  }
  const at = receivedAt(row.createdAt);
  if (at) {
    fields.push({ type: "mrkdwn", text: `*受信日時*\n${at}` });
  }

  const blocks: unknown[] = [
    {
      type: "header",
      text: { type: "plain_text", text: "新しいお問い合わせ", emoji: true },
    },
    // fields は 1 ブロックあたり 10 個まで。今は最大 7 個だが、項目が
    // 増えたときに黙って弾かれないよう明示して切る。
    { type: "section", fields: fields.slice(0, 10) },
    {
      type: "section",
      text: { type: "mrkdwn", text: `*内容*\n${escape(excerpt(row.message))}` },
    },
  ];

  if (row.attachmentUrl) {
    // 保存用は fl_attachment を挟む。そのままの URL では Slack から
    // 押したときにブラウザで開くだけになる。
    const download = row.attachmentUrl.includes("res.cloudinary.com")
      ? row.attachmentUrl.replace("/upload/", "/upload/fl_attachment/")
      : row.attachmentUrl;
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*添付*\n<${row.attachmentUrl}|${escape(row.attachmentName || "ファイル")}> ・ <${download}|ダウンロード>`,
      },
    });
  }

  blocks.push({
    type: "actions",
    elements: [
      {
        type: "button",
        text: { type: "plain_text", text: "管理画面で開く", emoji: true },
        url: adminUrl,
      },
    ],
  });

  // 一覧では省略されることがあるので、要点だけ末尾にも残す。
  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `受付番号 #${row.id}${where ? ` ・ ${escape(where)}` : ""}`,
      },
    ],
  });

  try {
    // 通知のために問い合わせ全体を待たせない。5秒で諦める。
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // 通知一覧やプレビューではこちらが出る。
        text: `新しいお問い合わせ：${who || row.name}様`,
        blocks,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error("slack notify failed", res.status, await res.text());
    }
  } catch (err) {
    console.error("slack notify error", err);
  }
}
