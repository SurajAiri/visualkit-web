import { Check, Film, RefreshCw } from "lucide-react";

/* Code on the left, validate → compile → clip on the right. The framework named in the code cycles, in step with the chips. */
const LIBS = ["HyperFrames", "Remotion", "Manim", "OpenCV"] as const;
const SRC = ["hyperframes", "remotion", "manim", "opencv"] as const;

export default function CodedClips() {
  return (
    <div className="coded-art">
      <div className="flow-graphic" role="img" aria-label="Code is validated, compiled into a clip asset, and placed on the timeline as a normal clip">
        <div className="flow-code">
          <div className="mini-window" aria-hidden="true"><i /><i /><i /></div>
          <code>
            <span>01</span> intro = visualkit.<strong>clip</strong>(<br />
            <span>02</span>{"    "}source=<u className="coded-swap">{SRC.map((s, i) => <span key={s} style={{ animationDelay: i * 2 + "s" }}>&quot;{s}&quot;</span>)}</u>,<br />
            <span>03</span>{"    "}duration=<mark>4</mark>,<br />
            <span>04</span> )
          </code>
          <span className="code-caption">A coded visual, in a batch.</span>
        </div>
        <div className="flow-steps" aria-hidden="true">
          <div className="flow-step"><span className="step-icon step-check"><Check size={14} /></span><span>validate</span></div>
          <i />
          <div className="flow-step"><span className="step-icon step-compile"><RefreshCw size={14} /></span><span>compile</span></div>
          <i />
          <div className="flow-step"><span className="step-icon step-ready"><Film size={14} /></span><span>clip asset</span></div>
        </div>
        <div className="flow-result" aria-hidden="true">
          <div className="result-frame"><div className="result-sun" /><div className="result-hill hill-a" /><div className="result-hill hill-b" /><span>04:12</span></div>
          <div className="result-label"><span>visual clip</span><Check size={13} /></div>
        </div>
      </div>
      <ul className="coded-libs" aria-label="Code-to-media frameworks">
        {LIBS.map((l, i) => <li key={l} style={{ animationDelay: i * 2 + "s" }}>{l}</li>)}
        <li className="is-more">any code-to-media library</li>
        <li className="is-more">audio code too</li>
      </ul>
    </div>
  );
}
