"use client";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "@/components/ui/useInView";

const PROMPT = "Use the visualkit-editing skill to cut /proj/interview.mp4 into a 15s teaser with a title card. Preview before you render.";
const RESULTS = [
  "skill loaded · visualkit-editing",
  "scanned /proj · 4 assets",
  "run_0043 · 2 changes · committed",
  "preview grid ready · contact_sheet.jpg",
];

export default function TypedPrompt() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.6);
  const reduced = useReducedMotion();
  const [count, setN] = useState(0);
  const n = reduced ? PROMPT.length : count;
  const typedSoFar = useRef(0); // survives effect cleanup, so typing resumes instead of stalling

  useEffect(() => {
    if (reduced || !inView || typedSoFar.current >= PROMPT.length) return;
    const id = setInterval(() => {
      typedSoFar.current += 1;
      setN(typedSoFar.current);
      if (typedSoFar.current >= PROMPT.length) clearInterval(id);
    }, 26);
    return () => clearInterval(id);
  }, [inView, reduced]);

  const done = n >= PROMPT.length;

  return (
    <div className="typed" ref={ref}>
      <div className="typed-bar" aria-hidden="true"><i /><i /><i /><span>my-edit · agent</span></div>
      <pre aria-label={PROMPT}>
        <code aria-hidden="true"><span className="typed-you">you ›</span> {PROMPT.slice(0, n)}<span className={"caret" + (done ? " is-idle" : "")} /></code>
      </pre>
      <ul className={"typed-out" + (done ? " is-in" : "")} aria-hidden={!done}>
        {RESULTS.map((r, i) => (
          <li key={r} style={{ ["--i" as string]: i }}><span>✓</span> {r}</li>
        ))}
      </ul>
    </div>
  );
}
