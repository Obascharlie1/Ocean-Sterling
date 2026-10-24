import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { Features } from "@/components/sections/Features";
import { DashboardPreview } from "@/components/sections/DashboardPreview";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { MarketAnalysis } from "@/components/sections/MarketAnalysis";
import { InvestmentPlans } from "@/components/sections/InvestmentPlans";
import { Testimonials } from "@/components/sections/Testimonials";
import { Certifications } from "@/components/sections/Certifications";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { LiveTradeFeed } from "@/components/ui/LiveTradeFeed";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <Features />
        <DashboardPreview />
        <HowItWorks />
        <MarketAnalysis />
        <InvestmentPlans />
        <Testimonials />
        <Certifications />
        <FinalCTA />
      </main>
      <Footer />
      <LiveTradeFeed />
    </>
  );
}
