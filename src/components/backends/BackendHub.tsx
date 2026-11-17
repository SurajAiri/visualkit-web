"use client";
import { useEffect, useRef, useState } from "react";
import { Layers, Plus } from "lucide-react";
import { prefersReducedMotion, useInView } from "@/components/ui/useInView";

// Nodes sit on a 100x100 grid so the SVG connectors and the HTML labels share coordinates.
const OUT = [
  { name: "FFmpeg", mark: "ff", y: 14, role: "Renders the settled snapshot to a file." },
  { name: "DaVinci Resolve", mark: "dr", y: 38, role: "Finishes the cut in your grading suite." },
  { name: "OpenTimelineIO", mark: "ot", y: 62, role: "Hands the timeline to any tool that reads OTIO." },
  { name: "your next backend", mark: "next", y: 86, role: "Write the adapter once. The project doesn’t change." },
];
const IN = [26, 42, 58, 74];

function Mark({ kind }: { kind: string }) {
  // Neutral glyphs on purpose: these are adapters, not vendor logos.
  if (kind === "ff") return <span aria-hidden>ƒ</span>;
  if (kind === "dr") return <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden><circle cx="10" cy="10" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="10" cy="10" r="1.8" fill="currentColor" /></svg>;
  if (kind === "ot") return <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden><rect x="3.5" y="5" width="13" height="3.2" rx="1" fill="currentColor" /><rect x="3.5" y="11.8" width="8" height="3.2" rx="1" fill="currentColor" opacity=".7" /></svg>;
  return <Plus size={14} aria-hidden />;
}

export default function BackendHub({ label = "settled branch → snapshot" }: { label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.4);
  const [active, setActive] = useState(0);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (!inView || manual || prefersReducedMotion()) return;
    const id = setInterval(() => setActive((n) => (n + 1) % OUT.length), 2600);
    return () => clearInterval(id);
  }, [inView, manual]);

  const pick = (i: number) => { setManual(true); setActive(i); };

  return (
    <div className="backend-wrap" ref={ref}>
      <div className="backend-graphic">
        <svg className="backend-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {IN.map((y, i) => (
            <path key={"i" + i} d={`M 2 ${y} C 14 ${y}, 20 50, 31 50`} className="line-in" vectorEffect="non-scaling-stroke" />
          ))}
          {OUT.map((o, i) => (
            <path key={o.name} d={`M 53 50 C 60 50, 60 ${o.y}, 66 ${o.y}`} className={"line-out" + (i === active ? " is-active" : "")} vectorEffect="non-scaling-stroke" />
          ))}
        </svg>

        <div className="backend-core">
          <div className="core-icon"><Layers size={20} aria-hidden /></div>
          <span>VISUALKIT</span>
          <small>one neutral project</small>
        </div>

        <ul className="backend-nodes">
          {OUT.map((o, i) => (
            <li key={o.name} style={{ top: o.y + "%" }} className={i === active ? "is-active" : ""}>
              <button onClick={() => pick(i)} onMouseEnter={() => pick(i)} onFocus={() => pick(i)} aria-pressed={i === active} aria-label={`${o.name}: ${o.role}`}>
                <span className={"backend-mark mark-" + o.mark}><Mark kind={o.mark} /></span>
                <strong>{o.name}</strong>
              </button>
            </li>
          ))}
        </ul>

        <span className="backend-snapshot">{label}</span>
      </div>
      <p className="backend-role" aria-live="polite" key={active}>
        <b>{OUT[active].name}</b> {OUT[active].role}
      </p>
    </div>
  );
}
