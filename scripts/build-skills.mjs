// Builds the downloadable Agent Skills from the plain files in /skills.
//
//   skills/<name>/SKILL.md (+ any other files, e.g. references/*.md)
//     -> public/downloads/skills/<name>.zip            one zip per skill
//     -> public/downloads/skills/<name>-SKILL.md       standalone copy of each SKILL.md
//     -> public/downloads/skills/visualkit-skills-all.zip   every skill in one zip
//
// Runs before `dev` and `build` (see package.json). The output folder is gitignored,
// so edit the files in /skills and never the generated ones.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { zipSync } from "fflate";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "skills");
const OUT = path.join(ROOT, "public", "downloads", "skills");
const ALL_ZIP = "visualkit-skills-all.zip";

// Fixed timestamp + sorted entries: the same sources always give byte-identical zips.
const MTIME = new Date(Date.UTC(2026, 0, 1));

/** Every file under `dir`, as POSIX-style paths relative to `base`, sorted. */
function listFiles(dir, base = dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(full, base));
    else if (entry.isFile()) files.push(path.relative(base, full).split(path.sep).join("/"));
  }
  return files.sort();
}

function zipFiles(files) {
  // `files` maps zip entry path -> bytes; level 9, nothing stored uncompressed by accident.
  const entries = {};
  for (const [name, data] of Object.entries(files)) entries[name] = [data, { mtime: MTIME, level: 9 }];
  return zipSync(entries);
}

if (!fs.existsSync(SRC)) {
  console.error(`build-skills: missing ${path.relative(ROOT, SRC)}/`);
  process.exit(1);
}

const skills = fs
  .readdirSync(SRC, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

if (skills.length === 0) {
  console.error("build-skills: no skill folders found in skills/");
  process.exit(1);
}

// The output folder is entirely generated, so start clean and never leave stale files behind.
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const everything = {};
const written = [];

for (const name of skills) {
  const dir = path.join(SRC, name);
  const files = listFiles(dir);
  if (!files.includes("SKILL.md")) {
    console.error(`build-skills: skills/${name}/ has no SKILL.md`);
    process.exit(1);
  }

  const entries = {};
  for (const rel of files) {
    const bytes = new Uint8Array(fs.readFileSync(path.join(dir, rel)));
    entries[`${name}/${rel}`] = bytes; // zip layout: <skill-name>/SKILL.md, <skill-name>/references/...
    everything[`${name}/${rel}`] = bytes;
  }

  fs.writeFileSync(path.join(OUT, `${name}.zip`), zipFiles(entries));
  fs.copyFileSync(path.join(dir, "SKILL.md"), path.join(OUT, `${name}-SKILL.md`));
  written.push(`${name}.zip`, `${name}-SKILL.md`);
}

fs.writeFileSync(path.join(OUT, ALL_ZIP), zipFiles(everything));
written.push(ALL_ZIP);

console.log(`build-skills: ${skills.length} skills -> public/downloads/skills/ (${written.sort().join(", ")})`);
