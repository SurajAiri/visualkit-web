"use client";
import { useSyncExternalStore } from "react";
import { LAUNCH_AT } from "@/lib/site";

/*
 * Library-release countdown (self-contained feature, see the README to remove it).
 * Everything runs in the browser: one shared 1-second timer, no network, no page refresh.
 * Server render and first paint see `null` ("not known yet"), so static HTML never depends on the build clock.
 */

export const LAUNCH_MS = LAUNCH_AT ? Date.parse(LAUNCH_AT) : NaN;
export const COUNTDOWN_ENABLED = Number.isFinite(LAUNCH_MS);

/** The countdown is shown as a 24-hour run-up on the timeline. */
export const RUN_UP_SECONDS = 24 * 3600;

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function stop() {
  if (timer !== undefined) clearInterval(timer);
  timer = undefined;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (timer === undefined && Date.now() < LAUNCH_MS) {
    timer = setInterval(() => {
      listeners.forEach((l) => l());
      if (Date.now() >= LAUNCH_MS) stop(); // nothing left to count
    }, 1000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stop();
  };
}

const secondsLeft = () => (COUNTDOWN_ENABLED ? Math.max(0, Math.ceil((LAUNCH_MS - Date.now()) / 1000)) : 0);

/** Whole seconds until launch; 0 once launched (or when the countdown is disabled); null until the browser has hydrated. */
export function useSecondsLeft(): number | null {
  return useSyncExternalStore(subscribe, secondsLeft, () => (COUNTDOWN_ENABLED ? null : 0));
}

export function splitTime(total: number) {
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** "11:42:10", or "2d 11:42:10" when more than a day away. */
export function formatShort(total: number): string {
  const { d, h, m, s } = splitTime(total);
  return `${d > 0 ? `${d}d ` : ""}${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}
