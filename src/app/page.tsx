import type { ReactNode } from "react";
import Chips from "@/components/Chips";
import Engine from "@/components/Engine";
import Keyframes from "@/components/Keyframes";
import Claims from "@/components/Claims";
import Install from "@/components/Install";
import { FEATURES } from "@/lib/features";
import { statusOf, upcomingIds } from "@/lib/registry";

function Sec({ id, title, lead, ids, children }: { id: string; title: string; lead: string; ids: string[]; children: ReactNode }) {
  return (
    <section className="sec wrap" id={id}>
      <h2>{title}</h2>
      <p className="lead">{lead}</p>
      {children}
      <Chips ids={ids} />
    </section>
  );
}

export default function Home() {
  const soon = upcomingIds();
  return (
    <main>
      <div className="wrap hero">
        <div>
          <h1>Agents edit. The cut stays safe.</h1>
          <p className="lead">
            VisualKit lets AI agents edit video as validated, versioned data. Every run is atomic and recorded, any state can be restored, and many agents can work on one timeline.
          </p>
          <Install />
        </div>
        <div className="panel" aria-label="A script moving a clip on a timeline">
          <pre><span className="m">clip</span>.transform.translation.y = 7{"\n"}<span className="m">clip</span>.keyframe(<span className="good">&apos;transform.scale&apos;</span>, at=0, value=1.0){"\n"}engine.commit(<span className="good">&apos;title pop-in&apos;</span>)</pre>
          <div className="tl">
            <div className="trk"><div className="head" /><div className="clip a" style={{ left: "4%", width: "22%" }} /><div className="clip slide b" style={{ width: "26%" }} /></div>
            <div className="trk"><div className="clip c" style={{ left: "4%", width: "70%" }} /></div>
          </div>
          <span className="tc">00:00:12:07</span>
        </div>
      </div>

      <section className="sec wrap" id="problem">
        <h2>A raw command has no safety net.</h2>
        <p className="lead">Agents can already call FFmpeg. One bad command ruins a cut, and nothing records what happened.</p>
        <div className="two">
          <div className="panel"><h3>raw ffmpeg</h3><pre className="fail">{"Error: Invalid argument\nexit 1\n\n(output half-written, no record,\n no way back)"}</pre></div>
          <div className="panel"><h3>visualkit exec</h3><pre><span className="fail">{"FAIL  3 problems, nothing written\n"}</span>{"edit1.py:12  field   Vec2D.y: must be <= 4320 (got 7000)\nedit1.py:19  commit  item 01J9K.. overlaps 01J9M.. on V1\nedit2.py:3   commit  source window ends after asset"}</pre></div>
        </div>
        <div className="layers">
          <div className="panel"><h3>Agent</h3><small>clips, tracks, keyframes, intent</small></div><span className="ar">&gt;</span>
          <div className="panel"><h3>Engine</h3><small>validates, stores, versions</small></div><span className="ar">&gt;</span>
          <div className="panel"><h3>Renderer adapters</h3><small>FFmpeg, Resolve, OpenTimelineIO</small></div>
        </div>
      </section>

      <Sec id="engine" title="Three states, one write." lead="Edits live in a draft, get sealed into the session, and reach disk only as one atomic revision. Commit checks what changed and what it touches, not the whole project." ids={["F01","F02","F03","F04","F05","F06","F29","F30"]}>
        <Engine />
      </Sec>

      <Sec id="history" title="Try anything. Go back to anything." lead="History only grows. Undo is a new revision that inverts an old one, so nothing an agent does is lost." ids={["F31","F32","F33","F34","F35"]}>
        <div className="panel">
          <svg viewBox="0 0 640 150" width="100%" role="img" aria-label="Revision graph: checkpoint, branch, merge">
            <line x1="30" x2="610" y1="40" y2="40" stroke="#5fb8a8" strokeWidth="3" />
            <path d="M190 40 C 230 40, 220 110, 270 110 L 400 110 C 450 110, 440 40, 480 40" fill="none" stroke="#f2b705" strokeWidth="3" />
            {[30, 110, 190, 480, 560].map((x) => (<circle key={x} cx={x} cy="40" r="7" fill="#0f2321" stroke="#5fb8a8" strokeWidth="3" />))}
            {[290, 380].map((x) => (<circle key={x} cx={x} cy="110" r="7" fill="#0f2321" stroke="#f2b705" strokeWidth="3" />))}
            <text x="150" y="22">checkpoint rough-cut</text><text x="270" y="140">branch try-bold-titles</text><text x="440" y="22">merge</text>
          </svg>
          <pre className="m">{"visualkit branch new try-bold-titles --from main\nvisualkit diff main try-bold-titles\nvisualkit merge try-bold-titles --into main"}</pre>
        </div>
      </Sec>

      <Sec id="keyframes" title="Animation that does what you mean." lead="Pre-keyframes ride the footage through speed ramps. Post-keyframes ignore speed and follow the screen. Trim the head and nothing is rewritten." ids={["F07","F12","F13","F14","F15"]}>
        <Keyframes />
      </Sec>

      <Sec id="claims" title="Own a slice of time." lead="Each agent claims a region and works in local time, as if nothing else existed. The engine converts both ways and ripples the rest." ids={["F36","F37","F38","F39","F40"]}>
        <Claims />
      </Sec>

      <section className="sec wrap" id="toolkit">
        <h2>The rest of the toolkit.</h2>
        <div className="mini">
          <div className="panel"><p className="sub">Plan on the timeline</p><pre>{"stage   rough | sound | visuals | polish\nscene   intro\n  intent   open on the product\n  summary  3 shots, 6 s\n  detail   read only when working here"}</pre><Chips ids={["F41","F42","F43"]} /></div>
          <div className="panel"><p className="sub">Code is footage</p><pre>{"code + params > compile > cached > clip\n<Title text=\"Q3\" />\nfingerprint a91f..   duration 4 s"}</pre><Chips ids={["F21","F22"]} /></div>
          <div className="panel"><p className="sub">Building blocks</p><pre>{"media  audio  text  shape  coded\ncompound  template (n internal clips)\neffects  adjustment  fusion  masks"}</pre><Chips ids={["F08","F09","F10","F11","F16","F17","F18","F19","F20","F23","F24","F25"]} /></div>
          <div className="panel"><p className="sub">Assets by id, not by path</p><pre>{"/project/footage/a001.mp4  pinned\n/global/music/bed.wav       pinned\nasset find --tag interview --has-audio"}</pre><Chips ids={["F26","F27","F28"]} /></div>
        </div>
        <div className="panel" style={{ marginTop: 16 }}>
          <p className="sub">Output</p>
          <pre className="m">{"visualkit render out.mp4 --ref rough-cut"}</pre>
          <pre>{"FFmpeg    DaVinci Resolve    OpenTimelineIO    FCPXML\nrenderers read a settled snapshot; VisualKit never renders"}</pre>
          <Chips ids={["F44","F45","F46","F47","F48"]} />
        </div>
      </section>

      {soon.length > 0 && (
        <section className="sec wrap" id="upcoming">
          <h2>Coming next.</h2>
          <div className="chips">
            {soon.map((id) => (<span className="chip" key={id}>{FEATURES[id]}<i>{statusOf(id)}</i></span>))}
          </div>
        </section>
      )}

      <section className="sec wrap foot" id="start">
        <h2>Start building.</h2>
        <p className="lead">Python 3.12 or later. FFmpeg for probing and rendering.</p>
        <Install />
      </section>
    </main>
  );
}
