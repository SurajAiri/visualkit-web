import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Download, FileCode2, FolderArchive, Layers, Sparkles } from "lucide-react";
import DocsShell from "@/components/docs/DocsShell";
import CodeBlock from "@/components/docs/CodeBlock";
import { DOC_SECTIONS, docHref, getDocNeighbors, getDocsSearchIndex } from "@/lib/docs";
import type { TocItem } from "@/lib/markdown";
import { GITHUB_URL, HUMAN_GUIDE_URL, SKILLS_BUNDLE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Agent Skills · VisualKit Docs",
  description:
    "Download official VisualKit Agent Skills (visualkit-editing and visualkit-collab) for Claude Code, Codex, Cursor, and Gemini CLI.",
};

const TOC: TocItem[] = [
  { id: "available-skills", text: "Available Skills", level: 2 },
  { id: "visualkit-editing", text: "visualkit-editing", level: 3 },
  { id: "visualkit-collab", text: "visualkit-collab", level: 3 },
  { id: "quick-install", text: "Quick Install", level: 2 },
  { id: "progressive-disclosure", text: "How Progressive Disclosure Works", level: 2 },
];

const INSTALL_SNIPPET = `# Download & unpack both skills into your project's agent skills folder (Claude Code shown)
mkdir -p .claude/skills
curl -fsSL ${SKILLS_BUNDLE_URL} -o /tmp/vk-skills.zip
unzip -qo /tmp/vk-skills.zip -d .claude/skills
rm /tmp/vk-skills.zip`;

const VERIFY_SNIPPET = `# Verify your VisualKit CLI and actors are ready for the agent
visualkit --help
visualkit actors doctor --format json`;

export default function DocsSkillsPage() {
  const searchIndex = getDocsSearchIndex();
  const { prev, next } = getDocNeighbors("skills");

  return (
    <DocsShell sections={DOC_SECTIONS} searchIndex={searchIndex} toc={TOC}>
      <article className="docs-prose">
        <span className="docs-kicker">AI Agents</span>
        <h1>Agent Skills</h1>
        <p>
          VisualKit ships two structured, progressive-disclosure <strong>Agent Skills</strong> designed for
          Claude Code, Cursor, Gemini CLI, Codex, and custom agent harnesses. Drop them into your
          agent&rsquo;s skills folder so agents orient cleanly, avoid common API traps, preview before
          rendering, and coordinate multi-agent claimed regions without merge conflicts.
        </p>

        <div className="skills-bundle-bar">
          <div>
            <div className="skills-bundle-title">Complete VisualKit Skills Bundle</div>
            <div className="skills-bundle-sub">
              Includes <code>visualkit-editing</code> (with 3 deep-dive references) + <code>visualkit-collab</code>
            </div>
          </div>
          <a
            href="/downloads/skills/visualkit-skills-all.zip"
            download="visualkit-skills-all.zip"
            className="button-primary skills-dl-primary"
          >
            <FolderArchive size={16} aria-hidden />
            <span>Download all skills (.zip)</span>
          </a>
        </div>

        <h2 id="available-skills">
          <span className="docs-heading-anchor">
            <span>Available Skills</span>
            <a className="docs-anchor-hash" href="#available-skills" aria-label="Link to Available Skills">#</a>
          </span>
        </h2>

        <div className="skills-grid">
          <section id="visualkit-editing" className="skill-card">
            <div className="skill-card-head">
              <div className="skill-card-badge is-lime">
                <Sparkles size={13} aria-hidden />
                <span>Single-Agent Editing</span>
              </div>
              <span className="skill-card-meta">4 files · SKILL.md + 3 references</span>
            </div>

            <h3 className="skill-card-title">visualkit-editing</h3>
            <p className="skill-card-desc">
              End-to-end video editing playbook for <code>visualkit</code> CLI and <code>VisualkitEngine</code>{" "}
              Python scripts: asset scanning via <code>/proj</code>, tracks &amp; clips, <code>crop_to</code>,
              speed curves, two-layer keyframes, effects &amp; Fusion DAGs, local actors, Director&rsquo;s Cut,
              previews, and FFmpeg rendering.
            </p>

            <div className="skill-files">
              <div className="skill-files-label">Included files</div>
              <ul>
                <li><code>SKILL.md</code> — 4-step editing loop, exact signatures, actors &amp; gotchas</li>
                <li><code>references/effects-and-fusion.md</code> — Effect parameter quick-reference &amp; Fusion DAGs</li>
                <li><code>references/compound-and-templates.md</code> — Nested sequences, variables &amp; repeaters</li>
                <li><code>references/director-and-coded.md</code> — Director&rsquo;s Cut CLI &amp; HTML/Remotion assets</li>
              </ul>
            </div>

            <div className="skill-card-actions">
              <a
                href="/downloads/skills/visualkit-editing.zip"
                download="visualkit-editing.zip"
                className="skill-btn is-accent"
              >
                <Download size={14} aria-hidden />
                <span>Download .zip</span>
              </a>
              <a
                href="/downloads/skills/visualkit-editing-SKILL.md"
                download="SKILL.md"
                className="skill-btn"
              >
                <FileCode2 size={14} aria-hidden />
                <span>SKILL.md</span>
              </a>
              <a
                href={`${GITHUB_URL}/tree/main/skills/visualkit-editing`}
                target="_blank"
                rel="noreferrer"
                className="skill-btn"
              >
                <span>GitHub</span>
                <ArrowUpRight size={13} aria-hidden />
              </a>
            </div>
          </section>

          <section id="visualkit-collab" className="skill-card">
            <div className="skill-card-head">
              <div className="skill-card-badge is-violet">
                <Layers size={13} aria-hidden />
                <span>Multi-Agent &amp; VCS</span>
              </div>
              <span className="skill-card-meta">1 file · SKILL.md</span>
            </div>

            <h3 className="skill-card-title">visualkit-collab</h3>
            <p className="skill-card-desc">
              Playbook for project version control and parallel editing: checkpoints, non-destructive
              <code>restore</code> / <code>revert</code>, branching &amp; 3-way entity merges, bound workspaces
              (<code>VISUALKIT_WORKSPACE</code>), Git-diffable JSON snapshots, and disjoint{" "}
              <strong>Claimed Regions</strong>.
            </p>

            <div className="skill-files">
              <div className="skill-files-label">Covers</div>
              <ul>
                <li><code>checkpoint</code>, <code>diff</code>, <code>restore</code>, <code>revert</code>, undo/redo</li>
                <li><code>branch</code> &amp; 3-way <code>merge --prefer ours|theirs</code></li>
                <li><code>workspace new --claim START END --on-straddle split</code></li>
                <li>Claim-local <code>0.0s</code> editing, <code>claim release</code> &amp; <code>claim abort</code></li>
              </ul>
            </div>

            <div className="skill-card-actions">
              <a
                href="/downloads/skills/visualkit-collab.zip"
                download="visualkit-collab.zip"
                className="skill-btn is-accent"
              >
                <Download size={14} aria-hidden />
                <span>Download .zip</span>
              </a>
              <a
                href="/downloads/skills/visualkit-collab-SKILL.md"
                download="SKILL.md"
                className="skill-btn"
              >
                <FileCode2 size={14} aria-hidden />
                <span>SKILL.md</span>
              </a>
              <a
                href={`${GITHUB_URL}/tree/main/skills/visualkit-collab`}
                target="_blank"
                rel="noreferrer"
                className="skill-btn"
              >
                <span>GitHub</span>
                <ArrowUpRight size={13} aria-hidden />
              </a>
            </div>
          </section>
        </div>

        <h2 id="quick-install">
          <span className="docs-heading-anchor">
            <span>Quick Install</span>
            <a className="docs-anchor-hash" href="#quick-install" aria-label="Link to Quick Install">#</a>
          </span>
        </h2>
        <p>
          Unpack the zip into your agent harness&rsquo;s skills directory: <code>.claude/skills/</code> for Claude
          Code, <code>.agents/skills/</code> for Codex, <code>.cursor/skills/</code> for Cursor, or{" "}
          <code>~/.gemini/skills/</code> for Gemini CLI:
        </p>
        <CodeBlock lang="bash" value={INSTALL_SNIPPET} />
        <p>Then verify your local CLI and built-in actors are reachable:</p>
        <CodeBlock lang="bash" value={VERIFY_SNIPPET} />
        <p>
          New to driving VisualKit through an agent? <Link href={HUMAN_GUIDE_URL}>Getting Started (Human)</Link>{" "}
          walks through importing the skills, handing over your footage, and the review loop, step by step.
        </p>

        <h2 id="progressive-disclosure">
          <span className="docs-heading-anchor">
            <span>How Progressive Disclosure Works</span>
            <a className="docs-anchor-hash" href="#progressive-disclosure" aria-label="Link to How Progressive Disclosure Works">#</a>
          </span>
        </h2>
        <p>
          Both skills keep top-level <code>SKILL.md</code> concise (~110–160 lines) so agents don&rsquo;t burn
          context tokens on rarely needed APIs. High-frequency guardrails—like <code>TimelineTime</code> splits,
          <code>engine.snap()</code>, signed-offset <code>set_human_props()</code>, and visual preview checks—stay
          at the top, while deeper references for Fusion DAGs, repeaters, and Director&rsquo;s Cut load only when
          the task actually needs them.
        </p>

        <nav className="docs-pager" style={{ marginTop: "36px" }} aria-label="Pagination">
          {prev ? (
            <Link href={docHref(prev.slug)} className="docs-pager-card">
              <span className="docs-pager-label">← Previous</span>
              <span className="docs-pager-title">{prev.title}</span>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link href={docHref(next.slug)} className="docs-pager-card is-next">
              <span className="docs-pager-label">Next →</span>
              <span className="docs-pager-title">{next.title}</span>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </article>
    </DocsShell>
  );
}
