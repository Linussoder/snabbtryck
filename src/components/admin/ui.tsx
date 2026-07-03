"use client";

import type { OrderStatus } from "@/lib/account";

const STATUS_STYLE: Record<OrderStatus, string> = {
  Mottagen: "border-warn text-warn",
  "I tryck": "border-cyan text-cyan",
  Skickad: "border-signal text-signal",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`spec rounded-full border px-2 py-0.5 text-[10px] uppercase ${STATUS_STYLE[status] ?? "border-line text-muted"}`}>
      {status}
    </span>
  );
}

export function Kpi({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="card p-4">
      <p className="eyebrow text-muted">{label}</p>
      <p className={`mt-1 font-display text-2xl ${accent ? "text-signal" : ""}`}>{value}</p>
      {sub && <p className="spec mt-0.5 text-[11px] text-muted">{sub}</p>}
    </div>
  );
}

/** Liten area-sparkline (inline SVG). */
export function Sparkline({ data, w = 240, h = 48 }: { data: number[]; w?: number; h?: number }) {
  if (data.length < 2) return <div className="h-12" />;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 6) - 3]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" aria-hidden>
      <path d={area} fill="var(--color-signal)" opacity="0.12" />
      <path d={line} fill="none" stroke="var(--color-signal)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r="2.6" fill="var(--color-signal)" />
    </svg>
  );
}
