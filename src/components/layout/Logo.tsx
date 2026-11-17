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

export default function Logo() {
  return (
    <Link className="brand" href="#top" aria-label="VisualKit, back to top">
      <BrandMark />
      visualkit<span className="brand-period">.</span>
    </Link>
  );
}
