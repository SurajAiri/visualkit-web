import { Check, CodeXml, Film, GitBranch, Layers, RefreshCw, ShieldCheck, Workflow } from "lucide-react";
import { BrandMark } from "./Logo";
import Reveal from "./Reveal";

const MODULES = [
  { icon: Workflow, label: "Engine" },
  { icon: Film, label: "Timeline" },
  { icon: GitBranch, label: "Collaboration" },
  { icon: Layers, label: "Services" },
];

export default function Architecture() {
  return (
    <section className="architecture-section" id="architecture">
      <Reveal className="section-head">
        <div>
          <span className="section-kicker">02 — THE BRIDGE</span>
          <h2>
            Your agent’s intent.<br />
            <span>Every tool’s language.</span>
          </h2>
        </div>
        <p>One backend-neutral project. A clear path from script to screen—and a snapshot each renderer can understand.</p>
      </Reveal>

      <Reveal className="architecture-flow" delay={80}>
        <div className="arch-node agent-node">
          <div className="arch-node-icon"><CodeXml size={24} aria-hidden /></div>
          <span>AGENT / SCRIPT / GUI</span>
          <small>describes edits in batches</small>
          <div className="node-decoration" aria-hidden="true"><i /><i /><i /></div>
        </div>

        <div className="arch-connector" aria-hidden="true">
          <span>validated edits</span>
          <div className="connector-line"><i /></div>
        </div>

        <div className="arch-node library-node">
          <div className="library-heading"><BrandMark /><strong>visualkit</strong></div>
          <div className="library-modules">
            {MODULES.map(({ icon: Icon, label }) => (
              <span key={label}><Icon size={14} aria-hidden /> {label}</span>
            ))}
          </div>
          <small>validate · version · snapshot</small>
        </div>

        <div className="arch-connector" aria-hidden="true">
          <span>settled snapshot</span>
          <div className="connector-line"><i /></div>
        </div>

        <div className="arch-node renderer-node">
          <div className="renderer-icons" aria-hidden="true">
            <span>ƒ</span>
            <span><svg viewBox="0 0 20 20" width="12" height="12"><circle cx="10" cy="10" r="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="10" cy="10" r="1.8" fill="currentColor" /></svg></span>
            <span><svg viewBox="0 0 20 20" width="12" height="12"><rect x="3.5" y="5" width="13" height="3.2" rx="1" fill="currentColor" /><rect x="3.5" y="11.8" width="8" height="3.2" rx="1" fill="currentColor" opacity=".7" /></svg></span>
          </div>
          <span>RENDER / FINISH</span>
          <small>FFmpeg · Resolve · OTIO</small>
          <div className="render-bars" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        </div>
      </Reveal>

      <div className="architecture-foot">
        <span><ShieldCheck size={14} aria-hidden /> Every run leaves a record</span>
        <span><Check size={14} aria-hidden /> Failed edits write nothing</span>
        <span><RefreshCw size={14} aria-hidden /> Any backend can be added</span>
      </div>
    </section>
  );
}
