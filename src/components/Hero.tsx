"use client";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, Pause, Play } from "lucide-react";
import { useInView, useReducedMotion } from "./useInView";
import { DUR, Stage, STAGES } from "./HeroScenes";
import { HERO_VIDEO } from "@/lib/site";
import "./hero.css";

const REST = 14.3; // reduced-motion users are parked on the finished timeline
const pad = (n: number) => String(n).padStart(2, "0");
const tc = (t: number) => `${pad(Math.floor(t / 60))}:${pad(Math.floor(t) % 60)}:${pad(Math.floor((t % 1) * 30))}`;
const stageAt = (t: number) => Math.max(0, STAGES.findIndex((s) => t >= s.a && t < s.b));

/* The stage is drawn at a fixed logical size and scaled to fit, so it looks identical at any width.
   Phones get a narrower logical canvas so text stays readable instead of shrinking to nothing. */
const size = (w: number) => (w < 720 ? { w: 480, h: 480 } : { w: 1000, h: 424 });

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const flag = useRef<HTMLSpanElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const t = useRef(0);
  const cur = useRef(0);
  const reduced = useReducedMotion();
  const inView = useInView(root, 0.05);
  const [user, setUser] = useState(true);
  const [stage, setStage] = useState(0);
  const [fit, setFit] = useState({ w: 1000, h: 400, s: 1 });
  const playing = user && inView && !reduced;

  /* single source of truth: write --t once per frame, CSS does the rest */
  const paint = useCallback((x: number) => {
    root.current?.style.setProperty("--t", x.toFixed(3));
    const s = tc(x);
    if (flag.current) flag.current.textContent = s;
    if (clock.current) clock.current.textContent = s;
    const n = stageAt(x);
    if (n !== cur.current) { cur.current = n; setStage(n); }
  }, []);

  const seek = useCallback((s: number) => {
    const x = Math.max(0, Math.min(DUR - 0.01, s));
    t.current = x;
    const v = vid.current;
    if (v) { try { v.currentTime = x; } catch { /* metadata not ready: the loop catches up */ } }
    paint(x);
  }, [paint]);

  useEffect(() => {
    const v = vid.current;
    if (reduced) { v?.pause(); seek(REST); return; }
    if (!playing) { v?.pause(); paint(t.current); return; }
    if (v) {
      if (Math.abs(v.currentTime - t.current) > 0.15) { try { v.currentTime = t.current; } catch { /* ignore */ } }
      v.play().catch(() => { /* autoplay blocked or file missing: the clock free-runs below */ });
    }
    let raf = 0, last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      // The timeline owns a 0→15 s clock so every stage always plays. It only follows the video
      // when that video is really ~15 s long (otherwise a short or still-loading file would pin it to the start).
      const synced = v && !v.paused && v.readyState >= 2 && Math.abs(v.duration - DUR) < 0.75;
      t.current = synced ? v.currentTime % DUR : (t.current + dt) % DUR;
      paint(t.current);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, reduced, paint, seek]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const cw = e.contentRect.width, d = size(cw);
      setFit({ ...d, s: cw / d.w });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scrub = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.type === "pointermove" && e.buttons !== 1) return;
    const r = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - r.left) / r.width) * DUR);
  };

  return (
    <section className="hx" id="top" ref={root} style={{ ["--t" as string]: 0 } as CSSProperties}>
      <div className="hx-grid">
        <div className="hx-copy">
          <h1>Let AI edit your videos.</h1>
          <p>VisualKit is an open-source Python library that lets agents cut, keyframe and render video on a shared timeline.</p>
          <div className="hx-cta">
            <a className="button-primary" href="#start">Get started <ArrowDown size={16} aria-hidden /></a>
            <a className="button-text" href="#how-it-works">See how it works</a>
          </div>
        </div>
        <figure className="hx-media">
          <div className="hx-frame"><video ref={vid} src={HERO_VIDEO} muted loop playsInline preload="auto" aria-label="A 15-second video edited by an agent using VisualKit" /></div>
          <figcaption className="hx-bar">
            <span><span ref={clock}>00:00:00</span> / {tc(DUR)}</span>
            {!reduced && (
              <button className="hx-play" onClick={() => setUser(!user)} aria-label={user ? "Pause demo" : "Play demo"}>
                {user ? <Pause size={12} aria-hidden /> : <Play size={12} aria-hidden />}{user ? "pause" : "play"}
              </button>
            )}
          </figcaption>
        </figure>
      </div>

      <div className="hx-tl" role="img" aria-label="A 15-second timeline built in seven steps: a Python script, split and trim, keyframes, an audio equalizer, agents editing claimed regions, a fusion graph, and an adjustment clip over the finished edit. The playhead is synced to the demo video above.">
        <div className="hx-in">
          <div className="hx-ruler" onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); scrub(e); }} onPointerMove={scrub}>
            {Array.from({ length: DUR }, (_, i) => <b key={i} style={{ left: (i / DUR) * 100 + "%" }}>{i}s</b>)}
          </div>
          <div className="hx-stagebox" ref={box} style={{ height: fit.h * fit.s }}>
            <div className="hx-stage" style={{ width: fit.w, height: fit.h, transform: `scale(${fit.s})` }}>
              <Stage key={stage} i={stage} />
            </div>
          </div>
          <div className="hx-ph" aria-hidden="true"><span ref={flag}>00:00:00</span></div>
        </div>
      </div>
    </section>
  );
}
