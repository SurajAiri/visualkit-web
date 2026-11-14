"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

// 10s of footage, pre-keyframes at 2s and 7s of *source* time, one post-keyframe at 1.5s of *clip* time.
// Change the speed: source-anchored marks travel with the footage, the clip-anchored mark stays put.
const SRC_LEN = 10;
const PRE = [2, 7];
const POST = 1.5;
const START = 8; // clip starts at 00:08 on the timeline
const TL = 20;   // timeline lane shows 20s

const tc = (s: number) => `00:${String(Math.round(s)).padStart(2, "0")}`;

export default function TimeDemo() {
  const [speed, setSpeed] = useState(2);
  const d = SRC_LEN / speed;
  const pc = (v: number, of: number) => (v / of) * 100 + "%";

  return (
    <div className="pipeline-graphic">
      <div className="pipeline-ruler">
        <span>source</span>
        <div className="ruler-track">
          <b className="ruler-span" style={{ left: 0, width: "100%" }} />
          {PRE.map((t) => <i key={t} className="key key-blue" style={{ left: pc(t, SRC_LEN) }} />)}
        </div>
        <strong>{SRC_LEN}s</strong>
      </div>

      <div className="pipeline-ruler">
        <span>clip</span>
        <div className="ruler-track">
          <b className="ruler-span" style={{ left: 0, width: pc(d, SRC_LEN) }} />
          {PRE.map((t) => <i key={t} className="key key-blue" style={{ left: pc((t / SRC_LEN) * d, SRC_LEN) }} />)}
          <i className="key key-orange" style={{ left: pc(POST, SRC_LEN) }} />
        </div>
        <strong>{d % 1 ? d.toFixed(1) : d}s</strong>
      </div>

      <div className="pipeline-ruler">
        <span>timeline</span>
        <div className="ruler-track">
          <b className="ruler-span is-tl" style={{ left: pc(START, TL), width: pc(d, TL) }} />
          {PRE.map((t) => <i key={t} className="key key-blue" style={{ left: pc(START + (t / SRC_LEN) * d, TL) }} />)}
          <i className="key key-orange" style={{ left: pc(START + POST, TL) }} />
        </div>
        <strong>{tc(START + d)}</strong>
      </div>

      <div className="pipeline-flow">
        <span>PRE KEYFRAMES</span>
        <label className="speed-ctl">
          <span className="speed-pill">{speed}× SPEED</span>
          <input
            type="range" min={1} max={4} step={0.5} value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            aria-label="Clip speed"
            aria-valuetext={`${speed} times speed, clip lasts ${d} seconds`}
          />
        </label>
        <ArrowRight size={14} aria-hidden />
        <span>POST KEYFRAMES</span>
      </div>

      <div className="pipeline-caption">
        <span className="dot-blue" /> footage moments travel with the source
        <span className="dot-orange" /> clip motion stays in place
      </div>
    </div>
  );
}
