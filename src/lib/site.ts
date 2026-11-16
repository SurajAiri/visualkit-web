export const DOCS_URL = "https://surajairi.github.io/visualkit/";

export const INSTALL = {
  uv: "uv add visualkit",
  pip: "pip install visualkit",
} as const;

export type InstallKey = keyof typeof INSTALL;
export const INSTALL_KEYS = Object.keys(INSTALL) as InstallKey[];

/* The 15 s edited demo. Swap for the Cloudinary URL later; the timeline stays in sync with whatever plays here. */
export const HERO_VIDEO = "/hero-demo.mp4";
