/* The visitor's cookie choice. Stored in localStorage on their device only (never sent anywhere), and asked again after
   ~6 months, well inside the 9 months Clarity treats a consent signal as valid. A tiny in-memory copy keeps the banner
   working for visitors whose browser blocks localStorage. */
export type ConsentChoice = "granted" | "denied";

const KEY = "vk-consent-v1";
const CHANGED = "vk:consent-changed";
export const OPEN_SETTINGS = "vk:open-cookie-settings";
const MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;

let memory: ConsentChoice | null = null;

export function readConsent(): ConsentChoice | null {
  if (memory) return memory;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { choice, at } = JSON.parse(raw) as { choice?: unknown; at?: unknown };
    if (choice !== "granted" && choice !== "denied") return null;
    if (typeof at !== "number" || Date.now() - at > MAX_AGE_MS) return null;
    return choice;
  } catch {
    return null;
  }
}

export function saveConsent(choice: ConsentChoice): void {
  memory = choice;
  try {
    localStorage.setItem(KEY, JSON.stringify({ choice, at: Date.now() }));
  } catch {
    /* storage blocked: the in-memory copy covers this page view */
  }
  window.dispatchEvent(new Event(CHANGED));
}

export function subscribeConsent(onChange: () => void): () => void {
  window.addEventListener(CHANGED, onChange);
  window.addEventListener("storage", onChange); // another tab changed the choice
  return () => {
    window.removeEventListener(CHANGED, onChange);
    window.removeEventListener("storage", onChange);
  };
}
