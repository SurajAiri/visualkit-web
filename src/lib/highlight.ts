export type TokenKind =
  | "plain"
  | "comment"
  | "string"
  | "keyword"
  | "builtin"
  | "number"
  | "flag"
  | "fn"
  | "type"
  | "key"
  | "punct";

export interface CodeToken {
  kind: TokenKind;
  value: string;
}

const PY_KEYWORDS = new Set([
  "and", "as", "assert", "async", "await", "break", "class", "continue", "def",
  "del", "elif", "else", "except", "finally", "for", "from", "global", "if",
  "import", "in", "is", "lambda", "nonlocal", "not", "or", "pass", "raise",
  "return", "try", "while", "with", "yield",
]);

const PY_BUILTINS = new Set([
  "True", "False", "None", "self", "cls", "engine", "print", "len", "list",
  "dict", "set", "tuple", "str", "int", "float", "bool", "range", "sorted",
]);

const SH_KEYWORDS = new Set([
  "export", "if", "then", "else", "fi", "for", "do", "done", "in", "while",
  "case", "esac", "cd", "mkdir", "cp", "mv", "rm", "echo", "cat", "unzip",
]);

const SH_COMMANDS = new Set([
  "visualkit", "visualkit-doctor", "uv", "pip", "python", "python3", "pytest",
  "ruff", "mypy", "pyright", "mkdocs", "ffmpeg", "ffprobe", "pnpm", "npm", "npx",
]);

const TS_KEYWORDS = new Set([
  "import", "export", "from", "const", "let", "var", "function", "return",
  "async", "await", "type", "interface", "if", "else", "for", "of", "in",
  "new", "true", "false", "null", "undefined", "default",
]);

function normalizeLang(lang: string): "python" | "bash" | "json" | "ts" | "toml" | "plain" {
  const l = lang.toLowerCase().trim();
  if (l === "py" || l === "python") return "python";
  if (l === "sh" || l === "bash" || l === "zsh" || l === "shell" || l === "console") return "bash";
  if (l === "json" || l === "jsonc") return "json";
  if (l === "ts" || l === "tsx" || l === "js" || l === "jsx" || l === "typescript" || l === "javascript") return "ts";
  if (l === "toml" || l === "yaml" || l === "yml") return "toml";
  return "plain";
}

function tokenizeLine(line: string, lang: ReturnType<typeof normalizeLang>): CodeToken[] {
  if (lang === "plain" || !line) {
    return line ? [{ kind: "plain", value: line }] : [];
  }

  const tokens: CodeToken[] = [];
  let i = 0;

  const push = (kind: TokenKind, value: string) => {
    if (!value) return;
    const prev = tokens[tokens.length - 1];
    if (prev && prev.kind === kind) {
      prev.value += value;
    } else {
      tokens.push({ kind, value });
    }
  };

  while (i < line.length) {
    const ch = line[i];

    // Comments (# for python/bash/toml, // for ts)
    if (
      (ch === "#" && (lang === "python" || lang === "bash" || lang === "toml")) ||
      (ch === "/" && line[i + 1] === "/" && lang === "ts")
    ) {
      push("comment", line.slice(i));
      break;
    }

    // Strings ("..." or '...')
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === "\\" && j + 1 < line.length) {
          j += 2;
          continue;
        }
        if (line[j] === quote) {
          j += 1;
          break;
        }
        j += 1;
      }
      const raw = line.slice(i, j);
      if (lang === "json" && line.slice(j).trimStart().startsWith(":")) {
        push("key", raw);
      } else {
        push("string", raw);
      }
      i = j;
      continue;
    }

    // CLI flags (--foo, -o) in bash
    if (lang === "bash" && ch === "-" && (i === 0 || /\s/.test(line[i - 1]))) {
      const m = line.slice(i).match(/^--?[a-zA-Z0-9][a-zA-Z0-9_-]*/);
      if (m) {
        push("flag", m[0]);
        i += m[0].length;
        continue;
      }
    }

    // Environment variables ($VAR) in bash
    if (lang === "bash" && ch === "$") {
      const m = line.slice(i).match(/^\$[A-Za-z_][A-Za-z0-9_]*/);
      if (m) {
        push("builtin", m[0]);
        i += m[0].length;
        continue;
      }
    }

    // Numbers
    if (/[0-9]/.test(ch) && (i === 0 || !/[A-Za-z0-9_]/.test(line[i - 1]))) {
      const m = line.slice(i).match(/^\d+(?:\.\d+)?/);
      if (m) {
        push("number", m[0]);
        i += m[0].length;
        continue;
      }
    }

    // Identifiers / keywords
    if (/[A-Za-z_]/.test(ch)) {
      const m = line.slice(i).match(/^[A-Za-z_][A-Za-z0-9_-]*/);
      if (m) {
        const word = m[0];
        const nextChar = line[i + word.length];
        if (lang === "python") {
          if (PY_KEYWORDS.has(word)) push("keyword", word);
          else if (PY_BUILTINS.has(word)) push("builtin", word);
          else if (/^[A-Z][A-Za-z0-9_]*$/.test(word)) push("type", word);
          else if (nextChar === "(") push("fn", word);
          else if (nextChar === "=" && line[i + word.length + 1] !== "=") push("flag", word);
          else push("plain", word);
        } else if (lang === "bash") {
          if (SH_KEYWORDS.has(word)) push("keyword", word);
          else if (SH_COMMANDS.has(word)) push("builtin", word);
          else if (/^[A-Z_][A-Z0-9_]{2,}$/.test(word)) push("type", word);
          else push("plain", word);
        } else if (lang === "json") {
          if (word === "true" || word === "false" || word === "null") push("builtin", word);
          else push("plain", word);
        } else if (lang === "ts") {
          if (TS_KEYWORDS.has(word)) push("keyword", word);
          else if (/^[A-Z][A-Za-z0-9_]*$/.test(word)) push("type", word);
          else if (nextChar === "(") push("fn", word);
          else push("plain", word);
        } else if (lang === "toml") {
          if (word === "true" || word === "false") push("builtin", word);
          else if (line.slice(i + word.length).trimStart().startsWith("=")) push("key", word);
          else push("plain", word);
        } else {
          push("plain", word);
        }
        i += word.length;
        continue;
      }
    }

    // Punctuation
    if (/[()[\]{}.,:=+\-*/<>|&!]/.test(ch)) {
      push("punct", ch);
      i += 1;
      continue;
    }

    push("plain", ch);
    i += 1;
  }

  return tokens;
}

export function highlightCode(code: string, lang: string): CodeToken[][] {
  const norm = normalizeLang(lang);
  return code.split("\n").map((line) => tokenizeLine(line, norm));
}
