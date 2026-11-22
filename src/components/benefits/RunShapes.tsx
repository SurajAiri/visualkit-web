"use client";
import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { prefersReducedMotion, useInView } from "@/components/ui/useInView";

/* One edit, three shapes. The same code can run as a single batch, phase by phase, or from several agents at once.
   Whatever the shape, every run is saved whole or not at all, so "Break one line" only rejects the run it sits in. */

type Run = { cmd: string; files: { name: string; edits: number }[] };
type Group = { agent?: string; claim?: string; runs: Run[] };
type Shape = {
  id: string;
  tab: string;
  caption: string;
  groups: Group[];
  fail: [group: number, run: number];
  failFile: string;
  hasRegions?: boolean;
};

const SHAPES: Shape[] = [
  {
    id: "batch",
    tab: "All at once",
    caption: "Many files, one run. They share a draft and save together.",
    groups: [
      {
        runs: [
          {
            cmd: "visualkit exec cut.py color.py titles.py",
            files: [
              { name: "cut.py", edits: 4 },
              { name: "color.py", edits: 6 },
              { name: "titles.py", edits: 3 },
            ],
          },
        ],
      },
    ],
    fail: [0, 0],
    failFile: "color.py",
  },
  {
    id: "phases",
    tab: "In phases",
    caption: "One command per phase. Each phase is saved, or rejected, on its own.",
    groups: [
      {
        runs: [
          { cmd: "visualkit exec cut.py", files: [{ name: "cut.py", edits: 4 }] },
          { cmd: "visualkit exec color.py", files: [{ name: "color.py", edits: 6 }] },
          { cmd: "visualkit exec titles.py", files: [{ name: "titles.py", edits: 3 }] },
        ],
      },
    ],
    fail: [0, 1],
    failFile: "color.py",
  },
  {
    id: "parallel",
    tab: "In parallel",
    caption: "Several agents, one timeline. Each run is saved, or rejected, on its own.",
    groups: [
      {
        agent: "agent-a",
        claim: "0–30s",
        runs: [{ cmd: "visualkit exec --workspace agent-a intro.py", files: [{ name: "intro.py", edits: 5 }] }],
      },
      {
        agent: "agent-b",
        claim: "30–60s",
        runs: [{ cmd: "visualkit exec --workspace agent-b outro.py", files: [{ name: "outro.py", edits: 4 }] }],
      },
    ],
    fail: [1, 0],
    failFile: "outro.py",
    hasRegions: true,
  },
];

const STEP_MS = 3400;

export default function RunShapes() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.5);
  const [state, setState] = useState({ mode: 0, broken: false });
  const [manual, setManual] = useState(false);
  const { mode, broken } = state;
  const shape = SHAPES[mode];

  // Auto-play: each shape is shown working, then with one broken line, then the next shape.
  useEffect(() => {
    if (!inView || manual || prefersReducedMotion()) return;
    const id = setInterval(() => {
      setState((s) => (s.broken ? { mode: (s.mode + 1) % SHAPES.length, broken: false } : { ...s, broken: true }));
    }, STEP_MS);
    return () => clearInterval(id);
  }, [inView, manual]);

  return (
    <div className={"runs-art" + (broken ? " is-broken" : "")} ref={ref}>
      <div className="runs-tabs" role="group" aria-label="How the edit runs">
        {SHAPES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={i === mode}
            onClick={() => {
              setManual(true);
              setState({ mode: i, broken: false });
            }}
          >
            {s.tab}
          </button>
        ))}
      </div>

      <div className="runs-body">
        <div className="runs-code" aria-hidden="true">
          <div className="mini-window"><i /><i /><i /></div>
          <code>
            <span>01</span> <em>with</em> engine.edit(label=<u>&quot;cut&quot;</u>):<br />
            <span>02</span>{"    "}clip.trim_tail(9.5)<br />
            <span>03</span> <em>with</em> engine.edit(label=<u>&quot;grade&quot;</u>):<br />
            <span>04</span>{"    "}clip.set_human_props(<br />
            <span className="ln-bad"><span>05</span>{"        "}opacity=<b>{broken ? "140" : "92"}</b>)</span>
          </code>
          <i className="runs-err">{broken ? "opacity must be 0–100" : "\u00a0"}</i>
        </div>

        <div className="runs-stage" key={shape.id}>
          {shape.groups.map((g, gi) => (
            <div className="runs-group" key={g.agent ?? gi}>
              {g.agent && (
                <span className={"runs-agent agent-" + (gi === 0 ? "a" : "b")}>
                  <i aria-hidden="true" />{g.agent}<small>claims {g.claim}</small>
                </span>
              )}
              {g.runs.map((run, ri) => {
                const rejected = broken && shape.fail[0] === gi && shape.fail[1] === ri;
                const total = run.files.reduce((n, f) => n + f.edits, 0);
                return (
                  <div className={"run" + (rejected ? " is-rejected" : "")} key={run.cmd}>
                    <div className="run-cmd"><i>$</i>{run.cmd}</div>
                    {run.files.length > 1 && (
                      <ul className="run-files">
                        {run.files.map((f) => (
                          <li key={f.name} className={rejected && f.name === shape.failFile ? "is-bad" : undefined}>
                            {f.name}
                            <em>{rejected && f.name === shape.failFile ? "out of range" : `${f.edits} edits`}</em>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="run-status">
                      {rejected ? <X size={12} aria-hidden /> : <Check size={12} aria-hidden />}
                      {rejected ? `Nothing written · 0 of ${total} applied` : `${total} edits saved together`}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {shape.hasRegions && (
            <div className="runs-regions" aria-hidden="true">
              <b className="r-a" style={{ ["--w" as string]: "50%" }}>a</b>
              <b className="r-b" style={{ ["--w" as string]: "50%" }}>b</b>
            </div>
          )}
        </div>
      </div>

      <div className="runs-foot">
        <p aria-live="polite">{shape.caption}</p>
        <button
          type="button"
          className="runs-toggle"
          aria-pressed={broken}
          onClick={() => {
            setManual(true);
            setState((s) => ({ ...s, broken: !s.broken }));
          }}
        >
          {broken ? "Fix the line" : "Break one line"}
        </button>
      </div>
    </div>
  );
}
