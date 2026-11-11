import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/schibsted-grotesk";
import "@fontsource-variable/martian-mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "VisualKit: safe video editing for AI agents",
  description:
    "VisualKit lets AI agents edit video as validated, versioned data. Every run is atomic and recorded, any state can be restored, and many agents can work on one timeline.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
