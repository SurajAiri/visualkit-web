import Link from "next/link";
import Logo from "./Logo";

/* `home` points the logo and the "back" link at "/" instead of #top, for pages that are not the landing page. */
export default function Footer({ home = false }: { home?: boolean }) {
  return (
    <footer className="site-footer">
      <Logo href={home ? "/" : "#top"} label={home ? "VisualKit home" : undefined} />
      <span>THE AGENT-FIRST VIDEO EDITING LIBRARY</span>
      {home ? <Link href="/">Back to the beginning ↑</Link> : <a href="#top">Back to the beginning ↑</a>}
      <span className="footer-year">BUILT FOR THE NEXT CUT.</span>
    </footer>
  );
}
