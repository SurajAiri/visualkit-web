"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { INSTALL, type InstallKey } from "@/lib/site";

export default function InstallCommand({ compact = false }: { compact?: boolean }) {
  const [k, setK] = useState<InstallKey>("pip");
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
    <div className={"install" + (compact ? " is-compact" : "")}>
      {!compact && <div className="install-tabs" role="tablist" aria-label="Package manager">
        {(Object.keys(INSTALL) as InstallKey[]).map((key) => (
          <button key={key} role="tab" aria-selected={k === key} onClick={() => setK(key)}>
            {key}
          </button>
        ))}
      </div>}
      <div className="install-line">
        <span className="install-prompt" aria-hidden="true">$</span>
        <code>{INSTALL[k]}</code>
        <button className="install-copy" onClick={copy} aria-label={`Copy ${INSTALL[k]}`}>
          {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
          <span aria-live="polite">{copied ? "copied" : "copy"}</span>
        </button>
      </div>
    </div>
  );
}
