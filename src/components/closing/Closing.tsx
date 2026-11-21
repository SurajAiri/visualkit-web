import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import TypedScript from "./TypedScript";
import InstallCommand from "./InstallCommand";
import Reveal from "@/components/ui/Reveal";
import { DOCS_URL, REQUIREMENTS } from "@/lib/site";
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
        <p>One install and one project file. Every edit an agent makes is checked, recorded, and easy to undo.</p>
        <div className="closing-actions">
          <Link className="button-primary" href={DOCS_URL}>
            Read the docs <ArrowUpRight size={16} aria-hidden />
          </Link>
          <InstallCommand />
        </div>
        <TypedScript />
        <small className="closing-req">{REQUIREMENTS}</small>
      </Reveal>
    </section>
  );
}
