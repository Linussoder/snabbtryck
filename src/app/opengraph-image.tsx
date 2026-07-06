import { ImageResponse } from "next/og";

export const alt = "Snabbtryck – Designa din egen tröja med DTF-tryck";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function Chevrons({ s = 30, color = "#FFDA00" }: { s?: number; color?: string }) {
  const bw = Math.round(s * 0.3);
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[0.45, 0.72, 1].map((o, i) => (
        <div
          key={i}
          style={{
            width: s,
            height: s,
            borderTop: `${bw}px solid ${color}`,
            borderRight: `${bw}px solid ${color}`,
            transform: "rotate(45deg)",
            opacity: o,
          }}
        />
      ))}
    </div>
  );
}

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#111114",
          color: "#FAF9F5",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <Chevrons />
          <div style={{ display: "flex", marginLeft: 18, fontSize: 46, fontWeight: 800, letterSpacing: -1 }}>
            <span>Snabb</span>
            <span style={{ color: "#FFDA00" }}>tryck</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 900, lineHeight: 1.0, letterSpacing: -3 }}>
            Designa din egen tröja
          </div>
          <div style={{ display: "flex", marginTop: 26, fontSize: 34, color: "#c9c9c2" }}>
            DTF-tryck i full färg · från 1 plagg · skickat inom 48 h
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              background: "#FFDA00",
              color: "#111114",
              fontSize: 28,
              fontWeight: 800,
              padding: "14px 30px",
              borderRadius: 100,
            }}
          >
            www.snabbtryck.se
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
