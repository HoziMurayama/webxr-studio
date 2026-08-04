import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

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
    // The intro engine (loaded client-side by <IntroOverlay> on the public
    // site) mutates <html> via data-xr-intro; suppress the resulting attribute
    // mismatch warning since that change is expected and intentional.
    <html
      lang="ja"
      className={`${notoSansJp.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
