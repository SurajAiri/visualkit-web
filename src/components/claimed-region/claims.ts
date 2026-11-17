// Wireframe data for the claimed-region walkthrough. Everything is in timeline seconds.
// A clip's base geometry is its REQUEST-stage geometry. `f` holds per-stage changes (1 resolve, 2 work, 3 release)
// and each stage inherits from the one before, so only differences are written down.
//
// Semantics the figure relies on (checked by scripts/check-claims.mjs):
//   - Stage 2 (work) edits happen on maya-agent's LOCAL clock. The shared timeline is a frozen snapshot until
//     release, so edits written under `f[2]` only become visible on the shared lanes at stage 3 (commit).
//   - Stage 3 (release) only ripples: clips after the region shift by the net duration change, nothing is resized.

export type Row = 0 | 1 | 2 | 3; // V3, V2, V1, A1
export type Range = [number, number];
export type Frame = { a?: number; b?: number; hide?: boolean; join?: boolean; g?: string | null };
export type CClip = {
  id: string; row: Row; a: number; b: number; name: string;
  g?: string | null; hide?: boolean; join?: boolean;
  f?: Partial<Record<1 | 2 | 3, Frame>>;
};
export type Scenario = {
  id: string;
  tab: string;
  request: Range;
  ranges: [Range, Range, Range, Range]; // R1 at request, resolve, work, release
  other?: { who: string; label: string; ranges: [Range, Range, Range, Range] };
  clips: CClip[];
  captions: [string, string, string, string];
};

export type Live = { a: number; b: number; hide: boolean; join: boolean; g: string | null };

export const EPS = 1e-6;

// Resolve a clip's geometry at a stage: each stage inherits the one before it.
export function frameOf(c: CClip, stage: number): Live {
  let f: Live = { a: c.a, b: c.b, hide: !!c.hide, join: !!c.join, g: c.g ?? null };
  for (let k = 1; k <= stage; k++) f = { ...f, ...(c.f?.[k as 1 | 2 | 3] ?? {}) } as Live;
  return f;
}
export const inside = (f: { a: number; b: number }, r: Range) => f.a >= r[0] - EPS && f.b <= r[1] + EPS;
export const crosses = (f: { a: number; b: number }, r: Range) => f.a < r[1] && f.b > r[0] && !inside(f, r);

// Where a clip that was drawn as ONE clip (pre-cut into `join` pieces) gets cut. Base geometry, stage 0.
export function seamsOf(sc: Scenario): { x: number; row: Row }[] {
  const joined = sc.clips.filter((c) => c.join).sort((p, q) => p.row - q.row || p.a - q.a);
  const out: { x: number; row: Row }[] = [];
  joined.forEach((c, k) => {
    const n = joined[k + 1];
    if (n && n.row === c.row && Math.abs(n.a - c.b) < 0.3) out.push({ x: c.b, row: c.row });
  });
  return out;
}

// The local-clock workspace: what the claim owner edits during WORK, on a clock that starts at 0:00 at the region start.
export type LocalSpec = {
  win: Range;         // resolved window, in shared-timeline seconds
  len: number;        // seconds shown on the local clock: the window, stretched if the edit grows past it
  clips: CClip[];     // clips that live in the workspace
  contentEnd: number; // latest clip end after the WORK edits
  net: number;        // contentEnd - window end. This is exactly what release ripples.
};
export function localSpec(sc: Scenario): LocalSpec {
  const win = sc.ranges[1];
  const clips = sc.clips.filter((c) => {
    const f1 = frameOf(c, 1), f2 = frameOf(c, 2);
    if (f2.hide) return false;
    return f1.hide ? inside(f2, win) : inside(f1, win);
  });
  const contentEnd = Math.max(...clips.map((c) => frameOf(c, 2).b));
  return { win, len: Math.max(win[1] - win[0], contentEnd - win[0]), clips, contentEnd, net: contentEnd - win[1] };
}

// The WORK edits in order. Members of a group are edited in the same step (one unit).
export type Edit = { step: number; d: number; isNew: boolean };
export function editsOf(spec: LocalSpec): Map<string, Edit> {
  const out = new Map<string, Edit>();
  const steps = new Map<string, number>();
  for (const c of spec.clips) {
    const p = frameOf(c, 1), q = frameOf(c, 2);
    const isNew = p.hide && !q.hide;
    if (!isNew && Math.abs(q.a - p.a) < EPS && Math.abs(q.b - p.b) < EPS) continue;
    const key = q.g ?? c.id;
    const step = steps.get(key) ?? steps.size;
    steps.set(key, step);
    out.set(c.id, { step, d: isNew ? q.b - q.a : q.b - q.a - (p.b - p.a), isNew });
  }
  return out;
}

export const SCALE = 46;
export const TRACKS = ["V3", "V2", "V1", "A1"] as const;

export const SCENARIOS: Scenario[] = [
  {
    id: "clean",
    tab: "Clean grant",
    request: [12, 24],
    ranges: [[12, 24], [12, 24], [12, 24], [12, 20]],
    clips: [
      { id: "t1", row: 0, a: 2, b: 9, name: "title" },
      { id: "t2", row: 0, a: 14, b: 21, name: "lower-third", f: { 2: { b: 18 } } },
      { id: "t3", row: 0, a: 27, b: 36, name: "end-card", f: { 3: { a: 23, b: 32 } } },
      { id: "b1", row: 1, a: 5, b: 11, name: "b-roll_01" },
      { id: "b2", row: 1, a: 12.5, b: 19, name: "b-roll_02", f: { 2: { b: 17 } } },
      { id: "b3", row: 1, a: 30, b: 41, name: "cutaway", f: { 3: { a: 26, b: 37 } } },
      { id: "i1", row: 2, a: 1, b: 12, name: "cam_A" },
      { id: "i2", row: 2, a: 12, b: 24, name: "cam_B", f: { 2: { b: 20 } } },
      { id: "i3", row: 2, a: 24.5, b: 34, name: "reaction", f: { 3: { a: 20.5, b: 30 } } },
      { id: "a1", row: 3, a: 0, b: 11.5, name: "room" },
      { id: "a2", row: 3, a: 12.5, b: 22, name: "foley", f: { 2: { b: 19.5 } } },
      { id: "a3", row: 3, a: 25, b: 39, name: "score", f: { 3: { a: 21, b: 35 } } },
    ],
    captions: [
      "maya-agent asks for [12s, 24s) across every track.",
      "Every clip sits wholly inside or wholly outside, so the range is granted as asked.",
      "Work stays inside the blue region, on maya-agent’s local clock below. Everything else is read-only.",
      "The edit came out 4s shorter. Release validates, commits, and ripples later clips left by 4s.",
    ],
  },
  {
    id: "overlap",
    tab: "Clip overlap",
    request: [12, 24],
    ranges: [[12, 24], [9.5, 26.5], [9.5, 26.5], [9.5, 28.5]],
    clips: [
      { id: "t1", row: 0, a: 3, b: 9, name: "title" },
      { id: "t2", row: 0, a: 14, b: 20, name: "lower-third" },
      { id: "fx", row: 0, a: 21, b: 26, name: "fx-title", hide: true, f: { 2: { hide: false } } },
      { id: "t3", row: 0, a: 28, b: 37, name: "end-card", f: { 3: { a: 30, b: 39 } } },
      { id: "b1", row: 1, a: 9.5, b: 16, name: "b-roll_03" },
      { id: "b2", row: 1, a: 28.5, b: 39, name: "cutaway", f: { 3: { a: 30.5, b: 41 } } },
      { id: "i0", row: 2, a: 1, b: 9.2, name: "cam_A" },
      { id: "i1", row: 2, a: 10.5, b: 17, name: "cam_B" },
      { id: "i2", row: 2, a: 18, b: 26.5, name: "cam_C", f: { 2: { b: 28.5 } } },
      { id: "i3", row: 2, a: 28, b: 40, name: "reaction", f: { 3: { a: 30, b: 42 } } },
      { id: "a1", row: 3, a: 0, b: 8.5, name: "room" },
      { id: "a2", row: 3, a: 13, b: 25.5, name: "music_bed" },
      { id: "a3", row: 3, a: 27.5, b: 40, name: "score", f: { 3: { a: 29.5, b: 42 } } },
    ],
    captions: [
      "The request [12s, 24s) cuts straight through four clips.",
      "Clips stay atomic, so the claim expands to [9.5s, 26.5s) to take them whole.",
      "On her local clock, maya-agent adds fx-title and extends cam_C. Nobody else can write here meanwhile.",
      "cam_C grew by 2s. Release ripples everything after the region right by 2s.",
    ],
  },
  {
    id: "group",
    tab: "Group overlap",
    request: [12, 24],
    ranges: [[12, 24], [12, 33], [12, 33], [12, 31]],
    clips: [
      { id: "t0", row: 0, a: 3, b: 9, name: "title" },
      { id: "ga", row: 0, a: 21, b: 26.5, name: "title_a", g: "G1" },
      { id: "gc", row: 0, a: 28, b: 33, name: "title_c", g: "G1", f: { 2: { b: 31 } } },
      { id: "b0", row: 1, a: 4, b: 10, name: "b-roll_01" },
      { id: "b3", row: 1, a: 14, b: 19.5, name: "b-roll_02" },
      { id: "st", row: 1, a: 23, b: 31, name: "sting", g: "G1", f: { 2: { b: 29 } } },
      { id: "i1", row: 2, a: 3, b: 11.5, name: "cam_A" },
      { id: "i2", row: 2, a: 13, b: 20.5, name: "cam_B" },
      { id: "i3", row: 2, a: 34.5, b: 43, name: "reaction", f: { 3: { a: 32.5, b: 41 } } },
      { id: "a1", row: 3, a: 1, b: 10, name: "room" },
      { id: "a2", row: 3, a: 12.5, b: 22, name: "foley" },
      { id: "a3", row: 3, a: 35, b: 43, name: "score", f: { 3: { a: 33, b: 41 } } },
    ],
    captions: [
      "The request [12s, 24s) clips the edge of group G1.",
      "A linked group is all or nothing, so the claim grows to take every member: [12s, 33s).",
      "On her local clock, maya-agent trims title_c and the sting. G1 is edited as one unit.",
      "Group edits validate together, then everything after the region ripples left by 2s.",
    ],
  },
  {
    id: "split",
    tab: "Split allowed",
    request: [12, 24],
    ranges: [[12, 24], [12, 24], [12, 24], [12, 26]],
    other: { who: "jules-agent", label: "R2", ranges: [[34, 41.5], [34, 41.5], [34, 41.5], [36, 43.5]] },
    clips: [
      { id: "ga", row: 0, a: 6, b: 11, name: "g_a", g: "G1", f: { 1: { g: null } } },
      { id: "gb", row: 0, a: 14, b: 19.5, name: "g_b", g: "G1", f: { 1: { g: "G2" } } },
      { id: "gc", row: 0, a: 25.5, b: 31, name: "g_c", g: "G1", f: { 1: { g: "G3" }, 3: { a: 27.5, b: 33 } } },
      { id: "b0", row: 1, a: 3, b: 10, name: "b-roll_01" },
      { id: "gd", row: 1, a: 15, b: 22.5, name: "g_d", g: "G1", f: { 1: { g: "G2" } } },
      { id: "ge", row: 1, a: 26, b: 32, name: "g_e", g: "G1", f: { 1: { g: "G3" }, 3: { a: 28, b: 34 } } },
      { id: "far", row: 1, a: 35, b: 41, name: "cutaway", f: { 3: { a: 37, b: 43 } } },
      { id: "i0", row: 2, a: 1, b: 9, name: "cam_A" },
      { id: "i1", row: 2, a: 13, b: 24, name: "cam_B", f: { 2: { b: 26 } } },
      { id: "i2", row: 2, a: 35, b: 41, name: "reaction", f: { 3: { a: 37, b: 43 } } },
      { id: "m1", row: 3, a: 2, b: 12, name: "music_bed", join: true, f: { 1: { b: 11.8, join: false } } },
      { id: "m2", row: 3, a: 12, b: 24, name: "music_bed", join: true, f: { 1: { a: 12.2, b: 23.8, join: false } } },
      { id: "m3", row: 3, a: 24, b: 30, name: "music_bed", join: true, f: { 1: { a: 24.2, join: false }, 3: { a: 26.2, b: 32 } } },
      { id: "a4", row: 3, a: 34.5, b: 41, name: "score", f: { 3: { a: 36.5, b: 43 } } },
    ],
    captions: [
      "With split allowed, [12s, 24s) may cut through group G1 and the long music_bed clip.",
      "G1 divides at the edge into G2 (inside) and G3 (outside). music_bed is cut in three.",
      "On her local clock, maya-agent extends cam_B while jules-agent keeps editing in R2.",
      "cam_B grew by 2s. Release ripples everything after the region, and R2 moves with it, still valid.",
    ],
  },
];
