"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import { ArrowRight, AudioLines, Film, LockKeyhole, Pause, Play, ShieldCheck, Type } from "lucide-react";
import Wave from "./Wave";
import { useInView, useReducedMotion } from "./useInView";

const SCALE = 42; // seconds across the lane
const pct = (s: number) => (s / SCALE) * 100 + "%";

// Each stage is a real moment in a claim's life: where the claimed range sits,
// how long the edited clips are, and how far the clips after it have rippled.
const STAGES = [
  {
    id: "REQUEST",
    sub: "[12s, 24s)",
    range: [12, 24] as const,
    inLen: 0,
    ripple: 0,
    label: "[12s, 24s)",
    clock: "waiting for the grant",
    caption: "maya-agent asks for [12s, 24s). b-roll_04 and the others run past the end of it.",
  },
  {
    id: "RESOLVE",
    sub: "expand · split · suggest",
    range: [12, 25] as const,
    inLen: 0,
    ripple: 0,
    label: "[12s, 25s)",
    clock: "range settled",
    caption: "Clips stay atomic, so the claim expands to [12s, 25s). Splitting would need an explicit request.",
  },
  {
    id: "WORK",
    sub: "isolated local clock",
    range: [12, 25] as const,
    inLen: 0,
    ripple: 0,
    label: "[12s, 25s)",
    clock: "00:00 → edits start here",
    caption: "Only the owner writes inside the blue region. Everyone else reads the same immutable snapshot.",
  },
  {
    id: "RELEASE",
    sub: "validate · ripple · commit",
    range: [12, 27] as const,
    inLen: 2,
    ripple: 2,
    label: "[12s, 27s)",
    clock: "released, +2s rippled",
    caption: "The edit grew by 2s. Release validates, commits atomically, then ripples everything after it.",
  },
];

const IN_START = 13;
const IN_END = 25;
const CLIPS = {
  text: { icon: Type, name: "TEXT", before: "opening-title", mid: "speaker card", after: "end-card" },
  video: { icon: Film, name: "VIDEO", before: "interview_A.mov", mid: "b-roll_04.mov", after: "cutaway" },
  audio: { icon: AudioLines, name: "AUDIO", before: "room-tone.wav", mid: "foley_bus.wav", after: "score_tail.wav" },
} as const;

export default function ClaimFigure() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, 0.4);
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();
  const [userPaused, setPaused] = useState(false);
  const paused = userPaused || reduced;

  useEffect(() => {
    if (!inView || paused) return;
    const t = setInterval(() => setI((n) => (n + 1) % STAGES.length), 3200);
    return () => clearInterval(t);
  }, [inView, paused]);

  const s = STAGES[i];
  const [a, b] = s.range;
  const working = i >= 2;

  return (
    <figure className="claim-visual" ref={ref} data-stage={i} aria-labelledby="claim-visual-caption">
      <div className="claim-window-bar">
        <div>
          <span className="claim-window-mark" aria-hidden="true"><i /><i /><i /></span>
          <strong>episode_08.vk</strong>
          <small>shared timeline</small>
        </div>
        <span className={"claim-live" + (working ? " is-live" : "")}>
          <span /> R1 · {working ? "CLAIMED" : i === 0 ? "REQUESTED" : "RESOLVED"}
        </span>
      </div>

      <div className="claim-canvas">
        <div className="claim-time-ruler" aria-hidden="true">
          {[0, 10, 20, 30, 40].map((t) => (
            <span key={t} style={{ left: pct(t) }}>{`00:${String(t).padStart(2, "0")}`}</span>
          ))}
        </div>

        <div className="claim-track-stack">
          <div className="claim-track-labels" aria-hidden="true">
            {Object.values(CLIPS).map(({ icon: Icon, name }) => (
              <span key={name}><Icon size={13} />{name}</span>
            ))}
          </div>

          <div className="claim-track-lanes">
            {(Object.keys(CLIPS) as (keyof typeof CLIPS)[]).map((k, row) => {
              const c = CLIPS[k];
              const grow = s.inLen;
              return (
                <div className="claim-lane" key={k}>
                  <span className={`claim-clip ${k}-clip`} style={{ left: pct(1.5), width: pct(9) }}>
                    {c.before}{k === "audio" && <Wave count={9} seed={row + 1} />}
                  </span>
                  <span
                    className={`claim-clip ${k}-clip in-claim${i === 0 ? " is-over" : ""}`}
                    style={{ left: pct(IN_START), width: pct(IN_END - IN_START + grow) }}
                  >
                    {c.mid}{k === "audio" && <Wave count={11} seed={row + 4} />}
                  </span>
                  <span className={`claim-clip ${k}-clip`} style={{ left: pct(29 + s.ripple), width: pct(9) }}>
                    {c.after}{k === "audio" && <Wave count={9} seed={row + 7} />}
                  </span>
                </div>
              );
            })}

            <div className={"claim-range state-" + s.id.toLowerCase()} style={{ left: pct(a), width: pct(b - a) }}>
              <span className="claim-range-label">
                <LockKeyhole size={11} aria-hidden />R1 <span>{s.label}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="claim-canvas-footer">
          <span className="claim-owner">
            <span className="claim-owner-avatar">M</span>
            <span><strong>maya-agent</strong><small>{working ? "exclusive write access" : "requesting access"}</small></span>
          </span>
          <span className="claim-local-clock">
            <span>LOCAL TIMELINE</span>
            <strong>{s.clock}</strong>
          </span>
          <span className="claim-reader"><ShieldCheck size={13} aria-hidden /> Others: immutable snapshot</span>
        </div>
      </div>

      <div className="claim-lifecycle" role="group" aria-label="Claim lifecycle. Choose a step to preview it.">
        {STAGES.map((st, n) => (
          <Fragment key={st.id}>
            {n > 0 && <ArrowRight size={14} aria-hidden className="life-arrow" />}
            <button
              className={n === i ? "is-current" : n < i ? "is-done" : ""}
              aria-pressed={n === i}
              onClick={() => { setI(n); setPaused(true); }}
            >
              <span>0{n + 1}</span>
              <strong>{st.id}</strong>
              <small>{st.sub}</small>
            </button>
          </Fragment>
        ))}
      </div>

      <figcaption id="claim-visual-caption">
        <span>{s.caption}</span>
        <button className="life-toggle" onClick={() => setPaused(!paused)} aria-label={paused ? "Play the claim walkthrough" : "Pause the claim walkthrough"}>
          {paused ? <Play size={11} aria-hidden /> : <Pause size={11} aria-hidden />}
        </button>
      </figcaption>
    </figure>
  );
}
