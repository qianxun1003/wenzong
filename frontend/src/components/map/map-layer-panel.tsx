"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { GeoMapCanvas } from "@/components/map/geo-map-canvas";
import { MapLayerLegend } from "@/components/map/map-layer-legend";
import { MapRegionSidebar } from "@/components/map/map-region-sidebar";
import { MAP_LAYER_OPTIONS, type MapLayerMode } from "@/lib/map-config";
import { cn } from "@/lib/utils";

interface MapLayerPanelProps {
  kind: "world" | "japan";
  layerMode: MapLayerMode;
  onLayerModeChange: (mode: MapLayerMode) => void;
}

export function MapLayerPanel({ kind, layerMode, onLayerModeChange }: MapLayerPanelProps) {
  const activeLayer = MAP_LAYER_OPTIONS.find((item) => item.id === layerMode);

  const sidebarItems = useMemo(
    () =>
      MAP_LAYER_OPTIONS.map((option) => ({
        id: option.id,
        label: option.label,
        subtitle: option.description,
        keywords: [option.shortLabel, option.description],
      })),
    []
  );

  const isJapan = kind === "japan";

  return (
    <div className="map-explorer-panel map-sub-panel">
      <div className="flex items-center justify-between border-b border-border/50 bg-background/50 px-3 py-2 sm:px-4">
        <p className="text-xs text-muted-foreground">
          {activeLayer ? `当前：${activeLayer.label}` : "选择图层维度"}
        </p>
        <Badge variant="outline" className="h-6 bg-background/60 text-[10px]">
          {activeLayer?.shortLabel ?? "综合"}视图
        </Badge>
      </div>

      <div
        className={cn(
          isJapan
            ? "map-explorer-body map-explorer-body-japan"
            : "map-explorer-body map-explorer-body-aligned map-explorer-body-tall"
        )}
      >
        <MapRegionSidebar
          items={sidebarItems}
          selectedId={layerMode}
          onSelect={(id) => onLayerModeChange(id as MapLayerMode)}
          searchPlaceholder="搜索图层维度…"
          compact={!isJapan}
          className={cn(
            "map-explorer-sidebar",
            isJapan && "map-explorer-sidebar-japan"
          )}
        />

        {isJapan ? (
          <div className="map-explorer-main map-explorer-main-japan flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="map-explorer-map map-explorer-map-japan relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-chart-1/15 via-background/40 to-primary/10">
              <GeoMapCanvas
                kind="japan"
                layerMode={layerMode}
                selectedRegionId={null}
                interactive={false}
                fitToSelection={false}
                fitPadding={20}
                showLabels={false}
                ariaLabel={`${activeLayer?.label ?? "地图"}预览`}
                className="h-full w-full"
              />
            </div>
          </div>
        ) : (
          <div className="map-explorer-main map-explorer-main-fill">
            <div className="map-explorer-map map-explorer-map-fill relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-chart-1/10 via-background/30 to-primary/10">
              <GeoMapCanvas
                kind="world"
                layerMode={layerMode}
                selectedRegionId={null}
                interactive={false}
                fitPadding={18}
                ariaLabel={`${activeLayer?.label ?? "地图"}预览`}
                className="h-full max-h-full w-full max-w-full"
              />
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border/50 bg-background/40 px-4 py-3 sm:px-5">
        <MapLayerLegend kind={kind} layerMode={layerMode} />
      </div>
    </div>
  );
}
