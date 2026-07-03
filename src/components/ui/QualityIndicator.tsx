import { QualityLevel, QualityResult } from "@/lib/dpi";

const CONF: Record<
  QualityLevel,
  { color: string; label: string; bg: string }
> = {
  good: { color: "var(--color-good)", label: "Skarpt", bg: "rgba(47,158,68,0.1)" },
  warn: { color: "var(--color-warn)", label: "Gränsfall", bg: "rgba(232,160,32,0.12)" },
  bad: { color: "var(--color-bad)", label: "För lågt", bg: "rgba(224,49,49,0.1)" },
};

export function QualityIndicator({
  result,
  compact = false,
}: {
  result: QualityResult;
  compact?: boolean;
}) {
  const c = CONF[result.level];
  return (
    <div
      className="rounded-[3px] border p-3"
      style={{ background: c.bg, borderColor: c.color }}
    >
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-full flex-none"
          style={{ background: c.color, boxShadow: `0 0 0 3px ${c.bg}` }}
        />
        <span
          className="font-display uppercase text-sm tracking-wide"
          style={{ color: c.color }}
        >
          {c.label}
        </span>
        <span className="spec ml-auto text-muted">
          {Math.round(result.dpi)} DPI
        </span>
      </div>
      {!compact && (
        <p className="text-[13px] leading-snug mt-1.5 text-ink/80">
          {result.message}
        </p>
      )}
    </div>
  );
}

/** Enkel prick för miniatyrer */
export function QualityDot({ level }: { level: QualityLevel }) {
  return (
    <span
      className="h-2.5 w-2.5 rounded-full inline-block"
      style={{ background: CONF[level].color }}
      title={CONF[level].label}
    />
  );
}
