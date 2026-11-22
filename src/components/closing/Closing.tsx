import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import TypedPrompt from "./TypedPrompt";
import SkillInstall from "./SkillInstall";
import Reveal from "@/components/ui/Reveal";
import { HUMAN_GUIDE_URL, INSTALL, REQUIREMENTS, SKILLS_URL } from "@/lib/site";
import "./closing.css";

export default function Closing() {
  return (
    <section className="closing-section" id="start">
      <div className="closing-grid" aria-hidden="true" />
      <Reveal className="closing-content">
        <span className="section-kicker">A LIBRARY FOR WHAT’S NEXT</span>
        <h2>
          Let the agents<br />
          <span>focus on the edit.</span>
        </h2>
        <p>Give your agent the VisualKit skills and describe the video. Every edit it makes is checked, recorded, and easy to undo.</p>
        <div className="closing-actions">
          <Link className="button-primary" href={SKILLS_URL}>
            Get the skills <ArrowUpRight size={16} aria-hidden />
          </Link>
          <Link className="closing-secondary" href={HUMAN_GUIDE_URL}>
            Getting started (Human) <ArrowUpRight size={15} aria-hidden />
          </Link>
        </div>
        <SkillInstall />
        <TypedPrompt />
        <small className="closing-req">
          {REQUIREMENTS} Skills drive the library, so install it too: <code>{INSTALL.uv}</code> or <code>{INSTALL.pip}</code>.
        </small>
      </Reveal>
    </section>
  );
}
