"use client";

import { getRegionBaseColor } from "@/lib/geo/layer-colors";
import { JAPAN_REGIONS, WORLD_REGIONS, type MapLayerMode } from "@/lib/map-config";

interface MapLayerLegendProps {
  kind: "world" | "japan";
  layerMode: MapLayerMode;
  className?: string;
}

export function MapLayerLegend({ kind, layerMode, className }: MapLayerLegendProps) {
  const regions = kind === "japan" ? JAPAN_REGIONS : WORLD_REGIONS;

  return (
    <div className={className}>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        区域图例
      </p>
      <div className="flex flex-wrap gap-x-3 gap-y-1.5">
        {regions.map((region) => (
          <div key={region.id} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: getRegionBaseColor(kind, layerMode, region.id) }}
            />
            <span className="text-[11px] text-muted-foreground">
              {kind === "japan" ? region.name.replace("地方", "") : region.name.replace("篇", "")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
