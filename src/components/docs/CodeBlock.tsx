"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { highlightCode } from "@/lib/highlight";

export default function CodeBlock({ lang, value }: { lang: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const lines = useMemo(() => highlightCode(value, lang), [value, lang]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard may be unavailable in restricted contexts
    }
  };

  return (
    <div className="docs-code-card">
      <div className="docs-code-head">
        <span className="docs-code-lang">{lang || "text"}</span>
        <button
          type="button"
          className={`docs-copy-btn${copied ? " is-copied" : ""}`}
          onClick={onCopy}
          aria-label="Copy code snippet"
        >
          {copied ? <Check size={13} aria-hidden /> : <Copy size={13} aria-hidden />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="docs-code-pre">
        <code>
          {lines.map((tokens, li) => (
            <span key={li} className="docs-code-line">
              {tokens.length === 0
                ? "\n"
                : tokens.map((tok, ti) =>
                    tok.kind === "plain" ? (
                      <span key={ti}>{tok.value}</span>
                    ) : (
                      <span key={ti} className={`tok-${tok.kind}`}>
                        {tok.value}
                      </span>
                    ),
                  )}
              {li < lines.length - 1 ? "\n" : ""}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
