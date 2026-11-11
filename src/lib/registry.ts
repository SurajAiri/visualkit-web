import { FEATURES } from "./features";

export type Status = "live" | "beta" | "upcoming" | "concept" | "hidden";

// The only place availability is recorded. Edit a value, redeploy.
// Missing entry => DEFAULT_STATUS. "hidden" renders nowhere.
const DEFAULT_STATUS: Status = "upcoming";
const REGISTRY: Record<string, Status> = {
  F01: "live",
  F02: "live",
  F03: "live",
  F04: "live",
  F05: "live",
  F06: "live",
  F07: "live",
  F08: "live",
  F09: "live",
  F10: "live",
  F11: "live",
  F12: "live",
  F13: "live",
  F14: "live",
  F15: "live",
  F16: "live",
  F17: "live",
  F18: "live",
  F19: "live",
  F20: "live",
  F21: "live",
  F22: "live",
  F23: "live",
  F24: "live",
  F25: "live",
  F26: "live",
  F27: "live",
  F28: "live",
  F29: "live",
  F30: "live",
  F31: "live",
  F32: "live",
  F33: "live",
  F34: "live",
  F35: "live",
  F36: "live",
  F37: "live",
  F38: "live",
  F39: "live",
  F40: "live",
  F41: "live",
  F42: "live",
  F43: "live",
  F44: "live",
  F45: "live",
  F46: "live",
  F47: "live",
  F48: "live",
};

export const statusOf = (id: string): Status => REGISTRY[id] ?? DEFAULT_STATUS;
export const upcomingIds = (): string[] =>
  Object.keys(FEATURES).filter((id) => {
    const s = statusOf(id);
    return s !== "live" && s !== "hidden";
  });
