"use client";
import { useState } from "react";

const CMD = { pip: "pip install visualkit", uv: "uv add visualkit" } as const;

export default function Install() {
  const [k, setK] = useState<keyof typeof CMD>("pip");
  const [done, setDone] = useState(false);
  return (
    <div className="cta" style={{ alignItems: "center" }}>
      <a className="btn main" href="https://surajairi.github.io/visualkit/">Read the documentation</a>
      <button
        className="btn alt"
        aria-label={`Copy ${CMD[k]}`}
        onClick={() => { navigator.clipboard?.writeText(CMD[k]); setDone(true); setTimeout(() => setDone(false), 1500); }}
      >
        <code>{CMD[k]}</code>
        <span className="tc" style={{ color: "#8fa8a1" }}>{done ? "copied" : "copy"}</span>
      </button>
      <span className="seg" style={{ display: "inline-flex" }}>
        {(Object.keys(CMD) as (keyof typeof CMD)[]).map((x) => (
          <button key={x} aria-pressed={k === x} style={{ color: "#14201e", borderColor: "#9aa89f" }} onClick={() => setK(x)}>{x}</button>
        ))}
      </span>
    </div>
  );
}
