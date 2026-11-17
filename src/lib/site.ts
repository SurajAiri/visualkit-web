export const DOCS_URL = "https://surajairi.github.io/visualkit/";

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
const CLD = "https://res.cloudinary.com/dlzdj6k6u/video/upload";
// const ID = "visualkit-demo-v1_xyhvvy";
const ID = "visuakit-demo-v2_leehdm";
export const HERO_VIDEO = {
  mp4: `${CLD}/${ID}.mp4`,
  poster: `${CLD}/so_0,w_1280/${ID}.jpg`,
} as const;
