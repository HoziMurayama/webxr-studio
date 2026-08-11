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

/**
 * 画像 1 枚ぶんの入力欄。画像そのものが押せる領域になっていて、
 * クリック・ドラッグ・貼り付けのいずれでもアップロードできる。
 * 説明文は置かない（並べると枚数が増えたときに読みづらいため）。
 */
function ImageField({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [over, setOver] = useState(false);

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
    <div className={cn("group relative space-y-1", className)}>
      {/* 画像そのものが押せる領域。説明文を並べず、クリックで選択、
          ドラッグと貼り付けでも受ける。 */}
      <label
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
        onPaste={(e) => {
          const f = Array.from(e.clipboardData.files)[0];
          if (f) {
            e.preventDefault();
            pick(f);
          }
        }}
        className={cn(
          "flex aspect-[4/3] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed bg-surface transition-colors",
          over
            ? "border-accent bg-accent/5"
            : "border-line hover:border-accent/60",
          busy && "cursor-wait opacity-60",
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-contain" />
        ) : (
          <span className="text-xs text-muted">
            {busy ? "アップロード中…" : "＋ 画像"}
          </span>
        )}

        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={busy}
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </label>

      {/* 削除は画像の右上に重ねる。label の中に入れるとクリックが
          ファイル選択に吸われるため、外に出して絶対配置する。 */}
      {value && !busy && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            setNote("");
          }}
          aria-label="画像を削除"
          className="absolute right-1.5 top-1.5 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink/60 text-white opacity-0 transition-opacity hover:bg-ink/85 group-hover:opacity-100"
        >
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}

      {note && <p className="text-[11px] text-accent-ink">WebP {note}</p>}
      {error && <p className="text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

/**
 * 画像を並べる欄。ギャラリー用。
 *
 * 画像だけを格子に並べる。1 枚ごとにラベル欄を挟むと縦に伸びて全体を
 * 見渡せないうえ、公開ページでも名前は出さないため。`label` は形を
 * 保つために空文字で持つ（DB は {label, value} の組で入っている）。
 */
function ImageList({
  value,
  onChange,
}: {
  value: KV[];
  onChange: (v: KV[]) => void;
}) {
  const rows = value.length ? value : [];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {rows.map((r, i) => (
          <div key={i} className="group relative">
            <ImageField
              value={r.value ?? ""}
              onChange={(v) =>
                onChange(
                  rows.map((row, idx) =>
                    idx === i ? { ...row, value: v } : row,
                  ),
                )
              }
            />
            {/* 枠ごと取り除く。画像だけ消したいときは画像側の × を使う。 */}
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
              aria-label="この枠を削除"
              className="absolute -right-1.5 -top-1.5 z-20 inline-flex h-6 w-6 items-center justify-center rounded-full border border-line bg-card text-muted opacity-0 shadow-sm transition-opacity hover:text-red-600 group-hover:opacity-100"
            >
              <svg
                viewBox="0 0 24 24"
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        ))}

        {/* 追加枠。押すとその場でファイル選択が開き、選んだ画像が入る。 */}
        <AddImageTile
          onAdd={(url) => onChange([...rows, { label: "", value: url }])}
        />
      </div>
    </div>
  );
}

/** ギャラリー末尾の追加枠。選んだ時点で 1 枚ぶんの行を足す。 */
function AddImageTile({ onAdd }: { onAdd: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [over, setOver] = useState(false);

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const r = await upload(file);
      onAdd(r.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "アップロードに失敗しました。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1">
      <label
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
        className={cn(
          "flex aspect-[4/3] w-full cursor-pointer items-center justify-center rounded-xl border border-dashed text-xs transition-colors",
          over
            ? "border-accent bg-accent/5 text-accent-ink"
            : "border-line bg-surface text-muted hover:border-accent/60 hover:text-accent-ink",
          busy && "cursor-wait opacity-60",
        )}
      >
        {busy ? "アップロード中…" : "＋ 画像を追加"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={busy}
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </label>
      {error && <p className="text-[11px] text-red-600">{error}</p>}
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
  row,
  onRowChange,
}: {
  field: FieldDef;
  value: Value;
  onChange: (v: Value) => void;
  /** client 型のように複数の列をまとめて扱う欄で使う。 */
  row?: Row;
  onRowChange?: (patch: Row) => void;
}) {
  return (
    <div>
      <Label>{field.label}</Label>
      {field.type === "client" && row && onRowChange ? (
        <ClientField row={row} onChange={onRowChange} />
      ) : (
        <FieldInput field={field} value={value} onChange={onChange} />
      )}
      {field.hint && <p className="mt-1 text-xs text-muted">{field.hint}</p>}
    </div>
  );
}

/**
 * お客様の写真・企業名・お名前をひとまとまりで編集する欄。
 * 左に写真、右に名前を置き、誰の事例かをその場で確かめられるようにする。
 */
function ClientField({
  row,
  onChange,
}: {
  row: Row;
  onChange: (patch: Row) => void;
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-line bg-surface p-3">
      <div className="w-28 shrink-0 sm:w-32">
        <ImageField
          value={String(row.imageUrl ?? "")}
          onChange={(v) => onChange({ imageUrl: v })}
        />
      </div>
      <div className="min-w-0 flex-1 space-y-2.5">
        <div>
          <p className="mb-1 text-xs text-muted">企業名（個人なら空欄）</p>
          <Input
            value={String(row.companyName ?? "")}
            placeholder="株式会社サンプル"
            onChange={(e) => onChange({ companyName: e.target.value })}
          />
        </div>
        <div>
          <p className="mb-1 text-xs text-muted">お名前</p>
          <Input
            value={String(row.clientName ?? "")}
            placeholder="山田 太郎 様"
            onChange={(e) => onChange({ clientName: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

export type { Row };
