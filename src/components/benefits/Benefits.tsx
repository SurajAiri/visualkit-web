import type { ReactNode } from "react";
import { ArrowRight, CodeXml, Feather, Film } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { DOCS_URL } from "@/lib/site";
import BatchDemo from "./BatchDemo";
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

/* 02 · What you get. Three headline benefits; the deep dives that prove them follow as their own sections. */
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
        <span className="feature-count">BATCHED · CODED · PARALLEL<br /><strong>ONE LIGHT LIBRARY</strong></span>
      </Reveal>

      <div className="feature-list">
        <Row n="01" tag="BATCH EDITS" icon={<CodeXml size={13} aria-hidden />} title="Edit a whole video in one run."
          href="#engine" cta="See how a run is saved"
          body="One script, any number of edits, even the entire cut. The run is atomic: every change lands together, or none do.">
          <BatchDemo />
        </Row>

        <Row n="02" tag="CODED CLIPS" icon={<Film size={13} aria-hidden />} title="Code becomes a clip."
          href={`${DOCS_URL}/assets#coded-visual-assets-html--remotion`} cta="Read about coded clips"
          body="Write visuals or audio in HyperFrames, Remotion, Manim, OpenCV or any code-to-media framework. VisualKit validates and compiles them into clips you can trim, keyframe and effect like any other.">
          <CodedClips />
        </Row>

        <Row n="03" tag="LIGHTWEIGHT" icon={<Feather size={13} aria-hidden />} title="Run a whole crew at once."
          href="#claimed-region" cta="See claimed regions"
          body="DaVinci Resolve and Premiere Pro are too heavy to run two or three copies, even with MCP. VisualKit is a light library: run many agents at once, on separate projects or together on one timeline.">
          <LightFleet />
        </Row>
      </div>
    </section>
  );
}
