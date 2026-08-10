"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

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

/**
 * ご相談内容から担当チームと近い実績を提示するセクション。
 *
 * 判定は /api/match に任せ、ここは入力と結果の見せ方だけを持つ。返ってくる
 * チームと実績は実データと突き合わせ済みなので、そのままリンクにできる。
 */
export function ProjectMatch() {
  const [brief, setBrief] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    <Section
      id="project-match"
      align="center"
      tone="muted"
      eyebrow="PROJECT MATCH"
      title="どのチームが担当できるか、その場でお答えします"
      description="つくりたいものや困りごとをそのままお書きください。担当するチームと、近い実績をご案内します。"
    >
      <form
        onSubmit={submit}
        className="mx-auto mt-10 w-full max-w-2xl text-left"
      >
        <label htmlFor="pm-brief" className="sr-only">
          プロジェクトの内容
        </label>
        <textarea
          id="pm-brief"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={4}
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
      </form>

      {error && (
        <p
          role="alert"
          className="mx-auto mt-6 max-w-2xl text-left text-sm text-red-600"
        >
          {error}
        </p>
      )}

      {result && !result.relevant && (
        <div className="mx-auto mt-8 max-w-2xl border border-line bg-card p-6 text-left">
          <p className="text-base leading-relaxed text-ink-soft">
            {result.reason}
          </p>
          <p className="mt-3 text-sm text-muted">
            制作・開発に関するご相談をお書きいただければ、担当チームをご案内します。
          </p>
        </div>
      )}

      {result && result.relevant && (
        <div className="mx-auto mt-10 max-w-3xl text-left">
          {result.summary && (
            <div className="border border-line bg-card p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                ご相談内容
              </p>
              <p className="mt-3 text-base leading-relaxed text-ink-soft">
                {result.summary}
              </p>
            </div>
          )}

          {result.teams.length > 0 && (
            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                担当するチーム
              </p>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {result.teams.map((t) => (
                  <li key={t.slug}>
                    <Link
                      href={t.href}
                      className="group flex h-full flex-col border border-line bg-card p-5 transition-colors hover:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
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
            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                近い実績
              </p>
              <ul className="mt-4 grid gap-4 sm:grid-cols-3">
                {result.works.map((w) => (
                  <li key={w.id}>
                    <Link
                      href={w.href}
                      className="group flex h-full flex-col border border-line bg-card transition-colors hover:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                    >
                      {w.image && (
                        <Image
                          src={w.image}
                          alt=""
                          aria-hidden
                          width={400}
                          height={300}
                          sizes="(min-width: 640px) 14rem, 100vw"
                          className="aspect-[4/3] w-full bg-surface-2 object-contain"
                        />
                      )}
                      <div className="flex flex-1 flex-col gap-1 p-4">
                        <p className="text-sm font-bold leading-snug tracking-tight text-ink">
                          {w.title}
                        </p>
                        {w.client && (
                          <p className="text-xs text-muted">{w.client}</p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-10 flex justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-accent px-6 py-3 text-sm font-bold tracking-tight text-accent-ink transition-colors hover:bg-accent hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 sm:text-base"
            >
              この内容で相談する
            </Link>
          </div>
        </div>
      )}
    </Section>
  );
}
