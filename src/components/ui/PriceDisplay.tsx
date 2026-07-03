"use client";

import { useEffect, useRef, useState } from "react";
import { kr } from "@/lib/format";

export function PriceDisplay({
  value,
  size = "lg",
  className = "",
}: {
  value: number;
  size?: "sm" | "lg" | "xl";
  className?: string;
}) {
  const [flash, setFlash] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current !== value) {
      setFlash(true);
      prev.current = value;
      const t = setTimeout(() => setFlash(false), 600);
      return () => clearTimeout(t);
    }
  }, [value]);

  const sz =
    size === "xl"
      ? "text-5xl md:text-6xl"
      : size === "lg"
      ? "text-3xl"
      : "text-xl";

  return (
    <span
      key={value}
      className={`font-display font-bold tabular-nums leading-none price-pop ${sz} ${
        flash ? "flash-signal" : ""
      } ${className}`}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {kr(value)}
    </span>
  );
}
