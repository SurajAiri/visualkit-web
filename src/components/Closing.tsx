import { ArrowUpRight, Sparkles } from "lucide-react";
import InstallCommand from "./InstallCommand";
import Reveal from "./Reveal";
import { DOCS_URL } from "@/lib/site";

export default function Closing() {
  return (
    <section className="closing-section" id="start">
      <div className="closing-grid" aria-hidden="true" />
      <div className="closing-orb orb-violet" aria-hidden="true" />
      <div className="closing-orb orb-orange" aria-hidden="true" />
      <Reveal className="closing-content">
        <div className="closing-spark" aria-hidden="true"><Sparkles size={22} /></div>
        <span className="section-kicker">A LIBRARY FOR WHAT’S NEXT</span>
        <h2>
          Let the agents<br />
          <span>focus on the edit.</span>
        </h2>
        <p>Give them a timeline that’s structured, collaborative, and ready for any renderer.</p>
        <div className="closing-actions">
          <a className="button-primary" href={DOCS_URL} target="_blank" rel="noreferrer">
            Read the docs <ArrowUpRight size={16} aria-hidden />
          </a>
          <InstallCommand />
        </div>
        <small className="closing-req">Python 3.12 or later. FFmpeg for probing and rendering.</small>
      </Reveal>
    </section>
  );
}
