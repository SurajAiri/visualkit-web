"use client";

import { Fragment, useRef, useState, type CSSProperties } from "react";
import {
  ArrowLeft, ArrowRight, Check, LockKeyhole, LockKeyholeOpen, Pause, Play, Scissors, ShieldCheck,
} from "lucide-react";
import Wave from "@/components/ui/Wave";
import { useInView, useReducedMotion } from "@/components/ui/useInView";
import {
  EPS, SCALE, SCENARIOS, TRACKS, crosses, editsOf, frameOf, inside, localSpec, seamsOf,
  type CClip, type Live, type Range,
} from "./claims";

// The figure shows two clocks. The shared timeline is what everyone else reads: it is a frozen snapshot while a
// claim is worked, and only changes at RELEASE. The local clock below it is where the claim owner edits.
// Motion is choreographed in CSS from data-stage / data-dir on the <figure>; this file only decides WHAT is on screen.

const STAGES = ["REQUEST", "RESOLVE", "WORK", "RELEASE"] as const;
const STATUS = ["REQUESTED", "RESOLVED", "CLAIMED", "RELEASED"] as const;
const OWNER = ["requesting access", "range settled", "exclusive write access", "released and committed"] as const;
const ROW = 46; // px per shared-timeline track row
const LTOP = 24; // px from the top of the local clock to its first track (ruler + gap)
const LSTEP = 32; // px per local-clock track row

const pct = (s: number) => (s / SCALE) * 100 + "%";
const round1 = (n: number) => Math.round(n * 10) / 10;
const num = (n: number) => (Number.isInteger(round1(n)) ? String(round1(n)) : round1(n).toFixed(1));
const rng = (r: Range) => `[${num(r[0])}s, ${num(r[1])}s)`;
const sgn = (n: number) => `${n < 0 ? "−" : "+"}${num(Math.abs(n))}s`;
const local = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
const shared = (s: number) => {
  const t = round1(s), whole = Math.floor(t), tenth = Math.round((t - whole) * 10);
  return `00:${String(whole).padStart(2, "0")}${tenth ? "." + tenth : ""}`;
};
const vars = (o: Record<string, string | number>) => o as CSSProperties;
// How long a stage stays up: long enough to read its caption (~250 wpm) and never shorter than the choreography.
const dwellOf = (caption: string) => Math.max(3800, caption.trim().split(/\s+/).length * 240 + 1400);

type Member = { c: CClip; f: Live };
type Box = { gid: string; a: number; b: number; r0: number; r1: number; tone: "in" | "over" | "out" };

function boxesOf(frames: Member[], win: Range, stage: number): Map<string, Box> {
  const by = new Map<string, Member[]>();
  for (const m of frames) if (m.f.g && !m.f.hide) by.set(m.f.g, [...(by.get(m.f.g) ?? []), m]);
  const out = new Map<string, Box>();
  by.forEach((ms, gid) => {
    if (ms.length < 2) return;
    const all = ms.every((m) => inside(m.f, win));
    const some = ms.some((m) => inside(m.f, win));
    out.set(gid, {
      gid,
      a: Math.min(...ms.map((m) => m.f.a)) - 0.25,
      b: Math.max(...ms.map((m) => m.f.b)) + 0.25,
      r0: Math.min(...ms.map((m) => m.c.row)),
      r1: Math.max(...ms.map((m) => m.c.row)),
      tone: all ? "in" : some && stage === 0 ? "over" : "out",
    });
  });
  return out;
}

export default function ClaimFigure() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, 0.4);
  const reduced = useReducedMotion();
  const [pos, setPos] = useState<{ s: number; i: number; dir: "fwd" | "back" }>({ s: 0, i: 0, dir: "fwd" });
  const [userPaused, setPaused] = useState(false);
  const paused = userPaused || reduced;
  const running = inView && !paused;

  const { s, i, dir } = pos;
  const fwd = dir === "fwd";
  const sc = SCENARIOS[s];
  const range = sc.ranges[i];
  const other = sc.other?.ranges[i];
  const working = i >= 2;
  const dwell = dwellOf(sc.captions[i]);

  const advance = () =>
    setPos((p) => (p.i < 3 ? { s: p.s, i: p.i + 1, dir: "fwd" } : { s: (p.s + 1) % SCENARIOS.length, i: 0, dir: "fwd" }));
  const jump = (ns: number, ni: number) => {
    setPos((p) => ({ s: ns, i: ni, dir: ns === p.s && ni < p.i ? "back" : "fwd" }));
    setPaused(true);
  };

  // ── shared timeline: a frozen snapshot while the claim is worked (stage 2 shows stage 1's geometry) ──
  const gs = i === 2 ? 1 : i;
  const pg = i === 3 ? 1 : Math.max(0, i - 1); // the shared stage we are coming from
  const live = sc.clips.map((c) => ({ c, f: frameOf(c, gs), p: frameOf(c, pg) }));
  const order = [...live].sort((x, y) => x.f.a - y.f.a).map((l) => l.c.id);

  const regionEnd = sc.ranges[2][1];
  const delta = sc.ranges[3][1] - regionEnd;
  const isAfter = (l: { f: Live; p: Live }) => i === 3 && !l.f.hide && l.p.a >= regionEnd - EPS;
  // everything after the region ripples as a wave, left to right
  const afterAs =
    i === 3
      ? Array.from(new Set([...live.filter(isAfter).map((l) => l.p.a), ...(sc.other ? [sc.other.ranges[2][0]] : [])])).sort((x, y) => x - y)
      : [];
  const rank = (a: number) => Math.min(7, Math.max(0, afterAs.indexOf(a)));

  const stateOf = ({ f, p }: { f: Live; p: Live }) => {
    if (f.hide) return "hide";
    if (i === 0 && (crosses(f, range) || f.join)) return "over";
    if (inside(f, range)) return i === 2 ? "checked" : i === 3 && p.hide ? "new" : "in";
    if (other && inside(f, other)) return "other";
    return i === 2 ? "locked" : "out";
  };

  // a clip that is pre-cut into `join` pieces is drawn as ONE clip until the split is granted
  const runs = new Map<string, string>();
  if (i === 0) {
    const joined = live.filter((l) => l.f.join).sort((x, y) => x.c.row - y.c.row || x.f.a - y.f.a);
    joined.forEach((l, k) => {
      const pv = joined[k - 1], nx = joined[k + 1];
      const hasPrev = !!pv && pv.c.row === l.c.row && Math.abs(pv.f.b - l.f.a) < 0.3;
      const hasNext = !!nx && nx.c.row === l.c.row && Math.abs(nx.f.a - l.f.b) < 0.3;
      runs.set(l.c.id, hasPrev && hasNext ? "j-mid" : hasPrev ? "j-last" : hasNext ? "j-first" : "");
    });
  }

  // where the request edge slices a clip (REQUEST), and the blade that cuts it (RESOLVE, split only)
  const seams = seamsOf(sc);
  const cuts: { x: number; row: number }[] = [];
  if (i === 0) {
    for (const { c, f } of live)
      if (!f.hide && !f.join) for (const e of sc.request) if (f.a < e - EPS && f.b > e + EPS) cuts.push({ x: e, row: c.row });
    seams.forEach((m) => cuts.push({ x: m.x, row: m.row }));
  }
  const bladeXs = i === 1 && fwd ? Array.from(new Set(seams.map((m) => m.x))) : [];

  // groups are drawn from whatever clips currently belong to them; a new group springs out of the one it came from
  const boxes = boxesOf(live.map(({ c, f }) => ({ c, f })), range, i);
  const prevBoxes = boxesOf(live.map(({ c, p }) => ({ c, f: p })), sc.ranges[pg], pg);
  const members = (gid: string) => live.filter((l) => l.f.g === gid && !l.f.hide);
  const parentOf = (gid: string) => {
    const pgid = members(gid)[0]?.p.g;
    return pgid && pgid !== gid ? prevBoxes.get(pgid) : undefined;
  };

  // a group that divides keeps its own box (and label) on screen until its children pull away from it
  const parents = new Map<string, Box>();
  if (fwd) boxes.forEach((g) => { const pb = !prevBoxes.has(g.gid) ? parentOf(g.gid) : undefined; if (pb) parents.set(pb.gid, pb); });

  const ghosts = i === 3 && fwd ? live.filter((l) => isAfter(l) && Math.abs(l.f.a - l.p.a) > EPS) : [];
  const grew = [sc.ranges[0][0] - sc.ranges[1][0], sc.ranges[1][1] - sc.ranges[0][1]];
  const tags =
    i === 1 && fwd
      ? [{ side: "l", x: sc.ranges[1][0], v: grew[0] }, { side: "r", x: sc.ranges[1][1], v: grew[1] }].filter((t) => Math.abs(t.v) > EPS)
      : [];

  // ── local clock: where the owner edits, 0:00 at the region start ──
  const spec = localSpec(sc);
  const edits = editsOf(spec);
  const lp = (t: number) => ((t - spec.win[0]) / spec.len) * 100 + "%";
  const lw = (d: number) => (d / spec.len) * 100 + "%";
  const lstage = i <= 1 ? 1 : 2;
  const tickEvery = spec.len <= 14 ? 2 : spec.len <= 24 ? 4 : 5;
  const ticks = Array.from({ length: Math.floor(spec.len / tickEvery) + 1 }, (_, k) => k * tickEvery);
  const winFrac = (spec.win[1] - spec.win[0]) / spec.len;
  const steps = Math.max(0, ...Array.from(edits.values(), (e) => e.step + 1));
  const slabAt = Math.min(spec.win[1], spec.contentEnd);
  const slabMid = ((slabAt + Math.abs(spec.net) / 2 - spec.win[0]) / spec.len) * 100;

  return (
    <figure className="claim-visual" ref={ref} data-stage={i} data-dir={dir} data-run={running ? "1" : "0"} aria-labelledby="claim-visual-caption">
      <div className="claim-window-bar">
        <div>
          <span className="claim-window-mark" aria-hidden="true"><i /><i /><i /></span>
          <strong>episode_08.vk</strong>
          <small>shared timeline</small>
        </div>
        <span className={"claim-live" + (working ? " is-live" : "")}><span /> R1 · {STATUS[i]}</span>
      </div>

      <div className="cf-tabs" role="group" aria-label="Claim scenario. Choose one to preview it.">
        {SCENARIOS.map((x, n) => (
          <button key={x.id} aria-pressed={n === s} onClick={() => jump(n, 0)}>
            <span>0{n + 1}</span>{x.tab}
          </button>
        ))}
      </div>

      <div className="cf" key={sc.id}>
        <div className="cf-strip" aria-hidden="true">
          <div
            className={"cf-chip r1" + (i === 0 ? " is-hollow" : i === 3 ? " is-released" : "")}
            style={{ left: pct(range[0]), width: pct(range[1] - range[0]) }}
          >
            <span className="cf-lock"><LockKeyhole size={10} className="shut" /><LockKeyholeOpen size={10} className="open" /></span>
            {i === 2 && <i className="cf-dot" />}
            {i === 0 ? "Request " : ""}R1{" "}
            <span className="cf-rng">
              {i === 3 && fwd && rng(sc.ranges[2]) !== rng(range) ? (
                <span className="cf-swap"><span className="was">{rng(sc.ranges[2])}</span><span className="now">{rng(range)}</span></span>
              ) : (
                rng(range)
              )}
            </span>
          </div>
          {tags.map((t) => (
            <span key={t.side} className={"cf-edge is-" + t.side} style={{ left: pct(t.x) }}>
              {t.side === "l" && <ArrowLeft size={10} />}{sgn(t.v)}{t.side === "r" && <ArrowRight size={10} />}
            </span>
          ))}
          {other && sc.other && (
            <div className="cf-chip r2" style={{ ...vars({ "--rd": rank(sc.other.ranges[2][0]) }), left: pct(other[0]), width: pct(other[1] - other[0]) }}>
              {i === 2 && <i className="cf-dot" />}
              <LockKeyhole size={10} />{sc.other.label} <span className="cf-rng">{sc.other.who.replace("-agent", "")}</span>
            </div>
          )}
        </div>

        <div className="cf-ruler" aria-hidden="true">
          {[0, 10, 20, 30, 40].map((t) => <span key={t} style={{ left: pct(t) }}>{shared(t)}</span>)}
        </div>

        <div className="cf-tracks">
          <div className="cf-labels" aria-hidden="true">
            {TRACKS.map((t) => <span key={t}>{t}</span>)}
          </div>

          <div className="cf-lanes">
            {TRACKS.map((t, r) => <div className="cf-lane" key={t} style={{ top: r * ROW }} />)}

            <div className={"cf-req" + (i === 0 ? " is-on" : i === 1 ? " is-faint" : "")} style={{ left: pct(sc.request[0]) }} />
            <div className={"cf-req is-2" + (i === 0 ? " is-on" : i === 1 ? " is-faint" : "")} style={{ left: pct(sc.request[1]) }} />

            {other && sc.other && (
              <div
                className={"cf-band r2" + (i === 2 ? " is-working" : "")}
                style={{ ...vars({ "--rd": rank(sc.other.ranges[2][0]) }), left: pct(other[0]), width: pct(other[1] - other[0]) }}
              />
            )}
            <div className={"cf-band r1 state-" + STAGES[i].toLowerCase()} style={{ left: pct(range[0]), width: pct(range[1] - range[0]) }} />

            {i === 3 && fwd && Math.abs(delta) > EPS && (
              <div className={"cf-slab " + (delta < 0 ? "is-close" : "is-open")} style={{ left: pct(Math.min(regionEnd, sc.ranges[3][1])), width: pct(Math.abs(delta)) }}>
                <i /><b>{sgn(delta)}</b>
              </div>
            )}

            {[...parents.values()].map((g) => (
              <div key={"parent-" + g.gid} className="cf-group is-over is-parent" style={{ left: pct(g.a), width: pct(g.b - g.a), top: g.r0 * ROW - 2, height: (g.r1 - g.r0) * ROW + 44 }}>
                <b>{g.gid}</b>
              </div>
            ))}

            {[...boxes.values()].map((g) => {
              const parent = fwd && !prevBoxes.has(g.gid) ? parentOf(g.gid) : undefined;
              const ms = members(g.gid);
              const after = i === 3 && ms.length > 0 && ms.every(isAfter);
              return (
                <div
                  key={g.gid}
                  className={"cf-group is-" + g.tone + (parent ? " is-born" : "") + (i === 3 ? (after ? " is-after" : " is-band") : "")}
                  style={{
                    ...vars({
                      "--fl": parent ? pct(parent.a) : "0%",
                      "--fw": parent ? pct(parent.b - parent.a) : "0%",
                      "--rd": after ? rank(Math.min(...ms.map((m) => m.p.a))) : 0,
                    }),
                    left: pct(g.a), width: pct(g.b - g.a), top: g.r0 * ROW - 2, height: (g.r1 - g.r0) * ROW + 44,
                  }}
                >
                  <b>{g.gid}</b>
                </div>
              );
            })}

            {ghosts.map(({ c, p }) => (
              <i key={c.id} className="cf-ghost" style={{ left: pct(p.a), width: pct(p.b - p.a), top: c.row * ROW + 4 }} />
            ))}

            {live.map((l) => {
              const { c, f, p } = l;
              const st = stateOf(l);
              const run = runs.get(c.id) ?? "";
              const after = isAfter(l);
              const valid = i === 3 && fwd && st === "in";
              const at = ((f.a + f.b) / 2 - sc.ranges[2][0]) / (sc.ranges[2][1] - sc.ranges[2][0]);
              return (
                <div
                  key={c.id}
                  className={
                    `cf-clip row-${c.row} is-${st}` + (run ? " " + run : "") +
                    (run === "j-mid" || run === "j-last" ? " is-nolabel" : "") + (after ? " is-after" : "") + (c.join ? " is-cut" : "")
                  }
                  style={{
                    ...vars({ "--ci": order.indexOf(c.id), "--rd": after ? rank(p.a) : 0, "--vd": valid ? `${(at * 0.7).toFixed(2)}s` : "0s" }),
                    left: pct(f.a), width: pct(f.b - f.a), top: c.row * ROW + 4,
                  }}
                  title={c.name}
                >
                  <span className="cf-name">{c.name}</span>
                  {c.row === 3 && <Wave count={Math.max(4, Math.round((f.b - f.a) * 4))} seed={c.id.length * 3 + Math.round(c.a * 4)} />}
                  {valid && <Check className="cf-tick" size={9} strokeWidth={3} aria-hidden />}
                </div>
              );
            })}

            {cuts.map((m, k) => <i key={`${m.x}-${m.row}`} className="cf-cut" style={{ ...vars({ "--k": k }), left: pct(m.x), top: m.row * ROW + 1 }} />)}

            {i === 3 && fwd && (
              <div className="cf-scan" style={{ left: pct(sc.ranges[2][0]), width: pct(sc.ranges[2][1] - sc.ranges[2][0]) }}><i /></div>
            )}
            {bladeXs.map((x) => <i key={x} className="cf-blade" style={{ left: pct(x) }}><Scissors size={11} aria-hidden /></i>)}
          </div>
        </div>

        <div className="cf-fanrow" aria-hidden="true">
          <span />
          <div className="cf-fan">
            <i style={{ clipPath: `polygon(${(range[0] / SCALE) * 100}% 0, ${(range[1] / SCALE) * 100}% 0, ${winFrac * 100}% 100%, 0 100%)` }} />
          </div>
        </div>

        <div className="cf-local">
          <div className="cf-local-head">
            <span className="cf-owner">
              <span className="cf-owner-avatar">M</span>
              <span><strong>maya-agent</strong><small>{OWNER[i]}</small></span>
            </span>
            <span className="cf-clock">
              <span>LOCAL CLOCK</span>
              <strong>{i === 0 ? "not started" : `0:00 = ${shared(spec.win[0])} shared`}</strong>
            </span>
            <span className="cf-snap"><ShieldCheck size={13} aria-hidden /> Others: immutable snapshot</span>
          </div>

          <div className="cf-local-body">
            <div className="cf-local-labels" aria-hidden="true">
              {TRACKS.map((t) => <span key={t}>{t}</span>)}
            </div>

            <div className="cf-local-lanes" style={vars({ "--n": spec.len })}>
              <div className="cf-lruler" aria-hidden="true">
                {ticks.map((t) => <span key={t} className={(t >= spec.len - EPS ? "is-end " : "") + (t % 4 ? "is-minor" : "")} style={{ left: lp(spec.win[0] + t) }}>{local(t)}</span>)}
              </div>
              {TRACKS.map((t, r) => <div className="cf-llane" key={t} style={{ top: LTOP + r * LSTEP }} />)}
              <div className={"cf-wait" + (i === 0 ? " is-on" : "")}>waiting for the grant</div>

              {i >= 1 && <i className="cf-wend" style={{ left: lp(spec.win[1]) }} />}
              {working && Math.abs(spec.net) > EPS && (
                <>
                  <i
                    className="cf-lslab"
                    style={{ ...vars({ "--sd": `${(steps * 0.28 + 0.45).toFixed(2)}s` }), left: lp(slabAt), width: lw(Math.abs(spec.net)) }}
                  />
                  <b
                    className="cf-lpill"
                    style={{ ...vars({ "--sd": `${(steps * 0.28 + 0.55).toFixed(2)}s` }), left: `clamp(28px, ${slabMid}%, calc(100% - 28px))` }}
                  >
                    {sgn(spec.net)}
                  </b>
                </>
              )}

              {i >= 1 && spec.clips.map((c, k) => {
                const f = frameOf(c, lstage);
                if (f.hide) return null;
                const e = edits.get(c.id);
                const edited = i >= 2 && !!e;
                return (
                  <div
                    key={c.id}
                    className={`cf-clip is-local row-${c.row}` + (edited ? " is-edit" : "") + (i >= 2 && e?.isNew ? " is-new" : "") + (i === 3 ? " is-committed" : "")}
                    style={{ ...vars({ "--ci": k, "--ed": e?.step ?? 0 }), left: lp(f.a), width: lw(f.b - f.a), top: LTOP + c.row * LSTEP + 2 }}
                    title={c.name}
                  >
                    <span className="cf-name">{c.name}</span>
                    {c.row === 3 && <Wave count={Math.max(6, Math.round((f.b - f.a) * 10))} seed={c.id.length * 3 + Math.round(c.a * 4)} />}
                    {edited && e && <small className="cf-delta">{e.isNew ? "new" : sgn(e.d)}</small>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="claim-lifecycle" role="group" aria-label="Claim lifecycle. Choose a step to preview it.">
        {STAGES.map((name, n) => (
          <Fragment key={name}>
            {n > 0 && <ArrowRight size={14} aria-hidden className="life-arrow" />}
            <button className={n === i ? "is-current" : n < i ? "is-done" : ""} aria-pressed={n === i} onClick={() => jump(s, n)}>
              {n === i && (
                <i
                  key={`${s}-${i}`}
                  className="life-fill"
                  style={{ animationDuration: dwell + "ms", animationPlayState: running ? "running" : "paused" }}
                  onAnimationEnd={advance}
                />
              )}
              <span>0{n + 1}</span>
              <strong>{name}</strong>
              <small>{[rng(sc.ranges[0]), rng(sc.ranges[1]), "isolated local clock", "validate · commit · ripple"][n]}</small>
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
