"use client";
import { useEffect, useState } from "react";

// Worked example: r1 holds 0-15s, r2 holds 20-30s (project seconds).
const ST = [
  { r1: [0, 15], r2: [20, 30], see: 10, cap: "Claims granted. r2 sees 0 to 10." },
  { r1: [0, 20], r2: [25, 35], see: 10, cap: "r1 saves a 20 s region. r2 is promised 25 to 35 and sees no change." },
  { r1: [0, 20], r2: [25, 33], see: 8, cap: "r2 saves an 8 s region. Promised start stays 25." },
  { r1: [0, 20], r2: [25, 33], see: 0, cap: "r2 releases: its items shift by 5 s. Same layout in any release order." },
];
const K = 11;

export default function Claims() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % ST.length), 2200);
    return () => clearInterval(t);
  }, []);
  const s = ST[i];
  const bar = (a: number, b: number, c: string, y: number, o = 1) => (
    <rect x={a * K} y={y} width={(b - a) * K} height="30" rx="4" fill={c} opacity={o} style={{ transition: "all .5s" }} />
  );
  return (
    <div className="panel">
      <svg viewBox="0 0 620 170" width="100%" role="img" aria-label="Two claimed regions on one timeline">
        <text x="0" y="14">project time</text>
        {bar(0, 55, "#183632", 22)}
        {bar(s.r1[0], s.r1[1], "#5fb8a8", 22)}
        {bar(s.r2[0], s.r2[1], "#e9a07a", 22, i === 3 ? 1 : 0.85)}
        <text x={s.r1[0] * K + 6} y="41" style={{ fill: "#0f2321" }}>r1</text>
        <text x={s.r2[0] * K + 6} y="41" style={{ fill: "#0f2321" }}>r2</text>
        <text x="0" y="86">what r2 sees, local time</text>
        {bar(0, 55, "#183632", 94)}
        {s.see > 0 && bar(0, s.see, "#e9a07a", 94)}
        <text x="0" y="148">{s.see > 0 ? `local 0 to ${s.see} s` : "claim released"}</text>
      </svg>
      <div className="banner m">{s.cap}</div>
      <div className="ctrl">
        <span className="seg">
          {ST.map((_, n) => (
            <button key={n} aria-pressed={i === n} onClick={() => setI(n)}>{n + 1}</button>
          ))}
        </span>
        <span>branch with open claims: not settled, merge and export refuse (exit 4)</span>
      </div>
    </div>
  );
}
