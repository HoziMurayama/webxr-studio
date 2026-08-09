import { Hero } from "@/components/sections/Hero";
import { CtoMessage } from "@/components/sections/CtoMessage";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { Portfolio } from "@/components/sections/Portfolio";
import { CompanyProfile } from "@/components/sections/CompanyProfile";
import { Faq } from "@/components/sections/Faq";
import { getCompany, getPortfolio, getFaqs } from "@/lib/content";

// Content is DB-driven and editable from the admin; render on each request so
// edits appear immediately.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [company, portfolio, faqs] = await Promise.all([
    getCompany(),
    getPortfolio(),
    getFaqs(),
  ]);

  return (
    <>
      <Hero company={company} />
      <CtoMessage />
      <div className="reveal">
        <About showClosing={false} teamLayout="carousel" />
        {/* 会社概要のみ。沿革と企業理念は /company に置く。 */}
        <CompanyProfile
          eyebrow="COMPANY"
          title="会社案内"
          description="会社概要と沿革、私たちが大切にしている考え方をご紹介します。"
          tone="muted"
        />
        <Services />
        <Portfolio items={portfolio} />
        <Faq faqs={faqs} tone="default" />
      </div>
    </>
  );
}
