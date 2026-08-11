"use client";

import { useState } from "react";
import { Input, Textarea, Label } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { FieldDef } from "@/lib/sections";
import { cn } from "@/lib/utils";

type Value = unknown;
type Row = Record<string, Value>;

/** Renders one editable field based on its declared type. */
export function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: Value;
  onChange: (v: Value) => void;
}) {
  switch (field.type) {
    case "textarea":
      return (
        <Textarea
          rows={4}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "number":
      return (
        <Input
          type="number"
          value={value === "" || value == null ? "" : String(value)}
          onChange={(e) =>
            onChange(e.target.value === "" ? "" : Number(e.target.value))
          }
        />
      );
    case "taglist":
      return <TagList value={(value as string[]) ?? []} onChange={onChange} />;
    case "image":
      return <ImageField value={String(value ?? "")} onChange={onChange} />;
    case "imagelist":
      return <ImageList value={(value as KV[]) ?? []} onChange={onChange} />;
    case "kvlist":
      return (
        <PairList
          value={(value as KV[]) ?? []}
          keys={["label", "value"]}
          labels={["ラベル", "値"]}
          onChange={onChange}
        />
      );
    case "linklist":
      return (
        <PairList
          value={(value as KV[]) ?? []}
          keys={["label", "url"]}
          labels={["ラベル", "URL"]}
          onChange={onChange}
        />
      );
    default:
      return (
        <Input
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

function TagList({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <Input
      value={value.join(", ")}
      placeholder="タグをカンマ区切りで入力"
      onChange={(e) =>
        onChange(
          e.target.value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        )
      }
    />
  );
}

type KV = Record<string, string>;

/** KB 表記。削減率を見せるために使う。 */
function kb(bytes: number) {
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

/**
 * 画像を Cloudinary へ送り、配信 URL を返す。変換と圧縮は向こう側で行う
 * ので、ここは送って結果を受け取るだけ。
 */
async function upload(file: File): Promise<{ url: string; note: string }> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "アップロードに失敗しました。");
  const saved =
    data.originalBytes && data.bytes
      ? `${kb(data.originalBytes)} → ${kb(data.bytes)}`
      : "";
  return { url: String(data.url), note: saved };
}

/** ファイル選択とプレビューを備えた画像 1 枚ぶんの入力欄。 */
function ImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [over, setOver] = useState(false);
  // URL 欄は既定で畳む。既に URL が入っているものだけ開いておく必要はなく、
  // ふだんはドラッグかファイル選択で足りるため。
  const [showUrl, setShowUrl] = useState(false);

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    setNote("");
    try {
      const r = await upload(file);
      onChange(r.url);
      setNote(r.note);
    } catch (e) {
      setError(e instanceof Error ? e.message : "アップロードに失敗しました。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {/* 枠ごと落とせるようにする。ファイル選択のダイアログを開かずに
          済むほうが、まとめて差し替えるときに速い。 */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!busy) setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          pick(e.dataTransfer.files?.[0]);
        }}
        // スクリーンショットをそのまま貼れるようにする。
        onPaste={(e) => {
          const f = Array.from(e.clipboardData.files)[0];
          if (f) {
            e.preventDefault();
            pick(f);
          }
        }}
        className={cn(
          "flex items-start gap-3 rounded-xl border border-dashed p-3 transition-colors",
          over ? "border-accent bg-accent/5" : "border-line bg-surface",
          busy && "opacity-60",
        )}
      >
        {/* プレビュー。next/image は外部ドメインの設定が要るので、ここは
            管理画面限定の素の img で足りる。 */}
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="h-24 w-24 shrink-0 rounded-lg border border-line bg-card object-contain"
          />
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-line bg-card text-xs text-muted">
            画像なし
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm text-ink-soft">
            {busy ? "アップロード中…" : "ここに画像をドラッグ、または貼り付け"}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            JPG / PNG / WebP など。自動で WebP に変換して保存します。
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <label
              className={cn(
                "inline-flex items-center rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-medium text-ink",
                busy ? "cursor-not-allowed" : "cursor-pointer hover:bg-surface",
              )}
            >
              ファイルを選ぶ
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={busy}
                onChange={(e) => pick(e.target.files?.[0])}
              />
            </label>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setNote("");
                }}
                className="rounded-lg px-2 py-1.5 text-xs text-muted hover:bg-red-50 hover:text-red-600"
              >
                削除
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowUrl((v) => !v)}
              className="rounded-lg px-2 py-1.5 text-xs text-muted hover:bg-card hover:text-ink"
            >
              {showUrl ? "URL を隠す" : "URL で指定"}
            </button>
            {note && (
              <span className="text-xs font-medium text-accent-ink">
                WebP {note}
              </span>
            )}
          </div>

          {/* 既存の URL を直したいときだけ開く。ふだんは畳んでおく。 */}
          {showUrl && (
            <div className="mt-2">
              <Input
                value={value}
                placeholder="https://res.cloudinary.com/..."
                onChange={(e) => onChange(e.target.value)}
              />
            </div>
          )}
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}

/** ラベルと画像の組を並べる欄。ギャラリー用。 */
function ImageList({
  value,
  onChange,
}: {
  value: KV[];
  onChange: (v: KV[]) => void;
}) {
  const rows = value.length ? value : [];

  function update(i: number, key: string, v: string) {
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [key]: v } : r)));
  }

  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div
          key={i}
          className="space-y-2 rounded-lg border border-line bg-surface p-3"
        >
          <div className="flex items-center gap-2">
            <Input
              placeholder="ラベル（例：トップページ）"
              value={r.label ?? ""}
              onChange={(e) => update(i, "label", e.target.value)}
            />
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
              aria-label="削除"
              className="shrink-0 rounded-lg px-2 py-2 text-muted hover:bg-red-50 hover:text-red-600"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <ImageField
            value={r.value ?? ""}
            onChange={(v) => update(i, "value", v)}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => onChange([...rows, { label: "", value: "" }])}
      >
        + 画像を追加
      </Button>
    </div>
  );
}

function PairList({
  value,
  keys,
  labels,
  onChange,
}: {
  value: KV[];
  keys: [string, string];
  labels: [string, string];
  onChange: (v: KV[]) => void;
}) {
  const rows = value.length ? value : [];

  function update(i: number, key: string, v: string) {
    const next = rows.map((r, idx) => (idx === i ? { ...r, [key]: v } : r));
    onChange(next);
  }
  function add() {
    onChange([...rows, { [keys[0]]: "", [keys[1]]: "" }]);
  }
  function remove(i: number) {
    onChange(rows.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            placeholder={labels[0]}
            value={r[keys[0]] ?? ""}
            onChange={(e) => update(i, keys[0], e.target.value)}
          />
          <Input
            placeholder={labels[1]}
            value={r[keys[1]] ?? ""}
            onChange={(e) => update(i, keys[1], e.target.value)}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label="削除"
            className="shrink-0 rounded-lg px-2 py-2 text-muted hover:bg-red-50 hover:text-red-600"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={add}>
        + 追加
      </Button>
    </div>
  );
}

/** A labelled field wrapper used by editors. */
export function EditableField({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: Value;
  onChange: (v: Value) => void;
}) {
  return (
    <div>
      <Label>{field.label}</Label>
      <FieldInput field={field} value={value} onChange={onChange} />
      {field.hint && <p className="mt-1 text-xs text-muted">{field.hint}</p>}
    </div>
  );
}

export type { Row };
