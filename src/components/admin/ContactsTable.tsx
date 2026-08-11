"use client";

import { useEffect, useRef, useState } from "react";
import type { Contact } from "@/db/schema";
import { cn } from "@/lib/utils";

/** 通知の可否をこの端末に覚えさせる。端末ごとの設定なので localStorage。 */
const NOTIFY_KEY = "webxr-admin-notify";

/**
 * ブラウザがそのまま開ける拡張子。
 *
 * 画像・PDF・動画・音声・テキストは新しいタブで見られる。zip や Office
 * 形式は開けずに落ちるだけなので、閲覧ボタンを出さずダウンロードに絞る。
 */
const VIEWABLE = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "avif",
  "svg",
  "bmp",
  "ico",
  "pdf",
  "mp4",
  "webm",
  "ogv",
  "mov",
  "mp3",
  "wav",
  "ogg",
  "m4a",
  "txt",
  "csv",
  "json",
  "xml",
  "md",
]);

function extOf(nameOrUrl: string): string {
  // URL のクエリや断片を落としてから拡張子を見る。
  const clean = nameOrUrl.split(/[?#]/)[0] ?? "";
  return clean.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? "";
}

/** その添付をブラウザで開けるか。 */
function canView(name: string, url: string): boolean {
  return VIEWABLE.has(extOf(name) || extOf(url));
}

/**
 * 保存用の URL。
 *
 * `download` 属性は別ドメインの相手には効かず、Cloudinary の URL では
 * ただ開くだけになる。`fl_attachment` を挟むと Content-Disposition が
 * 付いて確実に保存される。data URL（旧データ）は同一文書扱いなので
 * そのままで効く。
 */
function downloadUrl(url: string): string {
  if (!url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", "/upload/fl_attachment/");
}

/**
 * ISO の 2 文字コードを旗の絵文字にする。
 *
 * 各文字を「地域表示記号」（U+1F1E6 から始まる A–Z）に移すと、2 文字の
 * 並びがその国の旗として描画される。画像を持たずに済む。
 */
function flagOf(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return "";
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

export function ContactsTable({ initialRows }: { initialRows: Contact[] }) {
  const [rows, setRows] = useState(initialRows);
  const [notify, setNotify] = useState(false);
  // 直近で見た最大 id。これより大きい行が来たら新着とみなす。
  const seenId = useRef(Math.max(0, ...initialRows.map((r) => r.id)));

  // 保存済みの設定を読む。許可が取り消されていたら off に倒す。
  useEffect(() => {
    if (typeof Notification === "undefined") return;
    const saved = localStorage.getItem(NOTIFY_KEY) === "on";
    setNotify(saved && Notification.permission === "granted");
  }, []);

  /**
   * 新着を SSE で受け取る。
   *
   * ブラウザから数秒おきに HTTP を投げるのではなく、接続を張ったまま
   * サーバーからの通知を待つ。変化が無い間は往復が発生しない。
   *
   * 変化の検出はサーバー側で DB を見て行う。購読者をメモリに置く
   * pub/sub は、Vercel のように複数インスタンスへ分かれる環境では
   * 書き込みを受けた側にしか届かないため。
   *
   * 接続が切れたら EventSource が自動で繋ぎ直す。Vercel の実行時間の
   * 上限でサーバー側から畳まれるので、これは通常運転の一部。
   */
  useEffect(() => {
    // 通知が off のときは、背面にいる間は繋がない。前面に戻ったら張り直す。
    let es: EventSource | null = null;

    /** 変化の知らせを受けたら、一覧を取り直して差分を通知する。 */
    async function refresh() {
      try {
        const res = await fetch("/api/admin/contacts", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { rows?: Contact[] };
        const fresh = data.rows ?? [];
        const incoming = fresh.filter((r) => r.id > seenId.current);

        setRows(fresh);
        if (incoming.length === 0) return;
        seenId.current = Math.max(...fresh.map((r) => r.id));

        if (notify && typeof Notification !== "undefined") {
          for (const r of incoming.slice(0, 3)) {
            const n = new Notification("新しいお問い合わせ", {
              body: `${r.name}様${r.company ? `（${r.company}）` : ""}\n${r.service || ""}`,
              tag: `contact-${r.id}`,
              // 手を離している間に届くこともあるので、操作するまで残す。
              requireInteraction: true,
            });
            // 押したらこのタブへ戻す。別のタブを見ていても、その場で
            // 内容を確かめられる。
            n.onclick = () => {
              window.focus();
              n.close();
            };
          }
        }
      } catch {
        // 取得に失敗しても接続は保つ。次の知らせで取り直せる。
      }
    }

    function connect() {
      if (es) return;
      es = new EventSource("/api/admin/contacts/stream");
      es.addEventListener("change", refresh);
      es.onerror = () => {
        // EventSource は自動で再接続する。ここでは閉じない。
      };
    }

    function disconnect() {
      es?.close();
      es = null;
    }

    // 通知が有効なら常時つなぐ。無効なら前面のときだけ。
    const shouldConnect = () => notify || !document.hidden;
    if (shouldConnect()) connect();

    const onVisible = () => {
      if (shouldConnect()) {
        connect();
        // 切れていた間の分を取り戻す。
        refresh();
      } else {
        disconnect();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      disconnect();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [notify]);

  async function toggleNotify() {
    if (typeof Notification === "undefined") {
      alert("このブラウザは通知に対応していません。");
      return;
    }
    if (notify) {
      setNotify(false);
      localStorage.setItem(NOTIFY_KEY, "off");
      return;
    }
    // 許可はユーザー操作の中でしか求められない。
    const perm =
      Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();
    if (perm !== "granted") {
      alert(
        "通知が許可されませんでした。ブラウザのアドレスバー左の設定から許可できます。",
      );
      return;
    }
    setNotify(true);
    localStorage.setItem(NOTIFY_KEY, "on");
    new Notification("通知を有効にしました", {
      body: "新しいお問い合わせが届くとお知らせします。",
    });
  }

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
    const res = await fetch(`/api/admin/contacts/${row.id}`, {
      method: "DELETE",
    });
    if (res.ok) setRows((prev) => prev.filter((r) => r.id !== row.id));
  }

  return (
    <div>
      {/* 通知の切り替え。端末ごとの設定なので、ここに置いて即座に試せる
          ようにする。 */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-card px-4 py-3">
        <div>
          <p className="text-sm font-medium text-ink">新着の通知</p>
          <p className="mt-0.5 text-xs text-muted">
            このタブを開いたままにしておけば、別のタブを見ている間でも新着をお知らせします。
          </p>
        </div>
        <button
          type="button"
          onClick={toggleNotify}
          aria-pressed={notify}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors",
            notify
              ? "bg-ink text-white hover:bg-ink-soft"
              : "border border-line text-ink-soft hover:bg-surface",
          )}
        >
          <span
            className={cn(
              "inline-block h-2 w-2 rounded-full",
              notify ? "bg-green-400" : "bg-line",
            )}
          />
          {notify ? "オン" : "オフ"}
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-card px-4 py-12 text-center text-sm text-muted">
          まだお問い合わせはありません。
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li
              key={r.id}
              className={cn(
                "rounded-xl border bg-card p-5",
                r.handled ? "border-line opacity-70" : "border-accent/40",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">
                    {r.name}
                    {r.company && (
                      <span className="ml-2 text-sm font-normal text-muted">
                        {r.company}
                      </span>
                    )}
                  </p>
                  <a
                    href={`mailto:${r.email}`}
                    className="text-sm text-accent-ink hover:underline"
                  >
                    {r.email}
                  </a>
                  {r.phone && (
                    <span className="ml-3 text-sm text-muted">{r.phone}</span>
                  )}
                </div>
                <time className="text-xs text-muted">
                  {new Date(r.createdAt).toLocaleString("ja-JP")}
                </time>
              </div>

              {/* 相談の種類と送信元。どこから来た誰の相談かを一目で。 */}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                {r.service && (
                  <span className="rounded-full bg-surface px-2.5 py-1 font-medium text-ink-soft">
                    {r.service}
                  </span>
                )}
                {(r.country || r.city) && (
                  <span className="inline-flex items-center gap-1.5">
                    {flagOf(r.countryCode) && (
                      <span aria-hidden className="text-sm leading-none">
                        {flagOf(r.countryCode)}
                      </span>
                    )}
                    {[r.country, r.city].filter(Boolean).join(" / ")}
                  </span>
                )}
                {r.ip && <span className="tabular-nums">IP {r.ip}</span>}
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                {r.message}
              </p>

              {/* 添付。Cloudinary に上げたものは URL、旧データは data URL。
                  どちらも download 属性でそのまま保存できる。 */}
              {(r.attachmentUrl || r.attachmentData) && (
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden
                    width="14"
                    height="14"
                    className="shrink-0 text-muted"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21.4 11.05 12.25 20.2a6 6 0 0 1-8.49-8.49l9.2-9.19a4 4 0 0 1 5.65 5.66l-9.2 9.19a2 2 0 0 1-2.82-2.83l8.49-8.48" />
                  </svg>
                  <span className="min-w-0 flex-1 truncate text-xs text-ink">
                    {r.attachmentName || "添付ファイル"}
                  </span>

                  {/* ブラウザで開ける形式だけ「開く」を出す。zip などは
                      押しても落ちるだけなので、ダウンロードに絞る。 */}
                  {canView(r.attachmentName, r.attachmentUrl) && (
                    <a
                      href={r.attachmentUrl || r.attachmentData}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-md border border-line bg-card px-2.5 py-1 text-xs font-medium text-ink hover:bg-surface-2"
                    >
                      開く
                    </a>
                  )}
                  <a
                    href={downloadUrl(r.attachmentUrl || r.attachmentData)}
                    download={r.attachmentName || undefined}
                    className="shrink-0 rounded-md border border-line bg-card px-2.5 py-1 text-xs font-medium text-ink hover:bg-surface-2"
                  >
                    保存
                  </a>
                </div>
              )}

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
      )}
    </div>
  );
}
