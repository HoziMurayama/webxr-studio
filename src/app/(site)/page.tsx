import { Hero } from "@/components/sections/Hero";
import { CtoMessage } from "@/components/sections/CtoMessage";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { Portfolio } from "@/components/sections/Portfolio";
import { Reviews } from "@/components/sections/Reviews";
import { Team } from "@/components/sections/Team";
import { Faq } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";
import {
  getCompany,
  getServices,
  getPortfolio,
  getReviews,
  getTeam,
  getFaqs,
  getSiteSettings,
} from "@/lib/content";

// Content is DB-driven and editable from the admin; render on each request so
// edits appear immediately.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [company, services, portfolio, reviews, team, faqs, settings] = await Promise.all([
    getCompany(),
    getServices(),
    getPortfolio(),
    getReviews(),
    getTeam(),
    getFaqs(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Hero company={company} />
      <CtoMessage />
      <div className="reveal">
        <About company={company} />
        <Services services={services} />
        <Portfolio items={portfolio} />
        <Reviews reviews={reviews} />
        <Team members={team} />
        <Faq faqs={faqs} />
        <Contact contactEmail={settings?.contactEmail || undefined} />
      </div>
    </>
  );
}
