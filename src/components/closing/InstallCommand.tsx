"use client";
import { useState, useSyncExternalStore } from "react";
import { Check, Copy } from "lucide-react";
import { INSTALL, INSTALL_KEYS, type InstallKey } from "@/lib/site";

// One shared choice for every install box on the page. uv is the default.
let current: InstallKey = "uv";
const subs = new Set<() => void>();
const choose = (k: InstallKey) => {
  current = k;
  subs.forEach((cb) => cb());
};
const useInstallKey = () =>
  useSyncExternalStore(
    (cb) => (subs.add(cb), () => subs.delete(cb)),
    () => current,
    () => "uv" as InstallKey,
  );

export default function InstallCommand({ className = "" }: { className?: string }) {
  const k = useInstallKey();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(INSTALL[k]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked: the command is still selectable on screen */
    }
  }

  return (
    <div className={"install " + className}>
      <div className="install-tabs" role="tablist" aria-label="Package manager">
        {INSTALL_KEYS.map((key) => (
          <button key={key} role="tab" aria-selected={k === key} onClick={() => choose(key)}>
            {key}
          </button>
        ))}
      </div>
      <div className="install-line">
        <span className="install-prompt" aria-hidden="true">$</span>
        {/* every command sits in the same grid cell, so the box is always as wide as the longest one */}
        <span className="install-cmd">
          {INSTALL_KEYS.map((key) => (
            <code key={key} data-on={k === key} aria-hidden={k !== key}>{INSTALL[key]}</code>
          ))}
        </span>
        <button className="install-copy" onClick={copy} aria-label={`Copy ${INSTALL[k]}`}>
          {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
          <span className="copy-label" aria-live="polite">
            <span data-on={!copied}>copy</span>
            <span data-on={copied}>copied</span>
          </span>
        </button>
      </div>
    </div>
  );
}
