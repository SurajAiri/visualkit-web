import { ArrowDown, ArrowRight } from "lucide-react";
import HeroTimeline from "./HeroTimeline";
import InstallCommand from "./InstallCommand";
import TickRule from "./TickRule";
import { DOCS_URL } from "@/lib/site";

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <div className="eyebrow">OPEN-SOURCE VIDEO EDITING INFRASTRUCTURE</div>
        <h1>
          Give agents<br />the <span className="gradient-word">whole timeline.</span>
        </h1>
        <p className="hero-description">
          Edit video from Python. Agents describe changes in batches, claim the seconds they’re working on, and hand a
          settled snapshot to FFmpeg, DaVinci Resolve or OpenTimelineIO.
        </p>
        <div className="hero-actions">
          <a className="button-primary" href="#how-it-works">
            See how it works <ArrowDown size={16} aria-hidden />
          </a>
          <a className="button-text" href={DOCS_URL} target="_blank" rel="noreferrer">
            Meet the library <ArrowRight size={16} aria-hidden />
          </a>
        </div>
        <InstallCommand compact />
      </div>

      <HeroTimeline />

      <TickRule className="hero-ticks" />
      <div className="hero-bottom">
        <span>PYTHON 3.12+ · FFMPEG · RESOLVE · OTIO</span>
        <a className="scroll-hint" href="#how-it-works">SCROLL TO EXPLORE <ArrowDown size={13} aria-hidden /></a>
      </div>
    </section>
  );
}
