"use client";
import { useState } from "react";

const SRC = [0.5, 2, 3.5];
const POST = [0.5, 3];
const K = 100;

function Dia({ x, y, c, o = 1 }: { x: number; y: number; c: string; o?: number }) {
  return <rect x={x - 6} y={y - 6} width="12" height="12" fill={c} opacity={o} transform={`rotate(45 ${x} ${y})`} />;
}

export default function Keyframes() {
  const [v, setV] = useState(1);
  const [freeze, setFreeze] = useState(false);
  const [trim, setTrim] = useState(0);
  const len = freeze ? 4 : 4 / v;

  return (
    <div className="panel">
      <svg viewBox="0 0 640 190" width="100%" role="img" aria-label="Pre-keyframes follow the footage, post-keyframes stay on screen">
        <text x="0" y="14">clip, after the speed curve</text>
        <rect x="0" y="22" width="640" height="38" rx="5" fill="#1a403b" />
        <rect x={trim * K} y="26" width={Math.max(0, (len - trim) * K)} height="30" rx="4" fill="#2c7a6c" />
        {SRC.map((t) => {
          const x = freeze ? 2 * K : (t / v) * K;
          return x >= trim * K && x <= len * K ? <Dia key={t} x={x} y={41} c="#ff4f9a" o={freeze ? 0.6 : 1} /> : null;
        })}
        <text x="0" y="84">pre keys, pinned to footage</text>
        <text x="0" y="112">screen, what the viewer sees</text>
        <rect x="0" y="120" width="640" height="38" rx="5" fill="#1a403b" />
        {POST.map((a) => (
          <Dia key={a} x={a * K} y={139} c="#4d7cff" />
        ))}
        <text x="0" y="178">post keys, stored at clip time + anim_offset</text>
        <line className="ph" x1="0" x2="0" y1="8" y2="160" stroke="#fff" strokeWidth="2" opacity=".7" />
        <line x1={len * K} x2={len * K} y1="22" y2="158" stroke="#ffc400" strokeDasharray="3 3" />
      </svg>
      <div className="ctrl">
        <span className="seg">
          {[0.5, 1, 2].map((s) => (
            <button key={s} aria-pressed={!freeze && v === s} onClick={() => { setFreeze(false); setV(s); }}>{s}x</button>
          ))}
          <button aria-pressed={freeze} onClick={() => setFreeze(true)}>freeze</button>
        </span>
        <label>
          trim head {trim.toFixed(1)}s{" "}
          <input type="range" min="0" max="1.5" step="0.5" value={trim} onChange={(e) => setTrim(+e.target.value)} />
        </label>
      </div>
      <div className="banner m">
        anim_offset = +{trim.toFixed(1)}s, post keys rewritten: 0
        {freeze && <span className="fail">  pre keys share one source moment, so only post keys can move here</span>}
      </div>
    </div>
  );
}
