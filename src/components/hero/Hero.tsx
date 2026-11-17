"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { ArrowDown, Pause, Play } from "lucide-react";
import { useInView, useReducedMotion } from "@/components/ui/useInView";
import { DUR, Stage, STAGES } from "./HeroScenes";
import { HERO_VIDEO } from "@/lib/site";
import "./hero.css";

const REST = 14.3; // reduced-motion users are parked on the finished timeline
const pad = (n: number) => String(n).padStart(2, "0");
const tc = (t: number) =>
  `${pad(Math.floor(t / 60))}:${pad(Math.floor(t) % 60)}:${pad(Math.floor((t % 1) * 30))}`;
const stageAt = (t: number) =>
  Math.max(
    0,
    STAGES.findIndex((s) => t >= s.a && t < s.b),
  );

/* The video is the master clock. Whatever its real length (vd), timeline time = progress × 15,
   so the motion graphics always fit the clip exactly and loop with it. */
const vdOf = (v: HTMLVideoElement | null, fallback: number) =>
  v && Number.isFinite(v.duration) && v.duration > 0 ? v.duration : fallback;
const lab = (x: number) =>
  Math.abs(x - Math.round(x)) < 0.05 ? String(Math.round(x)) : x.toFixed(1);

/* The whole timeline (ruler, tracks, playhead) is drawn on ONE fixed 1000×462 canvas and scaled
   uniformly to the panel width, so it keeps the same layout and aspect ratio at every size. */
const CANVAS_W = 1000;

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const flag = useRef<HTMLSpanElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const t = useRef(0);
  const cur = useRef(0);
  const vd = useRef(DUR); // real video duration (s)
  const reduced = useReducedMotion();
  const inView = useInView(root, 0.05);
  const [user, setUser] = useState(true);
  const [stage, setStage] = useState(0);
  const [scale, setScale] = useState(0);
  const [vdur, setVdur] = useState(DUR);
  const playing = user && inView && !reduced;

  /* single source of truth: write --t once per frame, CSS does the rest */
  const paint = useCallback((x: number) => {
    root.current?.style.setProperty("--t", x.toFixed(3));
    const s = tc((x / DUR) * vd.current);
    if (flag.current) flag.current.textContent = s;
    if (clock.current) clock.current.textContent = s;
    const n = stageAt(x);
    if (n !== cur.current) {
      cur.current = n;
      setStage(n);
    }
  }, []);

  const seek = useCallback(
    (s: number) => {
      const x = Math.max(0, Math.min(DUR - 0.01, s));
      t.current = x;
      const v = vid.current;
      if (v) {
        try {
          v.currentTime = (x / DUR) * vdOf(v, vd.current);
        } catch {
          /* metadata not ready: the loop catches up */
        }
      }
      paint(x);
    },
    [paint],
  );

  useEffect(() => {
    const v = vid.current;
    if (reduced) {
      v?.pause();
      seek(REST);
      return;
    }
    if (!playing) {
      v?.pause();
      paint(t.current);
      return;
    }
    const tryPlay = () => {
      v?.play().catch(() => {
        /* autoplay blocked or not loaded yet: retried on canplay, the clock free-runs meanwhile */
      });
    };
    const onMeta = () => {
      if (v) {
        vd.current = vdOf(v, DUR);
        setVdur(vd.current);
      }
    };
    const onEnd = () => {
      if (v) {
        v.currentTime = 0;
        tryPlay();
      }
    }; // safety net if native loop is ignored
    if (v) {
      v.muted = true; // autoplay is only allowed while muted
      onMeta();
      const target = (t.current / DUR) * vdOf(v, DUR);
      if (Math.abs(v.currentTime - target) > 0.15) {
        try {
          v.currentTime = target;
        } catch {
          /* ignore */
        }
      }
      tryPlay();
      v.addEventListener("canplay", tryPlay);
      v.addEventListener("loadedmetadata", onMeta);
      v.addEventListener("ended", onEnd);
    }
    let raf = 0,
      last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      // While the video plays, the playhead is its progress (buffering holds it too).
      // If the video can't play (blocked, still loading, missing) the timeline free-runs 0→15 s instead.
      const following =
        v && !v.paused && Number.isFinite(v.duration) && v.duration > 0;
      t.current = following
        ? ((v.currentTime / v.duration) * DUR) % DUR
        : (t.current + dt) % DUR;
      paint(t.current);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      v?.removeEventListener("canplay", tryPlay);
      v?.removeEventListener("loadedmetadata", onMeta);
      v?.removeEventListener("ended", onEnd);
    };
  }, [playing, reduced, paint, seek]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setScale(e.contentRect.width / CANVAS_W),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scrub = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.type === "pointermove" && e.buttons !== 1) return;
    const r = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - r.left) / r.width) * DUR);
  };

  return (
    <section
      className="hx"
      id="top"
      ref={root}
      style={{ ["--t" as string]: 0 } as CSSProperties}
    >
      <div className="hx-grid">
        <div className="hx-copy">
          <h1>
            <span className="hx-highlight" data-text="Agent First">
              Agent First
            </span>{" "}
            Video Editor Library.
          </h1>
          <p>
            Agents edit video as code: a whole cut in one atomic batch, many
            agents on one timeline, every change undoable. Open-source Python,
            rendered anywhere.
          </p>
          <div className="hx-cta">
            <a className="button-primary" href="#start">
              Get started <ArrowDown size={16} aria-hidden />
            </a>
            <a className="button-text" href="#how-it-works">
              See how it works
            </a>
          </div>
        </div>
        <figure className="hx-media">
          <div className="hx-frame">
            <video
              ref={vid}
              poster={HERO_VIDEO.poster}
              muted
              loop
              playsInline
              preload="auto"
              aria-label="A 15-second video edited by an agent using VisualKit"
            >
              <source
                src={HERO_VIDEO.mp4}
                type="video/mp4"
                onError={() =>
                  console.warn("[hero] video failed to load:", HERO_VIDEO.mp4)
                }
              />
            </video>
          </div>
          <figcaption className="hx-bar">
            <span>
              <span ref={clock}>00:00:00</span> / {tc(vdur)}
            </span>
            {!reduced && (
              <button
                className="hx-play"
                onClick={() => setUser(!user)}
                aria-label={user ? "Pause demo" : "Play demo"}
              >
                {user ? (
                  <Pause size={12} aria-hidden />
                ) : (
                  <Play size={12} aria-hidden />
                )}
                {user ? "pause" : "play"}
              </button>
            )}
          </figcaption>
        </figure>
      </div>

      <div
        className="hx-tl"
        role="img"
        aria-label="A 15-second timeline built in seven steps: a Python script, split and trim, keyframes, an audio equalizer, agents editing claimed regions, a fusion graph, and an adjustment clip over the finished edit. The playhead is synced to the demo video above."
      >
        <div
          className="hx-canvas"
          ref={box}
          style={{ visibility: scale ? "visible" : "hidden" }}
        >
          <div className="hx-cv" style={{ transform: `scale(${scale || 1})` }}>
            <div
              className="hx-ruler"
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                scrub(e);
              }}
              onPointerMove={scrub}
            >
              {Array.from({ length: DUR }, (_, i) => (
                <b key={i} style={{ left: (i / DUR) * 100 + "%" }}>
                  {lab((i / DUR) * vdur)}s
                </b>
              ))}
            </div>
            <div className="hx-stage">
              <Stage key={stage} i={stage} />
            </div>
            <div className="hx-ph" aria-hidden="true">
              <span ref={flag}>00:00:00</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
