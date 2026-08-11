"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { EditableField } from "@/components/admin/FieldInputs";
import type { FieldDef } from "@/lib/sections";
import { cn } from "@/lib/utils";

type Row = Record<string, unknown> & { id?: number };

export function SectionEditor({
  slug,
  label,
  fields,
  singleton,
  initialRows,
}: {
  slug: string;
  label: string;
  fields: FieldDef[];
  singleton: boolean;
  initialRows: Row[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [editing, setEditing] = useState<Row | null>(
    singleton ? (initialRows[0] ?? emptyRow(fields, 1)) : null,
  );
  const [toast, setToast] = useState<string>("");

  function refresh() {
    router.refresh();
  }

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">{label}</h1>
          <p className="mt-1 text-sm text-muted">
            {singleton
              ? "内容を編集して保存します。"
              : "項目の追加・編集・削除ができます。"}
          </p>
        </div>
        {!singleton && (
          <Button onClick={() => setEditing(emptyRow(fields, nextOrder(rows)))}>
            + 新規追加
          </Button>
        )}
      </div>

      {toast && (
        <div className="mb-4 rounded-lg bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent-ink">
          {toast}
        </div>
      )}

      {!singleton && (
        <ul className="mb-6 space-y-2">
          {rows.length === 0 && (
            <li className="rounded-xl border border-dashed border-line bg-card px-4 py-8 text-center text-sm text-muted">
              まだ項目がありません。「新規追加」から作成してください。
            </li>
          )}
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-line bg-card px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {primaryLabel(r, fields)}
                </p>
                <p className="truncate text-xs text-muted">
                  {secondaryLabel(r, fields)}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditing(r)}
                >
                  編集
                </Button>
                <button
                  onClick={() => onDelete(r, slug, setRows, notify, refresh)}
                  className="rounded-full border border-line px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 一覧型は編集をモーダルで開く。項目が増えると一覧の下にフォームが
          伸びて、どれを編集中なのか分からなくなるため。単一項目の
          セクション（会社案内など）は一覧が無いので、そのまま置く。 */}
      {editing &&
        (singleton ? (
          <EditorForm
            key={editing.id ?? "new"}
            slug={slug}
            fields={fields}
            singleton
            row={editing}
            onSaved={(saved) => {
              setRows((prev) => mergeRow(prev, saved));
              setEditing(saved);
              notify("保存しました。");
              refresh();
            }}
          />
        ) : (
          <EditorModal
            title={editing.id != null ? `${label}を編集` : `${label}を追加`}
            onClose={() => setEditing(null)}
          >
            <EditorForm
              key={editing.id ?? "new"}
              slug={slug}
              fields={fields}
              singleton={false}
              row={editing}
              onCancel={() => setEditing(null)}
              onSaved={(saved) => {
                setRows((prev) => mergeRow(prev, saved));
                setEditing(null);
                notify("保存しました。");
                refresh();
              }}
            />
          </EditorModal>
        ))}
    </div>
  );
}

/**
 * 編集フォームを載せるモーダル。背景クリックと Escape で閉じる。
 * 入力中の取り消しは中の「キャンセル」に任せる。
 */
function EditorModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 backdrop-blur-sm sm:items-start sm:p-6 sm:pt-10"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-t-2xl border border-line bg-card sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-card px-5 py-4">
          <p className="text-base font-bold text-ink">{title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="-mr-2 inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-ink"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function EditorForm({
  slug,
  fields,
  singleton,
  row,
  onSaved,
  onCancel,
}: {
  slug: string;
  fields: FieldDef[];
  singleton: boolean;
  row: Row;
  onSaved: (row: Row) => void;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<Row>(row);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setBusy(true);
    setError("");
    const payload: Record<string, unknown> = {};
    for (const f of fields) {
      // client 型は 1 つの欄で 3 列（写真・企業名・お名前）を扱う。
      // 表示上のフィールド名 clientPhoto は列ではないので送らない。
      if (f.type === "client") {
        payload.imageUrl = values.imageUrl ?? "";
        payload.companyName = values.companyName ?? "";
        payload.clientName = values.clientName ?? "";
        continue;
      }
      payload[f.name] = values[f.name] ?? defaultFor(f);
    }
    // 一覧カードのサムネイルはギャラリー 1 枚目を使う。管理画面から
    // 個別の欄を外したので、保存のたびにここで揃えておく。
    const gallery = (values.gallery ?? []) as { value?: string }[];
    const first = gallery.find((g) => g.value)?.value ?? "";
    payload.workImageUrl = first;
    payload.thumbnailUrl = first;

    const isUpdate = values.id != null;
    const url =
      singleton || isUpdate
        ? `/api/admin/${slug}/${values.id ?? 1}`
        : `/api/admin/${slug}`;
    const method = singleton || isUpdate ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "保存に失敗しました。");
      onSaved(body.row ?? { ...values, ...payload });
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-card p-6",
        !singleton && "shadow-sm",
      )}
    >
      {!singleton && (
        <h2 className="mb-4 text-base font-semibold text-ink">
          {values.id != null ? "項目を編集" : "新規項目"}
        </h2>
      )}
      <div className="space-y-5">
        {fields.map((f) => (
          <EditableField
            key={f.name}
            field={f}
            value={values[f.name] ?? defaultFor(f)}
            onChange={(v) => setValues((prev) => ({ ...prev, [f.name]: v }))}
            // client 型だけは 3 列をまとめて扱うため、行そのものを渡す。
            row={f.type === "client" ? values : undefined}
            onRowChange={
              f.type === "client"
                ? (patch) => setValues((prev) => ({ ...prev, ...patch }))
                : undefined
            }
          />
        ))}
      </div>
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-6 flex gap-3">
        <Button onClick={save} disabled={busy}>
          {busy ? "保存中..." : "保存する"}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            キャンセル
          </Button>
        )}
      </div>
    </div>
  );
}

// --- helpers ---------------------------------------------------------------

async function onDelete(
  row: Row,
  slug: string,
  setRows: React.Dispatch<React.SetStateAction<Row[]>>,
  notify: (m: string) => void,
  refresh: () => void,
) {
  if (!confirm("この項目を削除しますか？")) return;
  const res = await fetch(`/api/admin/${slug}/${row.id}`, { method: "DELETE" });
  if (res.ok) {
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    notify("削除しました。");
    refresh();
  } else {
    const body = await res.json().catch(() => ({}));
    notify(body.error || "削除に失敗しました。");
  }
}

function defaultFor(f: FieldDef): unknown {
  if (f.type === "number") return 0;
  if (f.type === "taglist" || f.type === "kvlist" || f.type === "linklist")
    return [];
  return "";
}

function emptyRow(fields: FieldDef[], order: number): Row {
  const r: Row = {};
  for (const f of fields)
    r[f.name] = f.name === "order" ? order : defaultFor(f);
  return r;
}

function nextOrder(rows: Row[]): number {
  const max = rows.reduce((m, r) => Math.max(m, Number(r.order ?? 0)), 0);
  return max + 1;
}

function mergeRow(rows: Row[], saved: Row): Row[] {
  if (saved.id == null) return rows;
  const exists = rows.some((r) => r.id === saved.id);
  return exists
    ? rows.map((r) => (r.id === saved.id ? { ...r, ...saved } : r))
    : [...rows, saved];
}

function primaryLabel(row: Row, fields: FieldDef[]): string {
  const first = fields.find((f) => f.type === "text");
  return String(row[first?.name ?? "id"] ?? "（無題）") || "（無題）";
}

function secondaryLabel(row: Row, fields: FieldDef[]): string {
  const second = fields.find((f) => f.type === "textarea");
  const text = String(row[second?.name ?? ""] ?? "");
  return text.length > 60 ? text.slice(0, 60) + "…" : text;
}
