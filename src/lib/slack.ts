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
  city?: string | null;
  ip?: string | null;
  attachmentName?: string | null;
  attachmentUrl?: string | null;
};

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
 * 本文は長くなりうるので頭を切り出す。全文は管理画面で読む前提。
 * Slack のブロックは 3000 文字までという制限もある。
 */
function excerpt(text: string, max = 1500): string {
  const t = text.trim();
  return t.length > max ? `${t.slice(0, max)}…（以下略）` : t;
}

export async function notifyContact(row: ContactForSlack): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;

  // 管理画面への導線。環境変数が無ければ相対パスのままにして、
  // せめてどこを見ればよいかは伝える。
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  const adminUrl = `${base}/admin/contacts`;

  // 差出人と連絡先。埋まっている項目だけを並べる。
  const who = [row.company, row.name].filter(Boolean).join(" / ");
  const where = [row.country, row.city].filter(Boolean).join(" ");

  const fields: { type: "mrkdwn"; text: string }[] = [
    { type: "mrkdwn", text: `*お名前*\n${escape(who || row.name)}` },
    { type: "mrkdwn", text: `*メール*\n${escape(row.email)}` },
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

  const blocks: unknown[] = [
    {
      type: "header",
      text: { type: "plain_text", text: "新しいお問い合わせ", emoji: true },
    },
    { type: "section", fields },
    {
      type: "section",
      text: { type: "mrkdwn", text: `*内容*\n${escape(excerpt(row.message))}` },
    },
  ];

  if (row.attachmentUrl) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*添付* <${row.attachmentUrl}|${escape(row.attachmentName || "ファイル")}>`,
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
