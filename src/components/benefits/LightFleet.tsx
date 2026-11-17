import { LockKeyhole, X } from "lucide-react";

/* Left: a desktop editor is one heavy instance; a second copy does not fit.
   Right: VisualKit is a library, so many light agents work on one shared timeline, each in its own claimed region. */
const AGENTS = ["agent-a", "agent-b", "agent-c", "agent-d"] as const;

export default function LightFleet() {
  return (
    <div className="fleet" role="img" aria-label="A desktop editor with MCP runs as one heavy instance and a second copy will not fit. VisualKit runs many light agents at once, each holding its own claimed region of one shared timeline.">
      <div className="fleet-side fleet-heavy" aria-hidden="true">
        <span className="fleet-title">Desktop editor + MCP</span>
        <div className="fleet-win">
          <div className="fleet-chrome"><i /><i /><i /><b>DaVinci Resolve · Premiere Pro</b></div>
          <div className="fleet-meters">
            <span><em>GPU</em><i style={{ ["--w" as string]: "92%" }} /></span>
            <span><em>RAM</em><i style={{ ["--w" as string]: "86%" }} /></span>
            <span><em>UI</em><i style={{ ["--w" as string]: "74%" }} /></span>
          </div>
        </div>
        <div className="fleet-ghost"><X size={13} /> second instance</div>
        <small>One heavy copy at a time</small>
      </div>

      <div className="fleet-side fleet-light" aria-hidden="true">
        <span className="fleet-title">VisualKit</span>
        <ul className="fleet-agents">
          {AGENTS.map((a, i) => (
            <li key={a} style={{ ["--i" as string]: i }}><i />{a}</li>
          ))}
        </ul>
        <div className="fleet-tl">
          <div className="fleet-lane"><i className="c1" /><i className="c2" /><i className="c3" /><i className="c4" /></div>
          <div className="fleet-lane"><i className="c5" /><i className="c6" /><i className="c7" /></div>
          <b className="fleet-claim k1"><LockKeyhole size={9} />a</b>
          <b className="fleet-claim k2"><LockKeyhole size={9} />b</b>
          <b className="fleet-claim k3"><LockKeyhole size={9} />c</b>
        </div>
        <small>Many light agents, one timeline</small>
      </div>
    </div>
  );
}
