"use client";

import { useState } from "react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, FieldGroup } from "@/components/ui/Field";

type Status = "idle" | "sending" | "success" | "error";

export function Contact({
  /** /contact では PageHero が同じ見出しを出すため抑制する。 */
  showHeader = true,
}: {
  showHeader?: boolean;
} = {}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "送信に失敗しました。");
      }
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "送信に失敗しました。");
    }
  }

  return (
    <Section
      id="contact"
      align="center"
      eyebrow={showHeader ? "Contact" : undefined}
      title={showHeader ? "お問い合わせ" : undefined}
      description={
        showHeader ? "ご相談・お見積もりは無料です。お気軽にご連絡ください。" : undefined
      }
    >
      {/* Two columns: intro copy on the left, form on the right. Stacks to a
          single column below `lg`, where the copy still reads before the form. */}
      <div className="grid gap-10 text-left lg:grid-cols-[1fr_1.2fr] lg:items-start">
        <div className="space-y-6">
          <p className="text-base leading-relaxed text-ink-soft">
            プロジェクトのご相談、技術的なお悩み、既存システムの改善など、
            どんな内容でもお気軽にどうぞ。担当者より折り返しご連絡いたします。
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-5 rounded-2xl border border-line bg-surface p-6 sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldGroup label="お名前" htmlFor="name">
              <Input id="name" name="name" required placeholder="山田 太郎" autoComplete="name" />
            </FieldGroup>
            <FieldGroup label="会社名（任意）" htmlFor="company">
              <Input id="company" name="company" placeholder="株式会社サンプル" autoComplete="organization" />
            </FieldGroup>
          </div>
          <FieldGroup label="メールアドレス" htmlFor="email">
            <Input id="email" name="email" type="email" required placeholder="you@example.com" autoComplete="email" />
          </FieldGroup>
          <FieldGroup label="ご相談内容" htmlFor="message">
            <Textarea id="message" name="message" required rows={5} placeholder="ご相談内容をご記入ください。" />
          </FieldGroup>

          {status === "success" && (
            <p className="rounded-lg bg-accent/10 px-4 py-3 text-sm font-medium text-accent-ink">
              送信しました。折り返しご連絡いたします。ありがとうございます。
            </p>
          )}
          {status === "error" && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={status === "sending"}
            className="w-full sm:w-auto sm:min-w-48"
          >
            {status === "sending" ? "送信中..." : "送信する"}
          </Button>
        </form>
      </div>
    </Section>
  );
}
