import type { ReactNode } from "react";
import { ArrowRight, Check, CodeXml, Film, GitBranch, Layers, LockKeyhole, RefreshCw, ShieldCheck, Workflow } from "lucide-react";
import Reveal from "./Reveal";
import BackendHub from "./BackendHub";
import { DOCS_URL } from "@/lib/site";
import { FEATURES } from "@/lib/features";
import { statusOf } from "@/lib/registry";

function Row({
  n, tag, icon, title, body, href, cta, external, children, className = "",
}: {
  n: string; tag: string; icon: ReactNode; title: string; body: string; href: string; cta: string;
  external?: boolean; children: ReactNode; className?: string;
}) {
  return (
    <Reveal as="article" className={"feature-row " + className}>
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

// Worked example: 10s of footage played at 2x becomes a 5s clip.
// Pre keys sit at 2s and 7s of source, so they land at 1s and 3.5s of clip time.
const SRC = [20, 70];
const POST = 52;

export default function Features() {
  const shown = Object.keys(FEATURES).filter((id) => statusOf(id) !== "hidden");

  return (
    <section className="feature-section" id="features">
      <Reveal className="feature-heading">
        <div>
          <span className="section-kicker">03 — MADE FOR MOTION</span>
          <h2>
            The hard parts,<br />
            <span>made legible.</span>
          </h2>
        </div>
        <span className="feature-count">FIVE WAYS TO WORK<br /><strong>ONE SHARED MODEL</strong></span>
      </Reveal>

      <div className="feature-list">
        <Row n="01" tag="SCRIPT BATCHES" icon={<CodeXml size={13} aria-hidden />} title="Edit in batches." href="#trust" cta="See a run report"
          body="One script. A hundred thoughtful changes. Every run is validated, versioned, and easy to undo.">
          <div className="batch-art">
            <div className="batch-code">
              <span>01</span> clip.transform.scale = <b>1.08</b><br />
              <span>02</span> clip.effects.<em>add</em>(<u>&quot;grain&quot;</u>)<br />
              <span>03</span> clip.opacity = <b>0.92</b>
            </div>
            <ArrowRight className="batch-arrow" size={22} aria-hidden />
            <div className="batch-result">
              <ShieldCheck size={18} aria-hidden />
              <strong>3 changes</strong>
              <small>validated together</small>
              <div><Check size={13} aria-hidden /> atomic save</div>
            </div>
            <div className="batch-stamp" aria-hidden="true">ALL OR NOTHING</div>
          </div>
        </Row>

        <Row n="02" tag="COLLABORATION" icon={<GitBranch size={13} aria-hidden />} title="Many agents. One timeline." href="#claimed-region" cta="See the claim flow"
          body="Exclusive time-range locks protect every track, isolate edits on a local clock, and release changes without collisions.">
          <a className="collab-summary" href="#claimed-region">
            <span className="collab-summary-lock"><LockKeyhole size={18} aria-hidden /></span>
            <span><strong>One lock. Every track.</strong><small>Exclusive writes, shared immutable context.</small></span>
            <ArrowRight size={16} aria-hidden />
          </a>
        </Row>

        <Row n="03" tag="TIMELINE ENGINE" icon={<Workflow size={13} aria-hidden />} title="Time stays in sync." href={DOCS_URL} cta="Read about time" external
          body="Source-anchored and clip-anchored keyframes stay true through trims, speed ramps, and splits.">
          <div className="pipeline-graphic">
            {[
              { name: "source", len: "10s", bar: [10, 80], marks: SRC, tone: "blue" },
              { name: "clip", len: "5s", bar: [14, 86], marks: SRC, tone: "blue" },
              { name: "timeline", len: "00:18", bar: [6, 74], marks: [POST], tone: "orange" },
            ].map((r) => (
              <div className="pipeline-ruler" key={r.name}>
                <span>{r.name}</span>
                <div className="ruler-track">
                  <b className="ruler-span" style={{ left: r.bar[0] + "%", width: r.bar[1] - r.bar[0] + "%" }} />
                  {r.marks.map((m) => (
                    <i className={"key key-" + r.tone} key={m} style={{ left: r.bar[0] + ((r.bar[1] - r.bar[0]) * m) / 100 + "%" }} />
                  ))}
                </div>
                <strong>{r.len}</strong>
              </div>
            ))}
            <div className="pipeline-flow">
              <span>PRE KEYFRAMES</span><ArrowRight size={14} aria-hidden />
              <span className="speed-pill">2× SPEED</span><ArrowRight size={14} aria-hidden />
              <span>POST KEYFRAMES</span>
            </div>
            <div className="pipeline-caption">
              <span className="dot-blue" /> footage moments travel with the source
              <span className="dot-orange" /> clip motion stays in place
            </div>
          </div>
        </Row>

        <Row n="04" tag="CODED CLIPS" icon={<Film size={13} aria-hidden />} title="Code becomes a clip." href={DOCS_URL} cta="Read about coded clips" external
          body="Compile Remotion, HTML, OpenCV, or audio code into clips that behave like any other media.">
          <div className="flow-graphic" role="img" aria-label="Code is validated, compiled into an asset, and placed on the timeline">
            <div className="flow-code">
              <div className="mini-window" aria-hidden="true"><i /><i /><i /></div>
              <code>
                <span>01</span> intro = visualkit.<strong>clip</strong>(<br />
                <span>02</span> {"    "}source=<u>&quot;remotion&quot;</u>,<br />
                <span>03</span> {"    "}duration=<mark>4</mark>,<br />
                <span>04</span> )
              </code>
              <span className="code-caption">A coded visual, in a batch.</span>
            </div>
            <div className="flow-steps" aria-hidden="true">
              <div className="flow-step"><span className="step-icon step-check"><Check size={14} /></span><span>validate</span></div>
              <i />
              <div className="flow-step"><span className="step-icon step-compile"><RefreshCw size={14} /></span><span>compile</span></div>
              <i />
              <div className="flow-step"><span className="step-icon step-ready"><Film size={14} /></span><span>clip asset</span></div>
            </div>
            <div className="flow-result" aria-hidden="true">
              <div className="result-frame"><div className="result-sun" /><div className="result-hill hill-a" /><div className="result-hill hill-b" /><span>04:12</span></div>
              <div className="result-label"><span>visual clip</span><Check size={13} /></div>
            </div>
          </div>
        </Row>

        <Row n="05" tag="BACKEND ADAPTERS" icon={<Layers size={13} aria-hidden />} title="One project. Any backend." href="#backends" cta="Meet the adapters"
          body="Keep your edit backend-neutral, then hand a settled snapshot to the renderer you choose.">
          <BackendHub />
        </Row>
      </div>

      <Reveal as="details" className="capabilities">
        <summary>Everything in the box · {shown.length} capabilities</summary>
        <ul>
          {shown.map((id) => {
            const s = statusOf(id);
            return (
              <li key={id} className={s === "live" ? "" : "is-soon"}>
                {FEATURES[id]}
                {s !== "live" && <i>{s === "upcoming" ? "soon" : s}</i>}
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}
