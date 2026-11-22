"use client";
import { useEffect } from "react";

// Doc pages stream in behind a Suspense fallback, so on a first visit the browser looks for the
// #hash before the heading exists and leaves the page at the top. This mounts with the content
// and scrolls to the heading once it is really in the DOM.
export default function HashScroll() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ block: "start" });
  }, []);
  return null;
}
