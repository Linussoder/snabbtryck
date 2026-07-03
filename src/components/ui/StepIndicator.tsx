import { RegMark } from "./RegMark";

export function StepIndicator({
  steps,
  current,
}: {
  steps: string[];
  current: number; // 0-index
}) {
  return (
    <ol className="flex items-center gap-1 sm:gap-2 w-full">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="flex items-center gap-1 sm:gap-2 flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-display font-semibold border ${
                  active
                    ? "bg-signal text-white border-signal"
                    : done
                    ? "bg-ink text-paper border-ink"
                    : "bg-transparent text-muted border-line"
                }`}
              >
                {done ? "✓" : String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={`hidden sm:inline text-xs uppercase tracking-wide font-display ${
                  active ? "text-ink" : "text-muted"
                }`}
              >
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span
                className={`h-px flex-1 ${done ? "bg-ink" : "bg-line"}`}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export { RegMark };
