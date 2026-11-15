// What "nothing breaks silently" means in practice: a rejected attempt never moves HEAD.
// CSS-only loop. The dashed r42 attempt draws, gets refused, and fades. r41 stays current.
const REVS = [
  { id: "r38", msg: "rough cut", y: 28 },
  { id: "r39", msg: "titles", y: 76 },
  { id: "r40", msg: "grade", y: 124 },
  { id: "r41", msg: "b-roll", y: 172 },
];

export default function RevisionGraph() {
  return (
    <svg className="rev-graph" viewBox="0 0 250 270" role="img" aria-label="Revision history: r38 to r41 are committed. A failed attempt, r42, is rejected and HEAD stays on r41.">
      <line x1="30" y1="28" x2="30" y2="172" className="rev-line" />
      {REVS.map((r) => (
        <g key={r.id}>
          <circle cx="30" cy={r.y} r="6" className="rev-dot" />
          <text x="52" y={r.y + 4} className="rev-id">{r.id}</text>
          <text x="88" y={r.y + 4} className="rev-msg">{r.msg}</text>
        </g>
      ))}

      <g className="rev-head">
        <rect x="176" y="158" width="52" height="22" rx="3" />
        <text x="202" y="173" textAnchor="middle">HEAD</text>
      </g>

      <line x1="30" y1="172" x2="30" y2="228" className="rev-try" pathLength={1} />
      <circle cx="30" cy="228" r="6" className="rev-try-dot" />
      <g className="rev-try-label">
        <text x="52" y="232" className="rev-id">r42</text>
        <text x="88" y="232" className="rev-msg">visual_pass</text>
      </g>
      <g className="rev-x"><path d="M24 222 L36 234 M36 222 L24 234" /></g>
      <text x="52" y="256" className="rev-reason">rejected: overlap on V1</text>
    </svg>
  );
}
