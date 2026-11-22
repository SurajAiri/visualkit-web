"use client";
import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { SKILL_TARGETS, skillInstallCommand, type SkillTargetKey } from "@/lib/site";

export default function SkillInstall() {
  const [key, setKey] = useState<SkillTargetKey>("claude");
  const [copied, setCopied] = useState(false);
  const target = SKILL_TARGETS.find((t) => t.key === key) ?? SKILL_TARGETS[0];
  const command = skillInstallCommand(target.dir);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(id);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
    } catch {
      /* clipboard blocked: the command is still selectable on screen */
    }
  }

  return (
    <div className="skill-install">
      <div className="skill-install-head">
        <div className="skill-install-tabs" role="tablist" aria-label="Agent">
          {SKILL_TARGETS.map((t) => (
            <button key={t.key} role="tab" aria-selected={t.key === key} onClick={() => setKey(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        <button className="skill-install-copy" onClick={copy} aria-label="Copy skill install command">
          {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
          <span className="copy-label" aria-live="polite">
            <span data-on={!copied}>copy</span>
            <span data-on={copied}>copied</span>
          </span>
        </button>
      </div>
      <pre className="skill-install-cmd"><code>{command}</code></pre>
    </div>
  );
}
