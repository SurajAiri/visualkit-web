"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ShieldCheck, ShieldX } from "lucide-react";
import { prefersReducedMotion, useInView } from "@/components/ui/useInView";

// Break line 03 and the whole batch is rejected: that's the "all or nothing" promise, made touchable.
export default function BatchDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.5);
  const [broken, setBroken] = useState(false);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (!inView || manual || prefersReducedMotion()) return;
    const id = setInterval(() => setBroken((b) => !b), 3600);
    return () => clearInterval(id);
  }, [inView, manual]);

  return (
    <div className={"batch-art" + (broken ? " is-broken" : "")} ref={ref}>
      <div className="batch-code">
        <span>01</span> clip.transform.scale = <b>1.08</b><br />
        <span>02</span> clip.effects.<em>add</em>(<u>&quot;grain&quot;</u>)<br />
        <span className="ln-3"><span>03</span> clip.opacity = <b>{broken ? "1.4" : "0.92"}</b></span>
        {broken && <i className="ln-err" aria-hidden="true">out of range</i>}
        <br /><small className="ln-more">⋮ 120 more edits in this run</small>
      </div>

      <ArrowRight className="batch-arrow" size={22} aria-hidden />

      <div className="batch-result" aria-live="polite">
        {broken ? <ShieldX size={18} aria-hidden /> : <ShieldCheck size={18} aria-hidden />}
        <strong>{broken ? "Nothing written" : "123 changes"}</strong>
        <small>{broken ? "revision unchanged" : "validated together"}</small>
        <div>{broken ? "0 of 123 applied" : <><Check size={13} aria-hidden /> atomic save</>}</div>
      </div>

      <div className="batch-stamp" aria-hidden="true" key={String(broken)}>ALL OR NOTHING</div>

      <button className="batch-toggle" onClick={() => { setManual(true); setBroken((b) => !b); }} aria-pressed={broken}>
        {broken ? "Fix line 03" : "Break line 03"}
      </button>
    </div>
  );
}
