// Consistency check for the claimed-region walkthrough data (src/components/claimed-region/claims.ts).
// Run:  node --experimental-strip-types scripts/check-claims.mjs [path/to/claims.ts]
// Needs Node 22.6+ (it imports the .ts file directly). On Node 20, run it through tsx instead.
// It fails if the story the figure tells does not match the numbers behind it.
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const target = resolve(process.argv[2] ?? "src/components/claimed-region/claims.ts");
const { SCENARIOS, frameOf, inside, crosses, localSpec, editsOf } = await import(pathToFileURL(target).href);

let failures = 0;
const fail = (sc, msg) => { failures++; console.log(`  FAIL [${sc.id}] ${msg}`); };
const same = (x, y) => Math.abs(x - y) < 1e-6;
const words = (s) => s.trim().split(/\s+/).length;

for (const sc of SCENARIOS) {
  console.log(`${sc.id}`);
  const [, R1, R2, R3] = sc.ranges;
  const spec = localSpec(sc);
  const edits = editsOf(spec);
  const gframe = (c, stage) => frameOf(c, stage === 2 ? 1 : stage); // shared lanes are frozen during WORK

  // the window must not move while it is being worked, and the owner must actually do some work
  if (!same(R1[0], R2[0]) || !same(R1[1], R2[1])) fail(sc, `window changes during WORK: [${R1}] -> [${R2}]`);
  if (edits.size === 0) fail(sc, "nothing is edited during WORK");

  // the ripple is exactly the net duration change made on the local clock
  const delta = R3[1] - R2[1];
  if (!same(spec.net, delta)) fail(sc, `local net ${spec.net}s != released ripple ${delta}s`);
  const inWin3 = sc.clips.filter((c) => { const f = frameOf(c, 3); return !f.hide && inside(f, R3); });
  const end3 = Math.max(...inWin3.map((c) => frameOf(c, 3).b));
  if (!same(end3, R3[1])) fail(sc, `released window ends at ${R3[1]}s but its latest clip ends at ${end3}s`);

  // RELEASE only ripples: nothing is resized, only clips after the region move, and by exactly the net change
  for (const c of sc.clips) {
    const p = frameOf(c, 2), q = frameOf(c, 3);
    if (!same(q.b - q.a, p.b - p.a)) fail(sc, `${c.id} is resized during RELEASE (edit belongs in WORK)`);
    const after = !p.hide && p.a >= R2[1] - 1e-6;
    const shift = q.a - p.a;
    if (after && !same(shift, delta)) fail(sc, `${c.id} is after the region but shifts ${shift}s, expected ${delta}s`);
    if (!after && !same(shift, 0)) fail(sc, `${c.id} is not after the region but moves ${shift}s at RELEASE`);
  }
  if (sc.other) {
    const o = sc.other.ranges;
    if (!same(o[0][0], o[2][0]) || !same(o[3][0] - o[2][0], delta)) fail(sc, `${sc.other.who} range does not ripple by ${delta}s`);
  }

  // atomicity: a resolved window never cuts a clip, and a linked group is all-in or all-out
  for (const stage of [1, 2, 3]) {
    const win = sc.ranges[stage];
    const live = sc.clips.map((c) => ({ c, f: gframe(c, stage) })).filter((l) => !l.f.hide);
    for (const { c, f } of live) if (crosses(f, win)) fail(sc, `stage ${stage + 1}: ${c.id} straddles the window edge`);
    const groups = new Map();
    live.forEach((l) => l.f.g && groups.set(l.f.g, [...(groups.get(l.f.g) ?? []), l]));
    for (const [gid, ms] of groups) {
      const n = ms.filter((m) => inside(m.f, win)).length;
      if (n !== 0 && n !== ms.length) fail(sc, `stage ${stage + 1}: group ${gid} is split across the window edge`);
    }
  }

  // nothing may collide on a track: shared lanes at every stage, and the local workspace before/after the edits
  const overlaps = (frames, label) => {
    for (const x of frames) for (const y of frames)
      if (x.c.id < y.c.id && x.c.row === y.c.row && x.f.a < y.f.b - 1e-6 && y.f.a < x.f.b - 1e-6 && !(x.f.join && y.f.join))
        fail(sc, `${label}: ${x.c.id} overlaps ${y.c.id} on row ${x.c.row}`);
  };
  for (let s = 0; s <= 3; s++) overlaps(sc.clips.map((c) => ({ c, f: gframe(c, s) })).filter((l) => !l.f.hide), `shared lanes, stage ${s + 1}`);
  for (const s of [1, 2]) overlaps(spec.clips.map((c) => ({ c, f: frameOf(c, s) })).filter((l) => !l.f.hide), `local clock, stage ${s + 1}`);

  // captions are read while the animation plays; flag the ones that would take more than ~7s
  sc.captions.forEach((cap, i) => { if (words(cap) > 20) console.log(`  note [${sc.id}] caption ${i + 1} is ${words(cap)} words`); });

  console.log(`  window [${R1}] | local clock ${spec.len}s | net ${delta > 0 ? "+" : ""}${delta}s | ${edits.size} edit(s) in ${new Set([...edits.values()].map((e) => e.step)).size} step(s)`);
}
console.log(failures ? `\n${failures} problem(s)` : "\nall scenarios consistent");
process.exit(failures ? 1 : 0);
