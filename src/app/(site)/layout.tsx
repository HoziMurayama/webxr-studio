import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FooterBanner } from "@/components/layout/FooterBanner";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/content";

// This layout reads DB-backed settings (footer email/phone/address/socials).
// `dynamic` does NOT inherit from the child page, so without this the layout
// would be rendered once at build time and admin edits would never appear.
export const dynamic = "force-dynamic";

// SEO fields are admin-editable, so the public site's title/description come
// from the DB. Falls back to the root layout's static defaults when unset.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings?.seoTitle?.trim();
  const description = settings?.seoDescription?.trim();

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(title || description
      ? {
          openGraph: {
            ...(title ? { title } : {}),
            ...(description ? { description } : {}),
          },
        }
      : {}),
  };
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-screen flex-col">
      {/* 管理画面の保存を待ち受ける常時接続は置かない。訪問者ごとに関数が
          開きっぱなしになり、待っている間もずっと課金対象になるため。
          このレイアウトは `force-dynamic` なので、次の遷移や再読み込みで
          最新の内容が出る。 */}
      <Header />
      <main className="flex-1">{children}</main>
      {/* 全ページ共通の問い合わせ導線。フッターの直前に置く。 */}
      <FooterBanner />
      <Footer settings={settings} />
      <ScrollToTop />
    </div>
  );
}
