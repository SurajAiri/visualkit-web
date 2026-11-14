export const DOCS_URL = "https://surajairi.github.io/visualkit/";

export const INSTALL = {
  pip: "pip install visualkit",
  uv: "uv add visualkit",
} as const;

export type InstallKey = keyof typeof INSTALL;
