import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DocsShell from "@/components/docs/DocsShell";
import DocPageView from "@/components/docs/DocPageView";
import { DOC_SECTIONS, getAllDocSlugs, getDocBySlug, getDocsSearchIndex } from "@/lib/docs";

export function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) {
    return { title: "Not Found · VisualKit Docs" };
  }
  return {
    title: `${doc.parsed.title} · VisualKit Docs`,
    description: doc.parsed.description || `VisualKit documentation: ${doc.parsed.title}`,
  };
}

async function DocSlugContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) notFound();
  const searchIndex = getDocsSearchIndex();

  return (
    <DocsShell sections={DOC_SECTIONS} searchIndex={searchIndex} toc={doc.parsed.toc}>
      <DocPageView doc={doc} />
    </DocsShell>
  );
}

function DocsLoadingShell() {
  const searchIndex = getDocsSearchIndex();
  return (
    <DocsShell sections={DOC_SECTIONS} searchIndex={searchIndex} toc={[]}>
      <div className="docs-skeleton" aria-busy="true" aria-label="Loading documentation">
        <div className="docs-skel-kicker" />
        <div className="docs-skel-title" />
        <div className="docs-skel-line" />
        <div className="docs-skel-line is-short" />
      </div>
    </DocsShell>
  );
}

export default function DocSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<DocsLoadingShell />}>
      <DocSlugContent params={params} />
    </Suspense>
  );
}
