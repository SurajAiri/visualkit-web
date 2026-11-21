"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Menu, Search, X } from "lucide-react";
import Logo from "@/components/layout/Logo";
import Footer from "@/components/layout/Footer";
import type { DocNavSection, SearchDocEntry } from "@/lib/docs";
import type { TocItem } from "@/lib/markdown";
import { GITHUB_URL } from "@/lib/site";

function docHref(slug: string): string {
  return slug ? `/docs/${slug}` : "/docs";
}

export default function DocsShell({
  sections,
  searchIndex,
  toc,
  children,
}: {
  sections: DocNavSection[];
  searchIndex: SearchDocEntry[];
  toc: TocItem[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string>("");

  // Cmd/Ctrl + K search shortcut + Escape handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
        setSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Scroll spy for right-side TOC
  useEffect(() => {
    if (toc.length === 0) return;
    const els = toc
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [toc]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return searchIndex.slice(0, 8);
    return searchIndex
      .filter(
        (entry) =>
          entry.title.toLowerCase().includes(q) ||
          entry.section.toLowerCase().includes(q) ||
          entry.description.toLowerCase().includes(q) ||
          entry.headings.some((h) => h.text.toLowerCase().includes(q)) ||
          entry.plainText.toLowerCase().includes(q),
      )
      .slice(0, 10);
  }, [query, searchIndex]);

  return (
    <div className="docs-shell">
      <header className="docs-header">
        <div className="docs-header-left">
          <button
            type="button"
            className="docs-menu-btn"
            aria-label={sidebarOpen ? "Close docs navigation" : "Open docs navigation"}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((v) => !v)}
          >
            {sidebarOpen ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
          </button>
          <Logo href="/" label="VisualKit home" />
          <Link href="/docs" className="docs-badge">
            Docs
          </Link>
        </div>

        <div className="docs-header-right">
          <button
            type="button"
            className="docs-search-btn"
            onClick={() => setSearchOpen(true)}
            aria-label="Search documentation"
          >
            <Search size={14} aria-hidden />
            <span>Search docs</span>
            <kbd className="docs-kbd">⌘K</kbd>
          </button>
          <Link href="/" className="docs-header-link is-desktop-only">
            <ArrowLeft size={14} aria-hidden />
            <span>Home</span>
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="docs-header-link is-desktop-only"
          >
            <span>GitHub</span>
            <ArrowUpRight size={14} aria-hidden />
          </a>
        </div>
      </header>

      <div className="docs-grid">
        {sidebarOpen ? (
          <div className="docs-sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-hidden />
        ) : null}

        <aside className={`docs-sidebar${sidebarOpen ? " is-open" : ""}`} aria-label="Documentation navigation">
          {sections.map((section) => (
            <div key={section.title} className="docs-nav-group">
              <div className="docs-nav-group-title">{section.title}</div>
              <ul className="docs-nav-list">
                {section.items.map((item) => {
                  const href = docHref(item.slug);
                  const isCurrent = pathname === href;
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className="docs-nav-link"
                        aria-current={isCurrent ? "page" : undefined}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {item.shortTitle}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </aside>

        <main id="main" className="docs-main">
          {children}
        </main>

        <aside className="docs-toc" aria-label="On this page">
          {toc.length > 0 ? (
            <>
              <div className="docs-toc-title">On this page</div>
              <ul className="docs-toc-list">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={`docs-toc-link${item.level === 3 ? " is-sub" : ""}${activeId === item.id ? " is-active" : ""}`}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </aside>
      </div>

      <Footer home />

      {searchOpen ? (
        <div className="docs-modal-backdrop" onClick={() => setSearchOpen(false)}>
          <div
            className="docs-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Search VisualKit documentation"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="docs-modal-input-row">
              <Search size={16} aria-hidden />
              <input
                type="search"
                className="docs-modal-input"
                placeholder="Search docs, CLI commands, Fusion nodes, actors…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                className="docs-kbd"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
              >
                ESC
              </button>
            </div>
            <div className="docs-modal-results">
              {results.length === 0 ? (
                <div className="docs-search-empty">No matching docs for &ldquo;{query}&rdquo;.</div>
              ) : (
                results.map((hit) => (
                  <Link
                    key={hit.href}
                    href={hit.href}
                    className="docs-search-hit"
                    onClick={() => {
                      setSearchOpen(false);
                      setQuery("");
                    }}
                  >
                    <div className="docs-search-hit-top">
                      <span className="docs-search-hit-title">{hit.title}</span>
                      <span className="docs-search-hit-sec">{hit.section}</span>
                    </div>
                    {hit.description ? (
                      <span className="docs-search-hit-desc">{hit.description}</span>
                    ) : null}
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
