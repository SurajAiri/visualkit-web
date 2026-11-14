import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import Architecture from "@/components/Architecture";
import Features from "@/components/Features";
import ClaimSection from "@/components/ClaimSection";
import Safety from "@/components/Safety";
import BackendsSection from "@/components/BackendsSection";
import Closing from "@/components/Closing";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Manifesto />
        <Architecture />
        <Features />
        <ClaimSection />
        <Safety />
        <BackendsSection />
        <Closing />
      </main>
      <Footer />
    </>
  );
}
