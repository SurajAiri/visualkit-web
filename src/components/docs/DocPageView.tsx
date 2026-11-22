import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { DocPageData } from "@/lib/docs";
import { docHref } from "@/lib/docs";
import GithubLink from "@/components/ui/GithubLink";
import MarkdownView from "./MarkdownView";
import HashScroll from "./HashScroll";

export default function DocPageView({ doc }: { doc: DocPageData }) {
  const editPath = `/blob/main/docs/${doc.meta.file}`;

  return (
    <article>
      <HashScroll />
      <span className="docs-kicker">{doc.meta.section}</span>
      <MarkdownView blocks={doc.parsed.blocks} />

      <div className="docs-page-meta">
        <GithubLink path={editPath} className="docs-edit-link">
          <span>Edit this page on GitHub</span>
          <ArrowUpRight size={14} aria-hidden />
        </GithubLink>
      </div>

      <nav className="docs-pager" aria-label="Pagination">
        {doc.prev ? (
          <Link href={docHref(doc.prev.slug)} className="docs-pager-card">
            <span className="docs-pager-label">← Previous</span>
            <span className="docs-pager-title">{doc.prev.title}</span>
          </Link>
        ) : (
          <div />
        )}
        {doc.next ? (
          <Link href={docHref(doc.next.slug)} className="docs-pager-card is-next">
            <span className="docs-pager-label">Next →</span>
            <span className="docs-pager-title">{doc.next.title}</span>
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </article>
  );
}
