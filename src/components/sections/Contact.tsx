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

const MAX_FILE_BYTES = 50 * 1024 * 1024;

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
  const [dragOver, setDragOver] = useState(false);
  // 添付についての指摘。フォーム全体のエラーとは分けて、添付欄の
  // 直下に出す。
  const [fileError, setFileError] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function onPickFile(f: File | undefined) {
    if (!f) return setFile(null);
    if (f.size > MAX_FILE_BYTES) {
      // 実際の容量を添えて、どれだけ超えているかを分かるようにする。
      const mb = (f.size / 1024 / 1024).toFixed(1);
      setFileError(
        `このファイルは ${mb}MB です。50MB 以内のファイルを添付してください。`,
      );
      return setFile(null);
    }
    setFileError("");
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
    const plain = html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

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
        showHeader
          ? "ご相談・お見積もりは無料です。お気軽にご連絡ください。"
          : undefined
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
          className="mt-10 rounded-2xl border border-line bg-card p-6 shadow-[0_1px_3px_rgb(13,16,23,0.04)] sm:p-10"
        >
          <fieldset className="space-y-6 border-0 p-0">
            <div className="grid gap-6 sm:grid-cols-2">
              <FieldGroup label="お名前（必須）" htmlFor="name">
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="山田 太郎"
                  autoComplete="name"
                />
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
                  if (
                    (e.ctrlKey || e.metaKey) &&
                    ["b", "i", "u"].includes(e.key.toLowerCase())
                  ) {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  // 貼り付けは書式を落として本文だけ受け取る。
                  e.preventDefault();
                  const text = e.clipboardData.getData("text/plain");
                  document.execCommand("insertText", false, text);
                }}
                // 角丸と枠線・フォーカス表現は他の入力欄（ui/Field.tsx の
                // control）に合わせる。高さと行間だけ本文向けに広げている。
                className="min-h-56 w-full overflow-y-auto rounded-xl border border-line bg-card px-4 py-3 text-sm leading-relaxed text-ink transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 [&:empty]:before:text-muted/70 [&:empty]:before:content-['ご相談内容をご記入ください。']"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-ink">
                添付ファイル
              </label>
              {/* 枠ごと落とせるようにする。仕様書やスクリーンショットを
                  そのまま渡せるほうが、相談の往復が減る。 */}
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  onPickFile(e.dataTransfer.files?.[0]);
                }}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-8 text-center transition-colors",
                  dragOver
                    ? "border-accent bg-accent/5"
                    : "border-line bg-card hover:border-accent/60",
                )}
              >
                {file ? (
                  <>
                    <p className="text-sm font-medium text-ink">{file.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      クリックで選び直す
                    </p>
                  </>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden
                      className="h-6 w-6 text-muted"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 16V4M7 9l5-5 5 5M5 20h14" />
                    </svg>
                    <p className="mt-2 text-sm text-ink-soft">
                      ファイルをドラッグ、またはクリックして選択
                    </p>
                    <p className="mt-1 text-xs text-muted">50MB まで</p>
                  </>
                )}
                <input
                  id="attachment"
                  type="file"
                  className="hidden"
                  onChange={(e) => onPickFile(e.target.files?.[0])}
                />
              </label>
              {/* 添付についての指摘はこの欄の直下に出す。送信ボタン付近だと
                  どの入力が悪いのか分かりにくいため。 */}
              {fileError && (
                <p
                  role="alert"
                  className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
                >
                  {fileError}
                </p>
              )}
              {file && (
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setFileError("");
                  }}
                  className="mt-2 text-xs text-muted underline-offset-4 hover:text-red-600 hover:underline"
                >
                  添付を取り消す
                </button>
              )}
            </div>

            {status === "success" && (
              <p className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3.5 text-sm font-medium text-accent-ink">
                送信しました。折り返しご連絡いたします。ありがとうございます。
              </p>
            )}
            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-700">
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
          </fieldset>
        </form>
      </div>
    </Section>
  );
}
