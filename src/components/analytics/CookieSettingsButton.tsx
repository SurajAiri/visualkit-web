"use client";
import { OPEN_SETTINGS } from "@/lib/consent";

/** A link-styled button that brings the cookie banner back, so a choice can be changed as easily as it was made. */
export default function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className ?? "link-button"} onClick={() => window.dispatchEvent(new Event(OPEN_SETTINGS))}>
      Cookie settings
    </button>
  );
}
