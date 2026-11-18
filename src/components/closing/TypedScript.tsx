"use client";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "@/components/ui/useInView";

const LINES = [
  "with engine.claim(12, 24, owner=\"maya-agent\"):",
  "    clip.transform.scale = 1.08",
  "    clip.effects.add(\"grain\")",
  "engine.commit(\"visual_pass\")",
];
const FULL = LINES.join("\n");

export default function TypedScript() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.6);
  const reduced = useReducedMotion();
  const [count, setN] = useState(0);
  const n = reduced ? FULL.length : count;
  const typedSoFar = useRef(0); // survives effect cleanup, so typing resumes instead of stalling

  useEffect(() => {
    if (reduced || !inView || typedSoFar.current >= FULL.length) return;
    const id = setInterval(() => {
      typedSoFar.current += 1;
      setN(typedSoFar.current);
      if (typedSoFar.current >= FULL.length) clearInterval(id);
    }, 34);
    return () => clearInterval(id);
  }, [inView, reduced]);

  const done = n >= FULL.length;
  const typed = FULL.slice(0, n);

  return (
    <div className="typed" ref={ref}>
      <div className="typed-bar" aria-hidden="true"><i /><i /><i /><span>edit.py</span></div>
      <pre aria-label={FULL}><code aria-hidden="true">{typed}<span className={"caret" + (done ? " is-idle" : "")} /></code></pre>
      <div className={"typed-out" + (done ? " is-in" : "")} aria-hidden={!done}>
        <span>✓</span> run_0043 · 2 changes · committed
      </div>
    </div>
  );
}
