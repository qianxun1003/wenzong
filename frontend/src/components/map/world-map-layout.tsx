"use client";

import { useState } from "react";
import { Globe2, Layers, LayoutGrid } from "lucide-react";
import { BackToMapHubLink } from "@/components/map/back-to-map-hub-link";
import { MapFeatureSection } from "@/components/map/map-feature-section";
import { MapLayerPanel } from "@/components/map/map-layer-panel";
import { MapPageShell } from "@/components/map/map-page-shell";
import { MapPageTitle } from "@/components/map/map-page-title";
import { MapPuzzleEntry } from "@/components/map/map-puzzle-entry";
import { WorldRegionPanel } from "@/components/map/world-region-panel";
import { MAP_LAYER_OPTIONS, type MapLayerMode, type WorldRegionId } from "@/lib/map-config";

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
            <MapLayerPanel
              kind="world"
              layerMode={layerMode}
              onLayerModeChange={setLayerMode}
            />
            <MapPuzzleEntry label="开始世界地图拼图" mode="world" />
          </MapFeatureSection>

          <MapFeatureSection
            step={2}
            title="区域探索"
            subtitle="左侧选择区域篇章，地图聚焦后点击底部按钮进入学习"
            icon={LayoutGrid}
          >
            <p className="mb-6 text-sm text-muted-foreground">
              点击篇章后地图会聚焦，再通过底部按钮进入。知识点内容将在教师后台录入后显示。
            </p>
            <WorldRegionPanel
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
