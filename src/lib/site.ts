export const DOCS_URL = "/docs";
/* The public repo, no trailing slash, e.g. "https://github.com/surajairi/visualkit".
   While this is null the code isn't public yet: every GitHub link on the site (docs header, "Edit this page",
   skill cards) opens a "we're open-sourcing soon" dialog instead. Set the URL and they all become real links. */
export const GITHUB_URL: string | null = null;

export const REQUIREMENTS =
  "Python 3.10 or later. FFmpeg for probing and rendering.";

export const INSTALL = {
  uv: "uv add visualkit",
  pip: "pip install visualkit",
} as const;

export type InstallKey = keyof typeof INSTALL;
export const INSTALL_KEYS = Object.keys(INSTALL) as InstallKey[];

/* The 15 s edited demo, delivered straight from Cloudinary's CDN (not the embed player), so the timeline can read its clock.
   Plain original file on purpose: no on-the-fly transformation, so there is no encode step that can stall or return an error on first request.
   Same URL every visit = the browser's HTTP cache serves it from disk after the first load.
   Re-uploaded the video? Bump the public_id (…-v2) or use the versioned URL (…/upload/v123456/…) so cached copies refresh. */
export const CDN_ORIGIN = "https://res.cloudinary.com";
const CLD = `${CDN_ORIGIN}/dlzdj6k6u/video/upload`;
// const ID = "visualkit-demo-v1_xyhvvy";
const ID = "visuakit-demo-v2_leehdm";
export const HERO_VIDEO = {
  mp4: `${CLD}/${ID}.mp4`,
  poster: `${CLD}/so_0,w_1280/${ID}.jpg`,
} as const;

/* Agent Skills: the bundle the landing page and the docs both point at.
   Each target is the folder an agent harness scans for skills; the command unpacks the bundle there. */
export const SKILLS_URL = "/docs/skills";
export const HUMAN_GUIDE_URL = "/docs/getting-started-human";
export const SKILLS_BUNDLE_URL =
  "https://visualkit.hyekai.com/downloads/skills/visualkit-skills-all.zip";

export const SKILL_TARGETS = [
  { key: "claude", label: "Claude Code", dir: ".claude/skills" },
  { key: "codex", label: "Codex", dir: ".agents/skills" },
  { key: "cursor", label: "Cursor", dir: ".cursor/skills" },
  { key: "gemini", label: "Gemini CLI", dir: "~/.gemini/skills" },
] as const;

export type SkillTargetKey = (typeof SKILL_TARGETS)[number]["key"];

export function skillInstallCommand(dir: string): string {
  return [
    `mkdir -p ${dir}`,
    `curl -fsSL -o vk-skills.zip \\`,
    `  ${SKILLS_BUNDLE_URL}`,
    `unzip -qo vk-skills.zip -d ${dir} && rm vk-skills.zip`,
  ].join("\n");
}
