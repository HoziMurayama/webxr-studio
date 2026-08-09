import { Hero } from "@/components/sections/Hero";
import { CtoMessage } from "@/components/sections/CtoMessage";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { Portfolio } from "@/components/sections/Portfolio";
import { Team } from "@/components/sections/Team";
import { Faq } from "@/components/sections/Faq";
import {
  getCompany,
  getServices,
  getPortfolio,
  getTeam,
  getFaqs,
} from "@/lib/content";

// Content is DB-driven and editable from the admin; render on each request so
// edits appear immediately.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [company, services, portfolio, team, faqs] = await Promise.all([
    getCompany(),
    getServices(),
    getPortfolio(),
    getTeam(),
    getFaqs(),
  ]);

  return (
    <>
      <Hero company={company} />
      <CtoMessage />
      <div className="reveal">
        <About showClosing={false} />
        <Services services={services} />
        <Portfolio items={portfolio} />
        <Team members={team} />
        <Faq faqs={faqs} />
      </div>
    </>
  );
}
