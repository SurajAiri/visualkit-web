import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/hero/Hero";
import Architecture from "@/components/architecture/Architecture";
import Benefits from "@/components/benefits/Benefits";
import EngineStates from "@/components/engine-states/EngineStates";
import History from "@/components/history/History";
import BackendsSection from "@/components/backends/BackendsSection";
import ClaimSection from "@/components/claimed-region/ClaimSection";
import MoreFeatures from "@/components/more-features/MoreFeatures";
import Faq from "@/components/faq/Faq";
import Closing from "@/components/closing/Closing";
import LaunchGate from "@/components/countdown/LaunchGate";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Architecture />
        <Benefits />
        <EngineStates />
        <History />
        <BackendsSection />
        <ClaimSection />
        <MoreFeatures />
        <Faq />
        {/* Countdown until LAUNCH_AT (lib/site.ts), then Get started. Remove the wrapper to drop the countdown. */}
        <LaunchGate>
          <Closing />
        </LaunchGate>
      </main>
      <Footer />
    </>
  );
}
