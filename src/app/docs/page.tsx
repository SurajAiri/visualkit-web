import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DocsShell from "@/components/docs/DocsShell";
import DocPageView from "@/components/docs/DocPageView";
import { DOC_SECTIONS, getDocBySlug, getDocsSearchIndex } from "@/lib/docs";

export const metadata: Metadata = {
  title: "Documentation · VisualKit",
  description:
    "Official VisualKit documentation: versioned SQLite timelines, exact rational clocks, Fusion node graphs, local actors, Director's Cut, and CLI reference.",
};

export default function DocsIndexPage() {
  const doc = getDocBySlug("");
  if (!doc) notFound();
  const searchIndex = getDocsSearchIndex();

  return (
    <DocsShell sections={DOC_SECTIONS} searchIndex={searchIndex} toc={doc.parsed.toc}>
      <DocPageView doc={doc} />
    </DocsShell>
  );
}
