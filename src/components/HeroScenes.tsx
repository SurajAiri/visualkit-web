import type { CSSProperties, ReactNode } from "react";
import { Check, Scissors } from "lucide-react";

/* The demo video is 15 s, so the timeline is 15 s. Retime the stages here to match the final cut. */
export const DUR = 15;
export const STAGES = [
  { id: "script", label: "script", a: 0, b: 2.4 },
  { id: "cut", label: "split + trim", a: 2.4, b: 4.5 },
  { id: "keys", label: "keyframes", a: 4.5, b: 6.8 },
  { id: "audio", label: "audio eq", a: 6.8, b: 9.0 },
  { id: "agents", label: "agents", a: 9.0, b: 11.4 },
  { id: "fusion", label: "fusion", a: 11.4, b: 13.2 },
  { id: "effects", label: "effects", a: 13.2, b: 15 },
] as const;

/* ── motion helper ─────────────────────────────────────────────────────────────
   Every animated node is `.k` with an absolute start time `--at` and length `--d` (seconds).
   CSS pauses the animation and offsets it by the shared clock (--t), so the demo is a pure
   function of time: scrub, loop or pause and every element is always in the right state. */
type Vars = Record<string, string | number>;
const K = (at: number, d = 0.3, o: Vars = {}) => ({ "--at": at, "--d": d, ...o }) as CSSProperties;
const P = (s: number) => (s / DUR) * 100 + "%";

/* ── python highlighter ── */
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
const Call = ({ at, until, children }: { at: number; until?: number; children: string }) => (
  <div className="call k" style={K(at, 0.2, until ? { "--until": until } : {})}><i>›</i>{hl(children)}</div>
);

/* ── the one track-item look, used by every scene ── */
const wave = (seed: number, n = 90) => {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = (0.2 + 0.8 * Math.abs(Math.sin(i * 0.23 + seed) * Math.cos(i * 0.071 + seed * 2))) * (0.55 + 0.45 * Math.abs(Math.sin(i * 12.9898 + seed)));
    d += `M${(i * 100) / n} ${10 - a * 9}V${10 + a * 9}`;
  }
  return d;
};
type ClipProps = { n: string; tone: string; a: number; b: number; au?: boolean; kd?: number[]; at?: number; st?: CSSProperties; cls?: string; children?: ReactNode };
function Clip({ n, tone, a, b, au, kd, at, st, cls = "", children }: ClipProps) {
  return (
    <div className={`cl t-${tone}${au ? " au" : ""}${at != null ? " k" : ""} ${cls}`}
      style={{ left: P(a), width: P(b - a), ...(at != null ? K(at) : {}), ...st }}>
      <div className="in">
        {!au && <header><span>{n}</span><em>{(b - a).toFixed(1)}s</em></header>}
        {au ? (
          <svg viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden><path d={wave(a * 3 + b)} vectorEffect="non-scaling-stroke" /></svg>
        ) : <i className="fl" />}
        {au && <span className="auname">{n}</span>}
        {kd && <><u className="kline" />{kd.map((x) => <u className="kd" key={x} style={{ left: x + "%" }} />)}</>}
      </div>
      {children}
    </div>
  );
}
const Tag = ({ at, children, st }: { at: number; children: string; st?: CSSProperties }) => <em className="tag k" style={{ ...K(at, 0.25, { "--kf": "k-pop" }), ...st }}>{children}</em>;
const Scene = ({ a, children }: { a: number; children: ReactNode }) => <div className="sc k" style={K(a, 0.25, { "--kf": "k-fade" })}>{children}</div>;

/* 1 ─ script → what it builds ─────────────────────────────────────────── */
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
const STEPS: [string, string, number][] = [
  ["create_track", "V1_Base_Plates", 0.55], ["add_media", "broll_13 · 0.0→4.8s", 0.9],
  ["add_effect", "focus_pull σ 28", 1.2], ["keyframe", "scale 1.0 → 1.14", 1.55], ["commit", "rev 7f3a · 3 changes", 1.95],
];
function Script() {
  return (
    <Scene a={0}>
      <div className="cd">
        <div className="cd-main">
          <div className="cd-bar"><i /><i /><i /><span>build_hero_demo.py</span></div>
          {CODE.map((l, i) => <div className="ln-c k" key={i} style={K(0.1 + i * 0.22, 0.25)}><u>{i + 1}</u><span>{hl(l)}</span></div>)}
        </div>
        <div className="cd-side">
          <div className="cd-agent"><i className="live" />agent <b>claude-code</b><small>running</small></div>
          <div className="cd-steps">
            {STEPS.map(([f, s, at]) => (
              <div className="cd-step k" key={f} style={K(at, 0.25)}><span className="ck k" style={K(at + 0.12, 0.2, { "--kf": "k-pop" })}><Check size={11} strokeWidth={3} /></span><b>{f}</b><small>{s}</small></div>
            ))}
          </div>
          <div className="ln cd-lane">
            <Clip n="broll_13" tone="blue" a={0} b={9} at={0.9} kd={[70]} st={{ left: 0, "--kf": "k-w", "--w0": "0%", "--w1": "64%", "--d": 0.7 } as CSSProperties}>
              <Tag at={1.3} st={{ right: 4 }}>GaussianBlur</Tag>
            </Clip>
          </div>
        </div>
      </div>
    </Scene>
  );
}

/* 2 ─ split + trim: one controller, one edit at a time ──────────────────── */
function Cut() {
  const a = STAGES[1].a;
  return (
    <Scene a={a}>
      <div className="lns" style={{ "--lh": "56px" } as CSSProperties}>
        <div className="ln">
          <Clip n="title_card" tone="violet" a={1} b={4.2} at={a + 0.05} />
          <Clip n="lower_third" tone="pink" a={9} b={12.4} at={a + 0.12} />
        </div>
        <div className="ln">
          <Clip n="broll_13" tone="blue" a={0.4} b={4.6} at={a + 0.1} kd={[22, 61]} />
          <Clip n="broll_16" tone="orange" a={4.9} b={10} cls="once" st={{ "--until": a + 0.62 } as CSSProperties} at={a + 0.2} />
          <Clip n="broll_16" tone="orange" a={4.9} b={7.4} cls="half k" st={K(a + 0.62, 0.01)} />
          <Clip n="broll_16" tone="orange" a={7.4} b={10} cls="half k" st={{ ...K(a + 0.62, 0.01), "--nx": "0%" } as CSSProperties}>
            <i className="nudge" style={K(a + 0.66, 0.3, { "--kf": "k-gap" })} />
          </Clip>
          <div className="wrap k" style={K(a + 0.3, 0.3)}>
            <Clip n="broll_7" tone="blue" a={10.2} b={13.2} cls="k" st={K(a + 1.3, 0.3, { "--kf": "k-w", "--w0": P(4.4), "--w1": P(3) })} />
            <i className="hatch k" style={{ left: P(13.2), width: P(1.4), ...K(a + 1.3, 0.4, { "--kf": "k-hatch" }) }} />
          </div>
        </div>
        <div className="ln"><Clip n="bgm_flute_drop" tone="sage" a={0.4} b={14.6} au at={a + 0.18} /></div>
        <div className="blade-pos k" style={K(a + 1.1, 0.5, { "--kf": "k-mv", "--x0": P(7.4), "--x1": P(13.2) })}>
          <div className="blade k" style={K(a + 0.35, 0.25)}><span><Scissors size={12} /></span></div>
        </div>
      </div>
      <Call at={a + 0.5} until={a + 1.2}>clip.split_at(ClipTime(2.5))</Call>
      <Call at={a + 1.2}>clip.trim_tail(TimelineTime(13.2))</Call>
    </Scene>
  );
}

/* 3 ─ keyframes: clip header from "cut", colored lane graph, PRE / POST layers ─── */
type Lane = { n: string; v: string; tone: string; layer?: string; k: [number, number][] };
const LANES: Lane[] = [
  { n: "transform.scale", v: "1.09", tone: "lime", layer: "PRE", k: [[3.2, 22], [5.3, 14], [8.4, 7], [12.6, 18]] },
  { n: "transform.position.x", v: "−28", tone: "blue", layer: "POST", k: [[2.8, 8], [5.5, 25], [9.6, 25], [13.8, 10]] },
  { n: "transform.rotation", v: "−2.5°", tone: "pink", k: [[3.6, 8], [5.9, 24], [10.3, 12], [11.6, 12]] },
  { n: "opacity", v: "1.00", tone: "teal", k: [[3.0, 22], [4.9, 10], [11.4, 10], [14, 24]] },
  { n: "color_effects.saturation", v: "0.20", tone: "orange", k: [[3.2, 24], [5.6, 12], [10, 24]] },
  { n: "blur.sigma", v: "0.3", tone: "violet", layer: "PRE", k: [[2.8, 6], [5.0, 24], [12.4, 20]] },
];
const curve = (k: [number, number][]) =>
  k.reduce((d, [t, y], i) => {
    const x = t * 10;
    if (!i) return `M${x} ${y}`;
    const px = k[i - 1][0] * 10, m = (px + x) / 2;
    return d + ` C${m} ${k[i - 1][1]} ${m} ${y} ${x} ${y}`;
  }, "");
function Keys() {
  const a = STAGES[2].a;
  return (
    <Scene a={a}>
      <div className="kf-wrap">
        <div className="kf-clip"><Clip n="broll_13.mp4 · V1" tone="blue" a={0} b={DUR} st={{ left: 0, width: "100%" }} /></div>
        {LANES.map((l, i) => {
          const last = l.k[l.k.length - 1], d = curve(l.k) + ` L${last[0] * 10 + 20} ${last[1]}`;
          return (
            <div className={`kf-row t-${l.tone} k`} key={l.n} style={K(a + 0.1 + i * 0.09, 0.3)}>
              {["gr", "on"].map((c) => (
                <svg key={c} className={c} viewBox="0 0 150 30" preserveAspectRatio="none" aria-hidden><path d={d} /></svg>
              ))}
              {l.k.map(([t, y]) => <i key={t} className="kdia k" style={{ left: P(t), top: (y / 30) * 100 + "%", ...K(t, 0.01, { "--kf": "k-fill" }) }} />)}
              <div className="kf-lab"><span>{l.n}</span>{l.layer && <em className={l.layer}>{l.layer}</em>}<b>{l.v}</b></div>
            </div>
          );
        })}
        <Call at={a + 0.2} until={a + 1.3}>cam.keyframe(Transform.scale, at=SourceTime(4.8), layer=Layer.PRE)</Call>
        <Call at={a + 1.3}>cam.keyframe(Transform.position.x, at=ClipTime(4.8), layer=Layer.POST)</Call>
      </div>
    </Scene>
  );
}

/* 4 ─ audio: one channel strip. clip → shaped spectrum → band nodes → filters ─── */
const BANDS: [string, number][] = [["32", 0.3], ["64", 0.45], ["125", 0.2], ["250", -0.45], ["500", -0.35], ["1k", 0.05], ["2k", 0.4], ["4k", 0.6], ["8k", 0.65], ["16k", 0.55]];
const gainAt = (x: number) => {
  const f = x * (BANDS.length - 1), i = Math.min(BANDS.length - 2, Math.floor(f)), u = (1 - Math.cos((f - i) * Math.PI)) / 2;
  return BANDS[i][1] * (1 - u) + BANDS[i + 1][1] * u;
};
const hOf = (g: number) => 46 + g * 38;
function Knob({ label, val, at, to }: { label: string; val: string; at: number; to: number }) {
  const C = 2 * Math.PI * 20; // arc covers 270°
  return (
    <div className="knob k" style={K(at, 0.3, { "--kf": "k-fade" })}>
      <svg viewBox="0 0 56 56" aria-hidden>
        <circle className="trk" cx="28" cy="28" r="20" strokeDasharray={`${C * 0.75} ${C}`} />
        <circle className="arc k" cx="28" cy="28" r="20"
          style={K(at + 0.1, 0.9, { "--kf": "k-arc", "--len": C * 0.75 * to, "--ez": "cubic-bezier(.3,.7,.2,1)" })} />
        <g className="needle k" style={K(at + 0.1, 0.9, { "--kf": "k-rot", "--r1": `${to * 270}deg`, "--ez": "cubic-bezier(.3,.7,.2,1)" })}><line x1="28" y1="28" x2="28" y2="15" /></g>
      </svg>
      <b>{val}</b><small>{label}</small>
    </div>
  );
}
function Audio() {
  const a = STAGES[3].a, N = 44;
  return (
    <Scene a={a}>
      <div className="eq">
        <div className="eq-clip"><Clip n="bgm_flute_drop.mp3" tone="sage" a={0} b={DUR} au st={{ left: 0, width: "100%" }} /></div>
        <div className="eq-body">
          <div className="eq-panel">
            <div className="eq-head"><span>LOW <b>+4.0 dB</b></span><span>MID <b>−2.5 dB</b></span><span>HIGH <b>+5.5 dB</b></span></div>
            <div className="eq-plot">
              <i className="zero" />
              {Array.from({ length: N }, (_, i) => (
                <i key={i} className="bar k" style={K(a + 0.15 + i * 0.012, 0.7, { "--kf": "k-h", "--h0": "30%", "--h1": hOf(gainAt(i / (N - 1))) + "%", "--ph": (i * 0.37) % 1.1, left: `${(i / N) * 100 + 0.6}%` })} />
              ))}
              {BANDS.map(([f, g], i) => (
                <i key={f} className="node k" style={K(a + 0.3 + i * 0.05, 0.7, { "--kf": "k-y", "--y0": "70%", "--y1": 100 - hOf(g) + "%", left: `${(i / (BANDS.length - 1)) * 94 + 3}%` })} />
              ))}
            </div>
            <div className="eq-fr">{BANDS.map(([f]) => <small key={f}>{f}</small>)}</div>
          </div>
          <div className="eq-knobs">
            <Knob label="high_pass" val="80 Hz" at={a + 0.5} to={0.12} />
            <Knob label="low_pass" val="16 kHz" at={a + 0.65} to={0.82} />
          </div>
        </div>
        <Call at={a + 0.2} until={a + 1.2}>bgm.equalizer.low = 4.0</Call>
        <Call at={a + 1.2}>bgm.equalizer.high_pass = 80.0</Call>
      </div>
    </Scene>
  );
}

/* 5 ─ agents own regions. clips never cross a region edge, agents never leave their own ── */
const Cur = ({ who, tone, at, p }: { who: string; tone: string; at: number; p: number[] }) => (
  <div className={`cur t-${tone} k`} style={K(at, 1.5, { "--kf": "k-cur", "--x0": p[0] + "%", "--y0": p[1] + "px", "--x1": p[2] + "%", "--y1": p[3] + "px", "--x2": p[4] + "%", "--y2": p[5] + "px", "--ez": "ease-in-out" })}>
    <svg width="13" height="15" viewBox="0 0 11 13"><path d="M1 1 L1 11 L4 8 L6.4 12.4 L8 11.6 L5.7 7.3 L9.6 7 Z" fill="currentColor" stroke="#101017" strokeWidth=".8" strokeLinejoin="round" /></svg>
    <span>{who}</span>
  </div>
);
function Agents() {
  const a = STAGES[4].a;
  const R1: [number, number] = [0.1, 5.1], R2: [number, number] = [9.9, 14.9];
  return (
    <Scene a={a}>
      <div className="lns" style={{ "--lh": "50px", top: 34 } as CSSProperties}>
        {([[R1, "lime", "intro", "intro-agent"], [R2, "orange", "outro", "outro-agent"]] as const).map(([r, tone, rn, ag]) => (
          <div key={rn} className={`reg t-${tone} k`} style={{ left: P(r[0]), width: P(r[1] - r[0]), ...K(a + 0.05, 0.3) }}><b><i />{rn} · {ag}</b></div>
        ))}
        <div className="ln">
          <Clip n="title_card" tone="violet" a={0.5} b={3.4} st={{ "--kf": "k-w", "--w0": P(2.9), "--w1": P(2.1), "--at": a + 0.8, "--d": 0.5 } as CSSProperties} cls="k" />
          <Clip n="skate_ramp" tone="orange" a={5.6} b={9.2} />
          <Clip n="end_card" tone="pink" a={11} b={14.4} cls="k" st={{ ...K(a + 1.0, 0.5, { "--kf": "k-mv", "--x0": P(11), "--x1": P(10.3) }) }} />
        </div>
        <div className="ln">
          <Clip n="broll_13" tone="blue" a={0.3} b={4.9}><Tag at={a + 0.6}>GaussianBlurEffect</Tag></Clip>
          <Clip n="broll_16" tone="teal" a={5.4} b={7.4} cls="half" />
          <Clip n="broll_16" tone="teal" a={7.4} b={9.6} cls="half"><i className="nudge" style={K(a + 1.3, 0.3, { "--kf": "k-gap" })} /></Clip>
          <Clip n="broll_7" tone="blue" a={10.1} b={14.7}><Tag at={a + 1.5}>VignetteEffect</Tag></Clip>
        </div>
        <div className="ln">
          <Clip n="bgm" tone="sage" a={0.3} b={4.9} au /><Clip n="bgm" tone="sage" a={5.4} b={9.6} au /><Clip n="bgm" tone="sage" a={10.1} b={14.7} au />
        </div>
        <Cur who="intro-agent" tone="lime" at={a + 0.1} p={[8, 30, 15, 64, 22, 20]} />
        <Cur who="outro-agent" tone="orange" at={a + 0.2} p={[92, 90, 78, 20, 72, 24]} />
        <Cur who="agent-3" tone="teal" at={a + 0.7} p={[44, 100, 50, 76, 49, 100]} />
        <div className="flash k" style={{ ...K(a + 1.3, 0.2, { "--kf": "k-flash" }), left: P(7.4) }} />
      </div>
    </Scene>
  );
}

/* 6 ─ fusion graph ────────────────────────────────────────────────────── */
const Edge = ({ at }: { at: number }) => <div className="edge"><i className="k" style={K(at, 0.25, { "--kf": "k-x" })} /><s className="k" style={K(at + 0.5, 1, { "--kf": "k-run" })} /></div>;
const FNode = ({ at, tone, name, sub, thumb, cls = "" }: { at: number; tone: string; name: string; sub?: string; thumb?: ReactNode; cls?: string }) => (
  <div className={`fn t-${tone} k ${cls}`} style={K(at, 0.3, { "--kf": "k-pop" })}><i className="cap" />{thumb}<b>{name}</b>{sub && <small>{sub}</small>}</div>
);
function Fusion() {
  const a = STAGES[5].a;
  return (
    <Scene a={a}>
      <div className="fu"><span className="fu-t">FusionGraphEntity · TalkingHeadBackdropDAG</span>
        <div className="fu-row">
          <FNode at={a + 0.1} tone="lime" name="in_main" thumb={<i className="th" />} />
          <Edge at={a + 0.35} />
          <div className="fu-op k" style={K(a + 0.5, 0.3, { "--kf": "k-pop" })}>
            <i className="disc" /><small>apply_mask</small>
            <div className="fu-mask"><FNode at={a + 0.3} tone="blue" name="subject_mask" sub="feather 4.0" thumb={<i className="th mk" />} /><i className="vline k" style={K(a + 0.5, 0.2, { "--kf": "k-sy" })} /></div>
          </div>
          <Edge at={a + 0.75} />
          <FNode at={a + 0.85} tone="orange" name="gaussian_blur" sub="sigma 22.0" />
          <Edge at={a + 1.0} />
          <FNode at={a + 1.1} tone="teal" name="color_grade" sub="contrast 1.18" cls="grade" />
          <Edge at={a + 1.25} />
          <FNode at={a + 1.35} tone="orange" name="vignette" sub="angle 0.42" cls="hot" />
          <Edge at={a + 1.5} />
          <FNode at={a + 1.5} tone="sage" name="out_main" thumb={<><i className="th" /><i className="th fin k" style={K(a + 1.55, 0.4, { "--kf": "k-fade" })} /></>} />
        </div>
      </div>
      <Call at={a + 0.45} until={a + 1.2}>fg.add_node(FusionEffectNode(id="bg_blur", effect_type="gaussian_blur"))</Call>
      <Call at={a + 1.2}>c_th_bg.add_effect(fg_bg.as_effect(id="fusion_backdrop_dag"))</Call>
    </Scene>
  );
}

/* 7 ─ the finished edit: the adjustment clip is the TOP track, so it grades everything below ── */
function Effects() {
  const a = STAGES[6].a;
  return (
    <Scene a={a}>
      <div className="lns" style={{ "--lh": "38px", top: 12 } as CSSProperties}>
        <div className="ln adj">
          <Clip n="AdjustmentClipVisual · glow + vignette + grade → every track below" tone="lime" a={0.4} b={14.6} at={a + 0.1} cls="adjc" />
        </div>
        <div className="sheet k" style={K(a + 0.35, 0.6, { "--kf": "k-sy" })} />
        <div className="ln">
          <Clip n="title_card" tone="violet" a={1.2} b={7.6}><Tag at={a + 0.7}>GlowEffect</Tag></Clip>
          <Clip n="lower_third" tone="pink" a={8.4} b={13}><Tag at={a + 0.9}>DropShadow</Tag></Clip>
        </div>
        <div className="ln">
          <Clip n="broll_16_city" tone="lime" a={1.8} b={6.6}><Tag at={a + 0.8}>MaskEffect</Tag></Clip>
          <Clip n="skate_ramp" tone="violet" a={6.9} b={11}><Tag at={a + 1.0}>PixelateEffect</Tag></Clip>
          <Clip n="green_key" tone="orange" a={11.2} b={14.4}><Tag at={a + 1.1}>ChromaKey</Tag></Clip>
        </div>
        <div className="ln">
          <Clip n="broll_13" tone="blue" a={0.4} b={5} /><Clip n="broll_16" tone="orange" a={5.2} b={10}><Tag at={a + 1.2}>GaussianBlur</Tag></Clip>
          <Clip n="broll_7" tone="blue" a={10.2} b={14.6} />
        </div>
        <div className="ln"><Clip n="vo" tone="teal" a={0.4} b={4.8} au /><Clip n="vo" tone="teal" a={5.2} b={9.8} au /><Clip n="vo_outro" tone="teal" a={10.2} b={14.6} au /></div>
        <div className="ln"><Clip n="bgm_flute_drop" tone="sage" a={0.4} b={14.6} au><Tag at={a + 1.3}>Compressor</Tag></Clip></div>
      </div>
      <Call at={a + 0.1} until={a + 1.0}>eng.add_adjustment_visual(visual_track_id=v5.id, duration=Time(14.2))</Call>
      <Call at={a + 1.0}>render_project(eng.snapshot(), resolver, "hero.mp4")</Call>
    </Scene>
  );
}

/* Rendered as real components (never called inline), so each scene owns its own hook state. */
export function Stage({ i }: { i: number }) {
  switch (i) {
    case 0: return <Script />;
    case 1: return <Cut />;
    case 2: return <Keys />;
    case 3: return <Audio />;
    case 4: return <Agents />;
    case 5: return <Fusion />;
    default: return <Effects />;
  }
}
