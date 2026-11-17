"use client";
import { useSyncExternalStore } from "react";

/* Shows the address that was requested. The 404 page is prerendered, so the server can't know the path:
   it renders the fallback, then the browser swaps in the real one after hydration (no mismatch). */
const subscribe = () => () => {};
const read = () => window.location.pathname;
const readOnServer = () => "";

function pretty(path: string) {
  try {
    return decodeURIComponent(path);
  } catch {
    return path; // malformed %-escape: show it as typed
  }
}

export default function MissingPath() {
  const path = useSyncExternalStore(subscribe, read, readOnServer);
  return path ? <code className="nf-path">{pretty(path)}</code> : <>this address</>;
}
