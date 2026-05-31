"use client";

import { GeoMapCanvas } from "@/components/map/geo-map-canvas";
import { MapLayerLegend } from "@/components/map/map-layer-legend";
import { MAP_LAYER_OPTIONS, type MapLayerMode } from "@/lib/map-config";

interface MapLayerPreviewProps {
  kind: "world" | "japan";
  layerMode: MapLayerMode;
}

export function MapLayerPreview({ kind, layerMode }: MapLayerPreviewProps) {
  const layerOption = MAP_LAYER_OPTIONS.find((item) => item.id === layerMode);

  return (
    <div className="map-sub-panel mt-6">
      <div className="flex items-center justify-between border-b border-border/50 bg-background/50 px-4 py-3 sm:px-5">
        <div>
          <p className="text-sm font-medium text-foreground">图层预览</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{layerOption?.description}</p>
        </div>
      </div>
      <div
        className={
          kind === "japan"
            ? "relative h-[340px] overflow-hidden bg-gradient-to-br from-chart-1/15 via-background/40 to-primary/10 sm:h-[400px]"
            : "relative h-[200px] overflow-hidden bg-gradient-to-br from-chart-4/20 via-background/40 to-chart-2/20 sm:h-[220px]"
        }
      >
        <GeoMapCanvas
          kind={kind}
          layerMode={layerMode}
          selectedRegionId={null}
          interactive={false}
          fitToSelection={kind !== "japan"}
          ariaLabel={`${layerOption?.label ?? "地图"}预览`}
          className={kind === "japan" ? "h-full w-full" : undefined}
        />
      </div>
      <div className="border-t border-border/50 bg-background/40 px-4 py-3 sm:px-5">
        <MapLayerLegend kind={kind} layerMode={layerMode} />
      </div>
    </div>
  );
}
