/**
 * お客様のお写真が未登録のときに出す既定のアバター。
 *
 * 事例の一覧カードと詳細ページのバナーで共有する。写真の枠をそのまま
 * 埋めるので、`className` で高さや比率を指定して使う。
 */
export function AvatarFallback({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center bg-surface-2 ${className ?? ""}`}
    >
      {/* 頭と肩だけの人物シルエット。塗りは線より一段薄くして、
          写真がある他のカードと並んだときに主張しすぎないようにする。 */}
      <svg
        viewBox="0 0 64 64"
        className="h-2/5 w-auto text-muted/45"
        fill="currentColor"
      >
        <circle cx="32" cy="21" r="12" />
        <path d="M32 37c-11.6 0-21 7.6-21 17v6h42v-6c0-9.4-9.4-17-21-17z" />
      </svg>
    </div>
  );
}
