"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { GeoMapCanvas } from "@/components/map/geo-map-canvas";
import { MapPanZoomViewport } from "@/components/map/map-pan-zoom-viewport";
import { MapRegionSidebar } from "@/components/map/map-region-sidebar";
import { buildWorldSidebarItems, toWorldRegionId } from "@/lib/map-sidebar-items";
import { WORLD_REGIONS, type MapLayerMode, type WorldRegionId } from "@/lib/map-config";
import { cn } from "@/lib/utils";

interface WorldRegionPanelProps {
  selectedId: WorldRegionId | null;
  onSelect: (id: WorldRegionId) => void;
  layerMode: MapLayerMode;
  layerLabel: string;
}

export function WorldRegionPanel({ selectedId, onSelect, layerMode, layerLabel }: WorldRegionPanelProps) {
  const selectedRegion = WORLD_REGIONS.find((r) => r.id === selectedId);
  const sidebarItems = buildWorldSidebarItems();

  const handleRegionSelect = (regionId: WorldRegionId) => {
    onSelect(regionId);
  };

  return (
    <div className="map-explorer-panel map-sub-panel">
      <div className="flex items-center justify-between border-b border-border/50 bg-background/50 px-3 py-2 sm:px-4">
        <p className="text-xs text-muted-foreground">
          {selectedRegion ? `已选 ${selectedRegion.name}` : "选择篇章"}
        </p>
        <Badge variant="outline" className="h-6 bg-background/60 text-[10px]">
          {layerLabel}
        </Badge>
      </div>

      <div className="map-explorer-body map-explorer-body-aligned map-explorer-body-tall">
        <MapRegionSidebar
          items={sidebarItems}
          selectedId={selectedId}
          onSelect={(id) => {
            const regionId = toWorldRegionId(id);
            if (regionId) handleRegionSelect(regionId);
          }}
          searchPlaceholder="搜索篇章、国家…"
          compact
          className="map-explorer-sidebar"
        />

        <div className="map-explorer-main map-explorer-main-fill">
          <div className="map-explorer-map map-explorer-map-fill relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-chart-1/10 via-background/30 to-primary/10">
            <MapPanZoomViewport resetKey={selectedId} className="h-full w-full">
              <GeoMapCanvas
                kind="world"
                layerMode={layerMode}
                selectedRegionId={selectedId}
                onSelect={(id) => handleRegionSelect(id as WorldRegionId)}
                fitPadding={18}
                ariaLabel="世界区域地图"
                className="h-full max-h-full w-full max-w-full"
              />
            </MapPanZoomViewport>

            {selectedRegion && (
              <div className="absolute inset-x-0 bottom-3 flex justify-center px-4">
                <Link
                  href={`/map/world/${selectedRegion.id}`}
                  className={cn(buttonVariants({ size: "sm" }), "gap-1.5 gradient-academy shadow-md")}
                >
                  进入{selectedRegion.name}学习
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
