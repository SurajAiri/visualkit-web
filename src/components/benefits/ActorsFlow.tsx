import { ArrowRight, Bot, Cloud, KeyRound, LockKeyhole } from "lucide-react";

/* Three rows, one idea each:
   Actors     run a job, from the command line or as a node in a Fusion graph.
   Proxies    let an agent use an AI service while the keys stay inside VisualKit.
   Workflows  chain actors, proxies and code edits into one flow. */

const STEPS = [
  { name: "Find clips", kind: "external actor", tone: "actor" },
  { name: "Transcribe", kind: "actor", tone: "actor" },
  { name: "Generate a shot", kind: "proxy", tone: "proxy" },
  { name: "Cut it in", kind: "code", tone: "code" },
] as const;

export default function ActorsFlow() {
  return (
    <div
      className="act"
      role="img"
      aria-label="Actors run jobs from the command line or as nodes in a Fusion graph. A proxy lets an agent call an AI video service while the secret keys stay inside VisualKit. A workflow chains finding clips, transcribing, generating a shot and cutting it in."
    >
      <div className="act-row" aria-hidden="true">
        <div className="act-label">
          <strong>Actors</strong>
          <small>Local or third-party jobs</small>
        </div>
        <div className="act-body">
          <div className="act-line">
            <span className="act-cap">As a command</span>
            <code className="act-cmd"><i>$</i>visualkit actor media_tools detect-scenes raw.mp4</code>
          </div>
          <div className="act-line">
            <span className="act-cap">In a Fusion graph</span>
            <div className="act-graph">
              <span className="g-node">in</span>
              <i className="g-wire" />
              <span className="g-node g-actor">ffmpeg_lut</span>
              <i className="g-wire" />
              <span className="g-node">out</span>
            </div>
          </div>
        </div>
      </div>

      <div className="act-row" aria-hidden="true">
        <div className="act-label">
          <strong>Proxies</strong>
          <small>Agents never hold the keys</small>
        </div>
        <div className="act-body">
          <div className="act-proxy">
            <span className="p-node p-agent"><Bot size={13} />agent<small>no keys</small></span>
            <i className="p-wire"><b /></i>
            <span className="p-node p-vault"><LockKeyhole size={13} />VisualKit proxy<small><KeyRound size={10} />keys stay here</small></span>
            <i className="p-wire"><b /></i>
            <span className="p-node p-cloud"><Cloud size={13} />AI video service</span>
          </div>
          <span className="act-note">Short jobs get a temporary key that revokes itself.</span>
        </div>
      </div>

      <div className="act-row" aria-hidden="true">
        <div className="act-label">
          <strong>Workflows</strong>
          <small>Chain them into one flow</small>
        </div>
        <div className="act-body">
          <ol className="act-steps">
            {STEPS.map((s, i) => (
              <li key={s.name} className={"s-" + s.tone} style={{ ["--i" as string]: i }}>
                <span>{s.name}</span>
                <small>{s.kind}</small>
                {i < STEPS.length - 1 && <ArrowRight className="s-arrow" size={12} />}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
