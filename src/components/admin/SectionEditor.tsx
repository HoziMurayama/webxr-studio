"use client";

import { useState } from "react";
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
            {singleton ? "内容を編集して保存します。" : "項目の追加・編集・削除ができます。"}
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
            <li className="rounded-xl border border-dashed border-line bg-white px-4 py-8 text-center text-sm text-muted">
              まだ項目がありません。「新規追加」から作成してください。
            </li>
          )}
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-line bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{primaryLabel(r, fields)}</p>
                <p className="truncate text-xs text-muted">{secondaryLabel(r, fields)}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditing(r)}>
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

      {editing && (
        <EditorForm
          key={editing.id ?? "new"}
          slug={slug}
          fields={fields}
          singleton={singleton}
          row={editing}
          onCancel={singleton ? undefined : () => setEditing(null)}
          onSaved={(saved) => {
            setRows((prev) => mergeRow(prev, saved));
            if (!singleton) setEditing(null);
            else setEditing(saved);
            notify("保存しました。");
            refresh();
          }}
        />
      )}
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
    for (const f of fields) payload[f.name] = values[f.name] ?? defaultFor(f);

    const isUpdate = values.id != null;
    const url =
      singleton || isUpdate ? `/api/admin/${slug}/${values.id ?? 1}` : `/api/admin/${slug}`;
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
    <div className={cn("rounded-2xl border border-line bg-white p-6", !singleton && "shadow-sm")}>
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
          />
        ))}
      </div>
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
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
  if (f.type === "taglist" || f.type === "kvlist" || f.type === "linklist") return [];
  return "";
}

function emptyRow(fields: FieldDef[], order: number): Row {
  const r: Row = {};
  for (const f of fields) r[f.name] = f.name === "order" ? order : defaultFor(f);
  return r;
}

function nextOrder(rows: Row[]): number {
  const max = rows.reduce((m, r) => Math.max(m, Number(r.order ?? 0)), 0);
  return max + 1;
}

function mergeRow(rows: Row[], saved: Row): Row[] {
  if (saved.id == null) return rows;
  const exists = rows.some((r) => r.id === saved.id);
  return exists ? rows.map((r) => (r.id === saved.id ? { ...r, ...saved } : r)) : [...rows, saved];
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
