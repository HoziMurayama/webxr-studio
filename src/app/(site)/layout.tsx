import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ai/ChatWidget";
import { LiveContent } from "@/components/LiveContent";
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
      {/* Refreshes this route when an admin save is broadcast. Renders nothing. */}
      <LiveContent />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <ChatWidget />
    </div>
  );
}
