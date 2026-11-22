import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { preload } from "react-dom";
import "@fontsource-variable/schibsted-grotesk";
import "@fontsource-variable/martian-mono";
import sansLatin from "@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2";
import monoLatin from "@fontsource-variable/martian-mono/files/martian-mono-latin-wght-normal.woff2";
import "./globals.css";
import Clarity from "@/components/analytics/Clarity";
import ConsentBanner from "@/components/analytics/ConsentBanner";

const TITLE = "VisualKit: A native video editor for AI agents";
// Set NEXT_PUBLIC_SITE_URL (e.g. https://visualkit.dev) so share-image URLs are absolute. Vercel's production URL is used if present.
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);

export const metadata: Metadata = {
  ...(SITE ? { metadataBase: new URL(SITE) } : {}),
  title: TITLE,
  description:
    "An open-source Python library where agents edit video as code: atomic batches, many agents on one timeline, full version history, and rendering with FFmpeg, DaVinci Resolve or OpenTimelineIO.",
  openGraph: {
    title: TITLE,
    description: "Agents edit video as code. Atomic, versioned, and rendered anywhere.",
    type: "website",
    siteName: "VisualKit",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: "Agents edit video as code. Atomic, versioned, and rendered anywhere.",
  },
};

export const viewport: Viewport = {
  themeColor: "#101017",
  colorScheme: "dark",
};

// Turbopack hands back either a URL string or a { src } object for asset imports.
const assetUrl = (a: string | { src: string }) => (typeof a === "string" ? a : a.src);

export default function RootLayout({ children }: { children: ReactNode }) {
  // Resource hint, hoisted into <head> by React: load the two latin font files without waiting for the CSS.
  // (The hero poster and CDN connection are hinted from Hero.tsx, so the 404 page does not download them.)
  preload(assetUrl(sansLatin), { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  preload(assetUrl(monoLatin), { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        {children}
        <ConsentBanner />
        <Clarity />
      </body>
    </html>
  );
}
