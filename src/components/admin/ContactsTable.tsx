"use client";

import { useState } from "react";
import type { Contact } from "@/db/schema";
import { cn } from "@/lib/utils";

export function ContactsTable({ initialRows }: { initialRows: Contact[] }) {
  const [rows, setRows] = useState(initialRows);

  async function toggle(row: Contact) {
    const res = await fetch(`/api/admin/contacts/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handled: !row.handled }),
    });
    if (res.ok) {
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, handled: !r.handled } : r)),
      );
    }
  }

  async function remove(row: Contact) {
    if (!confirm("このお問い合わせを削除しますか？")) return;
    const res = await fetch(`/api/admin/contacts/${row.id}`, { method: "DELETE" });
    if (res.ok) setRows((prev) => prev.filter((r) => r.id !== row.id));
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-white px-4 py-12 text-center text-sm text-muted">
        まだお問い合わせはありません。
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li
          key={r.id}
          className={cn(
            "rounded-xl border bg-white p-5",
            r.handled ? "border-line opacity-70" : "border-accent/40",
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-ink">
                {r.name}
                {r.company && <span className="ml-2 text-sm font-normal text-muted">{r.company}</span>}
              </p>
              <a href={`mailto:${r.email}`} className="text-sm text-accent-ink hover:underline">
                {r.email}
              </a>
            </div>
            <time className="text-xs text-muted">
              {new Date(r.createdAt).toLocaleString("ja-JP")}
            </time>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
            {r.message}
          </p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => toggle(r)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium",
                r.handled
                  ? "bg-surface text-ink-soft hover:bg-surface-2"
                  : "bg-ink text-white hover:bg-ink-soft",
              )}
            >
              {r.handled ? "未対応に戻す" : "対応済みにする"}
            </button>
            <button
              onClick={() => remove(r)}
              className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              削除
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
