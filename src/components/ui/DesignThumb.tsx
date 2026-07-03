"use client";

import { useMemo } from "react";
import { DesignSnapshot } from "@/lib/store";
import { mockupDataUrl } from "@/lib/mockup";
import { ViewKey } from "@/lib/garments";

export function DesignThumb({
  design,
  view,
  className = "",
}: {
  design: DesignSnapshot;
  view?: ViewKey;
  className?: string;
}) {
  const src = useMemo(() => mockupDataUrl(design, view), [design, view]);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={design.name}
      className={`h-full w-full object-contain ${className}`}
    />
  );
}
