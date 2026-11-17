import Reveal from "@/components/ui/Reveal";
import "./more-features.css";

/* One title, one line. Every line is taken from the feature reference. */
const FEATURES: [string, string][] = [
  ["Exact time", "Times are exact fractions, so nothing drifts and saved projects round-trip without loss."],
  ["Three clocks", "Source, clip and timeline time stay separate, so animation sticks to the right thing."],
  ["Pre keyframes", "Keyframes tied to the source footage, held in place through every trim and split."],
  ["Speed curves", "Ramp, freeze or reverse a clip by remapping clip time to source time."],
  ["Post keyframes", "Keyframes on the placed clip, applied after the speed curve."],
  ["Effect stacks", "Ordered effects on any clip: colour, blur, chroma key, audio EQ and more."],
  ["Adjustment clips", "One clip applies its look to every clip below it, for picture or sound."],
  ["Fusion graphs", "Node graphs for masks, keying and composites that a plain stack can’t express."],
  ["Compound clips", "A whole mini-edit packaged as one reusable clip."],
  ["Template clips", "Repeat a group of clips with the same look and different content per copy."],
  ["Asset resolver", "Clips use asset IDs, so a moved file is relinked once and descriptions make footage searchable."],
  ["Actors and proxy keys", "Agents use AI video services without ever handling the secret keys."],
  ["Dry runs", "Run everything against the current state and print the change report, writing nothing."],
  ["Run records", "Every run, failed ones included, is kept with its script and report."],
  ["JSON output", "Every command takes --format json, so agents read the same report you do."],
  ["Script guardrails", "A static check rejects imports outside the allowlist before a script runs."],
  ["Workspaces", "Each agent gets its own working context: a branch, a claim and an expiry."],
  ["Sub-claims", "Split a claimed region among worker agents, so multi-agent systems can nest."],
  ["Settled branches", "Merge and render only when no claims are open."],
  ["Storyboards and markers", "Plan each editing stage with markers, a storyboard and a director cut."],
  ["Readable export", "Export one JSON file per object, and import it back."],
];

export default function MoreFeatures() {
  return (
    <section className="more-section" id="more">
      <Reveal className="feature-heading">
        <div>
          <span className="section-kicker">07 / MORE FEATURES</span>
          <h2>
            And the rest<br />
            <span>of the toolbox.</span>
          </h2>
        </div>
        <span className="feature-count">{FEATURES.length} MORE THINGS<br /><strong>IN THE BOX</strong></span>
      </Reveal>
      <Reveal as="ul" className="more-grid" delay={60}>
        {FEATURES.map(([t, d], i) => (
          <li key={t}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <strong>{t}</strong>
            <p>{d}</p>
          </li>
        ))}
      </Reveal>
    </section>
  );
}
