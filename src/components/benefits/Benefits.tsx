import type { ReactNode } from "react";
import { ArrowRight, CodeXml, Feather, Film, Workflow } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { DOCS_URL } from "@/lib/site";
import RunShapes from "./RunShapes";
import ActorsFlow from "./ActorsFlow";
import CodedClips from "./CodedClips";
import LightFleet from "./LightFleet";
import "./benefits.css";

function Row({
  n, tag, icon, title, body, href, cta, external, children,
}: {
  n: string; tag: string; icon: ReactNode; title: string; body: string; href: string; cta: string;
  external?: boolean; children: ReactNode;
}) {
  return (
    <Reveal as="article" className="feature-row">
      <div className="feature-copy">
        <span className="feature-tag">{icon}{tag}</span>
        <h3><sup>{n}</sup>{title}</h3>
        <p>{body}</p>
        <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} aria-label={`${cta}: ${title}`}>
          {cta} <ArrowRight size={15} aria-hidden />
        </a>
      </div>
      <div className="feature-art">{children}</div>
    </Reveal>
  );
}

/* 02 · What you get. Four headline benefits; the deep dives that prove them follow as their own sections. */
export default function Benefits() {
  return (
    <section className="feature-section" id="benefits">
      <Reveal className="feature-heading">
        <div>
          <span className="section-kicker">02 / WHAT YOU GET</span>
          <h2>
            The speed of code.<br />
            <span>The safety of an editor.</span>
          </h2>
        </div>
        <span className="feature-count">EDITS · CLIPS · ACTORS · AGENTS<br /><strong>ONE LIGHT LIBRARY</strong></span>
      </Reveal>

      <div className="feature-list">
        <Row n="01" tag="EDIT WITH CODE" icon={<CodeXml size={13} aria-hidden />} title="Edit videos with code."
          href={`${DOCS_URL}/core-concepts#script-execution-visualkit-exec`} cta="Read about running scripts"
          body="Write edits as Python, in one file or many. Run them all at once, phase by phase, or from several agents. Every run is atomic: it lands whole, or not at all.">
          <RunShapes />
        </Row>

        <Row n="02" tag="CODED CLIPS" icon={<Film size={13} aria-hidden />} title="Code becomes a clip."
          href={`${DOCS_URL}/assets#coded-visual-assets-html-remotion`} cta="Read about coded clips"
          body="Write visuals or audio in HyperFrames, Remotion, Manim, OpenCV or any code-to-media framework. VisualKit validates and compiles them into clips you can trim, keyframe and effect like any other.">
          <CodedClips />
        </Row>

        <Row n="03" tag="LIGHTWEIGHT" icon={<Feather size={13} aria-hidden />} title="Run a whole crew at once."
          href={`${DOCS_URL}/version-control-and-collaboration#multi-agent-claimed-regions`} cta="Read about claimed regions"
          body="DaVinci Resolve and Premiere Pro are too heavy to run two or three copies, even with MCP. VisualKit is a light library: run many agents at once, on separate projects or together on one timeline.">
          <LightFleet />
        </Row>

        <Row n="04" tag="ACTORS · PROXIES · WORKFLOWS" icon={<Workflow size={13} aria-hidden />} title="Hand the heavy jobs to actors."
          href={`${DOCS_URL}/actors#using-actors-inside-fusion-graphs`} cta="Read about actors"
          body="Actors do the outside work: finding clips, transcribing, keying, grading. Run one from the command line or drop it into a Fusion graph. Proxies let agents use AI video services while the keys stay with VisualKit.">
          <ActorsFlow />
        </Row>
      </div>
    </section>
  );
}
