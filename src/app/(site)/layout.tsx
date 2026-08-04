import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ai/ChatWidget";
import { IntroOverlay } from "@/components/brand/IntroOverlay";
import { getSiteSettings } from "@/lib/content";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Intro overlay — loaded and mounted client-side to avoid SSR/hydration
          mismatches with the custom element. */}
      <IntroOverlay />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <ChatWidget />
    </div>
  );
}
