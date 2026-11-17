import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/schibsted-grotesk";
import "@fontsource-variable/martian-mono";
import "./globals.css";

const TITLE = "VisualKit: A native video editor for AI agents";

export const metadata: Metadata = {
  title: TITLE,
  description:
    "An open-source Python library where agents edit video as code: atomic batches, many agents on one timeline, full version history, and rendering with FFmpeg, DaVinci Resolve or OpenTimelineIO.",
  openGraph: {
    title: TITLE,
    description: "Agents edit video as code. Atomic, versioned, and rendered anywhere.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: "Agents edit video as code. Atomic, versioned, and rendered anywhere.",
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
