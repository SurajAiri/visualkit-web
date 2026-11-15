"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, Pause, Play } from "lucide-react";
import InstallCommand from "./InstallCommand";
import Wave from "./Wave";
import { useReducedMotion } from "./useInView";
import { DOCS_URL } from "@/lib/site";

/* One scale for the whole stage: seconds on the timeline. CSS turns seconds into pixels (--sec). */
const LOOP = 54; // seconds before the playhead wraps
const RATE = 2; // timeline seconds per real second once the intro is over
const INTRO = 2.4; // real seconds the playhead takes to scrub across the headline
const INTRO_TO = 19; // timeline second it reaches by then
const REST = 16.33; // where it sits for reduced motion

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const pad = (n: number) => String(n).padStart(2, "0");
const tc = (t: number) => `${pad(Math.floor(t / 60))}:${pad(Math.floor(t) % 60)}:${pad(Math.floor((t % 1) * 24))}`;

type Clip = { name: string; a: number; b: number; tone: "violet" | "purple" | "pink" | "orange" | "audio"; wave?: boolean };
const TRACKS: { name: string; clips: Clip[] }[] = [
  { name: "V3", clips: [
    { name: "opening-title", a: 2, b: 10, tone: "violet" },
    { name: "lower-third", a: 14, b: 23, tone: "purple" },
    { name: "end-card", a: 44, b: 54, tone: "violet" },
  ] },
  { name: "V2", clips: [
    { name: "b-roll_01", a: 13, b: 22, tone: "pink" },
    { name: "cutaway_04", a: 31, b: 41, tone: "pink" },
    { name: "insert_09", a: 44, b: 54, tone: "pink" },
  ] },
  { name: "V1", clips: [
    { name: "cam_A.mov", a: 2, b: 11, tone: "orange", wave: true },
    { name: "cam_B.mov", a: 12.6, b: 23.4, tone: "orange", wave: true },
    { name: "reaction.mov", a: 31, b: 41, tone: "orange", wave: true },
    { name: "cam_C.mov", a: 42.4, b: 54, tone: "orange", wave: true },
  ] },
  { name: "A1", clips: [
    { name: "", a: 2, b: 11.6, tone: "audio" },
    { name: "", a: 12.4, b: 23.6, tone: "audio" },
    { name: "", a: 24.4, b: 29.6, tone: "audio" },
    { name: "", a: 30.4, b: 41.6, tone: "audio" },
    { name: "", a: 42.4, b: 54, tone: "audio" },
  ] },
];

const CLAIMS = [
  { who: "jules-agent", a: 12, b: 24, tone: "lime" },
  { who: "maya-agent", a: 30, b: 42, tone: "orange" },
] as const;

const LOG = [
  { ok: true, text: "run_0041 committed, 3 changes" },
  { ok: true, text: "claim R2 [30s, 42s) granted to maya-agent" },
  { ok: false, text: "run_0042 rejected, overlap on V1, nothing written" },
  { ok: true, text: "claim R1 released, ripple +2s" },
  { ok: true, text: "snapshot settled, handed to ffmpeg" },
];

const at = (s: number) => ({ ["--t" as string]: s });
const span = (a: number, b: number, i = 0) => ({ ["--t" as string]: a, ["--d" as string]: b - a, ["--i" as string]: i });

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const flag = useRef<HTMLSpanElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const time = useRef(0);
  const elapsed = useRef(0);
  const reduced = useReducedMotion();
  const [userPlaying, setUserPlaying] = useState(true);
  const playing = userPlaying && !reduced;
  const [logI, setLogI] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const words = Array.from(el.querySelectorAll<HTMLElement>(".ph"));
    const paint = (t: number) => {
      el.style.setProperty("--time", String(t));
      const s = tc(t);
      if (flag.current) flag.current.textContent = s;
      if (clock.current) clock.current.textContent = s;
    };
    const fill = () => words.forEach((w) => w.style.setProperty("--ph", "100%"));

    if (reduced) { time.current = REST; paint(REST); fill(); return; }
    if (!playing) { paint(time.current); fill(); return; }

    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (elapsed.current < INTRO) {
        // First pass: the playhead scrubs across the headline and the words light up as it crosses them.
        elapsed.current += dt;
        time.current = INTRO_TO * ease(Math.min(1, elapsed.current / INTRO));
        paint(time.current);
        const x = line.current?.getBoundingClientRect().left ?? 0;
        words.forEach((w) => {
          const r = w.getBoundingClientRect();
          const p = Math.max(0, Math.min(1, (x - r.left) / r.width));
          w.style.setProperty("--ph", p * 100 + "%");
        });
        if (elapsed.current >= INTRO) fill();
      } else {
        time.current = (time.current + dt * RATE) % LOOP;
        paint(time.current);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, reduced]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setLogI((n) => (n + 1) % LOG.length), 2800);
    return () => clearInterval(id);
  }, [playing]);

  return (
    <section className={"hero" + (playing ? "" : " is-paused")} id="top" ref={root} style={{ ["--time" as string]: 0 }}>
      <div className="hero-head">
        <h1>
          <span className="hl">Give agents</span>
          <span className="hl">the <span className="ph">whole</span></span>
          <span className="hl"><span className="ph">timeline.</span></span>
        </h1>

        <div className="hero-aside">
          <p>
            Open-source Python library for editing video. Agents describe changes in batches, claim the seconds
            they’re working on, and hand a settled snapshot to FFmpeg, DaVinci Resolve or OpenTimelineIO.
          </p>
          <div className="hero-actions">
            <a className="button-primary" href="#how-it-works">
              See how it works <ArrowDown size={16} aria-hidden />
            </a>
            <a className="button-text" href={DOCS_URL} target="_blank" rel="noreferrer">
              Meet the library <ArrowRight size={16} aria-hidden />
            </a>
          </div>
          <InstallCommand className="is-hero" />
        </div>
      </div>

      <div className="ph-line" ref={line} aria-hidden="true" />

      <div className="stage" role="img" aria-label="A video timeline with four tracks. Two agents each hold an exclusive claimed range of seconds while a playhead moves across.">
        <div className="stage-regions" aria-hidden="true">
          {CLAIMS.map((c) => (
            <div key={c.who} className={"region region-" + c.tone} style={span(c.a, c.b)}>
              <b>{c.who}</b>
              <span>{c.a}s to {c.b}s</span>
            </div>
          ))}
        </div>

        <div className="stage-body" aria-hidden="true">
          <div className="stage-ruler">
            {[0, 10, 20, 30, 40, 50, 60].map((s) => (
              <span key={s} style={at(s)}>{`00:${pad(s)}`}</span>
            ))}
          </div>

          <div className="stage-tracks">
            {TRACKS.map((tr, ti) => (
              <div className="track" key={tr.name}>
                <span className="track-label">{tr.name}</span>
                {tr.clips.map((c, ci) => (
                  <div key={ci} className={"clip clip-" + c.tone} style={span(c.a, c.b, ti * 2 + ci)}>
                    {c.name && <span className="clip-name">{c.name}</span>}
                    {c.wave && <Wave count={Math.round((c.b - c.a) * 1.6)} seed={ti * 7 + ci} className="clip-wave" />}
                    {c.tone === "audio" && <Wave count={Math.round((c.b - c.a) * 2.4)} seed={ci * 3 + 1} className="audio-wave" />}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="bands">
            {CLAIMS.map((c) => (
              <div key={c.who} className={"band band-" + c.tone} style={span(c.a, c.b)} />
            ))}
            <div className="agent-cursor cursor-jules"><svg width="11" height="13" viewBox="0 0 11 13"><path d="M1 1 L1 11 L4 8 L6.4 12.4 L8 11.6 L5.7 7.3 L9.6 7 Z" fill="currentColor" stroke="#101017" strokeWidth=".8" strokeLinejoin="round" /></svg><span>jules-agent</span></div>
            <div className="agent-cursor cursor-maya"><svg width="11" height="13" viewBox="0 0 11 13"><path d="M1 1 L1 11 L4 8 L6.4 12.4 L8 11.6 L5.7 7.3 L9.6 7 Z" fill="currentColor" stroke="#101017" strokeWidth=".8" strokeLinejoin="round" /></svg><span>maya-agent</span></div>
          </div>

          <div className="ph-flag"><span ref={flag}>00:00:00</span></div>
        </div>

        <div className="stage-foot">
          <p className="stage-log" aria-hidden="true">
            <span className="log-prompt">$</span>
            <span key={logI} className={"log-line " + (LOG[logI].ok ? "is-ok" : "is-bad")}>{LOG[logI].text}</span>
          </p>
          <div className="stage-transport">
            <span className="stage-clock"><span ref={clock}>00:00:00</span> / {tc(LOOP)}</span>
            <button
              className="hero-toggle"
              onClick={() => setUserPlaying(!playing)}
              aria-label={playing ? "Pause timeline animation" : "Play timeline animation"}
            >
              {playing ? <Pause size={12} aria-hidden /> : <Play size={12} aria-hidden />}
              <span>{playing ? "pause" : "play"}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
