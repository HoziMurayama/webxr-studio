import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://web-xr.studio"),
  title: {
    default: "WEB-XR.STUDIO｜Web・アプリ・AI開発スタジオ",
    template: "%s｜WEB-XR.STUDIO",
  },
  description:
    "WEB-XR.STUDIOは、Web制作・システム開発・アプリ開発・AIソリューションを一気通貫で提供する開発スタジオです。作って終わりではなく、育て続けるITパートナー。",
  openGraph: {
    title: "WEB-XR.STUDIO｜Web・アプリ・AI開発スタジオ",
    description:
      "Web制作・システム開発・アプリ開発・AIソリューションを一気通貫で提供する開発スタジオ。",
    type: "website",
    locale: "ja_JP",
    siteName: "WEB-XR.STUDIO",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // `suppressHydrationWarning` guards against browser extensions that mutate
    // <html> before React hydrates — a common source of spurious warnings.
    <html lang="ja" className="h-full antialiased" suppressHydrationWarning>
      {/* Extensions (Grammarly and similar) stamp attributes such as
          `bis_register` and `__processed_*` onto <body> before React hydrates,
          which React reports as a mismatch. Suppressing here covers this
          element's own attributes; it does not cascade to descendants. */}
      <body className="min-h-full" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
