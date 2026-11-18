import { ImageResponse } from "next/og";

export const alt = "VisualKit: A native video editor for AI agents";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const bars = [
    { h: 70, c: "#c5fb63" },
    { h: 110, c: "#92d8cd" },
    { h: 140, c: "#a580ef" },
  ];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: "#101017", color: "#f1f0f7" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
          {bars.map((b) => (
            <div key={b.c} style={{ width: 26, height: b.h, borderRadius: 8, background: b.c, transform: "skewX(-14deg)" }} />
          ))}
          <div style={{ display: "flex", fontSize: 54, fontWeight: 700, marginLeft: 20, letterSpacing: -2 }}>
            visualkit<span style={{ color: "#c5fb63" }}>.</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.02, letterSpacing: -4 }}>A native video editor</div>
          <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.02, letterSpacing: -4, color: "#a59db4" }}>for AI agents.</div>
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#a8a6b3" }}>Atomic batches · many agents, one timeline · full history</div>
      </div>
    ),
    size,
  );
}
