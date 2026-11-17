"use client";
import { useEffect, useRef, useState } from "react";
import { Check, HardDrive, LockKeyhole, MemoryStick, Pencil, RotateCcw, X } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { useInView, useReducedMotion } from "@/components/ui/useInView";
import "./engine-states.css";

/* 03 · Three data states. Edits are made in a mutable Draft (dirty), sealed into the Session (memory) at each commit,
   and written to the Store (disk) once, atomically. A bad edit stops at the commit: nothing below it ever changes. */
const HOLD = [800, 1500, 1300, 1700, 1300, 3400]; // ms held on each beat
const LAST = HOLD.length - 1;
type Mode = "ok" | "bad";

const ITEMS = [
  { id: "clip_07", v: "scale 1.08" },
  { id: "item_21", v: "start 4.0s" },
  { id: "clip_09", v: "effect grain" },
] as const;

const ROWS = [
  { n: "01", t: "Draft", tag: "dirty", d: "Mutable working copies of only the objects a run touched. Every assignment is checked on the spot." },
  { n: "02", t: "Session", tag: "in memory", d: "Each commit validates the changes and seals a snapshot. Sealed steps never change, and a GUI can walk them for undo and redo." },
  { n: "03", t: "Store", tag: "on disk", d: "One SQLite file with every revision, branch and run record. One atomic write per run, so disk is always the source of truth." },
];

export default function EngineStates() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.35);
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<Mode>("ok");
  const [step, setStep] = useState(LAST); // resting picture: a finished, successful run

  useEffect(() => {
    if (reduced || !inView) return;
    const end = mode === "bad" ? 3 : LAST;
    let i = 0;
    let id: ReturnType<typeof setTimeout>;
    const tick = () => {
      setStep(i);
      id = setTimeout(() => {
        i = i >= end ? 0 : i + 1;
        tick();
      }, i === end && mode === "bad" ? 3400 : HOLD[i]);
    };
    tick();
    return () => clearTimeout(id);
  }, [inView, reduced, mode]);

  const bad = mode === "bad";
  const failed = bad && step >= 3;
  const sealed = !bad && step >= 3;
  const saved = !bad && step >= 5;

  return (
    <section className="engine-section" id="engine">
      <div className="engine-inner">
        <Reveal className="engine-copy">
          <span className="section-kicker">03 / THREE DATA STATES</span>
          <h2>
            Make a mess in the Draft.<br />
            <span>Only clean work reaches disk.</span>
          </h2>
          <p>
            Your agent can make hundreds of edits, and plenty of mistakes, without touching the real project. Work
            moves through three states, and each one checks it again before it moves on.
          </p>
          <ol className="engine-rows">
            {ROWS.map((r) => (
              <li key={r.n}>
                <span className="engine-n">{r.n}</span>
                <span><strong>{r.t} <em>{r.tag}</em></strong><small>{r.d}</small></span>
              </li>
            ))}
          </ol>
        </Reveal>

        <div className="es-fig" ref={ref}>
          <div className="es-top">
            <span><i className={"es-pulse" + (step === 1 ? " is-on" : "")} />script · assignment check</span>
            <button className="es-toggle" onClick={() => setMode(bad ? "ok" : "bad")} aria-pressed={bad}>
              {bad ? <><RotateCcw size={12} aria-hidden /> Run a good edit</> : <><X size={12} aria-hidden /> Try a bad edit</>}
            </button>
          </div>

          {/* DRAFT */}
          <div className={"es-tray t-draft" + (step >= 1 && step <= 2 ? " is-live" : "")}>
            <header><Pencil size={14} aria-hidden /><b>Draft</b><em className="tag-dirty">dirty</em><small>lives for one run</small></header>
            <div className="es-items">
              {ITEMS.map((it, i) => {
                const isBad = bad && it.id === "item_21" && step >= 2;
                return (
                  <span key={it.id} className={"es-item" + (step >= 1 ? " is-in" : "") + (isBad ? " is-bad" : "")} style={{ transitionDelay: step >= 1 ? i * 0.18 + "s" : "0s" }}>
                    <i />{it.id} <small>{it.v}</small>
                  </span>
                );
              })}
            </div>
          </div>

          <Link label="commit · graph validation" on={step === 2} dead={false} />

          {/* SESSION */}
          <div className={"es-tray t-session" + (step === 3 ? " is-live" : "") + (failed ? " is-failed" : "")}>
            <header><MemoryStick size={14} aria-hidden /><b>Session</b><em className="tag-mem">in memory</em><small>lives for one process</small></header>
            <div className="es-items">
              {sealed && (
                <div className="es-sealed" key="s">
                  <span><LockKeyhole size={11} aria-hidden /> step 1 · sealed copy</span>
                  {ITEMS.map((it) => <span key={it.id} className="es-item is-in is-clean"><Check size={11} strokeWidth={3} aria-hidden />{it.id}</span>)}
                </div>
              )}
              {failed && (
                <div className="es-err" key="e"><X size={13} aria-hidden /> commit rejected: item_21 overlaps clip on V1. Nothing sealed.</div>
              )}
              {!sealed && !failed && <span className="es-empty">no sealed steps yet</span>}
            </div>
          </div>

          <Link label="save · claim check, merge, one atomic write" on={step === 4} dead={failed} />

          {/* STORE */}
          <div className={"es-tray t-store" + (step === 4 ? " is-live" : "") + (saved ? " is-saved" : "")}>
            <header><HardDrive size={14} aria-hidden /><b>Store</b><em className="tag-disk">on disk</em><small>permanent</small><LockKeyhole size={14} className={"es-lock" + (step === 4 ? " is-on" : "")} aria-hidden /></header>
            <ul className="es-revs">
              {saved && <li className="is-new" key="r42"><i />r42 <small>visual_pass</small><b>HEAD</b></li>}
              <li><i />r41 <small>b-roll</small>{!saved && <b>HEAD</b>}</li>
              <li><i />r40 <small>grade</small></li>
            </ul>
            {failed && <p className="es-note" role="status">Nothing written. r41 is still HEAD.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

function Link({ label, on, dead }: { label: string; on: boolean; dead: boolean }) {
  return (
    <div className={"es-link" + (on ? " is-on" : "") + (dead ? " is-dead" : "")} aria-hidden="true">
      <span className="es-wire"><i /></span>
      <small>{label}</small>
    </div>
  );
}
