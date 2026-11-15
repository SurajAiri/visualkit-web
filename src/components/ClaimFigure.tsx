"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import { ArrowRight, LockKeyhole, Pause, Play, ShieldCheck } from "lucide-react";
import Wave from "./Wave";
import { useInView, useReducedMotion } from "./useInView";
import { SCALE, SCENARIOS, TRACKS, type CClip, type Range } from "@/lib/claims";

const STAGES = ["REQUEST", "RESOLVE", "WORK", "RELEASE"] as const;
const STATUS = ["REQUESTED", "RESOLVED", "CLAIMED", "RELEASED"] as const;
const ROW = 46; // px per track row
const pct = (s: number) => (s / SCALE) * 100 + "%";
const num = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
const rng = (r: Range) => `[${num(r[0])}s, ${num(r[1])}s)`;
const EPS = 1e-6;

type Live = { a: number; b: number; hide: boolean; join: boolean; g: string | null; isNew: boolean };

// Resolve a clip's geometry at a stage: each stage inherits the one before it.
function frameOf(c: CClip, stage: number): Live {
  let f: Live = { a: c.a, b: c.b, hide: !!c.hide, join: !!c.join, g: c.g ?? null, isNew: false };
  for (let k = 1; k <= stage; k++) {
    f = { ...f, isNew: false, ...(c.f?.[k as 1 | 2 | 3] ?? {}) } as Live;
  }
  return f;
}
const inside = (f: { a: number; b: number }, r: Range) => f.a >= r[0] - EPS && f.b <= r[1] + EPS;
const crosses = (f: { a: number; b: number }, r: Range) => f.a < r[1] && f.b > r[0] && !inside(f, r);

export default function ClaimFigure() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, 0.4);
  const reduced = useReducedMotion();
  const [pos, setPos] = useState({ s: 0, i: 0 });
  const [userPaused, setPaused] = useState(false);
  const paused = userPaused || reduced;

  useEffect(() => {
    if (!inView || paused) return;
    const t = setInterval(
      () => setPos((p) => (p.i < 3 ? { s: p.s, i: p.i + 1 } : { s: (p.s + 1) % SCENARIOS.length, i: 0 })),
      3300,
    );
    return () => clearInterval(t);
  }, [inView, paused]);

  const sc = SCENARIOS[pos.s];
  const i = pos.i;
  const range = sc.ranges[i];
  const other = sc.other?.ranges[i];
  const working = i >= 2;
  const delta = sc.ranges[3][1] - sc.ranges[2][1];

  const live = sc.clips.map((c) => ({ c, f: frameOf(c, i) }));

  const stateOf = ({ f }: { f: Live }) => {
    if (f.hide) return "hide";
    const inR = inside(f, range);
    if (i === 0 && (crosses(f, range) || f.join)) return "over";
    if (inR) return f.isNew ? "new" : "in";
    if (other && inside(f, other)) return "other";
    return i === 2 ? "locked" : "out";
  };

  // groups are drawn from whatever clips currently belong to them
  const groups = new Map<string, typeof live>();
  live.forEach((l) => { if (l.f.g && !l.f.hide) groups.set(l.f.g, [...(groups.get(l.f.g) ?? []), l]); });

  return (
    <figure className="claim-visual" ref={ref} data-stage={i} aria-labelledby="claim-visual-caption">
      <div className="claim-window-bar">
        <div>
          <span className="claim-window-mark" aria-hidden="true"><i /><i /><i /></span>
          <strong>episode_08.vk</strong>
          <small>shared timeline</small>
        </div>
        <span className={"claim-live" + (working ? " is-live" : "")}><span /> R1 · {STATUS[i]}</span>
      </div>

      <div className="cf-tabs" role="group" aria-label="Claim scenario. Choose one to preview it.">
        {SCENARIOS.map((s, n) => (
          <button key={s.id} aria-pressed={n === pos.s} onClick={() => { setPos({ s: n, i: 0 }); setPaused(true); }}>
            <span>0{n + 1}</span>{s.tab}
          </button>
        ))}
      </div>

      <div className="cf" key={sc.id}>
        <div className="cf-strip" aria-hidden="true">
          <div className={"cf-chip r1" + (i === 0 ? " is-hollow" : i === 3 ? " is-released" : "")} style={{ left: pct(range[0]), width: pct(range[1] - range[0]) }}>
            <LockKeyhole size={10} />{i === 0 ? "Request " : ""}R1 <span>{rng(range)}</span>
          </div>
          {i === 3 && delta !== 0 && (
            <div className="cf-ripple" style={{ left: pct(range[1]) }}>ripple {delta > 0 ? "+" : "−"}{Math.abs(delta)}s</div>
          )}
          {other && sc.other && (
            <div className="cf-chip r2" style={{ left: pct(other[0]), width: pct(other[1] - other[0]) }}>
              <LockKeyhole size={10} />{sc.other.label} <span>{sc.other.who.replace("-agent", "")}</span>
            </div>
          )}
        </div>

        <div className="cf-ruler" aria-hidden="true">
          {[0, 10, 20, 30, 40].map((t) => <span key={t} style={{ left: pct(t) }}>{`00:${String(t).padStart(2, "0")}`}</span>)}
        </div>

        <div className="cf-tracks">
          <div className="cf-labels" aria-hidden="true">
            {TRACKS.map((t) => <span key={t}>{t}</span>)}
          </div>

          <div className="cf-lanes">
            {TRACKS.map((t, r) => <div className="cf-lane" key={t} style={{ top: r * ROW }} />)}

            <div className={"cf-req" + (i === 0 ? " is-on" : i === 1 ? " is-faint" : "")} style={{ left: pct(sc.request[0]) }} />
            <div className={"cf-req" + (i === 0 ? " is-on" : i === 1 ? " is-faint" : "")} style={{ left: pct(sc.request[1]) }} />

            {other && <div className="cf-band r2" style={{ left: pct(other[0]), width: pct(other[1] - other[0]) }} />}
            <div className={"cf-band r1 state-" + STAGES[i].toLowerCase()} style={{ left: pct(range[0]), width: pct(range[1] - range[0]) }} />

            {[...groups.entries()].map(([gid, ms]) => {
              if (ms.length < 2) return null;
              const a = Math.min(...ms.map((m) => m.f.a)) - 0.25;
              const b = Math.max(...ms.map((m) => m.f.b)) + 0.25;
              const r0 = Math.min(...ms.map((m) => m.c.row));
              const r1 = Math.max(...ms.map((m) => m.c.row));
              const some = ms.some((m) => inside(m.f, range));
              const all = ms.every((m) => inside(m.f, range));
              const tone = all ? "in" : some && i === 0 ? "over" : "out";
              return (
                <div key={gid} className={"cf-group is-" + tone} style={{ left: pct(a), width: pct(b - a), top: r0 * ROW - 2, height: (r1 - r0) * ROW + 44 }}>
                  <b>{gid}</b>
                </div>
              );
            })}

            {live.map((l) => {
              const st = stateOf(l);
              const { c, f } = l;
              return (
                <div
                  key={c.id}
                  className={`cf-clip row-${c.row} is-${st}` + (f.join ? " is-joined" : "")}
                  style={{ left: pct(f.a), width: pct(f.b - f.a), top: c.row * ROW + 4 }}
                  title={c.name}
                >
                  <span>{c.name}</span>
                  {c.row === 3 && <Wave count={Math.max(4, Math.round((f.b - f.a) * 1.4))} seed={c.id.length * 3 + c.a} />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="claim-canvas-footer">
          <span className="claim-owner">
            <span className="claim-owner-avatar">M</span>
            <span><strong>maya-agent</strong><small>{working ? "exclusive write access" : "requesting access"}</small></span>
          </span>
          <span className="claim-local-clock">
            <span>LOCAL TIMELINE</span>
            <strong>{["waiting for the grant", "range settled", "00:00 → edits start here", "released and committed"][i]}</strong>
          </span>
          <span className="claim-reader"><ShieldCheck size={13} aria-hidden /> Others: immutable snapshot</span>
        </div>
      </div>

      <div className="claim-lifecycle" role="group" aria-label="Claim lifecycle. Choose a step to preview it.">
        {STAGES.map((name, n) => (
          <Fragment key={name}>
            {n > 0 && <ArrowRight size={14} aria-hidden className="life-arrow" />}
            <button
              className={n === i ? "is-current" : n < i ? "is-done" : ""}
              aria-pressed={n === i}
              onClick={() => { setPos({ s: pos.s, i: n }); setPaused(true); }}
            >
              <span>0{n + 1}</span>
              <strong>{name}</strong>
              <small>{[rng(sc.ranges[0]), rng(sc.ranges[1]), "isolated local clock", "validate · ripple · commit"][n]}</small>
            </button>
          </Fragment>
        ))}
      </div>

      <figcaption id="claim-visual-caption">
        <span>{sc.captions[i]}</span>
        <button className="life-toggle" onClick={() => setPaused(!paused)} aria-label={paused ? "Play the claim walkthrough" : "Pause the claim walkthrough"}>
          {paused ? <Play size={11} aria-hidden /> : <Pause size={11} aria-hidden />}
        </button>
      </figcaption>
    </figure>
  );
}
