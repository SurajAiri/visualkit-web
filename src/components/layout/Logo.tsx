import Link from "next/link";

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={"brand-mark " + className} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

/* On the landing page the logo scrolls to #top. Pages outside it (e.g. the 404) pass href="/". */
export default function Logo({
  href = "#top",
  label = "VisualKit, back to top",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <Link className="brand" href={href} aria-label={label}>
      <BrandMark />
      visualkit<span className="brand-period">.</span>
    </Link>
  );
}
