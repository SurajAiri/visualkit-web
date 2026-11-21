export type InlineNode =
  | { type: "text"; value: string }
  | { type: "code"; value: string }
  | { type: "strong"; children: InlineNode[] }
  | { type: "em"; children: InlineNode[] }
  | { type: "del"; children: InlineNode[] }
  | { type: "link"; href: string; external: boolean; children: InlineNode[] };

export type ListItemNode = {
  children: InlineNode[];
  sublist?: { ordered: boolean; items: ListItemNode[] };
};

export type BlockNode =
  | { type: "heading"; level: 1 | 2 | 3 | 4; id: string; text: string; children: InlineNode[] }
  | { type: "paragraph"; children: InlineNode[] }
  | { type: "code"; lang: string; value: string }
  | { type: "blockquote"; blocks: BlockNode[] }
  | { type: "list"; ordered: boolean; items: ListItemNode[] }
  | { type: "table"; headers: InlineNode[][]; rows: InlineNode[][][] }
  | { type: "hr" };

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface ParsedMarkdown {
  title: string;
  description: string;
  blocks: BlockNode[];
  toc: TocItem[];
  plainText: string;
}

/** GitHub-style heading slugifier. */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Rewrite relative `.md` doc links so raw VisualKit `docs/*.md` files work unmodified in `/docs`. */
export function rewriteDocHref(rawHref: string): { href: string; external: boolean } {
  const href = rawHref.trim();
  if (/^https?:\/\//i.test(href) || /^mailto:/i.test(href)) {
    return { href, external: true };
  }
  if (href.startsWith("#") || href.startsWith("/")) {
    return { href, external: false };
  }
  const [pathPart, hashPart] = href.split("#");
  const hash = hashPart ? `#${hashPart}` : "";
  const cleaned = pathPart.replace(/^\.\//, "").replace(/^docs\//, "");
  if (cleaned === "README.md" || cleaned === "") {
    return { href: `/docs${hash}`, external: false };
  }
  if (cleaned.endsWith(".md")) {
    const slug = cleaned.slice(0, -3);
    return { href: `/docs/${slug}${hash}`, external: false };
  }
  return { href, external: false };
}

function stripInlineFormatting(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .trim();
}

export function parseInline(input: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let i = 0;

  const pushText = (s: string) => {
    if (!s) return;
    const prev = nodes[nodes.length - 1];
    if (prev && prev.type === "text") {
      prev.value += s;
    } else {
      nodes.push({ type: "text", value: s });
    }
  };

  while (i < input.length) {
    // Inline code: `...`
    if (input[i] === "`") {
      const end = input.indexOf("`", i + 1);
      if (end !== -1) {
        nodes.push({ type: "code", value: input.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    // Link: [label](href)
    if (input[i] === "[") {
      const closeBracket = input.indexOf("]", i + 1);
      if (closeBracket !== -1 && input[closeBracket + 1] === "(") {
        const closeParen = input.indexOf(")", closeBracket + 2);
        if (closeParen !== -1) {
          const label = input.slice(i + 1, closeBracket);
          const rawHref = input.slice(closeBracket + 2, closeParen);
          const { href, external } = rewriteDocHref(rawHref);
          nodes.push({
            type: "link",
            href,
            external,
            children: parseInline(label),
          });
          i = closeParen + 1;
          continue;
        }
      }
    }

    // Bold: **...**
    if (input[i] === "*" && input[i + 1] === "*") {
      const end = input.indexOf("**", i + 2);
      if (end !== -1) {
        nodes.push({ type: "strong", children: parseInline(input.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }

    // Strikethrough: ~~...~~
    if (input[i] === "~" && input[i + 1] === "~") {
      const end = input.indexOf("~~", i + 2);
      if (end !== -1) {
        nodes.push({ type: "del", children: parseInline(input.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }

    // Italic: *...*
    if (input[i] === "*" && input[i + 1] !== " ") {
      const end = input.indexOf("*", i + 1);
      if (end !== -1 && input[end - 1] !== " ") {
        nodes.push({ type: "em", children: parseInline(input.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }

    pushText(input[i]);
    i += 1;
  }

  return nodes;
}

function splitTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells: string[] = [];
  let cur = "";
  let inCode = false;
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === "`") {
      inCode = !inCode;
      cur += ch;
    } else if (ch === "|" && !inCode) {
      cells.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  cells.push(cur.trim());
  return cells;
}

function isTableSeparator(line: string): boolean {
  const t = line.trim();
  if (!t.includes("|")) return false;
  const cells = splitTableRow(t);
  return cells.length > 0 && cells.every((c) => /^:?-{3,}:?$/.test(c));
}

function parseBlocks(lines: string[], seenIds: Map<string, number>, toc: TocItem[]): BlockNode[] {
  const blocks: BlockNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    // Fenced code block
    const fenceMatch = trimmed.match(/^```([a-zA-Z0-9_-]*)\s*$/);
    if (fenceMatch) {
      const lang = fenceMatch[1] || "";
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      blocks.push({ type: "code", lang, value: codeLines.join("\n") });
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    // Heading (# .. ####)
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3 | 4;
      const rawText = headingMatch[2].trim();
      const plain = stripInlineFormatting(rawText);
      const baseId = slugifyHeading(plain) || "section";
      const count = seenIds.get(baseId) ?? 0;
      seenIds.set(baseId, count + 1);
      const id = count === 0 ? baseId : `${baseId}-${count}`;
      if (level === 2 || level === 3) {
        toc.push({ id, text: plain, level });
      }
      blocks.push({
        type: "heading",
        level,
        id,
        text: plain,
        children: parseInline(rawText),
      });
      i += 1;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push({
        type: "blockquote",
        blocks: parseBlocks(quoteLines, seenIds, toc),
      });
      continue;
    }

    // GFM Table
    if (trimmed.includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const headers = splitTableRow(trimmed).map((c) => parseInline(c));
      i += 2;
      const rows: InlineNode[][][] = [];
      while (i < lines.length && lines[i].trim().includes("|") && lines[i].trim() !== "") {
        rows.push(splitTableRow(lines[i]).map((c) => parseInline(c)));
        i += 1;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    // List (unordered or ordered, with 1 level of nested sublist)
    const ulMatch = line.match(/^(\s*)[-*+]\s+(.+)$/);
    const olMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (ulMatch || olMatch) {
      const ordered = Boolean(olMatch);
      const baseIndent = (ulMatch ?? olMatch)![1].length;
      const items: ListItemNode[] = [];

      while (i < lines.length) {
        const cur = lines[i];
        const m = ordered
          ? cur.match(/^(\s*)\d+\.\s+(.+)$/)
          : cur.match(/^(\s*)[-*+]\s+(.+)$/);
        if (m && m[1].length === baseIndent) {
          items.push({ children: parseInline(m[2].trim()) });
          i += 1;
          // Check for nested list items
          const subItems: ListItemNode[] = [];
          let subOrdered = false;
          while (i < lines.length) {
            const subLine = lines[i];
            const smUl = subLine.match(/^(\s+)[-*+]\s+(.+)$/);
            const smOl = subLine.match(/^(\s+)\d+\.\s+(.+)$/);
            const sm = smUl || smOl;
            if (sm && sm[1].length > baseIndent) {
              if (subItems.length === 0) subOrdered = Boolean(smOl);
              subItems.push({ children: parseInline(sm[2].trim()) });
              i += 1;
            } else {
              break;
            }
          }
          if (subItems.length > 0 && items.length > 0) {
            items[items.length - 1].sublist = { ordered: subOrdered, items: subItems };
          }
        } else {
          break;
        }
      }

      blocks.push({ type: "list", ordered, items });
      continue;
    }

    // Paragraph (consume contiguous non-special lines)
    const paraLines: string[] = [];
    while (i < lines.length) {
      const cur = lines[i];
      const t = cur.trim();
      if (
        !t ||
        t.startsWith("```") ||
        /^#{1,4}\s+/.test(t) ||
        t.startsWith(">") ||
        /^(-{3,}|\*{3,}|_{3,})$/.test(t) ||
        /^(\s*)[-*+]\s+/.test(cur) ||
        /^(\s*)\d+\.\s+/.test(cur) ||
        (t.includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1]))
      ) {
        break;
      }
      paraLines.push(t);
      i += 1;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: "paragraph", children: parseInline(paraLines.join(" ")) });
    }
  }

  return blocks;
}

export function parseMarkdown(raw: string): ParsedMarkdown {
  const normalized = raw.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const seenIds = new Map<string, number>();
  const toc: TocItem[] = [];
  const blocks = parseBlocks(lines, seenIds, toc);

  let title = "Documentation";
  let description = "";
  for (const b of blocks) {
    if (b.type === "heading" && b.level === 1 && title === "Documentation") {
      title = b.text;
    } else if (b.type === "paragraph" && !description) {
      description = inlineToPlain(b.children);
    }
  }

  const plainParts: string[] = [];
  for (const b of blocks) {
    if (b.type === "heading") plainParts.push(b.text);
    else if (b.type === "paragraph") plainParts.push(inlineToPlain(b.children));
    else if (b.type === "list") {
      for (const it of b.items) plainParts.push(inlineToPlain(it.children));
    }
  }

  return {
    title,
    description,
    blocks,
    toc,
    plainText: plainParts.join(" ").slice(0, 4000),
  };
}

function inlineToPlain(nodes: InlineNode[]): string {
  return nodes
    .map((n) => {
      if (n.type === "text" || n.type === "code") return n.value;
      return inlineToPlain(n.children);
    })
    .join("");
}
