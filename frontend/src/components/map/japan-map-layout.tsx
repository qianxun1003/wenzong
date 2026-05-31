"use client";

import { useState } from "react";
import { LayoutGrid, Layers, MapPinned } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BackToMapHubLink } from "@/components/map/back-to-map-hub-link";
import { MapFeatureSection } from "@/components/map/map-feature-section";
import { MapLayerSwitcher } from "@/components/map/map-layer-switcher";
import { MapPageShell } from "@/components/map/map-page-shell";
import { MapPageTitle } from "@/components/map/map-page-title";
import { MapPuzzleEntry } from "@/components/map/map-puzzle-entry";
import { JapanRegionPanel } from "@/components/map/japan-region-panel";
import { JAPAN_LEARNING_TOPICS, MAP_LAYER_OPTIONS, type JapanRegionId, type MapLayerMode } from "@/lib/map-config";

export function JapanMapLayout() {
  const [layerMode, setLayerMode] = useState<MapLayerMode>("comprehensive");
  const [selectedRegionId, setSelectedRegionId] = useState<JapanRegionId | null>(null);
  const activeLayerLabel =
    MAP_LAYER_OPTIONS.find((item) => item.id === layerMode)?.shortLabel ?? "综合";

  return (
    <MapPageShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <BackToMapHubLink className="mb-6 -ml-2" />

        <MapPageTitle
          variant="japan"
          title="日本地图"
          subtitle="八大地方区分 · 都道府县 · 拼图记忆"
          icon={MapPinned}
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
              <div className="flex min-h-[180px] items-center justify-center bg-gradient-to-br from-chart-1/15 via-background/40 to-primary/10 p-6 sm:min-h-[200px]">
                <p className="text-sm text-muted-foreground">切换图层后，下方区域地图同步更新</p>
              </div>
            </div>
            <MapPuzzleEntry label="开始日本地图拼图" />
          </MapFeatureSection>

          <MapFeatureSection
            step={2}
            title="区域板块"
            subtitle="选择地方区分，地图将聚焦到对应位置"
            icon={LayoutGrid}
          >
            <p className="mb-6 text-sm text-muted-foreground">
              覆盖 {JAPAN_LEARNING_TOPICS.slice(0, 4).join("、")} 等考点。选中地方后，点击地图上的按钮继续学习。
            </p>
            <JapanRegionPanel
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
