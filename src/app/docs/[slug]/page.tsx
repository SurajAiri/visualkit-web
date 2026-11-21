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

export default async function DocSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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
