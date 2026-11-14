import { LockKeyhole } from "lucide-react";

// CSS-only loop: a third agent tries to write into maya's claim, gets refused with a
// suggested range, then lands its edit in the free gap.
export default function CollabScene() {
  return (
    <div className="collab-scene" role="img" aria-label="A third agent tries to edit inside a claimed range, is refused with a suggested range, and writes in the free gap instead.">
      <div className="cs-ruler" aria-hidden="true">
        {[0, 10, 20, 30, 40, 50].map((t) => <span key={t} style={{ left: (t / 60) * 100 + "%" }}>{`00:${String(t).padStart(2, "0")}`}</span>)}
      </div>
      <div className="cs-lanes" aria-hidden="true">
        <div className="cs-lane"><i style={{ left: "10%", width: "16.7%" }} /><i style={{ left: "63.3%", width: "20%" }} /><i className="cs-new" style={{ left: "43.3%", width: "13.3%" }} /></div>
        <div className="cs-lane"><i style={{ left: "13.3%", width: "20%" }} /><i style={{ left: "66.7%", width: "20%" }} /></div>

        <div className="cs-claim cs-maya" style={{ left: "6.7%", width: "33.3%" }}><b><LockKeyhole size={10} />R1 maya-agent [4s, 24s)</b></div>
        <div className="cs-claim cs-jules" style={{ left: "60%", width: "26.7%" }}><b><LockKeyhole size={10} />R2 jules-agent [36s, 52s)</b></div>

        <div className="cs-cursor"><svg width="11" height="13" viewBox="0 0 11 13"><path d="M1 1 L1 11 L4 8 L6.4 12.4 L8 11.6 L5.7 7.3 L9.6 7 Z" fill="currentColor" stroke="#1a1921" strokeWidth=".8" strokeLinejoin="round" /></svg><span>kit-agent</span></div>
        <div className="cs-toast cs-no"><strong>Refused</strong> R1 belongs to maya-agent. Try [24s, 36s).</div>
        <div className="cs-toast cs-yes"><strong>Written</strong> clip placed at 00:26, no overlap.</div>
      </div>
    </div>
  );
}
