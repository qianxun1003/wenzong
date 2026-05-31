"use client";

import { useState } from "react";
import { LayoutGrid, Layers, MapPinned } from "lucide-react";
import { BackToMapHubLink } from "@/components/map/back-to-map-hub-link";
import { MapFeatureSection } from "@/components/map/map-feature-section";
import { MapLayerPanel } from "@/components/map/map-layer-panel";
import { MapPageShell } from "@/components/map/map-page-shell";
import { MapPageTitle } from "@/components/map/map-page-title";
import { MapPuzzleEntry } from "@/components/map/map-puzzle-entry";
import { JapanRegionPanel } from "@/components/map/japan-region-panel";
import { MAP_LAYER_OPTIONS, type JapanRegionId, type MapLayerMode } from "@/lib/map-config";

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
            <MapLayerPanel
              kind="japan"
              layerMode={layerMode}
              onLayerModeChange={setLayerMode}
            />
            <MapPuzzleEntry label="开始日本地图拼图" mode="japan" />
          </MapFeatureSection>

          <MapFeatureSection
            step={2}
            title="区域探索"
            subtitle="左侧选择地方或都道府县，地图将聚焦到对应位置"
            icon={LayoutGrid}
          >
            <p className="mb-6 text-sm text-muted-foreground">
              左侧选择地方或都道府县，地图将聚焦到对应位置。知识点内容将在教师后台录入后显示。
            </p>
            <JapanRegionPanel
              selectedId={selectedRegionId}
              onSelect={setSelectedRegionId}
              layerMode={layerMode}
              layerLabel={activeLayerLabel}
            />
          </MapFeatureSection>
        </div>
      </div>
    </MapPageShell>
  );
}
