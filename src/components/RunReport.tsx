"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, LockKeyhole, RotateCcw } from "lucide-react";
import { prefersReducedMotion, useInView } from "./useInView";

const LINES = [
  { n: "01", code: "clip.transform.scale = 1.08", ok: true },
  { n: "02", code: 'engine.commit("visual_pass")', ok: true },
  { n: "03", code: "overlap on V1 · 01J9N / 01J9M", ok: false },
];

export default function RunReport() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.5);
  const [shown, setShown] = useState(0); // 0..4: lines 1-3, then the verdict
  const [run, setRun] = useState(1);
  const started = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion()) { setShown(4); return; }
    if (!inView && !started.current) return;
    started.current = true;
    setShown(0);
    const timers = [1, 2, 3, 4].map((n) => setTimeout(() => setShown(n), 650 * n));
    return () => timers.forEach(clearTimeout);
  }, [inView, run]);

  const done = shown >= 4;

  return (
    <div className="validation-card" ref={ref}>
      <div className="validation-head">
        <span><span className={"status-dot" + (done ? " is-fail" : "")} /> RUN REPORT</span>
        <span>run_0042</span>
      </div>

      {LINES.map((l, idx) => {
        const visible = shown > idx;
        return (
          <div className={"validation-line" + (l.ok ? "" : " error-line") + (visible ? " is-in" : "")} key={l.n}>
            <span>{l.n}</span>
            <code>{l.code}</code>
            <b aria-label={l.ok ? "passed" : "failed"}>{l.ok ? <Check size={14} aria-hidden /> : "!"}</b>
          </div>
        );
      })}

      <div className={"validation-result" + (done ? " is-in" : "")}>
        <LockKeyhole size={16} aria-hidden />
        <span>
          <strong>Nothing written.</strong>
          <small>Previous revision is safe.</small>
        </span>
        <button className="replay" onClick={() => setRun((r) => r + 1)} aria-label="Replay the run">
          {done ? <RotateCcw size={14} aria-hidden /> : <ArrowRight size={14} aria-hidden />}
        </button>
      </div>
    </div>
  );
}
