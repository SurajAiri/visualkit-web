import { Plus } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { REQUIREMENTS } from "@/lib/site";
import "./faq.css";

const FAQ: [string, string][] = [
  ["Is VisualKit a video editor with a GUI?",
    "VisualKit is a Python library and command line. Agents describe edits as code and the engine does the rest. It is GUI-ready by design, so a GUI can sit on the same engine and walk the same history."],
  ["What can it render with?",
    "FFmpeg, DaVinci Resolve and OpenTimelineIO. Backends are adapters that read a snapshot of a settled branch, so adding another one never changes your project."],
  ["What happens if an edit has a mistake?",
    "Nothing is written. A run saves once, atomically, and every error is reported together with its file, line and object. The failed run is still recorded, so the agent can learn from it."],
  ["Can several agents edit at the same time?",
    "Yes. Each agent claims a range of the timeline and works in that region’s own local time. Others can read it but not write to it, and when a region grows or shrinks, later content ripples to stay in order."],
  ["Can I undo what an agent did?",
    "Yes. History is append-only: revert a revision, restore a checkpoint, or branch to experiment and merge back. Nothing is ever rewritten."],
  ["Which frameworks can make coded clips?",
    "HyperFrames, Remotion, Manim, OpenCV, or any library that turns code into visuals or audio. VisualKit validates the code and compiles it into a clip asset that behaves like any other clip."],
  ["Do agents ever see my API keys?",
    "No. For third-party services such as AI video generators, VisualKit’s proxy carries the requests. Agents sign in to VisualKit, and short-lived work can use a temporary key that is revoked on its own."],
  ["What do I need to install it?",
    `${REQUIREMENTS} Then run uv add visualkit, or pip install visualkit.`],
];

const LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
};

export default function Faq() {
  return (
    <section className="faq-section" id="faq">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LD) }} />
      <Reveal className="faq-head">
        <span className="section-kicker">08 / QUESTIONS</span>
        <h2>
          Good questions.<br />
          <span>Short answers.</span>
        </h2>
      </Reveal>
      <Reveal className="faq-list" delay={60}>
        {FAQ.map(([q, a], i) => (
          <details key={q} name="faq" open={i === 0}>
            <summary>{q}<Plus size={18} aria-hidden /></summary>
            <p>{a}</p>
          </details>
        ))}
      </Reveal>
    </section>
  );
}
