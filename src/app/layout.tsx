import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/schibsted-grotesk";
import "@fontsource-variable/martian-mono";
import "./globals.css";

const TITLE = "VisualKit — The agent-first video editing library";

export const metadata: Metadata = {
  title: TITLE,
  description:
    "A backend-neutral video editing library for AI agents. Describe edits in code, collaborate on timelines, and render with FFmpeg, DaVinci Resolve, or OpenTimelineIO.",
  openGraph: {
    title: TITLE,
    description: "Give agents the whole timeline. A shared, validated editing model that renders anywhere.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: "Give agents the whole timeline. A shared, validated editing model that renders anywhere.",
  },
};

export const viewport: Viewport = {
  themeColor: "#101017",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
