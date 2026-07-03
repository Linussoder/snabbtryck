// Chevron-marken ›› — varumärkets "framåt"-symbol (tre skevande vinklar med fade).
// Ersätter det gamla ⊕-registreringsmärket som prominent brand-ikon.
export function ChevronMark({
  size = 16,
  color = "#FFDA00",
  className = "",
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  const bw = Math.max(2, Math.round(size * 0.28));
  return (
    <span
      className={`inline-flex ${className}`}
      style={{ gap: Math.max(1, Math.round(size * 0.06)) }}
      aria-hidden
    >
      {[0.45, 0.72, 1].map((o, i) => (
        <i
          key={i}
          style={{
            display: "inline-block",
            width: size,
            height: size,
            borderTop: `${bw}px solid ${color}`,
            borderRight: `${bw}px solid ${color}`,
            transform: "rotate(45deg)",
            opacity: o,
          }}
        />
      ))}
    </span>
  );
}
