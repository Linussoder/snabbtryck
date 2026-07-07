"use client";

import { DesignSnapshot } from "@/lib/store";
import { GarmentPreview } from "@/components/ui/GarmentPreview";
import { ViewKey } from "@/lib/garments";

/**
 * Miniatyr av en design. Renderar samma riktiga plaggfoto + element som
 * editorn (via GarmentPreview) så bilden matchar det kunden designade.
 * Anroparen placerar den i en kvadratisk box.
 */
export function DesignThumb({
  design,
  view,
  className = "",
}: {
  design: DesignSnapshot;
  view?: ViewKey;
  className?: string;
}) {
  return <GarmentPreview design={design} view={view} className={className} />;
}
