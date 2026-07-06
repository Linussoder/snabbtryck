import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111114",
        }}
      >
        <div style={{ display: "flex", gap: 4 }}>
          {[0.5, 0.75, 1].map((o, i) => (
            <div
              key={i}
              style={{
                width: 28,
                height: 28,
                borderTop: "9px solid #FFDA00",
                borderRight: "9px solid #FFDA00",
                transform: "rotate(45deg)",
                opacity: o,
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
