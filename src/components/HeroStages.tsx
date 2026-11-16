import type { CSSProperties, ReactNode } from "react";
import { Scissors } from "lucide-react";

/* The video is 15 s, so the timeline is 15 s. Retime the stages here to match the final cut. */
export const DUR = 15;
export const STAGES = [
  { id: "script", label: "script", a: 0, b: 2.2 },
  { id: "timeline", label: "split + trim", a: 2.2, b: 4.3 },
  { id: "keyframes", label: "keyframes", a: 4.3, b: 6.4 },
  { id: "audio", label: "audio eq", a: 6.4, b: 8.6 },
  { id: "agents", label: "agents", a: 8.6, b: 10.9 },
  { id: "fusion", label: "fusion", a: 10.9, b: 13.0 },
  { id: "effects", label: "effects", a: 13.0, b: 15 },
] as const;

type Vars = Record<string, string | number>;
const v = (o: Vars) => o as CSSProperties;
/* K(at, for): this element animates from local second `at`, over `for` seconds (see .k in hero.css) */
const K = (at: number, f = 0.3, o: Vars = {}) => v({ "--at": at, "--for": f, ...o });
const pct = (a: number, b: number) => ({ left: a + "%", width: b - a + "%" });

/* tiny python highlighter so the snippets read like real code */
const TOK = /("[^"]*")|(\b\d+(?:\.\d+)?\b)|\b([A-Z]\w*)\b|\.(\w+)(?=\()/g;
function hl(src: string): ReactNode[] {
  const out: ReactNode[] = [];
  let i = 0, m: RegExpExecArray | null;
  TOK.lastIndex = 0;
  while ((m = TOK.exec(src))) {
    if (m.index > i) out.push(src.slice(i, m.index));
    if (m[4]) out.push(".", <b key={m.index} className="f">{m[4]}</b>);
    else out.push(<b key={m.index} className={m[1] ? "s" : m[2] ? "n" : "t"}>{m[0]}</b>);
    i = m.index + m[0].length;
  }
  out.push(src.slice(i));
  return out;
}

/* one-line API call that swaps in place at the bottom of a scene */
const Call = ({ at, until, children }: { at: number; until?: number; children: string }) => (
  <div className="vh-call k" style={K(at, 0.2, until ? { "--u": until } : {})}><i>›</i>{hl(children)}</div>
);

/* ───────── shared project: names come from the real hero_demo script ───────── */
type Clip = { id: string; a: number; b: number; t: string; n: string };
const ROWS: { n: string; c: Clip[] }[] = [
  { n: "V3", c: [
    { id: "t1", a: 3, b: 24, t: "violet", n: "title_card" },
    { id: "t2", a: 61, b: 84, t: "pink", n: "lower_third" },
  ] },
  { n: "V2", c: [
    { id: "b1", a: 11, b: 33, t: "lime", n: "broll_16_city" },
    { id: "b2", a: 36, b: 62, t: "violet", n: "skate_ramp" },
    { id: "b3", a: 68, b: 92, t: "orange", n: "green_key" },
  ] },
  { n: "V1", c: [
    { id: "v1", a: 3, b: 27, t: "blue", n: "broll_13" },
    { id: "v2", a: 28, b: 58, t: "orange", n: "broll_16" },
    { id: "v3", a: 61, b: 82, t: "blue", n: "broll_7" },
    { id: "v4", a: 84, b: 98, t: "teal", n: "prism_flare" },
  ] },
  { n: "A1", c: [
    { id: "a1", a: 3, b: 45, t: "sage", n: "bgm_flute_drop" },
    { id: "a2", a: 47, b: 98, t: "sage", n: "bgm_flute_drop" },
  ] },
];
type X = { cls?: string; style?: CSSProperties; fx?: [string, number]; kids?: ReactNode };

function Tl({ enter, x = {}, children }: { enter?: boolean; x?: Record<string, X>; children?: ReactNode }) {
  return (
    <div className="vh-tl4">
      {ROWS.map((r, ri) => (
        <div className="vh-row" key={r.n}>
          <b>{r.n}</b>
          <div className="lane">
            {r.c.map((c, ci) => {
              const o = x[c.id] ?? {};
              return (
                <div key={c.id} className={`vh-clip c-${c.t}${r.n === "A1" ? " is-aud" : ""}${enter ? " k k-x" : ""} ${o.cls ?? ""}`}
                  style={{ ...pct(c.a, c.b), ...(enter ? K(ri * 0.07 + ci * 0.08, 0.3) : {}), ...o.style }}>
                  {o.fx && <em className="vh-tag k" style={K(o.fx[1], 0.25)}>{o.fx[0]}</em>}
                  <span>{c.n}</span>
                  {o.kids}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div className="vh-ov">{children}</div>
    </div>
  );
}

/* 1 ─ script: the agent writes the edit */
const CODE = [
  'eng = VisualkitEngine.in_memory(fps=30, resolution=(1920, 1080))',
  'v1  = eng.create_track(ClipStream.VISUAL, name="V1_Base_Plates")',
  'cam = eng.add_media(asset_id="broll_13", visual_track_id=v1.id,',
  '                    start_ts=TimelineTime(0.0), duration=Time(4.8)).visual',
  'cam.add_effect(GaussianBlurEffect(id="focus_pull", sigma=28.0))',
  'cam.keyframe(Transform.scale, at=SourceTime(4.8),',
  '             value=Vec2d(x=1.14, y=1.14), layer=Layer.PRE)',
  'eng.commit("agent: rough cut")',
];
export function Script() {
  return (
    <div className="vh-code">
      <div className="vh-bar"><i /><i /><i /><span>build_hero_demo.py</span>
        <em className="k k-fade" style={K(1.75, 0.2)}>● commit 3 changes</em></div>
      {CODE.map((l, i) => (
        <div className="ln k" key={i} style={K(0.1 + i * 0.2, 0.26)}><u>{i + 1}</u><span>{hl(l)}</span></div>
      ))}
    </div>
  );
}

/* 2 ─ split + trim on a real multi-clip timeline, revealed by a tilted line wipe */
export function Cut() {
  return (
    <>
      <div className="vh-wipe">
        <Tl enter x={{
          v2: { kids: <i className="vh-gap k" style={K(1.2, 0.2)} /> },
          v3: { kids: <i className="vh-hatch k" style={K(1.5, 0.3)} /> },
        }}>
          <div className="vh-blade k" style={K(0.95, 0.3, { left: "43%" })}><Scissors size={13} /></div>
        </Tl>
        <Call at={0.95} until={1.45}>clip.split_at(ClipTime(1.2))</Call>
        <Call at={1.45}>clip.trim_tail(TimelineTime(3.1))</Call>
      </div>
      <div className="vh-edge" />
    </>
  );
}

/* 3 ─ keyframes: lanes with diamonds, PRE / POST layers, live preview */
const LANES: [string, string, number[]][] = [
  ["Transform.scale", "PRE", [6, 34, 62, 93]],
  ["position.x", "POST", [18, 48, 80]],
  ["saturation", "", [4, 40, 92]],
  ["blur.sigma", "PRE", [22, 55, 86]],
  ["volume", "", [10, 44, 70, 96]],
];
export function Keys() {
  return (
    <div className="vh-keys">
      <div className="vh-clip-head"><div className="pv" /><b>broll_13.mp4</b><small>V1 · 0.0s → 4.8s</small></div>
      <div className="vh-lanes">
        {LANES.map(([n, layer, d], li) => (
          <div className="vh-kl" key={n} style={v({ "--i": li })}>
            <label><span>{n}</span>{layer && <em className={layer}>{layer}</em>}</label>
            <div className="ln2">
              <i className="seg k" style={K(0.3 + li * 0.12, 0.9, pct(d[0], d[d.length - 1]))} />
              {d.map((x, di) => <i key={di} className="dia k" style={K(0.2 + li * 0.12 + di * 0.1, 0.2, { left: x + "%" })} />)}
              <i className="dot" />
            </div>
          </div>
        ))}
        <div className="scan" />
      </div>
      <Call at={0.2} until={1.2}>cam.keyframe(Transform.scale, at=SourceTime(4.8), layer=Layer.PRE)</Call>
      <Call at={1.2}>cam.keyframe(Transform.position.x, at=ClipTime(4.8), layer=Layer.POST)</Call>
    </div>
  );
}

/* 4 ─ audio equalizer: Equalizer(low, mid, high, high_pass, low_pass) */
const BANDS: [string, number][] = [["32", 0.3], ["64", 0.45], ["125", 0.2], ["250", -0.45], ["500", -0.35], ["1k", 0.05], ["2k", 0.4], ["4k", 0.6], ["8k", 0.65], ["16k", 0.55]];
export function Audio() {
  return (
    <div className="vh-eq">
      <div className="vh-wavebar k k-fade" style={K(0, 0.3)}>
        <b>bgm_flute_drop.mp3</b>
        {Array.from({ length: 64 }, (_, i) => <i key={i} style={v({ "--i": i })} />)}
      </div>
      <div className="vh-sliders">
        {BANDS.map(([f, g], i) => (
          <div className="sl" key={f} style={v({ "--i": i, "--tg": g })}>
            <div className="trk k" style={K(0.15 + i * 0.05, 0.6)}><i className="fill" /><i className="knob" /></div>
            <small>{f}</small>
          </div>
        ))}
      </div>
      <div className="vh-groups"><span>LOW +4.0 dB</span><span>MID −2.5 dB</span><span>HIGH +5.5 dB</span></div>
      <div className="vh-dials k k-fade" style={K(0.4, 0.4)}>
        <div><i className="dial" /><small>high_pass 80 Hz</small></div>
        <div><i className="dial b" /><small>low_pass 16 kHz</small></div>
      </div>
      <Call at={0.2} until={1.2}>bgm.equalizer.low = 4.0</Call>
      <Call at={1.2}>bgm.equalizer.high_pass = 80.0</Call>
    </div>
  );
}

/* 5 ─ two agents hold claimed regions and edit at the same time */
const Cur = ({ who, tone, at, p }: { who: string; tone: string; at: number; p: number[] }) => (
  <div className={`vh-cur c-${tone} k`} style={K(at, 0.25, { "--x0": p[0], "--y0": p[1], "--x1": p[2], "--y1": p[3], "--x2": p[4], "--y2": p[5] })}>
    <svg width="12" height="14" viewBox="0 0 11 13"><path d="M1 1 L1 11 L4 8 L6.4 12.4 L8 11.6 L5.7 7.3 L9.6 7 Z" fill="currentColor" stroke="#101017" strokeWidth=".8" strokeLinejoin="round" /></svg>
    <span>{who}</span>
  </div>
);
export function Agents() {
  return (
    <>
      <Tl x={{
        b1: { fx: ["GaussianBlurEffect", 0.8] },
        v1: { cls: "k vh-trimr", style: K(0.9, 0.5) },
        t2: { cls: "k vh-slide", style: K(1.0, 0.6) },
        b3: { fx: ["PixelateEffect", 1.3] },
      }}>
        <div className="vh-reg c-lime" style={pct(0, 34)}><b>claim R1 · jules-agent</b><small>[0s, 5s)</small></div>
        <div className="vh-reg c-orange" style={pct(58, 100)}><b>claim R2 · maya-agent</b><small>[9s, 15s)</small></div>
        <div className="vh-flash k" style={K(1.5, 0.15, { left: "34%" })} />
        <Cur who="jules-agent" tone="lime" at={0.1} p={[4, 20, 12, 62, 24, 38]} />
        <Cur who="maya-agent" tone="orange" at={0.3} p={[96, 80, 72, 22, 34, 58]} />
      </Tl>
      <div className="vh-log k" style={K(0.5, 0.2, { "--u": 1.5 })}><b className="ok">✓</b>run_0041 committed, 3 changes</div>
      <div className="vh-log k" style={K(1.5, 0.2)}><b className="bad">✕</b>run_0042 rejected, overlap on R1, nothing written</div>
    </>
  );
}

/* 6 ─ fusion graph: nodes are the real FusionGraphEntity node types */
type N = { id: string; l: string; s: string; x: number; y: number; w?: number; t: string; at: number; pv?: string };
const NODES: N[] = [
  { id: "ic", l: "FusionInputNode", s: "broll_7_cutout_rgba", x: 3, y: 10, t: "lime", at: 0.1 },
  { id: "mk", l: "FusionMaskNode", s: "ellipse · feather 4", x: 40, y: 10, t: "blue", at: 0.35 },
  { id: "im", l: "FusionInputNode", s: "in_main · broll_7", x: 3, y: 56, t: "lime", at: 0.2 },
  { id: "bl", l: "FusionEffectNode", s: "gaussian_blur σ 22", x: 22, y: 56, t: "blue", at: 0.5, pv: "pv-blur" },
  { id: "mg", l: "Merge", s: "", x: 47, y: 58, w: 9, t: "violet", at: 0.8 },
  { id: "cg", l: "FusionColorGradeNode", s: "contrast 1.18", x: 63, y: 56, t: "orange", at: 1.0, pv: "pv-grade" },
  { id: "out", l: "FusionOutputNode", s: "out_main", x: 84, y: 56, w: 13, t: "sage", at: 1.25 },
];
const EDGES: [string, string][] = [["ic", "mk"], ["mk", "mg"], ["im", "bl"], ["bl", "mg"], ["mg", "cg"], ["cg", "out"]];
const ctr = (id: string) => { const n = NODES.find((q) => q.id === id)!; const w = n.w ?? 15; return [n.x + w / 2, n.y + (n.id === "mg" ? 14 : 11)]; };
export function Fusion() {
  return (
    <div className="vh-fu">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {EDGES.map(([a, b]) => {
          const [x1, y1] = ctr(a), [x2, y2] = ctr(b), at = NODES.find((n) => n.id === b)!.at;
          return <line key={a + b} className="k" style={K(at - 0.1, 0.25)} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </svg>
      {NODES.map((n) => (
        <div key={n.id} className={`vh-node c-${n.t}${n.id === "mg" ? " is-merge" : ""} k k-pop`} style={K(n.at, 0.25, { left: n.x + "%", top: n.y + "%", width: (n.w ?? 15) + "%" })}>
          {n.id !== "mg" && <i className={`thumb ${n.pv ?? ""}`} />}
          <b>{n.l}</b>{n.s && <small>{n.s}</small>}
        </div>
      ))}
      <Call at={0.45} until={1.3}>fg.add_node(FusionEffectNode(id="bg_blur", effect_type="gaussian_blur"))</Call>
      <Call at={1.3}>c_th_bg.add_effect(fg_bg.as_effect(id="fusion_backdrop_dag"))</Call>
    </div>
  );
}

/* 7 ─ the finished timeline: named effects + an adjustment clip over everything below it */
export function Effects() {
  return (
    <>
      <Tl x={{
        t1: { fx: ["GlowEffect", 0.15] }, b1: { fx: ["MaskEffect", 0.3] }, b2: { fx: ["PixelateEffect", 0.45] },
        b3: { fx: ["ChromaKeyEffect", 0.6] }, v1: { fx: ["GaussianBlurEffect", 0.75] }, v3: { fx: ["DropShadowEffect", 0.9] },
        t2: { fx: ["VignetteEffect", 1.05] }, a2: { fx: ["CompressorEffect", 1.2] },
      }}>
        <div className="vh-adj k" style={K(1.0, 0.45)}><b>AdjustmentClipVisual</b><small>glow + vignette + grade → every clip below</small></div>
      </Tl>
      <Call at={1.0} until={1.5}>eng.add_adjustment_visual(visual_track_id=v5.id, duration=Time(0.7))</Call>
      <Call at={1.5}>render_project(eng.snapshot(), resolver, "hero.mp4")</Call>
      <div className="vh-render"><i /></div>
    </>
  );
}
