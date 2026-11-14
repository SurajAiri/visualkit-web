"use client";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "./useInView";

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
  const started = useRef(false);

  useEffect(() => {
    if (reduced) return;
    if (!inView || started.current) return;
    started.current = true;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= FULL.length) clearInterval(id);
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
