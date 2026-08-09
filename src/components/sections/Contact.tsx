"use client";

import { Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Input, FieldGroup } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "success" | "error";

/** 対応サービス。当社の4領域＋サイト運用まわりの相談を受けられるようにする。 */
const SERVICES = [
  "Web制作",
  "システム開発",
  "アプリ開発",
  "AI開発",
  "サイト利用",
  "その他・相談したい",
];

const MAX_FILE_BYTES = 2 * 1024 * 1024;

/**
 * useSearchParams はプリレンダリング時に Suspense 境界を必要とするため、
 * 中身を包んで公開する。呼び出し側は従来どおり `<Contact />` でよい。
 */
export function Contact(props: { showHeader?: boolean } = {}) {
  return (
    // fallback では ?service= を読めないため、未選択の状態を出しておく。
    <Suspense fallback={<ContactForm {...props} preselected="" />}>
      <ContactFormWithParams {...props} />
    </Suspense>
  );
}

/**
 * サービスページの「このサービスを相談する」から ?service= 付きで来たときは
 * 対応サービスを選択済みにする。既知の選択肢に一致するときだけ採用する。
 */
function ContactFormWithParams(props: { showHeader?: boolean }) {
  const requested = useSearchParams().get("service") ?? "";
  return (
    <ContactForm
      {...props}
      preselected={SERVICES.includes(requested) ? requested : ""}
    />
  );
}

function ContactForm({
  /** /contact では PageHero が同じ見出しを出すため抑制する。 */
  showHeader = true,
  /** 「対応サービス」の初期選択値。 */
  preselected,
}: {
  showHeader?: boolean;
  preselected: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [file, setFile] = useState<{ name: string; data: string } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return setFile(null);
    if (f.size > MAX_FILE_BYTES) {
      setError("添付ファイルは 2MB 以内にしてください。");
      e.target.value = "";
      return setFile(null);
    }
    setError("");
    const data = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(f);
    });
    setFile({ name: f.name, data });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const form = e.currentTarget;
    const fd = new FormData(form);
    const html = editorRef.current?.innerHTML ?? "";
    const plain = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

    if (plain.length < 10) {
      setStatus("error");
      setError("内容は10文字以上で入力してください。");
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          company: fd.get("company"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          service: fd.get("service"),
          message: html,
          attachmentName: file?.name ?? "",
          attachmentData: file?.data ?? "",
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "送信に失敗しました。");
      }
      setStatus("success");
      form.reset();
      if (editorRef.current) editorRef.current.innerHTML = "";
      setFile(null);
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
      <div className="mx-auto max-w-3xl text-left">
        <p className="text-base leading-relaxed text-ink-soft sm:text-lg">
          プロジェクトのご相談、技術的なお悩み、既存システムの改善など、
          どんな内容でもお気軽にどうぞ。担当者より折り返しご連絡いたします。
        </p>

        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="mt-10 space-y-6 border border-line bg-surface p-6 sm:p-10"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <FieldGroup label="お名前（必須）" htmlFor="name">
              <Input id="name" name="name" required placeholder="山田 太郎" autoComplete="name" />
            </FieldGroup>
            <FieldGroup label="会社名" htmlFor="company">
              <Input
                id="company"
                name="company"
                placeholder="株式会社サンプル"
                autoComplete="organization"
              />
            </FieldGroup>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <FieldGroup label="メールアドレス（必須）" htmlFor="email">
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                autoComplete="email"
              />
            </FieldGroup>
            <FieldGroup label="電話番号" htmlFor="phone">
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="03-1234-5678"
                autoComplete="tel"
              />
            </FieldGroup>
          </div>

          <FieldGroup label="対応サービス（必須）" htmlFor="service">
            <select
              id="service"
              name="service"
              required
              // defaultValue は初回のみ効くため、?service= が変わったら key で
              // 作り直して選択状態を追従させる。
              key={preselected}
              defaultValue={preselected}
              className="w-full rounded-xl border border-line bg-card px-4 py-2.5 text-sm text-ink transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
            >
              <option value="" disabled>
                選択してください
              </option>
              {SERVICES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </FieldGroup>

          <div>
            <label
              htmlFor="message-editor"
              className="mb-2 block text-sm font-medium text-ink"
            >
              内容（必須・10文字以上）
            </label>

            {/* contentEditable のエディタ。Enter だけを受け付け、改行として
                <br> を挿入する。太字などの書式ショートカット（Ctrl+B 等）は
                無効化し、本文は書式なしのテキストとして扱う。 */}
            <div
              id="message-editor"
              ref={editorRef}
              contentEditable
              role="textbox"
              aria-multiline="true"
              aria-label="内容"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  document.execCommand("insertLineBreak");
                  return;
                }
                // ブラウザ既定の書式ショートカットを塞ぐ。
                if ((e.ctrlKey || e.metaKey) && ["b", "i", "u"].includes(e.key.toLowerCase())) {
                  e.preventDefault();
                }
              }}
              onPaste={(e) => {
                // 貼り付けは書式を落として本文だけ受け取る。
                e.preventDefault();
                const text = e.clipboardData.getData("text/plain");
                document.execCommand("insertText", false, text);
              }}
              className="min-h-56 w-full overflow-y-auto border border-line bg-card px-4 py-3 text-sm leading-relaxed text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 [&:empty]:before:text-muted/70 [&:empty]:before:content-['ご相談内容をご記入ください。']"
            />
          </div>

          <FieldGroup label="添付ファイル" htmlFor="attachment">
            <input
              id="attachment"
              type="file"
              onChange={onPickFile}
              className="w-full text-sm text-ink-soft file:mr-4 file:border file:border-line file:bg-card file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-surface"
            />
            <p className="mt-2 text-xs text-muted">
              {file ? `選択中: ${file.name}` : "2MB までのファイルを添付できます。"}
            </p>
          </FieldGroup>

          {status === "success" && (
            <p className="border-l-2 border-accent bg-accent/10 px-4 py-3 text-sm font-medium text-accent-ink">
              送信しました。折り返しご連絡いたします。ありがとうございます。
            </p>
          )}
          {error && (
            <p className="border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={status === "sending"}
            className={cn("w-full sm:w-auto sm:min-w-48")}
          >
            {status === "sending" ? "送信中..." : "送信する"}
          </Button>
        </form>
      </div>
    </Section>
  );
}
