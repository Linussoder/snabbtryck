// Snabbtryck-logotyp — chevron ›› (rörelse framåt) + skevat ordmärke.
// Primär = gult på mörkt. Ljus botten = enfärg bläcksvart (aldrig gult ordmärke).
// Marken byggs av tre kvadrater (border-top + border-right, roterade 45°) med
// fade 0.45 / 0.72 / 1.0. Ordmärket är Anton med skewX(-9deg).

export function Logo({
  variant = "dark",
  size = 24,
  className = "",
}: {
  /** "dark" = på mörk yta (gul chevron, tryck-accent). "light" = enfärg bläck på ljus yta. */
  variant?: "dark" | "light";
  /** ordmärkets font-size i px; chevron skalas proportionellt. */
  size?: number;
  className?: string;
}) {
  const chev = variant === "dark" ? "#FFDA00" : "#111114";
  const snabb = variant === "dark" ? "#FAF9F5" : "#111114";
  const tryck = variant === "dark" ? "#FFDA00" : "#111114";

  const c = Math.round(size * 0.56); // chevron-kvadratens sida
  const bw = Math.max(3, Math.round(size * 0.17)); // stroke-bredd
  const fades = [0.45, 0.72, 1];

  return (
    <span
      className={`inline-flex items-center ${className}`}
      style={{ gap: Math.round(size * 0.2) }}
      aria-label="Snabbtryck"
    >
      <span className="inline-flex" style={{ gap: 1 }} aria-hidden>
        {fades.map((o, i) => (
          <i
            key={i}
            style={{
              display: "inline-block",
              width: c,
              height: c,
              borderTop: `${bw}px solid ${chev}`,
              borderRight: `${bw}px solid ${chev}`,
              transform: "rotate(45deg)",
              opacity: o,
            }}
          />
        ))}
      </span>
      <span
        style={{
          fontFamily: "var(--font-anton), 'Arial Narrow', sans-serif",
          fontSize: size,
          lineHeight: 1,
          letterSpacing: "0.01em",
          transform: "skewX(-9deg)",
          display: "inline-block",
          marginLeft: Math.round(size * 0.12),
        }}
      >
        <span style={{ color: snabb }}>Snabb</span>
        <span style={{ color: tryck }}>tryck</span>
      </span>
    </span>
  );
}
