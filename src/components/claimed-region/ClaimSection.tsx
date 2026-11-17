import ClaimFigure from "./ClaimFigure";
import "./claims.css";
import Reveal from "@/components/ui/Reveal";

const RULES = [
  { title: "One exclusive window", body: "The region follows its owner, even as the surrounding edit moves." },
  { title: "Conflict-aware by design", body: "Clips and groups stay atomic unless a split is explicitly requested." },
  { title: "Release with integrity", body: "Validate, commit atomically, then ripple for any duration change." },
];

export default function ClaimSection() {
  return (
    <section className="claim-section" id="claimed-region">
      <div className="claim-section-inner">
        <Reveal className="claim-section-copy">
          <span className="section-kicker">06 / SAFE PARALLEL WORK</span>
          <h2>
            Claim the time.<br />
            <span>Not the whole timeline.</span>
          </h2>
          <p>
            A claim reserves a half-open time range, <code>[start, end)</code>, across every track. Only the owner can
            write there; everyone else reads the same immutable project snapshot. No dirty reads, no surprise edits.
          </p>
          <div className="claim-rules">
            {RULES.map(({ title, body }, i) => (
              <div key={title}>
                <span className="claim-rule-n">{`0${i + 1}`}</span>
                <span><strong>{title}</strong><small>{body}</small></span>
              </div>
            ))}
          </div>
          <div className="claim-resolution">
            <span>WHEN A CLAIM OVERLAPS</span>
            <p>Expand connected clips or groups when allowed. Otherwise reject with a precise suggested range, or split only when requested.</p>
          </div>
        </Reveal>
        <ClaimFigure />
      </div>
    </section>
  );
}
