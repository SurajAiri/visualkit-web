"use client";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowRight, Pause, Play } from "lucide-react";
import InstallCommand from "./InstallCommand";
import { useInView, useReducedMotion } from "./useInView";
import { Agents, Audio, Cut, DUR, Effects, Fusion, Keys, Script, STAGES } from "./HeroStages";
import { DOCS_URL, HERO_VIDEO } from "@/lib/site";
import "./hero.css";

const REST = 14.3; // where reduced-motion users get parked: the finished timeline
const pad = (n: number) => String(n).padStart(2, "0");
const tc = (t: number) => `${pad(Math.floor(t / 60))}:${pad(Math.floor(t) % 60)}:${pad(Math.floor((t % 1) * 30))}`;

/* in / out = how each stage enters and leaves; o = zoom origin of the clip being dived into */
const SCENES = [
  { C: Script, cls: "no-out" },
  { C: Cut, cls: "in-wipe out-grow", o: "16% 62%" },
  { C: Keys, cls: "in-grow out-shrink" },
  { C: Audio, cls: "in-grow out-shrink" },
  { C: Agents, cls: "in-pull out-grow", o: "72% 60%" },
  { C: Fusion, cls: "in-grow out-shrink" },
  { C: Effects, cls: "in-pull sc-last" },
];

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const flag = useRef<HTMLSpanElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const scenes = useRef<HTMLElement[]>([]);
  const t = useRef(0);
  const cur = useRef(0);
  const reduced = useReducedMotion();
  const inView = useInView(root, 0.05);
  const [user, setUser] = useState(true);
  const [stage, setStage] = useState(0);
  const playing = user && inView && !reduced;

  /* the single source of truth: write --t once, CSS does the rest for playhead, scenes and every in-scene motion */
  const paint = useCallback((x: number) => {
    const el = root.current;
    if (!el) return;
    el.style.setProperty("--t", x.toFixed(3));
    const s = tc(x);
    if (flag.current) flag.current.textContent = s;
    if (clock.current) clock.current.textContent = s;
    let now = cur.current;
    scenes.current.forEach((n, i) => {
      const { a, b } = STAGES[i];
      const live = x > a - 0.3 && x < b + 0.3;
      if (n.hidden === live) n.hidden = !live;
      if (x >= a && x < b) now = i;
    });
    if (now !== cur.current) { cur.current = now; setStage(now); }
  }, []);

  const seek = useCallback((s: number) => {
    const x = Math.max(0, Math.min(DUR - 0.01, s));
    t.current = x;
    const v = vid.current;
    if (v) { try { v.currentTime = x; } catch { /* metadata not ready yet; the loop will catch up */ } }
    paint(x);
  }, [paint]);

  useEffect(() => {
    const v = vid.current;
    scenes.current = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-sc]") ?? []);
    if (reduced) { v?.pause(); seek(REST); return; }
    if (!playing) { v?.pause(); paint(t.current); return; }
    if (v) {
      if (Math.abs(v.currentTime - t.current) > 0.15) { try { v.currentTime = t.current; } catch { /* ignore */ } }
      v.play().catch(() => { /* autoplay blocked or no file: the clock free-runs below */ });
    }
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (v && !v.paused) {
        // The video is the master clock. While it buffers, currentTime holds still, so the timeline holds too.
        t.current = v.currentTime % DUR;
      } else {
        t.current = (t.current + dt) % DUR; // no playable video yet: free-run so the widget never stalls
      }
      paint(t.current);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, reduced, paint, seek]);

  const scrub = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.type === "pointermove" && e.buttons !== 1) return;
    const r = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - r.left) / r.width) * DUR);
  };

  return (
    <section className={"vh" + (playing ? "" : " is-paused")} id="top" ref={root} style={{ ["--t" as string]: 0 } as CSSProperties}>
      <div className="vh-top">
        <div className="vh-video" aria-hidden="true">
          <video ref={vid} src={HERO_VIDEO} muted loop playsInline preload="auto" />
        </div>
        <div className="vh-copy">
          <h1>Agents edit<br />your <em>video.</em></h1>
          <p>
            Open-source Python library for editing video. Agents describe changes in batches, claim the seconds
            they’re working on, and hand a settled snapshot to FFmpeg, DaVinci Resolve or OpenTimelineIO.
          </p>
          <div className="vh-actions">
            <a className="button-primary" href="#how-it-works">See how it works <ArrowDown size={16} aria-hidden /></a>
            <a className="button-text" href={DOCS_URL} target="_blank" rel="noreferrer">Meet the library <ArrowRight size={16} aria-hidden /></a>
          </div>
          <InstallCommand className="is-hero" />
        </div>
      </div>

      <div className="vh-wrap">
        <div className="vh-ph" aria-hidden="true"><i /><span ref={flag}>00:00:00</span></div>
        <div className="vh-tl" role="img" aria-label="A video timeline built in seven steps: a Python script, split and trim, keyframes, an audio equalizer, two agents editing claimed regions, a fusion graph, and finished effects. The playhead is synced to the demo video above.">
          <div className="vh-scrub" onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); scrub(e); }} onPointerMove={scrub} />
          <div className="vh-cam" aria-hidden="true">
            {SCENES.map(({ C, cls, o }, i) => (
              <div key={i} data-sc hidden={i > 0} className={`vh-sc ${cls}`}
                style={{ ["--a0" as string]: STAGES[i].a, ["--b0" as string]: STAGES[i].b, ...(o ? { ["--o" as string]: o } : {}) } as CSSProperties}>
                <C />
              </div>
            ))}
          </div>
        </div>
        <div className="vh-foot">
          <div className="vh-steps">
            {STAGES.map((s, i) => (
              <button key={s.id} aria-current={stage === i} onClick={() => seek(s.a + 0.02)}><b>{i + 1}</b><span>{s.label}</span></button>
            ))}
          </div>
          <div className="vh-transport">
            <span><span ref={clock}>00:00:00</span> / {tc(DUR)}</span>
            {!reduced && (
              <button className="hero-toggle" onClick={() => setUser(!user)} aria-label={user ? "Pause demo" : "Play demo"}>
                {user ? <Pause size={12} aria-hidden /> : <Play size={12} aria-hidden />}<span>{user ? "pause" : "play"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
