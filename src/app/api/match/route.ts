import { NextResponse } from "next/server";
import { z } from "zod";
import { getPortfolio } from "@/lib/content";
import { TEAMS } from "@/components/sections/About";
import { getGroq, GROQ_MODEL } from "@/lib/groq";

export const runtime = "nodejs";
export const maxDuration = 60;

const schema = z.object({
  brief: z.string().trim().min(1).max(2000),
});

/**
 * ご相談内容から、担当できるチームと近い実績を選ぶ。
 *
 * モデルには自由記述をさせず、こちらが渡した候補の中から id を選ばせる。
 * 実在しないチーム名や事例をでっち上げられると、リンク先が無いばかりか
 * 経歴の詐称になるため。返ってきた id は必ず実データと突き合わせる。
 */
const SYSTEM_PROMPT = `あなたは日本の開発スタジオ「WEB-XR.studio」の相談窓口です。
お客様が書いたプロジェクトの構想や要件を読み、社内のどのチームが担当できるか、
また過去のどの実績が近いかを選びます。

必ず次の JSON だけを返してください。前後に説明文やコードブロックを付けないこと。

{
  "relevant": true または false,
  "reason": "お断りする場合の理由。relevant が true なら空文字",
  "summary": "ご相談内容の要約（2〜3文、日本語、敬体）",
  "teamSlugs": ["担当できるチームの slug。1〜2件"],
  "portfolioIds": [近い実績の id。0〜3件],
  "note": "なぜそのチームと実績が合うのかの説明（2〜3文、日本語、敬体）"
}

判定のルール:
- Web サイト制作、システム開発、アプリ開発、AI 活用、デザイン、保守運用など、
  当社が受けられる制作・開発の相談であれば relevant を true にしてください。
- 上記と無関係な話題（雑談、時事、人生相談、他社への問い合わせ、当社の業務と
  関係のない質問など）は relevant を false にし、reason に理由を書いてください。
- 内容が短くても、制作や開発の意図が読み取れる限り true として扱ってください。
- teamSlugs と portfolioIds には、必ず「候補一覧」に含まれる値だけを使ってください。
  該当する実績がなければ portfolioIds は空配列で構いません。`;

/** モデルの出力。ここでは形だけ検証し、中身は実データと突き合わせる。 */
const aiSchema = z.object({
  relevant: z.boolean(),
  reason: z.string().max(500).optional().default(""),
  summary: z.string().max(1000).optional().default(""),
  teamSlugs: z.array(z.string()).max(4).optional().default([]),
  portfolioIds: z.array(z.number()).max(6).optional().default([]),
  note: z.string().max(1000).optional().default(""),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "リクエストが不正です。" },
      { status: 400 },
    );
  }
  const { brief } = parsed.data;

  let groq;
  try {
    groq = getGroq();
  } catch {
    return NextResponse.json(
      { error: "この機能は現在ご利用いただけません。" },
      { status: 503 },
    );
  }

  // 候補をこちらで用意し、この中から選ばせる。
  const portfolio = await getPortfolio().catch(() => []);
  const teamList = TEAMS.map(
    (t) =>
      `- slug=${t.slug} / ${t.ja}（${t.en}）: ${t.mission} 対応: ${t.services.slice(0, 6).join("、")}`,
  ).join("\n");
  const workList = portfolio
    .map(
      (p) =>
        `- id=${p.id} / ${p.title}${p.industry ? `（${p.industry}）` : ""}: ${(p.tags ?? []).join("、")}`,
    )
    .join("\n");

  let raw = "";
  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 800,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "system",
          content: `候補一覧\n\n【チーム】\n${teamList}\n\n【実績】\n${workList || "（実績データがありません）"}`,
        },
        { role: "user", content: brief },
      ],
    });
    raw = completion.choices[0]?.message?.content ?? "";
  } catch (err) {
    console.error("groq error", err);
    return NextResponse.json(
      { error: "判定中にエラーが発生しました。時間をおいてお試しください。" },
      { status: 500 },
    );
  }

  const ai = aiSchema.safeParse(JSON.parse(raw || "{}"));
  if (!ai.success) {
    console.error("unexpected ai payload", raw.slice(0, 300));
    return NextResponse.json(
      { error: "判定結果を読み取れませんでした。もう一度お試しください。" },
      { status: 502 },
    );
  }

  if (!ai.data.relevant) {
    return NextResponse.json({
      relevant: false,
      reason:
        ai.data.reason ||
        "恐れ入りますが、制作・開発に関するご相談を承っております。",
    });
  }

  // モデルが返した id を実データと突き合わせる。存在しないものは捨てる。
  const teams = ai.data.teamSlugs
    .map((slug) => TEAMS.find((t) => t.slug === slug))
    .filter((t): t is (typeof TEAMS)[number] => Boolean(t))
    .map((t) => ({
      slug: t.slug,
      ja: t.ja,
      en: t.en,
      mission: t.mission,
      href: `/about#${t.slug}`,
    }));

  const works = ai.data.portfolioIds
    .map((id) => portfolio.find((p) => p.id === id))
    .filter((p): p is (typeof portfolio)[number] => Boolean(p))
    .map((p) => ({
      id: p.id,
      title: p.title,
      client: [p.companyName?.trim(), p.clientName?.trim()]
        .filter(Boolean)
        .join("　"),
      industry: p.industry ?? "",
      image: p.imageUrl || p.thumbnailUrl || p.workImageUrl || "",
      href: `/case-study/${p.id}`,
    }));

  return NextResponse.json({
    relevant: true,
    summary: ai.data.summary,
    note: ai.data.note,
    teams,
    works,
  });
}
