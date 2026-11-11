"use client";
import { useEffect, useState } from "react";

const STEPS = [
  "script assigns clip.transform.opacity = 0.4",
  "commit: validate only what is dirty and what it affects",
  "sealed: a validated step enters the session",
  "save: one atomic write, one new revision",
];

export default function Engine() {
  const [s, setS] = useState(0);
  const [err, setErr] = useState(false);
  const [play, setPlay] = useState(true);
  const max = err ? 2 : 4;

  useEffect(() => {
    if (!play || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setS((x) => (x + 1) % max), 1700);
    return () => clearInterval(t);
  }, [play, max]);

  const failed = err && s === 1;
  const sealed = !err && s >= 2;
  const saved = !err && s >= 3;

  return (
    <div className="panel">
      <div className="engine">
        <div className="col">
          <h4>Draft</h4>
          <small>one run, mutable copies</small>
          <div className="ent dirty">clip 01J9N</div>
          <div className={"ent " + (failed ? "bad" : s === 1 ? "chk" : "")}>item 01J9N</div>
          <div className={"ent " + (failed ? "bad" : s === 1 ? "chk" : "")}>item 01J9M, same track</div>
          <div className="ent">track V1</div>
        </div>
        <div className={"gate " + (s === 1 ? "on" : "")}>commit<br />graph check</div>
        <div className="col">
          <h4>Session</h4>
          <small>sealed snapshots, step history</small>
          <div className="ent">head</div>
          {sealed && <div className="ent new">step: dim the title</div>}
        </div>
        <div className={"gate " + (s === 3 && !err ? "on" : "")}>save<br />one write</div>
        <div className="col">
          <h4>Store</h4>
          <small>SQLite, append-only</small>
          <div className="ent">rev 01J9Q</div>
          {saved && <div className="ent new">rev 01J9R + run record</div>}
        </div>
      </div>
      <div className="banner">
        {failed ? (
          <span className="fail">FAIL 1 problem, nothing written: item 01J9N overlaps 01J9M on V1</span>
        ) : (
          <span className="m">{STEPS[s]}</span>
        )}
      </div>
      <div className="ctrl">
        <span className="seg">
          <button aria-pressed={!err} onClick={() => { setErr(false); setS(0); }}>valid edit</button>
          <button aria-pressed={err} onClick={() => { setErr(true); setS(0); }}>overlapping edit</button>
        </span>
        <button className="btn alt" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setPlay((p) => !p)}>
          {play ? "pause" : "play"}
        </button>
        <button className="btn alt" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => { setPlay(false); setS((x) => (x + 1) % max); }}>
          step
        </button>
      </div>
    </div>
  );
}
