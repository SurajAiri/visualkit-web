import { Check, ShieldCheck } from "lucide-react";
import RunReport from "./RunReport";
import Reveal from "./Reveal";

export default function Safety() {
  return (
    <section className="safety-section" id="trust">
      <div className="safety-orb" aria-hidden="true">
        <span className="safety-ring ring-a" />
        <span className="safety-ring ring-b" />
        <div><ShieldCheck size={36} /></div>
      </div>

      <Reveal className="safety-copy">
        <span className="section-kicker">05 — TRUST THE PROCESS</span>
        <h2>
          Experiment freely.<br />
          <span>Nothing breaks silently.</span>
        </h2>
        <p>
          Every value is checked. Every run is recorded—even the failed ones. A save is atomic: it all lands, or nothing
          does. Your previous revision stays intact.
        </p>
        <div className="safety-points">
          <span><Check size={14} aria-hidden /> Object-level checks</span>
          <span><Check size={14} aria-hidden /> Graph-level validation</span>
          <span><Check size={14} aria-hidden /> Atomic, versioned saves</span>
        </div>
      </Reveal>

      <RunReport />
    </section>
  );
}
