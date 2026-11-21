import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Undo2 } from "lucide-react";
import Logo from "@/components/layout/Logo";
import Footer from "@/components/layout/Footer";
import MissingPath from "./MissingPath";
import { DOCS_URL } from "@/lib/site";
import { wave } from "@/lib/wave";
import "./not-found.css";

/* A 15 s timeline with a hole in it. a / b are percentages of the lane.
   The gap (17% → 42%) and the playhead (00:04:04 = 27.56%) are mirrored in not-found.css. */
type Tone = "violet" | "teal" | "blue" | "sage" | "orange" | "pink";
type Clip = { name: string; a: number; b: number; tone: Tone };

const V2: Clip[] = [
  { name: "title", a: 3, b: 13, tone: "orange" },
  { name: "claims", a: 47, b: 67, tone: "pink" },
  { name: "install", a: 75, b: 96, tone: "violet" },
];
const V1: Clip[] = [
  { name: "hero", a: 0, b: 17, tone: "violet" },
  { name: "benefits", a: 42, b: 63, tone: "teal" },
  { name: "history", a: 63, b: 82, tone: "blue" },
  { name: "faq", a: 82, b: 100, tone: "sage" },
];
const A1 = [
  { a: 0, b: 17, bars: 16, seed: 2 },
  { a: 42, b: 100, bars: 54, seed: 7 },
];

const span = (a: number, b: number) => ({ left: a + "%", width: b - a + "%" });

function Lane({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="nf-lane">
      <span className="nf-track">{label}</span>
      {children}
    </div>
  );
}

function Clips({ clips }: { clips: Clip[] }) {
  return (
    <>
      {clips.map((c) => (
        <div key={c.name} className="nf-clip" data-tone={c.tone} style={span(c.a, c.b)}>
          <div>
            <span>{c.name}</span>
          </div>
        </div>
      ))}
    </>
  );
}

export default function NotFoundPage() {
  return (
    <>
      <header className="site-nav nf-nav">
        <a className="skip-link" href="#main">Skip to content</a>
        <Logo href="/" label="VisualKit home" />
      </header>

      <main id="main" className="nf" tabIndex={-1}>
        <div className="nf-grid" aria-hidden="true" />

        <div className="nf-copy">
          <span className="section-kicker">Error 404</span>
          <h1>This page didn’t make the cut.</h1>
          <p>
            We couldn’t find anything at <MissingPath />. The link may be old or mistyped. Everything on VisualKit lives on
            the home page.
          </p>
          <div className="nf-cta">
            <Link className="button-primary" href="/">
              Back to home <Undo2 size={16} aria-hidden />
            </Link>
            <Link className="button-text" href={DOCS_URL}>
              Read the docs <ArrowUpRight size={16} aria-hidden />
            </Link>
          </div>
        </div>

        <div
          className="nf-tl"
          role="img"
          aria-label="A video timeline with a gap in it where this page should be. The playhead is parked in the empty gap at 00:04:04."
        >
          <div className="nf-body">
            <div className="nf-ruler">
              {Array.from({ length: 15 }, (_, i) => (
                <b key={i} style={{ left: (i / 15) * 100 + "%" }}>
                  {i}s
                </b>
              ))}
            </div>

            <div className="nf-lanes">
              <Lane label="V2">
                <Clips clips={V2} />
              </Lane>
              <Lane label="V1">
                <Clips clips={V1} />
              </Lane>
              <Lane label="A1">
                {A1.map((c) => (
                  <div key={c.a} className="nf-clip" data-tone="sage" style={span(c.a, c.b)}>
                    <div>
                      <span className="nf-wave">
                        {wave(c.bars, c.seed).map((h, i) => (
                          <i key={i} style={{ height: h + "%" }} />
                        ))}
                      </span>
                    </div>
                  </div>
                ))}
              </Lane>
              <div className="nf-gap">
                <span className="nf-gap-tag">
                  404<small> no clip</small>
                </span>
              </div>
            </div>

            <div className="nf-ph">
              <span>00:04:04</span>
            </div>
          </div>
        </div>
      </main>

      <Footer home />
    </>
  );
}
