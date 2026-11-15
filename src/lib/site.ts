export const DOCS_URL = "https://surajairi.github.io/visualkit/";

export const INSTALL = {
  uv: "uv add visualkit",
  pip: "pip install visualkit",
} as const;

export type InstallKey = keyof typeof INSTALL;
export const INSTALL_KEYS = Object.keys(INSTALL) as InstallKey[];
