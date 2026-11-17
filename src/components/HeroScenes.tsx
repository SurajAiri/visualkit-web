import { Fragment, type CSSProperties, type ReactNode } from "react";
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
const Y = (lane: number) => `calc((var(--lh) + 6px) * ${lane})`; // top of a timeline lane

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

/* ── the one track-item look: icon · name · duration header, filmstrip or waveform body ──
   An effect replaces the name in the header (✦ Name) and the clip name moves to the middle. */
const wave = (seed: number, n = 90) => {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = (0.2 + 0.8 * Math.abs(Math.sin(i * 0.23 + seed) * Math.cos(i * 0.071 + seed * 2))) * (0.55 + 0.45 * Math.abs(Math.sin(i * 12.9898 + seed)));
    d += `M${(i * 100) / n} ${10 - a * 9}V${10 + a * 9}`;
  }
  return d;
};
type Kind = "v" | "t" | "a";
type C = { id: string; n: string; tone: string; a: number; b: number; k?: Kind; kd?: number[] };
type ClipProps = Omit<C, "id"> & { id?: string; at?: number; st?: CSSProperties; cls?: string; fx?: string; fxAt?: number; dur?: string; children?: ReactNode };
function Clip({ n, tone, a, b, k = "v", kd, at, st, cls = "", fx, fxAt = 0, dur, children }: ClipProps) {
  return (
    <div className={`cl t-${tone} kind-${k}${at != null ? " k" : ""} ${cls}`} style={{ left: P(a), width: P(b - a), ...(at != null ? K(at) : {}), ...st }}>
      <div className="in">
        <header>
          <i className={`ic ic-${k}`} />
          <span className={`hn${fx ? " k" : ""}`} style={fx ? K(0, 0.01, { "--until": fxAt }) : undefined}>{n}</span>
          {fx && <span className="hf k" style={K(fxAt, 0.25, { "--kf": "k-fade" })}>✦ {fx}</span>}
          <em>{dur ?? (b - a).toFixed(1) + "s"}</em>
        </header>
        {k === "a"
          ? <svg viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden><path d={wave(a * 3 + b)} vectorEffect="non-scaling-stroke" /></svg>
          : <i className="fl" />}
        {fx && <span className="mid k" style={K(fxAt, 0.25, { "--kf": "k-fade" })}>{n}</span>}
        {kd && kd.length > 0 && <><u className="kline" />{kd.map((x) => <u className="kd" key={x} style={{ left: x + "%" }} />)}</>}
      </div>
      {children}
    </div>
  );
}
const Scene = ({ a, children }: { a: number; children: ReactNode }) => <div className="sc k" style={K(a, 0.25, { "--kf": "k-fade" })}>{children}</div>;

/* ── the shared project every timeline scene works on (8 tracks, clips kept inside the 3 acts) ── */
const c = (id: string, n: string, tone: string, a: number, b: number, k?: Kind, kd?: number[]): C => ({ id, n, tone, a, b, k, kd });
const PROJ: { n: string; c: C[] }[] = [
  { n: "V5", c: [c("lens", "lens_dirt", "teal", 0.5, 2.4), c("speed", "speed_ramp", "lime", 6.0, 8.0, "v", [30, 62]), c("vhs", "vhs_overlay", "pink", 11.0, 13.4)] },
  { n: "V4", c: [c("title", "title_card", "violet", 0.4, 3.6, "t"), c("callout", "callout_arrow", "orange", 5.6, 7.2, "t"), c("lower", "lower_third", "pink", 10.3, 13.6, "t"), c("endc", "end_card", "violet", 13.9, 14.8, "t")] },
  { n: "V3", c: [c("light", "light_leak", "orange", 0.3, 1.9), c("glitch", "glitch_pack", "blue", 2.3, 3.6), c("prism", "prism_flare", "teal", 4.0, 4.9), c("grain", "film_grain", "orange", 6.2, 8.4), c("key", "green_key", "teal", 10.4, 13.2, "v", [25, 55, 82])] },
  { n: "V2", c: [c("city", "broll_16_city", "lime", 1.0, 4.8, "v", [20, 46, 72]), c("skate", "skate_ramp", "violet", 5.6, 9.4, "v", [30, 66]), c("drone", "drone_08", "blue", 10.4, 12.4)] },
  { n: "V1", c: [c("b13", "broll_13", "blue", 0.3, 4.8, "v", [18, 46, 80]), c("b16", "broll_16", "orange", 5.3, 9.7), c("b7", "broll_7", "blue", 10.1, 14.6, "v", [35, 70])] },
  { n: "A1", c: [c("vo1", "vo_intro_t3", "teal", 0.3, 2.6, "a"), c("vo2", "vo_01", "teal", 3.0, 4.8, "a"), c("vo3", "vo_02_alt", "teal", 5.5, 7.6, "a"), c("vo4", "vo_03", "teal", 8.0, 9.6, "a"), c("vo5", "vo_outro", "teal", 10.2, 14.4, "a")] },
  { n: "A2", c: [c("bgm1", "bgm_flute_drop", "sage", 0.3, 4.8, "a"), c("bgm2", "bgm_flute_drop", "sage", 5.3, 9.7, "a"), c("bgm3", "bgm_flute_drop", "sage", 10.1, 14.8, "a")] },
  { n: "A3", c: [c("s1", "whoosh_01", "violet", 1.4, 2.3, "a"), c("s2", "hit_03", "orange", 3.7, 4.3, "a"), c("s3", "riser", "pink", 6.2, 7.0, "a"), c("s4", "pop", "lime", 8.6, 9.1, "a"), c("s5", "whoosh_02", "violet", 10.6, 11.6, "a"), c("s6", "impact", "orange", 12.6, 13.3, "a"), c("s7", "room_tone", "blue", 13.6, 14.8, "a")] },
];
type Over = Record<string, (c: C, at: number) => ReactNode>;
function Project({ a, x = {}, fx = {}, top, children }: { a: number; x?: Over; fx?: Record<string, [string, number]>; top?: ReactNode; children?: ReactNode }) {
  return (
    <>
      {top}
      {PROJ.map((r, ri) => (
        <div className="ln" key={r.n}>
          {r.c.map((cl, ci) => {
            const at = a + ri * 0.05 + ci * 0.04, f = fx[cl.id];
            return <Fragment key={cl.id}>{x[cl.id] ? x[cl.id](cl, at) : <Clip {...cl} at={at} fx={f?.[0]} fxAt={f?.[1]} />}</Fragment>;
          })}
        </div>
      ))}
      {children}
    </>
  );
}
/* split a clip in two at second `s` (time `ts`), and trim a clip's tail to `nb` (time `tt`) */
const Split = (cl: C, at: number, s: number, ts: number) => (
  <>
    <Clip {...cl} at={at} cls="once" st={{ "--until": ts } as CSSProperties} />
    <Clip {...cl} b={s} cls="k" st={K(ts, 0.01)} />
    <Clip {...cl} a={s} cls="k" st={K(ts, 0.01)}><i className="nudge k" style={K(ts + 0.04, 0.3, { "--kf": "k-gap" })} /></Clip>
  </>
);
const Trim = (cl: C, at: number, nb: number, tt: number) => (
  <div className="wrap k" style={K(at, 0.3)}>
    <Clip {...cl} b={nb} cls="k" st={K(tt, 0.3, { "--kf": "k-w", "--w0": P(cl.b - cl.a), "--w1": P(nb - cl.a) })} />
    <i className="hatch k" style={{ left: P(nb), width: P(cl.b - nb), ...K(tt, 0.4, { "--kf": "k-hatch" }) }} />
  </div>
);

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
          <div className="term k" style={K(1.9, 0.25)}><div><i>$</i> python build_hero_demo.py</div><div><b className="ok">✓</b> 3 changes committed · rev 7f3a</div></div>
        </div>
        <div className="cd-side">
          <div className="cd-agent"><i className="live" />agent <b>claude-code</b><small>running</small></div>
          <div className="cd-steps">
            {STEPS.map(([f, s, at]) => (
              <div className="cd-step k" key={f} style={K(at, 0.25)}><span className="ck k" style={K(at + 0.12, 0.2, { "--kf": "k-pop" })}><Check size={11} strokeWidth={3} /></span><b>{f}</b><small>{s}</small></div>
            ))}
          </div>
          <div className="cd-cap">V1_Base_Plates</div>
          <div className="ln cd-lane">
            <Clip n="broll_13" tone="blue" a={0} b={4.8} at={0.9} kd={[70]} fx="GaussianBlurEffect" fxAt={1.3}
              st={{ left: 0, "--kf": "k-w", "--w0": "0%", "--w1": "72%", "--d": 0.7 } as CSSProperties} />
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
      <div className="lns">
        <Project a={a} x={{ b16: (cl, at) => Split(cl, at, 7.5, a + 0.62), b7: (cl, at) => Trim(cl, at, 13.2, a + 1.3) }}>
          <div className="blade-pos k" style={K(a + 1.1, 0.5, { "--kf": "k-mv", "--x0": P(7.5), "--x1": P(13.2) })}>
            <div className="blade k" style={K(a + 0.35, 0.25)}><span><Scissors size={12} /></span></div>
          </div>
        </Project>
      </div>
      <Call at={a + 0.5} until={a + 1.2}>clip.split_at(ClipTime(2.2))</Call>
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
        <div className="kf-clip"><Clip n="broll_13.mp4 · V1 · 0.0s → 4.8s" tone="blue" a={0} b={DUR} dur="4.8s" kd={[]} st={{ left: 0, width: "100%" }} /></div>
        {LANES.map((l, i) => {
          const last = l.k[l.k.length - 1], d = curve(l.k) + ` L${last[0] * 10 + 20} ${last[1]}`;
          return (
            <div className={`kf-row t-${l.tone} k`} key={l.n} style={K(a + 0.1 + i * 0.09, 0.3)}>
              {["gr", "on"].map((cn) => (
                <svg key={cn} className={cn} viewBox="0 0 150 30" preserveAspectRatio="none" aria-hidden><path d={d} /></svg>
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

/* 4 ─ audio: clip → frequency-response curve (continuous) → filters ──────── */
const BANDS: [string, number][] = [["32", 0.3], ["64", 0.45], ["125", 0.2], ["250", -0.45], ["500", -0.35], ["1k", 0.05], ["2k", 0.4], ["4k", 0.6], ["8k", 0.65], ["16k", 0.55]];
const PTS = BANDS.map(([, g], i) => [3 + (i * 94) / 9, 50 - g * 55] as [number, number]); // x %, y % (50 = 0 dB)
const EQD = ([[0, PTS[0][1]], ...PTS, [100, PTS[PTS.length - 1][1]]] as [number, number][]).reduce((d, [x, y], i, arr) => {
  if (!i) return `M${x} ${y}`;
  const [px, py] = arr[i - 1], m = (px + x) / 2;
  return d + ` C${m} ${py} ${m} ${y} ${x} ${y}`;
}, "");
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
  const a = STAGES[3].a;
  return (
    <Scene a={a}>
      <div className="eq">
        <div className="eq-clip"><Clip n="bgm_flute_drop.mp3" tone="sage" a={0} b={DUR} k="a" dur="6.2s" st={{ left: 0, width: "100%" }} /></div>
        <div className="eq-body">
          <div className="eq-panel">
            <div className="eq-plot">
              {["LOW +4.0 dB", "MID −2.5 dB", "HIGH +5.5 dB"].map((l, i) => <div key={l} className="band" style={{ left: i * 33.333 + "%" }}><span>{l}</span></div>)}
              {[["+12", 17], ["0", 50], ["−12", 83]].map(([l, y]) => <i key={l} className="gl" style={{ top: y + "%" }}><b>{l}</b></i>)}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                <g className="eqg k" style={K(a + 0.15, 0.9, { "--kf": "k-sy" })}>
                  <path className="area" d={EQD + " L100 50 L0 50 Z"} />
                  <path className="line" d={EQD} />
                </g>
              </svg>
              {PTS.map(([x, y], i) => (
                <i key={i} className="node k" style={K(a + 0.15 + i * 0.02, 0.9, { "--kf": "k-y", "--y0": "50%", "--y1": y + "%", left: x + "%" })} />
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
  <div className={`cur t-${tone} k`} style={K(at, 1.5, { "--kf": "k-cur", "--x0": p[0] + "%", "--y0": Y(p[1]), "--x1": p[2] + "%", "--y1": Y(p[3]), "--x2": p[4] + "%", "--y2": Y(p[5]), "--ez": "ease-in-out" })}>
    <svg width="13" height="15" viewBox="0 0 11 13"><path d="M1 1 L1 11 L4 8 L6.4 12.4 L8 11.6 L5.7 7.3 L9.6 7 Z" fill="currentColor" stroke="#101017" strokeWidth=".8" strokeLinejoin="round" /></svg>
    <span>{who}</span>
  </div>
);
function Agents() {
  const a = STAGES[4].a;
  const regions = [[0.1, 5.1, "lime", "intro", "intro-agent"], [9.9, 14.9, "orange", "outro", "outro-agent"]] as const;
  return (
    <Scene a={a}>
      <div className="lns" style={{ "--top": "32px" } as CSSProperties}>
        {regions.map(([r0, r1, tone, rn, ag]) => (
          <div key={rn} className={`reg t-${tone} k`} style={{ left: P(r0), width: P(r1 - r0), ...K(a + 0.05, 0.3) }}><b><i />{rn} · {ag}</b></div>
        ))}
        <Project a={a}
          x={{ title: (cl, at) => Trim(cl, at, 2.9, a + 0.9), vhs: (cl, at) => Trim(cl, at, 12.4, a + 1.0), b16: (cl, at) => Split(cl, at, 7.5, a + 1.5) }}
          fx={{ b13: ["GaussianBlurEffect", a + 1.6], b7: ["VignetteEffect", a + 1.7] }}>
          <Cur who="intro-agent" tone="lime" at={a + 0.1} p={[6, 0.3, 24, 1.5, 12, 4.5]} />
          <Cur who="outro-agent" tone="orange" at={a + 0.2} p={[94, 3, 89, 0.5, 80, 4.5]} />
          <Cur who="agent-3" tone="teal" at={a + 0.7} p={[58, 6.8, 50, 4.5, 55, 2.7]} />
          <div className="flash k" style={{ ...K(a + 1.5, 0.2, { "--kf": "k-flash" }), left: P(7.5) }} />
        </Project>
      </div>
      <div className="stat">
        {([["lime", "intro-agent", "trim(title_card)", 1.3], ["orange", "outro-agent", "trim(vhs_overlay)", 1.4], ["teal", "agent-3", "split(broll_16)", 1.8]] as const).map(([tone, who, op, t]) => (
          <span key={who} className={`pill t-${tone} k`} style={K(a + t, 0.25)}><i /><b>{who}</b>{op}</span>
        ))}
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
        <div className="ln fu-lane"><Clip n="broll_7" tone="blue" a={0.4} b={14.6} kd={[18, 52, 84]} fx="fusion_backdrop_dag" fxAt={a + 1.3} at={a + 0.2} /></div>
      </div>
      <Call at={a + 0.45} until={a + 1.2}>fg.add_node(FusionEffectNode(id="bg_blur", effect_type="gaussian_blur"))</Call>
      <Call at={a + 1.2}>c_th_bg.add_effect(fg_bg.as_effect(id="fusion_backdrop_dag"))</Call>
    </Scene>
  );
}

/* 7 ─ the finished edit: a short adjustment clip on the TOP track grades only what is below it ── */
function Effects() {
  const a = STAGES[6].a;
  const E = (name: string, t: number): [string, number] => [name, a + t];
  return (
    <Scene a={a}>
      <div className="lns">
        <Project a={a} fx={{
          title: E("GlowEffect", 0.5), speed: E("SpeedEffect", 0.6), callout: E("DropShadowEffect", 0.7), lower: E("VignetteEffect", 0.8),
          light: E("FilmGrainEffect", 0.9), city: E("MaskEffect", 1.0), skate: E("PixelateEffect", 1.1), key: E("ChromaKeyEffect", 1.2),
          b13: E("GaussianBlurEffect", 1.3), b7: E("ColorGradeEffect", 1.4), vo5: E("DenoiseEffect", 1.5), bgm1: E("CompressorEffect", 1.6),
        }}
          top={<div className="ln adj"><Clip n="AdjustmentClipVisual" tone="lime" a={5.6} b={9.8} at={a + 0.1} cls="adjc" fx="glow + vignette + grade" fxAt={a + 0.1} /></div>}>
          <div className="sheet k" style={{ left: P(5.6), width: P(4.2), ...K(a + 0.35, 0.6, { "--kf": "k-sy" }) }} />
        </Project>
      </div>
      <Call at={a + 0.1} until={a + 1.0}>eng.add_adjustment_visual(visual_track_id=v6.id, start=Time(5.6), duration=Time(4.2))</Call>
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
