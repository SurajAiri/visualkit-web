"use client";
import { useMemo, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { LAUNCH_MS, RUN_UP_SECONDS, pad2, splitTime } from "./useLaunchCountdown";
import "./countdown.css";

/** One rolling digit: remounting the inner span on change replays the roll animation. */
function Digit({ ch }: { ch: string }) {
  return (
    <span className="cd-digit">
      <span key={ch} className="cd-digit-in">{ch}</span>
    </span>
  );
}

function Unit({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className={"cd-unit" + (accent ? " is-accent" : "")}>
      <div className="cd-digits" aria-hidden="true">
        {value.split("").map((c, i) => <Digit key={i} ch={c} />)}
      </div>
      <span className="cd-label">{label}</span>
    </div>
  );
}

const Sep = () => <span className="cd-sep" aria-hidden="true">:</span>;

const UTC_FMT = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short",
});

export default function CountdownSection({ left }: { left: number | null }) {
  const ready = left !== null;
  const { d, h, m, s } = splitTime(left ?? 0);
  const show = (n: number) => (ready ? pad2(n) : "--");

  // 0 = start of the 24h run-up, 1 = release
  const progress = ready ? Math.min(1, Math.max(0, 1 - left / RUN_UP_SECONDS)) : 0;

  const lines = useMemo(() => {
    const utc = UTC_FMT.format(LAUNCH_MS);
    if (!ready) return { utc, local: null as string | null };
    const local = new Intl.DateTimeFormat(undefined, {
      weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short",
    }).format(LAUNCH_MS);
    return { utc, local: local === utc ? null : local };
  }, [ready]);

  const label = ready
    ? `${d > 0 ? `${d} days ` : ""}${h} hours ${m} minutes ${s} seconds until the library release`
    : "Library release countdown";

  return (
    <section className="cd-section" id="start" aria-labelledby="cd-title">
      <div className="cd-grid" aria-hidden="true" />
      <Reveal className="cd-content">
        <span className="section-kicker">LIBRARY RELEASE</span>
        <h2 id="cd-title">
          Docs are live.<br />
          <span>Library drops soon.</span>
        </h2>
        <p>The documentation is up now (it may get a few cosmetic touch-ups). The library ships when the clock hits zero.</p>

        <div className={"cd-clock" + (d > 0 ? " has-days" : "")} role="timer" aria-label={label}>
          {d > 0 ? (<><Unit value={show(d)} label="days" /><Sep /></>) : null}
          <Unit value={show(h)} label="hours" />
          <Sep />
          <Unit value={show(m)} label="minutes" />
          <Sep />
          <Unit value={show(s)} label="seconds" accent />
        </div>

        {/* a tiny timeline: the docs clip is finished, the library clip fills as the playhead nears release */}
        <div className="cd-tl" aria-hidden="true" style={{ "--p": progress } as CSSProperties}>
          <div className="cd-tl-row is-ruler">
            <span />
            <div className="cd-ruler"><b>−24h</b><b>RELEASE</b></div>
          </div>
          <div className="cd-tl-row">
            <span className="cd-tl-name">V2</span>
            <div className="cd-lane"><div className="cd-clip is-done"><Check size={12} /> docs · live</div></div>
          </div>
          <div className="cd-tl-row">
            <span className="cd-tl-name">V1</span>
            <div className="cd-lane"><div className="cd-clip is-build">library<span className="cd-hide-sm"> · final checks</span></div></div>
          </div>
          <div className="cd-ph-wrap"><div className="cd-ph"><i /></div><div className="cd-flag" /></div>
        </div>

        <div className="cd-meta">
          <span>{lines.utc}</span>
          {lines.local ? <span>{lines.local} <em>(your time)</em></span> : null}
        </div>

        <div className="cd-cta">
          <Link className="button-primary" href="/docs">
            Read the docs <ArrowUpRight size={16} aria-hidden />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
