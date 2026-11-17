"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Logo from "./Logo";
import { DOCS_URL } from "@/lib/site";

const LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#benefits", label: "Benefits" },
  { href: "#history", label: "History" },
  { href: "#claimed-region", label: "Claimed regions" },
  { href: "#backends", label: "Backends" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [active, setActive] = useState("");
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setStuck(window.scrollY > 12);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.current?.style.setProperty("--progress", String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const els = LINKS.map((l) => document.querySelector(l.href)).filter(Boolean) as Element[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive("#" + e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header ref={bar} className={"site-nav" + (stuck ? " is-stuck" : "") + (open ? " is-open" : "")}>
      <a className="skip-link" href="#main">Skip to content</a>
      <Logo />
      <button
        className="mobile-menu"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="primary-nav"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
      </button>
      <nav id="primary-nav" className="nav-links" aria-label="Primary">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} aria-current={active === l.href ? "true" : undefined} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
        <a className="nav-cta" href={DOCS_URL} target="_blank" rel="noreferrer">
          Read the docs <ArrowUpRight size={15} aria-hidden />
        </a>
      </nav>
    </header>
  );
}
