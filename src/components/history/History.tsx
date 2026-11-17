import { Archive, Bookmark, GitBranch, GitMerge, RotateCcw } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import RevisionLab from "./RevisionLab";
import "./history.css";

const POINTS = [
  { icon: Archive, t: "Append-only", d: "Undo, redo and rollback each add a new revision. Nothing is rewritten, so nothing is lost." },
  { icon: Bookmark, t: "Checkpoints", d: "Name any revision as a safe point. It costs nothing and can't be lost." },
  { icon: GitBranch, t: "Branches", d: "Fork a line of experiments cheaply. Main never changes until you merge." },
  { icon: GitMerge, t: "Three-way merge", d: "Merges by object, and lists any conflict with both versions." },
] as const;

/* 04 · History. The existing "trust" idea, finished: commit, checkpoint, branch, merge, undo, redo, rollback. */
export default function History() {
  return (
    <section className="history-section" id="history">
      <Reveal className="history-copy">
        <span className="section-kicker">04 / HISTORY, BRANCHES, CHECKPOINTS</span>
        <h2>
          Try anything.<br />
          <span>Take it back.</span>
        </h2>
        <p>
          Every run becomes a revision. Name a safe point, fork a branch to experiment, undo a change or roll the whole
          project back, then merge what works. An agent can explore without fear because the previous cut is always
          one command away.
        </p>
        <ul className="history-points">
          {POINTS.map(({ icon: Icon, t, d }) => (
            <li key={t}>
              <Icon size={16} aria-hidden />
              <span><strong>{t}</strong><small>{d}</small></span>
            </li>
          ))}
        </ul>
        <span className="history-hint"><RotateCcw size={12} aria-hidden /> Try the buttons. It is a live model of the real commands.</span>
      </Reveal>
      <RevisionLab />
    </section>
  );
}
