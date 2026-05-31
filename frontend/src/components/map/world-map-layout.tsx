"use client";

import { useState } from "react";
import { Globe2, Layers, LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BackToMapHubLink } from "@/components/map/back-to-map-hub-link";
import { MapFeatureSection } from "@/components/map/map-feature-section";
import { MapLayerSwitcher } from "@/components/map/map-layer-switcher";
import { MapPageShell } from "@/components/map/map-page-shell";
import { MapPageTitle } from "@/components/map/map-page-title";
import { MapPuzzleEntry } from "@/components/map/map-puzzle-entry";
import { WorldRegionPanel } from "@/components/map/world-region-panel";
import { COUNTRY_PROFILE_SECTIONS, MAP_LAYER_OPTIONS, type MapLayerMode, type WorldRegionId } from "@/lib/map-config";

export function WorldMapLayout() {
  const [layerMode, setLayerMode] = useState<MapLayerMode>("comprehensive");
  const [selectedRegionId, setSelectedRegionId] = useState<WorldRegionId | null>(null);
  const activeLayerLabel =
    MAP_LAYER_OPTIONS.find((item) => item.id === layerMode)?.shortLabel ?? "综合";

  return (
    <MapPageShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <BackToMapHubLink className="mb-6 -ml-2" />

        <MapPageTitle
          variant="world"
          title="世界地图"
          subtitle="八大区域板块 · 国家画像 · 地图图层"
          icon={Globe2}
          className="mb-10"
        />

        <div className="space-y-8">
          <MapFeatureSection
            step={1}
            title="地图图层"
            subtitle="选择一种视图，地图将以对应维度展示信息"
            icon={Layers}
          >
            <MapLayerSwitcher value={layerMode} onChange={setLayerMode} />
            <div className="map-sub-panel mt-6">
              <div className="flex items-center justify-between border-b border-border/50 bg-background/50 px-4 py-3 sm:px-5">
                <p className="text-sm font-medium text-foreground">图层预览</p>
                <Badge variant="outline" className="bg-background/60">
                  {activeLayerLabel}视图
                </Badge>
              </div>
              <div className="flex min-h-[180px] items-center justify-center bg-gradient-to-br from-chart-4/20 via-background/40 to-chart-2/20 p-6 sm:min-h-[200px]">
                <p className="text-sm text-muted-foreground">切换图层后，下方区域地图同步更新</p>
              </div>
            </div>
            <MapPuzzleEntry label="开始世界地图拼图" />
          </MapFeatureSection>

          <MapFeatureSection
            step={2}
            title="区域板块"
            subtitle="选择区域篇章，地图将聚焦到对应位置"
            icon={LayoutGrid}
          >
            <p className="mb-6 text-sm text-muted-foreground">
              国家画像含 {COUNTRY_PROFILE_SECTIONS.slice(0, 4).join("、")} 等模块。选中区域后，点击地图上的按钮继续学习。
            </p>
            <WorldRegionPanel
              selectedId={selectedRegionId}
              onSelect={setSelectedRegionId}
              layerLabel={activeLayerLabel}
            />
          </MapFeatureSection>
        </div>
      </div>
    </MapPageShell>
  );
}
