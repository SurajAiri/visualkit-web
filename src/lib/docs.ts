import fs from "node:fs";
import path from "node:path";
import { parseMarkdown, type ParsedMarkdown, type TocItem } from "./markdown";

export interface DocNavItem {
  slug: string; // "" for /docs index
  file: string;
  title: string;
  shortTitle: string;
  section: string;
}

export interface DocNavSection {
  title: string;
  items: DocNavItem[];
}

export interface DocPageData {
  meta: DocNavItem;
  parsed: ParsedMarkdown;
  prev: DocNavItem | null;
  next: DocNavItem | null;
}

export interface SearchDocEntry {
  slug: string;
  href: string;
  title: string;
  section: string;
  description: string;
  headings: TocItem[];
  plainText: string;
}

export const DOC_SECTIONS: DocNavSection[] = [
  {
    title: "Start Here",
    items: [
      { slug: "", file: "README.md", title: "Overview", shortTitle: "Overview", section: "Start Here" },
      { slug: "getting-started", file: "getting-started.md", title: "Getting Started", shortTitle: "Getting Started", section: "Start Here" },
      { slug: "getting-started-human", file: "getting-started-human.md", title: "Getting Started (Human)", shortTitle: "Getting Started (Human)", section: "Start Here" },
      { slug: "core-concepts", file: "core-concepts.md", title: "Core Concepts", shortTitle: "Core Concepts", section: "Start Here" },
    ],
  },
  {
    title: "AI Agents",
    items: [
      { slug: "skills", file: "", title: "Agent Skills", shortTitle: "Agent Skills", section: "AI Agents" },
    ],
  },
  {
    title: "Editing & Animation",
    items: [
      { slug: "clips-and-timeline", file: "clips-and-timeline.md", title: "Clips & Timeline Editing", shortTitle: "Clips & Timeline", section: "Editing & Animation" },
      { slug: "keyframes-and-animation", file: "keyframes-and-animation.md", title: "Keyframes & Animation", shortTitle: "Keyframes & Animation", section: "Editing & Animation" },
      { slug: "style-text-shapes-templates", file: "style-text-shapes-templates.md", title: "Style, Text, Shapes & Templates", shortTitle: "Text, Shapes & Templates", section: "Editing & Animation" },
      { slug: "effects-and-fusion", file: "effects-and-fusion.md", title: "Effects & Fusion Graphs", shortTitle: "Effects & Fusion", section: "Editing & Animation" },
    ],
  },
  {
    title: "Composition & Planning",
    items: [
      { slug: "compound-and-template-clips", file: "compound-and-template-clips.md", title: "Compound & Template Clips", shortTitle: "Compound & Templates", section: "Composition & Planning" },
      { slug: "director-cut", file: "director-cut.md", title: "Director's Cut", shortTitle: "Director's Cut", section: "Composition & Planning" },
      { slug: "version-control-and-collaboration", file: "version-control-and-collaboration.md", title: "Version Control & Collaboration", shortTitle: "Version Control & Claims", section: "Composition & Planning" },
    ],
  },
  {
    title: "Ecosystem & Reference",
    items: [
      { slug: "assets", file: "assets.md", title: "Assets & Coded Visuals", shortTitle: "Assets & Coded Visuals", section: "Ecosystem & Reference" },
      { slug: "actors", file: "actors.md", title: "Built-in & Local Actors", shortTitle: "Local Actors", section: "Ecosystem & Reference" },
      { slug: "preview-and-rendering", file: "preview-and-rendering.md", title: "Preview & Rendering", shortTitle: "Preview & Rendering", section: "Ecosystem & Reference" },
      { slug: "cli-reference", file: "cli-reference.md", title: "CLI Reference", shortTitle: "CLI Reference", section: "Ecosystem & Reference" },
    ],
  },
];

export const ALL_DOC_ITEMS: DocNavItem[] = DOC_SECTIONS.flatMap((s) => s.items);

const DOCS_DIR = path.join(process.cwd(), "content", "docs");

export function docHref(slug: string): string {
  return slug ? `/docs/${slug}` : "/docs";
}

export function getDocBySlug(slug: string): DocPageData | null {
  const index = ALL_DOC_ITEMS.findIndex((item) => item.slug === slug);
  if (index === -1) return null;
  const meta = ALL_DOC_ITEMS[index];
  if (!meta.file) return null;
  const filePath = path.join(DOCS_DIR, meta.file);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = parseMarkdown(raw);
  return {
    meta,
    parsed,
    prev: index > 0 ? ALL_DOC_ITEMS[index - 1] : null,
    next: index < ALL_DOC_ITEMS.length - 1 ? ALL_DOC_ITEMS[index + 1] : null,
  };
}

export function getDocNeighbors(slug: string): { prev: DocNavItem | null; next: DocNavItem | null } {
  const index = ALL_DOC_ITEMS.findIndex((item) => item.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? ALL_DOC_ITEMS[index - 1] : null,
    next: index < ALL_DOC_ITEMS.length - 1 ? ALL_DOC_ITEMS[index + 1] : null,
  };
}

export function getAllDocSlugs(): string[] {
  return ALL_DOC_ITEMS.filter((item) => item.slug !== "" && item.file !== "").map((item) => item.slug);
}

export function getDocsSearchIndex(): SearchDocEntry[] {
  const entries: SearchDocEntry[] = [];
  for (const item of ALL_DOC_ITEMS) {
    if (!item.file) {
      entries.push({
        slug: item.slug,
        href: docHref(item.slug),
        title: item.title,
        section: item.section,
        description: "Download official VisualKit Agent Skills (visualkit-editing and visualkit-collab) for Claude Code, Codex, Cursor, and Gemini CLI.",
        headings: [
          { id: "available-skills", text: "Available Skills", level: 2 },
          { id: "visualkit-editing", text: "visualkit-editing", level: 3 },
          { id: "visualkit-collab", text: "visualkit-collab", level: 3 },
          { id: "quick-install", text: "Quick Install", level: 2 },
        ],
        plainText: "visualkit-editing visualkit-collab agent skills download zip SKILL.md install skills folder Claude Code Cursor Gemini CLI Codex",
      });
      continue;
    }
    const filePath = path.join(DOCS_DIR, item.file);
    if (!fs.existsSync(filePath)) continue;
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = parseMarkdown(raw);
    entries.push({
      slug: item.slug,
      href: docHref(item.slug),
      title: parsed.title || item.title,
      section: item.section,
      description: parsed.description,
      headings: parsed.toc,
      plainText: parsed.plainText,
    });
  }
  return entries;
}
