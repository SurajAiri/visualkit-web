"use client";
import { useEffect, useRef, useState } from "react";
import { Bot, Check, CodeXml, Film, MousePointerClick } from "lucide-react";
import { BrandMark } from "@/components/layout/Logo";
import { useInView, useReducedMotion } from "@/components/ui/useInView";

/* One loop, eleven beats. `p` is the beat we are on; every element is simply "on" once p reaches its beat,
   so the picture is always a clean function of one number (and the finished picture is the resting state). */
const BEATS = [500, 800, 800, 1000, 1100, 800, 800, 1000, 1100, 2200, 2200]; // ms each beat is held
const LAST = BEATS.length - 1;

const CODE = [
  <>clip.transform.scale = <b className="n">1.08</b></>,
  <>clip.effects.add(<b className="s">&quot;grain&quot;</b>)</>,
  <>track.add(<b className="t">TextClip</b>(<b className="s">&quot;Intro&quot;</b>))</>,
  <>engine.<b className="f">commit</b>(<b className="s">&quot;visual_pass&quot;</b>)</>,
];
const CHECKS = [
  ["Object checks", "per assignment"],
  ["Graph checks", "per commit"],
  ["Atomic save", "all or nothing"],
] as const;
const RENDERERS = ["FFmpeg", "DaVinci Resolve", "OpenTimelineIO"] as const;

const on = (p: number, n: number) => (p >= n ? " is-on" : "");

export default function ArchFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.3);
  const reduced = useReducedMotion();
  const [p, setP] = useState(LAST); // no-JS, SSR and reduced motion all rest on the finished picture

  useEffect(() => {
    if (reduced || !inView) return;
    let i = 0;
    let id: ReturnType<typeof setTimeout>;
    const tick = () => {
      setP(i);
      id = setTimeout(() => {
        i = (i + 1) % BEATS.length;
        tick();
      }, BEATS[i]);
    };
    tick();
    return () => clearTimeout(id);
  }, [inView, reduced]);

  return (
    <div className="arch-flow" ref={ref}>
      {/* 01 · AGENT */}
      <article className={"arch-layer l-agent" + (p >= 1 && p <= 3 ? " is-active" : "")}>
        <header>
          <span className="arch-num">01</span>
          <h3>Agent, script or GUI</h3>
        </header>
        <div className="arch-who" aria-hidden="true">
          <span className="is-lit"><Bot size={12} /> Agent</span>
          <span><CodeXml size={12} /> Script</span>
          <span><MousePointerClick size={12} /> GUI</span>
        </div>
        <div className="arch-viz arch-code" aria-hidden="true">
          <div className="arch-bar"><i /><i /><i /><span>edit.py</span></div>
          {CODE.map((l, i) => (
            <div key={i} className={"arch-ln" + on(p, i === 3 ? 3 : i + 1)}>
              <u>{i + 1}</u>
              <span>{l}</span>
            </div>
          ))}
        </div>
        <p>
          Describe the edit as code, in as big a batch as you like. People can drive the same engine from a GUI.
        </p>
      </article>

      <Link run={p === 4} on={p >= 4} label="edits as code" />

      {/* 02 · VISUALKIT */}
      <article className={"arch-layer l-engine" + (p >= 5 && p <= 7 ? " is-active" : "")}>
        <header>
          <span className="arch-num">02</span>
          <h3><BrandMark /> VisualKit engine</h3>
        </header>
        <div className="arch-who" aria-hidden="true">
          <span className={on(p, 5)}>Validate</span>
          <span className={on(p, 6)}>Version</span>
          <span className={on(p, 7)}>Snapshot</span>
        </div>
        <div className="arch-viz arch-checks" aria-hidden="true">
          {CHECKS.map(([t, s], i) => (
            <div key={t} className={"arch-check" + on(p, 5 + i)}>
              <span className="tick"><Check size={11} strokeWidth={3} /></span>
              <b>{t}</b>
              <small>{s}</small>
            </div>
          ))}
          <div className={"arch-rev" + on(p, 7)}>
            <i /> r42 committed · sealed
          </div>
        </div>
        <p>
          Validates every value, versions every run, and saves atomically. Bad edits never reach the project.
        </p>
      </article>

      <Link run={p === 8} on={p >= 8} label="settled snapshot" />

      {/* 03 · RENDERER */}
      <article className={"arch-layer l-render" + (p >= 9 ? " is-active" : "")}>
        <header>
          <span className="arch-num">03</span>
          <h3>Renderer</h3>
        </header>
        <div className="arch-who" aria-hidden="true">
          <span className={on(p, 9)}>Render</span>
          <span className={on(p, 9)}>Finish</span>
          <span className={on(p, 9)}>Hand off</span>
        </div>
        <div className="arch-viz arch-render" aria-hidden="true">
          <div className="arch-rlist">
            {RENDERERS.map((r, i) => (
              <span key={r} className={on(p, 9)} style={{ transitionDelay: i * 0.28 + "s" }}>{r}</span>
            ))}
            <span className="is-future">your next backend</span>
          </div>
          <div className="arch-bar-out">
            <div className="arch-progress"><i className={on(p, 9)} /></div>
            <div className={"arch-done" + on(p, 10)}>
              <Film size={12} /> hero.mp4 <Check size={12} strokeWidth={3} />
            </div>
          </div>
        </div>
        <p>
          DaVinci Resolve, FFmpeg, OpenTimelineIO, or any adapter you add. Renderers only read the snapshot.
        </p>
      </article>

      <span className="sr-only">
        Flow: an agent, script or GUI writes edit code; the VisualKit engine validates, versions and saves it; a
        renderer such as FFmpeg, DaVinci Resolve or OpenTimelineIO produces the video.
      </span>
    </div>
  );
}

function Link({ run, on: lit, label }: { run: boolean; on: boolean; label: string }) {
  return (
    <div className={"arch-link" + (lit ? " is-on" : "") + (run ? " is-run" : "")} aria-hidden="true">
      <span>{label}</span>
      <div className="arch-wire"><i /></div>
    </div>
  );
}
