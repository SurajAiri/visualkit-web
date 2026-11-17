import { Check, RefreshCw, ShieldCheck } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import ArchFlow from "./ArchFlow";
import "./architecture.css";

/* 01 · How it works: the whole product in one picture. Agent (or script, or GUI) → VisualKit engine → renderer. */
export default function Architecture() {
  return (
    <section className="architecture-section" id="how-it-works">
      <Reveal className="section-head">
        <div>
          <span className="section-kicker">01 / HOW IT WORKS</span>
          <h2>
            Three layers.<br />
            <span>One clean path to the screen.</span>
          </h2>
        </div>
        <p>
          Agents write the edit. VisualKit checks, versions and stores it. A renderer turns the settled result into
          video, and you can swap that renderer without touching the project.
        </p>
      </Reveal>

      <Reveal delay={80}>
        <ArchFlow />
      </Reveal>

      <div className="architecture-foot">
        <span><ShieldCheck size={14} aria-hidden /> Every run leaves a record</span>
        <span><Check size={14} aria-hidden /> Failed edits write nothing</span>
        <span><RefreshCw size={14} aria-hidden /> Any renderer can be added</span>
      </div>
    </section>
  );
}
