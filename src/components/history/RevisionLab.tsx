"use client";
import { useEffect, useRef, useState } from "react";
import { Bookmark, GitBranch, GitCommitHorizontal, GitMerge, Redo2, RotateCcw, Undo2 } from "lucide-react";
import { useInView, useReducedMotion } from "@/components/ui/useInView";

/* A tiny, honest model of VisualKit history. Every action appends a revision (history is append-only):
   undo = `revert`, redo = reverting the revert, rollback = `restore` a checkpoint, merge = a revision with two parents. */
type Kind = "commit" | "revert" | "reapply" | "restore" | "merge";
type Node = { id: string; lane: 0 | 1; col: number; kind: Kind; label: string; parents: string[]; cp?: string; of?: string };
type S = { nodes: Node[]; lane: 0 | 1; main: string; branch: string | null; fork: string | null; seq: number; cmd: string; note: string };
type Op = "commit" | "checkpoint" | "branch" | "merge" | "undo" | "redo" | "rollback";

const MAX = 10;
const MSGS = ["titles", "colour", "b-roll", "music", "captions", "fades"];
const CPS = ["rough-cut", "v1", "client-ok", "v2"];
const SEED: S = {
  nodes: [
    { id: "r38", lane: 0, col: 0, kind: "commit", label: "rough", parents: [], cp: "rough-cut" },
    { id: "r39", lane: 0, col: 1, kind: "commit", label: "titles", parents: ["r38"] },
    { id: "r40", lane: 0, col: 2, kind: "commit", label: "grade", parents: ["r39"] },
  ],
  lane: 0, main: "r40", branch: null, fork: null, seq: 41,
  cmd: "visualkit log", note: "Three revisions on main. r38 is a named checkpoint.",
};

const headId = (s: S) => (s.lane === 0 ? s.main : s.branch ?? (s.fork as string));
const nodeOf = (s: S, id: string) => s.nodes.find((n) => n.id === id)!;
const full = (s: S) => s.nodes.length >= MAX;

function can(s: S, op: Op): boolean {
  const h = nodeOf(s, headId(s));
  switch (op) {
    case "commit": return !full(s);
    case "checkpoint": return !h.cp;
    case "branch": return s.lane === 0;
    case "merge": return s.lane === 1 && s.branch !== null && !full(s);
    case "undo": return !full(s) && h.kind !== "revert" && !(s.lane === 1 && s.branch === null);
    case "redo": return !full(s) && h.kind === "revert";
    case "rollback": return !full(s) && s.nodes.some((n) => n.cp);
  }
}

function add(s: S, kind: Kind, label: string, parents: string[], extra: Partial<Node> = {}): S {
  const lane = kind === "merge" ? 0 : s.lane;
  const id = "r" + s.seq;
  const n: Node = { id, lane, col: s.nodes.length, kind, label, parents, ...extra };
  return { ...s, nodes: [...s.nodes, n], seq: s.seq + 1, ...(lane === 0 ? { main: id } : { branch: id }) };
}

function apply(s: S, op: Op): S {
  if (!can(s, op)) return s;
  const h = nodeOf(s, headId(s));
  switch (op) {
    case "commit":
      return { ...add(s, "commit", MSGS[s.seq % MSGS.length], [h.id]), cmd: "visualkit exec edit.py", note: "One run, one revision. A failed run writes none." };
    case "checkpoint": {
      const name = CPS[s.nodes.filter((n) => n.cp).length % CPS.length];
      return { ...s, nodes: s.nodes.map((n) => (n.id === h.id ? { ...n, cp: name } : n)), cmd: `visualkit checkpoint new ${name}`, note: "A named safe point on " + h.id + ". It costs nothing." };
    }
    case "branch":
      return { ...s, lane: 1, branch: null, fork: s.main, cmd: "visualkit branch new try-a --from main", note: "Forking copies pointers only. Commits now land on try-a." };
    case "merge": {
      const b = s.branch as string;
      const m = add({ ...s, lane: 0 }, "merge", "merge", [s.main, b]);
      return { ...m, lane: 0, branch: null, fork: null, cmd: "visualkit merge try-a --into main", note: "Three-way merge by object. The revision has two parents." };
    }
    case "undo":
      return { ...add(s, "revert", "revert", [h.id], { of: h.id }), cmd: `visualkit revert ${h.id}`, note: `A new revision that inverts ${h.id}. ${h.id} is still in history.` };
    case "redo":
      return { ...add(s, "reapply", "redo", [h.id], { of: h.id }), cmd: `visualkit revert ${h.id}`, note: "Reverting the revert puts the change back." };
    case "rollback": {
      const cp = [...s.nodes].reverse().find((n) => n.cp)!;
      return { ...add(s, "restore", "restore", [h.id]), cmd: `visualkit restore ${cp.cp}`, note: `A new revision whose state equals ${cp.cp}. Everything after it is still recoverable.` };
    }
  }
}

const BUTTONS: { op: Op; label: string; Icon: typeof Undo2 }[] = [
  { op: "commit", label: "Commit", Icon: GitCommitHorizontal },
  { op: "checkpoint", label: "Checkpoint", Icon: Bookmark },
  { op: "branch", label: "Branch", Icon: GitBranch },
  { op: "merge", label: "Merge", Icon: GitMerge },
  { op: "undo", label: "Undo", Icon: Undo2 },
  { op: "redo", label: "Redo", Icon: Redo2 },
  { op: "rollback", label: "Rollback", Icon: RotateCcw },
];
const TOUR: Op[] = ["commit", "checkpoint", "branch", "commit", "commit", "merge", "undo", "redo", "rollback"];
const COLOR: Record<Kind, string> = { commit: "#c5fb63", merge: "#a580ef", revert: "#f8a27b", reapply: "#5b8cff", restore: "#f48ac0" };
const X = (c: number) => 60 + c * 63;
const Y = (l: number) => (l === 0 ? 66 : 142);

export default function RevisionLab() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.45);
  const reduced = useReducedMotion();
  const [s, setS] = useState<S>(SEED);
  const touched = useRef(false);
  const started = useRef(false);

  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  // The tour starts once, the first time the lab is on screen, and keeps going even if the visitor scrolls away.
  useEffect(() => {
    if (reduced || !inView || started.current) return;
    started.current = true;
    let i = 0;
    timer.current = setInterval(() => {
      if (touched.current || i >= TOUR.length) { clearInterval(timer.current); return; }
      const op = TOUR[i++];
      setS((cur) => apply(cur, op));
    }, 1250);
  }, [inView, reduced]);
  useEffect(() => () => clearInterval(timer.current), []);

  const act = (op: Op) => { touched.current = true; setS((c) => apply(c, op)); };
  const reset = () => { touched.current = true; setS(SEED); };
  const head = headId(s);
  const hasBranch = s.fork !== null || s.nodes.some((n) => n.lane === 1);
  const ghostCol = s.lane === 1 && s.branch === null ? s.nodes.length : -1;

  return (
    <div className="lab" ref={ref}>
      <div className="lab-bar">
        {BUTTONS.map(({ op, label, Icon }) => (
          <button key={op} onClick={() => act(op)} disabled={!can(s, op)}><Icon size={13} aria-hidden />{label}</button>
        ))}
      </div>

      <div className="lab-scroll">
      <svg className="lab-graph" viewBox="0 0 700 196" role="img" aria-label="A revision graph. Commits, merges, reverts and restores are all appended; nothing is rewritten.">
        <text x="8" y={Y(0) + 4} className="lab-lane">main</text>
        {hasBranch && <text x="8" y={Y(1) + 4} className="lab-lane">try-a</text>}
        {s.nodes.flatMap((n) =>
          n.parents.map((p) => {
            const a = nodeOf(s, p);
            const x1 = X(a.col), y1 = Y(a.lane), x2 = X(n.col), y2 = Y(n.lane);
            const d = y1 === y2 ? `M${x1} ${y1}L${x2} ${y2}` : `M${x1} ${y1}C${x1 + 34} ${y1},${x2 - 34} ${y2},${x2} ${y2}`;
            return <path key={n.id + p} d={d} className="lab-edge" />;
          }),
        )}
        {ghostCol >= 0 && (
          <g>
            <path d={`M${X(nodeOf(s, s.fork as string).col)} ${Y(0)}C${X(nodeOf(s, s.fork as string).col) + 34} ${Y(0)},${X(ghostCol) - 34} ${Y(1)},${X(ghostCol)} ${Y(1)}`} className="lab-edge is-ghost" />
            <circle cx={X(ghostCol)} cy={Y(1)} r="7" className="lab-ghost" />
          </g>
        )}
        {s.nodes.map((n) => (
          <g key={n.id} className="lab-node">
            <circle cx={X(n.col)} cy={Y(n.lane)} r="7.5" fill={COLOR[n.kind]} />
            <text x={X(n.col)} y={Y(n.lane) - 15} textAnchor="middle" className="lab-id">{n.id}</text>
            <text x={X(n.col)} y={Y(n.lane) + 24} textAnchor="middle" className="lab-msg">{n.label}</text>
            {n.cp && (
              <g className="lab-cp">
                <path d={`M${X(n.col) - 4} ${Y(n.lane) - 40}v14`} />
                <path d={`M${X(n.col) - 4} ${Y(n.lane) - 40}h22l-5 4.5l5 4.5h-22z`} />
                <text x={X(n.col) + 24} y={Y(n.lane) - 31} >{n.cp}</text>
              </g>
            )}
            {n.id === head && <g className="lab-head"><rect x={X(n.col) - 19} y={Y(n.lane) + 32} width="38" height="15" rx="3" /><text x={X(n.col)} y={Y(n.lane) + 43} textAnchor="middle">HEAD</text></g>}
          </g>
        ))}
      </svg>
      </div>

      <div className="lab-term" role="status" aria-live="polite">
        <button className="lab-reset" onClick={reset}>Reset</button>
        <code><i>$</i> {s.cmd}</code>
        <span>{s.note}{full(s) ? " The demo is full: reset to keep playing." : ""}</span>
      </div>
    </div>
  );
}
