// Registreringsmärke ⊕ — varumärkets återkommande tryck-token.
export function RegMark({
  size = 16,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`reg-mark ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span className="reg-ring" />
    </span>
  );
}
