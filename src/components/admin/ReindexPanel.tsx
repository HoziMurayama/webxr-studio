"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function ReindexPanel() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function reindex() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/reindex", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "再構築に失敗しました。");
      setMsg(`インデックスを再構築しました（${body.chunks} チャンク）。`);
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "再構築に失敗しました。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button onClick={reindex} disabled={busy}>
        {busy ? "再構築中..." : "インデックスを再構築"}
      </Button>
      {msg && <p className="text-sm text-ink-soft">{msg}</p>}
    </div>
  );
}
