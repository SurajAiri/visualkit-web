import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="site-footer">
      <Logo />
      <span>THE AGENT-FIRST VIDEO EDITING LIBRARY</span>
      <a href="#top">Back to the beginning ↑</a>
      <span className="footer-year">BUILT FOR THE NEXT CUT.</span>
    </footer>
  );
}
