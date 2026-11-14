"use client";
import { useEffect, useRef, useState } from "react";
import { AudioLines, LockKeyhole, Pause, Play } from "lucide-react";
import Wave from "./Wave";
import { prefersReducedMotion, useReducedMotion } from "./useInView";

// One scale for everything on this timeline: seconds -> percent of lane width.
const PCT = 1.8; // 50s lands at 90%
const FPS = 24;
const LOOP = 52; // seconds shown before the playhead wraps
const REAL_SECONDS = 26; // playhead runs at 2x so the loop takes 26s of wall time
const at = (s: number) => s * PCT + "%";
const span = (a: number, b: number, i = 0) => ({ left: at(a), width: (b - a) * PCT + "%", ["--i" as string]: i });

const tc = (t: number) => {
  const f = Math.floor((t % 1) * FPS);
  const s = Math.floor(t) % 60;
  const m = Math.floor(t / 60);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(m)}:${p(s)}:${p(f)}`;
};

const LOG = [
  { ok: true, text: "run_0041 committed · 3 changes" },
  { ok: true, text: "claim R2 [30s, 42s) granted → maya-agent" },
  { ok: false, text: "run_0042 rejected · overlap on V1, nothing written" },
  { ok: true, text: "claim R1 released · ripple +2s" },
  { ok: true, text: "snapshot settled → ffmpeg" },
];

const JULES = [12, 24] as const;
const MAYA = [30, 42] as const;

export default function HeroTimeline() {
  const root = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const [userPlaying, setPlaying] = useState(true);
  const playing = userPlaying && !reduced;
  const [logI, setLogI] = useState(0);
  const t = useRef(16.33);

  const paint = (time: number) => {
    head.current?.style.setProperty("--p", String((time * PCT) / 100));
    if (label.current) label.current.textContent = tc(time);
  };

  useEffect(() => {
    paint(t.current);
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      t.current = (t.current + dt * (LOOP / REAL_SECONDS)) % LOOP;
      paint(t.current);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  useEffect(() => {
    if (!playing || prefersReducedMotion()) return;
    const id = setInterval(() => setLogI((n) => (n + 1) % LOG.length), 2800);
    return () => clearInterval(id);
  }, [playing]);

  // Gentle tilt that follows the pointer. Off for reduced motion and touch.
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--ry", `${-9 + x * 5}deg`);
      el.style.setProperty("--rx", `${4 - y * 4}deg`);
    };
    const leave = () => {
      el.style.removeProperty("--ry");
      el.style.removeProperty("--rx");
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div className={"hero-visual" + (playing ? "" : " is-paused")} ref={root}>
      <div className="timeline-window" role="img" aria-label="A video timeline with two agents each holding an exclusive claimed time range">
        <div className="window-top">
          <div className="window-dots" aria-hidden="true"><i /><i /><i /></div>
          <span>episode_08.vk · main</span>
          <span className="live-pill"><span /> LIVE SESSION</span>
        </div>

        <div className="timeline-body">
          <div className="timeline-toolbar">
            <span className="toolbar-label">TIMELINE</span>
            <span>24 fps</span>
            <span>{tc(LOOP)}</span>
          </div>

          <div className="tl-lanes" ref={head} style={{ ["--p" as string]: (16.33 * PCT) / 100 }}>
            <div className="time-ruler" aria-hidden="true">
              {[0, 10, 20, 30, 40, 50].map((s) => (
                <span key={s} style={{ left: at(s) }}>{`00:${String(s).padStart(2, "0")}`}</span>
              ))}
            </div>

            <div className="track-row">
              <span className="track-name">V3</span>
              <div className="track-lane">
                <div className="clip clip-violet" style={span(2, 10, 0)}><span>opening-title</span><i /></div>
                <div className="clip clip-purple" style={span(14, 23, 2)}><span>lower-third</span><i /></div>
                <div className="clip clip-violet" style={span(44, 52, 7)}><span>end-card</span><i /></div>
              </div>
            </div>
            <div className="track-row">
              <span className="track-name">V2</span>
              <div className="track-lane">
                <div className="clip clip-pink" style={span(13, 22, 3)}><span>b-roll_01</span><i /></div>
                <div className="clip clip-pink" style={span(31, 41, 6)}><span>cutaway_04</span><i /></div>
              </div>
            </div>
            <div className="track-row">
              <span className="track-name">V1</span>
              <div className="track-lane">
                <div className="clip clip-orange" style={span(2, 11, 1)}><span>cam_A.mov</span><Wave count={16} seed={2} /></div>
                <div className="clip clip-orange" style={span(12.6, 23.4, 4)}><span>cam_B.mov</span><Wave count={18} seed={5} /></div>
                <div className="clip clip-orange" style={span(31, 41, 5)}><span>reaction.mov</span><Wave count={14} seed={9} /></div>
              </div>
            </div>
            <div className="track-row">
              <span className="track-name">A1</span>
              <div className="track-lane">
                {[[2, 11.6], [12.4, 23.6], [24.4, 29.6], [30.4, 41.6], [42.4, 52]].map(([a, b], i) => (
                  <div className="clip clip-audio" style={span(a, b, 8 + i)} key={i}>
                    {i === 0 && <AudioLines size={13} aria-hidden />}
                    <Wave count={Math.round((b - a) * 2.2)} seed={i * 4 + 1} className="audio-wave" />
                  </div>
                ))}
              </div>
            </div>

            <div className="lane-layer" aria-hidden="true">
              <div className="claim-band band-jules" style={span(...JULES)} />
              <div className="claim-band band-maya" style={span(...MAYA)} />
              <div className="agent-cursor cursor-jules"><svg width="11" height="13" viewBox="0 0 11 13"><path d="M1 1 L1 11 L4 8 L6.4 12.4 L8 11.6 L5.7 7.3 L9.6 7 Z" fill="currentColor" stroke="#101017" strokeWidth=".8" strokeLinejoin="round" /></svg><span>jules-agent</span></div>
              <div className="agent-cursor cursor-maya"><svg width="11" height="13" viewBox="0 0 11 13"><path d="M1 1 L1 11 L4 8 L6.4 12.4 L8 11.6 L5.7 7.3 L9.6 7 Z" fill="currentColor" stroke="#101017" strokeWidth=".8" strokeLinejoin="round" /></svg><span>maya-agent</span></div>
              <div className="playhead"><span ref={label}>00:16:08</span></div>
            </div>
          </div>

          <div className="tl-log" aria-hidden="true">
            <span className="log-prompt">$</span>
            <span key={logI} className={"log-line " + (LOG[logI].ok ? "is-ok" : "is-bad")}>
              <i />{LOG[logI].text}
            </span>
          </div>

          <div className="timeline-footer">
            <span><i className="legend-violet" />CODED CLIP</span>
            <span><i className="legend-pink" />MEDIA</span>
            <span><i className="legend-claim" />CLAIMED REGION</span>
          </div>
        </div>

        <div className="float-note note-top">
          <span className="avatar avatar-lime">J</span>
          <span><strong>jules-agent</strong><small>editing 00:12–00:24</small></span>
          <span className="note-lock"><LockKeyhole size={13} aria-hidden /></span>
        </div>
        <div className="float-note note-bottom">
          <span className="avatar avatar-orange">M</span>
          <span><strong>maya-agent</strong><small>local time · 0–12s</small></span>
          <span className="note-lock"><LockKeyhole size={13} aria-hidden /></span>
        </div>
      </div>

      <button
        className="hero-toggle"
        onClick={() => setPlaying(!playing)}
        aria-label={playing ? "Pause timeline animation" : "Play timeline animation"}
      >
        {playing ? <Pause size={11} aria-hidden /> : <Play size={11} aria-hidden />}
        <span>{playing ? "pause" : "play"}</span>
      </button>
    </div>
  );
}
