import { NextResponse } from "next/server";
import { z } from "zod";
import { retrieve } from "@/lib/rag";
import { getGroq, GROQ_MODEL } from "@/lib/groq";

export const runtime = "nodejs";
export const maxDuration = 60;

const schema = z.object({
  message: z.string().trim().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      }),
    )
    .max(10)
    .optional()
    .default([]),
});

const SYSTEM_PROMPT = `あなたは「WEB-XR.studio」（Web制作・システム開発・アプリ開発・AIソリューションを手がける日本の開発スタジオ）の公式サイトに設置されたAIアシスタントです。

ルール:
- 回答は必ず日本語で、丁寧かつ簡潔に行ってください。
- 下記の「参考情報」に含まれる内容のみを根拠に回答してください。参考情報から判断できない場合は、推測せず「申し訳ございません、その点については分かりかねます。お問い合わせフォームよりお気軽にご連絡ください。」と案内してください。
- 会社やサービスと無関係な質問には、丁寧にお断りし、サービスに関するご相談を促してください。
- 料金や具体的な見積もりについては、目安を伝えつつ、正確なお見積もりはお問い合わせが必要である旨を添えてください。`;

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "リクエストが不正です。" }, { status: 400 });
  }
  const { message, history } = parsed.data;

  // 1) Retrieve relevant site content chunks.
  let context = "";
  try {
    const chunks = await retrieve(message, 5);
    context = chunks.map((c, i) => `【${i + 1}】${c}`).join("\n");
  } catch (err) {
    console.error("retrieval failed", err);
    // Continue without context — the guardrail will make the model decline.
  }

  const contextBlock = context
    ? `参考情報:\n${context}`
    : "参考情報: （該当する情報が見つかりませんでした）";

  // 2) Stream the grounded answer from Groq.
  let groq;
  try {
    groq = getGroq();
  } catch {
    return NextResponse.json(
      { error: "AIアシスタントは現在利用できません（APIキー未設定）。" },
      { status: 503 },
    );
  }

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.3,
      max_tokens: 800,
      stream: true,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "system", content: contextBlock },
        ...history,
        { role: "user", content: message },
      ],
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const token = chunk.choices[0]?.delta?.content ?? "";
            if (token) controller.enqueue(encoder.encode(token));
          }
        } catch (err) {
          console.error("stream error", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("groq error", err);
    return NextResponse.json(
      { error: "回答の生成中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}
