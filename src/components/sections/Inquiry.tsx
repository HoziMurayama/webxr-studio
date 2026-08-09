"use client";

import { useRef, useState } from "react";
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
  "サイト保守・運用",
  "その他・相談したい",
];

const MAX_FILE_BYTES = 2 * 1024 * 1024;

export function Inquiry({
  /** /contact では PageHero が同じ見出しを出すため抑制する。 */
  showHeader = true,
}: {
  showHeader?: boolean;
} = {}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [file, setFile] = useState<{ name: string; data: string } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  /** 選択範囲に太字／赤字を適用する。エディタに焦点を戻してから実行する。 */
  const format = (cmd: "bold" | "red") => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    if (cmd === "bold") document.execCommand("bold");
    else document.execCommand("foreColor", false, "#dc2626");
  };

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
      eyebrow={showHeader ? "Inquiry" : undefined}
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
              defaultValue=""
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

            {/* 書式ツールバー。選択範囲に太字／赤字を適用する。 */}
            <div className="flex flex-wrap items-center gap-2 border border-b-0 border-line bg-card px-3 py-2">
              <button
                type="button"
                onClick={() => format("bold")}
                className="border border-line px-3 py-1 text-sm font-bold text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => format("red")}
                className="border border-line px-3 py-1 text-sm font-semibold text-[#dc2626] transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                赤字
              </button>
              <span className="ml-auto text-xs text-muted">
                Enter で改行できます
              </span>
            </div>

            {/* contentEditable のエディタ。改行を確実に入れるため、Enter は
                自前で <br> を挿入する（ブラウザ既定だと <div> が入り、
                書式が意図せず途切れることがある）。 */}
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
