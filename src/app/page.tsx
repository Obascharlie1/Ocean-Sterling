import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { Bento } from "@/components/sections/Bento";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { InvestmentPlans } from "@/components/sections/InvestmentPlans";
import { Testimonials } from "@/components/sections/Testimonials";
import { Certifications } from "@/components/sections/Certifications";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { LiveTradeFeed } from "@/components/ui/LiveTradeFeed";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <Bento />
        <HowItWorks />
        <InvestmentPlans />
        <Testimonials />
        <Certifications />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <LiveTradeFeed />
    </>
  );
}
