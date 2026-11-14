import { ArrowDown, ArrowRight } from "lucide-react";
import HeroTimeline from "./HeroTimeline";
import { DOCS_URL } from "@/lib/site";

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-pulse" /> OPEN-SOURCE VIDEO EDITING INFRASTRUCTURE</div>
        <h1>
          Give agents<br />the <span className="gradient-word">whole timeline.</span>
        </h1>
        <p className="hero-description">
          An agent-first video editing library. Describe edits in code, collaborate without collisions, and render anywhere.
        </p>
        <div className="hero-actions">
          <a className="button-primary" href="#how-it-works">
            See how it works <ArrowDown size={16} aria-hidden />
          </a>
          <a className="button-text" href={DOCS_URL} target="_blank" rel="noreferrer">
            Meet the library <ArrowRight size={16} aria-hidden />
          </a>
        </div>
        <p className="hero-proof">
          <span className="proof-avatars" aria-hidden="true"><i /><i /><i /></span>
          One project model<span> · </span>many ways to create
        </p>
      </div>

      <HeroTimeline />

      <div className="hero-bottom">
        <span>BUILT FOR THE WAY AGENTS CREATE</span>
        <a className="scroll-hint" href="#how-it-works">SCROLL TO EXPLORE <ArrowDown size={13} aria-hidden /></a>
      </div>
    </section>
  );
}
