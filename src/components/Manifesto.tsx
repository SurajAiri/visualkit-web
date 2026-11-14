import { Workflow } from "lucide-react";
import Reveal from "./Reveal";

const EVENTS = [
  "claim R1 [12s, 24s) → maya-agent",
  "run_0041 · 3 changes · committed",
  "overlap on V1 · nothing written",
  "release · ripple +2s",
  "snapshot settled → ffmpeg",
  "claim R2 [30s, 42s) → jules-agent",
];

export default function Manifesto() {
  return (
    <section className="manifesto" id="how-it-works">
      <Reveal className="manifesto-inner">
        <span className="section-kicker">01 — THE IDEA</span>
        <div>
          <h2>
            Not another editor.<br />
            <span>A language for editing.</span>
          </h2>
          <p>
            VisualKit sits between AI agents and the tools that finish video. It gives every edit a shared, validated
            structure—then hands a clean snapshot to the renderer you already use.
          </p>
        </div>
        <div className="manifesto-aside">
          <span className="aside-icon"><Workflow size={18} aria-hidden /></span>
          <span>Describe it.<br />Validate it.<br /><strong>Render it.</strong></span>
        </div>
      </Reveal>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((n) => (
            <span className="marquee-set" key={n}>
              {EVENTS.map((e) => (
                <span key={e}>{e}<i /></span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
