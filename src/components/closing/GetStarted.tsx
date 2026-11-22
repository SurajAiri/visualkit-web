"use client";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Bot, Check, Copy, Terminal } from "lucide-react";
import { useInView, useReducedMotion } from "@/components/ui/useInView";
import {
  HUMAN_GUIDE_URL,
  INSTALL,
  INSTALL_KEYS,
  SKILL_TARGETS,
  SKILLS_URL,
  skillInstallCommand,
  type InstallKey,
  type SkillTargetKey,
} from "@/lib/site";

type Mode = "agent" | "code";

const AGENT_PROMPT =
  "Use the visualkit-editing skill to cut /proj/interview.mp4 into a 15s teaser with a title card. Preview before you render.";
const AGENT_RESULTS = [
  "skill loaded · visualkit-editing",
  "scanned /proj · 4 assets",
  "run_0043 · 2 changes · committed",
  "preview grid ready · contact_sheet.jpg",
];

const CODE_FULL = [
  'with engine.claim(12, 24, owner="maya-agent"):',
  "    clip.transform.scale = 1.08",
  '    clip.effects.add("grain")',
  'engine.commit("visual_pass")',
].join("\n");
const CODE_RESULTS = ["validated · no overlaps", "run_0043 · 2 changes · committed"];

const INIT_CMD = "visualkit init demo.visualkit --fps 30 --width 1920 --height 1080";

/** Types `text` once, the first time `run` is true. Progress survives pauses, so switching tabs resumes instead of restarting. */
function useTyped(text: string, run: boolean, speed: number, reduced: boolean) {
  const [n, setN] = useState(0);
  const sofar = useRef(0);
  useEffect(() => {
    if (reduced || !run || sofar.current >= text.length) return;
    const id = setInterval(() => {
      sofar.current += 1;
      setN(sofar.current);
      if (sofar.current >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [run, reduced, text, speed]);
  return reduced ? text.length : n;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(id);
  }, [copied]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      /* clipboard blocked: the command is still selectable on screen */
    }
  }
  return (
    <button className="gs-copy" onClick={copy} aria-label={label}>
      {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
      <span className="copy-label" aria-live="polite">
        <span data-on={!copied}>copy</span>
        <span data-on={copied}>copied</span>
      </span>
    </button>
  );
}

/** A code block with its own copy button in the corner, so it is clear what gets copied. */
function CodeWell({ text, label, children }: { text: string; label: string; children: ReactNode }) {
  return (
    <div className="gs-well">
      {children}
      <CopyButton text={text} label={label} />
    </div>
  );
}

function Step({ n, title, tools, children }: { n: number; title: string; tools?: ReactNode; children: ReactNode }) {
  return (
    <section className="gs-step">
      <header className="gs-step-head">
        <span className="gs-num" aria-hidden="true">{n}</span>
        <h3>{title}</h3>
        {tools ? <div className="gs-tools">{tools}</div> : null}
      </header>
      {children}
    </section>
  );
}

function Pills<T extends string>({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: readonly { key: T; label: string }[];
  value: T;
  onChange: (k: T) => void;
}) {
  return (
    <div className="gs-pills" role="group" aria-label={label}>
      {items.map((it) => (
        <button key={it.key} aria-pressed={it.key === value} onClick={() => onChange(it.key)}>
          {it.label}
        </button>
      ))}
    </div>
  );
}

/** Typed text with an invisible copy of the finished text underneath, so the box never grows while typing. */
function Typed({ text, n, prefix, label }: { text: string; n: number; prefix?: ReactNode; label: string }) {
  const done = n >= text.length;
  return (
    <CodeWell text={text} label={label}>
      <pre className="gs-code gs-typed" aria-label={text}>
        <code className="gs-ghost" aria-hidden="true">{prefix}{text}</code>
        <code aria-hidden="true">{prefix}{text.slice(0, n)}<span className={"caret" + (done ? " is-idle" : "")} /></code>
      </pre>
    </CodeWell>
  );
}

function Results({ items, show }: { items: string[]; show: boolean }) {
  return (
    <ul className={"gs-out" + (show ? " is-in" : "")} aria-hidden={!show}>
      {items.map((r, i) => (
        <li key={r} style={{ ["--i" as string]: i }}><span>✓</span> {r}</li>
      ))}
    </ul>
  );
}

export default function GetStarted() {
  const [mode, setMode] = useState<Mode>("agent");
  const [target, setTarget] = useState<SkillTargetKey>("claude");
  const [pm, setPm] = useState<InstallKey>("uv");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.5);
  const reduced = useReducedMotion();

  const typedAgent = useTyped(AGENT_PROMPT, inView && mode === "agent", 24, reduced);
  const typedCode = useTyped(CODE_FULL, inView && mode === "code", 30, reduced);

  const dir = (SKILL_TARGETS.find((t) => t.key === target) ?? SKILL_TARGETS[0]).dir;
  const skillCmd = skillInstallCommand(dir);
  const codeCmd = `${INSTALL[pm]}\n${INIT_CMD}`;

  function onSwitchKey(e: KeyboardEvent) {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const next: Mode = mode === "agent" ? "code" : "agent";
      setMode(next);
      document.getElementById(`gs-tab-${next}`)?.focus();
    }
  }

  return (
    <div className="gs" ref={ref}>
      <div className="gs-switch" role="tablist" aria-label="How do you want to start?" onKeyDown={onSwitchKey}>
        <button
          id="gs-tab-agent"
          role="tab"
          aria-selected={mode === "agent"}
          aria-controls="gs-pane-agent"
          tabIndex={mode === "agent" ? 0 : -1}
          onClick={() => setMode("agent")}
        >
          <Bot size={15} aria-hidden /> <span className="gs-long">Continue with an agent</span><span className="gs-short">With an agent</span>
        </button>
        <button
          id="gs-tab-code"
          role="tab"
          aria-selected={mode === "code"}
          aria-controls="gs-pane-code"
          tabIndex={mode === "code" ? 0 : -1}
          onClick={() => setMode("code")}
        >
          <Terminal size={14} aria-hidden /> <span className="gs-long">Continue with code</span><span className="gs-short">With code</span>
        </button>
      </div>

      <div className="gs-window">
        <div className="gs-bar" aria-hidden="true"><i /><i /><i /><span>my-edit</span></div>

        {/* Both panes share one grid cell, so the window is always as tall as the taller one. */}
        <div className="gs-panes">
          <div id="gs-pane-agent" role="tabpanel" aria-labelledby="gs-tab-agent" className="gs-pane" data-on={mode === "agent"} aria-hidden={mode !== "agent"}>
            <Step
              n={1}
              title="Add the skills"
              tools={<Pills label="Agent" items={SKILL_TARGETS} value={target} onChange={setTarget} />}
            >
              <CodeWell text={skillCmd} label="Copy skill install commands">
                <pre className="gs-code"><code>{skillCmd}</code></pre>
              </CodeWell>
            </Step>
            <Step n={2} title="Ask for the edit">
              <Typed text={AGENT_PROMPT} n={typedAgent} label="Copy prompt" prefix={<><span className="gs-you">you ›</span>{" "}</>} />
              <Results items={AGENT_RESULTS} show={typedAgent >= AGENT_PROMPT.length} />
            </Step>
          </div>

          <div id="gs-pane-code" role="tabpanel" aria-labelledby="gs-tab-code" className="gs-pane" data-on={mode === "code"} aria-hidden={mode !== "code"}>
            <Step
              n={1}
              title="Install and start a project"
              tools={<Pills label="Package manager" items={INSTALL_KEYS.map((k) => ({ key: k, label: k }))} value={pm} onChange={setPm} />}
            >
              <CodeWell text={codeCmd} label="Copy install commands">
                <pre className="gs-code"><code>{codeCmd}</code></pre>
              </CodeWell>
            </Step>
            <Step n={2} title="Edit with a script" tools={<span className="gs-file">edit.py</span>}>
              <Typed text={CODE_FULL} n={typedCode} label="Copy script" />
              <Results items={CODE_RESULTS} show={typedCode >= CODE_FULL.length} />
            </Step>
          </div>
        </div>
      </div>

      <div className="gs-cta">
        {mode === "agent" ? (
          <>
            <Link className="button-primary" href={SKILLS_URL}>Get the skills <ArrowUpRight size={16} aria-hidden /></Link>
            <Link className="closing-secondary" href={HUMAN_GUIDE_URL}>Getting started (Human) <ArrowUpRight size={15} aria-hidden /></Link>
          </>
        ) : (
          <>
            <Link className="button-primary" href="/docs/getting-started">Read the docs <ArrowUpRight size={16} aria-hidden /></Link>
            <Link className="closing-secondary" href="/docs/cli-reference">CLI reference <ArrowUpRight size={15} aria-hidden /></Link>
          </>
        )}
      </div>
    </div>
  );
}
