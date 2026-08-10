"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/ui/Section";

type Team = {
  slug: string;
  ja: string;
  en: string;
  mission: string;
  href: string;
};

type Work = {
  id: number;
  title: string;
  client: string;
  industry: string;
  image: string;
  href: string;
};

type Result =
  | {
      relevant: true;
      summary: string;
      note: string;
      teams: Team[];
      works: Work[];
    }
  | { relevant: false; reason: string };

/** 左側に置く説明。何ができるかを3点に絞る。 */
const POINTS = [
  "ご相談の内容から、担当できるチームを判定します",
  "過去の実績のうち、近いものをご案内します",
  "そのまま詳細ページへ移動できます",
];

/**
 * ご相談内容から担当チームと近い実績を提示するセクション。
 *
 * 判定は /api/match に任せ、ここは入力と結果の見せ方だけを持つ。返ってくる
 * チームと実績は実データと突き合わせ済みなので、そのままリンクにできる。
 * 結果はページに流し込まず、モーダルで見せる。入力欄の位置が動かず、
 * 続けて別の相談を試しやすいため。
 */
export function ProjectMatch() {
  const [brief, setBrief] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const close = useCallback(() => setResult(null), []);

  // モーダルを開いている間は背後を固定し、Escape で閉じられるようにする。
  useEffect(() => {
    if (!result) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [result, close]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = brief.trim();
    if (!text || loading) return;

    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "エラーが発生しました。");
        return;
      }
      setResult(data as Result);
    } catch {
      setError("通信に失敗しました。時間をおいてお試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Section
        id="project-match"
        tone="muted"
        eyebrow="PROJECT MATCH"
        title="どのチームが担当できるか、その場でお答えします"
      >
        <div className="mt-10 grid items-start gap-10 text-left lg:grid-cols-2 lg:gap-14">
          {/* 左: この機能の説明 */}
          <div>
            <p className="text-base leading-relaxed text-ink-soft sm:text-lg">
              つくりたいものや、いま困っていることをそのままお書きください。
              内容を読み取り、担当するチームと、過去の近い実績をご案内します。
            </p>
            <ul className="mt-6 space-y-3">
              {POINTS.map((p) => (
                <li
                  key={p}
                  className="flex items-start gap-3 text-sm leading-relaxed text-ink-soft"
                >
                  <svg
                    viewBox="0 0 20 20"
                    aria-hidden
                    className="mt-[0.15em] h-4 w-4 shrink-0 text-accent"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 10.5l4 4 8-9" />
                  </svg>
                  {p}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-muted">
              ※ 制作・開発に関するご相談を承っております。
              内容によってはお答えできない場合があります。
            </p>
          </div>

          {/* 右: 入力 */}
          <form onSubmit={submit} className="w-full">
            <label htmlFor="pm-brief" className="sr-only">
              プロジェクトの内容
            </label>
            <textarea
              id="pm-brief"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={7}
              maxLength={2000}
              placeholder="例）予約機能のある美容室のサイトを作りたい。スマホ対応と、管理画面から予約状況を確認できるようにしたいです。"
              className="w-full resize-y border border-line bg-card px-4 py-3.5 text-base leading-relaxed text-ink placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            />
            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-xs text-muted">{brief.length} / 2000</p>
              <button
                type="submit"
                disabled={loading || !brief.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-base font-bold tracking-tight text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "確認しています…" : "担当チームを調べる"}
              </button>
            </div>

            {error && (
              <p role="alert" className="mt-4 text-sm text-red-600">
                {error}
              </p>
            )}
          </form>
        </div>
      </Section>

      {result && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="判定結果"
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          // 背景を押したら閉じる。中身のクリックは拾わない。
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto overscroll-contain border border-line bg-card">
            <div className="sticky top-0 flex items-center justify-between gap-4 border-b border-line bg-card px-6 py-4">
              <p className="text-sm font-bold tracking-tight text-ink">
                {result.relevant ? "ご相談内容の判定結果" : "ご相談について"}
              </p>
              <button
                type="button"
                onClick={close}
                aria-label="閉じる"
                className="-mr-2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-6">
              {!result.relevant ? (
                <>
                  <p className="text-base leading-relaxed text-ink-soft">
                    {result.reason}
                  </p>
                  <p className="mt-3 text-sm text-muted">
                    制作・開発に関するご相談をお書きいただければ、担当チームをご案内します。
                  </p>
                </>
              ) : (
                <>
                  {result.summary && (
                    <div className="border border-line bg-surface-2 p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                        ご相談内容
                      </p>
                      <p className="mt-3 text-base leading-relaxed text-ink-soft">
                        {result.summary}
                      </p>
                    </div>
                  )}

                  {result.teams.length > 0 && (
                    <div className="mt-7">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                        担当するチーム
                      </p>
                      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                        {result.teams.map((t) => (
                          <li key={t.slug}>
                            <Link
                              href={t.href}
                              onClick={close}
                              className="flex h-full flex-col border border-line bg-card p-5 transition-colors hover:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                            >
                              <p className="text-base font-bold tracking-tight text-ink">
                                {t.ja}
                              </p>
                              <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-accent-ink">
                                {t.en}
                              </p>
                              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                                {t.mission}
                              </p>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.note && (
                    <p className="mt-6 text-sm leading-relaxed text-ink-soft">
                      {result.note}
                    </p>
                  )}

                  {result.works.length > 0 && (
                    <div className="mt-7">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                        近い実績
                      </p>
                      <ul className="mt-4 grid gap-4 sm:grid-cols-3">
                        {result.works.map((w) => (
                          <li key={w.id}>
                            <Link
                              href={w.href}
                              onClick={close}
                              className="flex h-full flex-col border border-line bg-card transition-colors hover:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                            >
                              {w.image && (
                                <Image
                                  src={w.image}
                                  alt=""
                                  aria-hidden
                                  width={400}
                                  height={300}
                                  sizes="(min-width: 640px) 12rem, 100vw"
                                  className="aspect-[4/3] w-full bg-surface-2 object-contain"
                                />
                              )}
                              <div className="flex flex-1 flex-col gap-1 p-4">
                                <p className="text-sm font-bold leading-snug tracking-tight text-ink">
                                  {w.title}
                                </p>
                                {w.client && (
                                  <p className="text-xs text-muted">
                                    {w.client}
                                  </p>
                                )}
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-8 flex justify-center">
                    <Link
                      href="/contact"
                      onClick={close}
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-accent px-6 py-3 text-sm font-bold tracking-tight text-accent-ink transition-colors hover:bg-accent hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 sm:text-base"
                    >
                      この内容で相談する
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
