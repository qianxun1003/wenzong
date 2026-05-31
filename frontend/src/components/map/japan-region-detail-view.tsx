"use client";

import { useMemo, useState } from "react";
import { GeoMapCanvas } from "@/components/map/geo-map-canvas";
import { MapPanZoomViewport } from "@/components/map/map-pan-zoom-viewport";
import { MapCountryCategoryBar } from "@/components/map/map-country-category-bar";
import { MapRegionSidebar } from "@/components/map/map-region-sidebar";
import {
  prefectureCnToJa,
  prefectureDisplayName,
  prefectureJaToCn,
  toPrefectureSlug,
} from "@/lib/geo/japan-prefecture-names";
import { getPrefectureProfile } from "@/lib/map-content-data";
import { buildJapanPrefectureSidebarItemsForRegion } from "@/lib/map-sidebar-items";
import type { JapanRegion } from "@/lib/map-config";

interface JapanRegionDetailViewProps {
  region: JapanRegion;
  initialPrefectureCn?: string;
}

export function JapanRegionDetailView({ region, initialPrefectureCn }: JapanRegionDetailViewProps) {
  const sidebarItems = useMemo(
    () => buildJapanPrefectureSidebarItemsForRegion(region.id),
    [region.id]
  );

  const [selectedPrefectureJa, setSelectedPrefectureJa] = useState<string | null>(() => {
    const cnName = initialPrefectureCn ?? region.prefectures[0];
    return cnName ? prefectureCnToJa(cnName) : null;
  });

  const selectedPrefectureCn = selectedPrefectureJa
    ? prefectureJaToCn(selectedPrefectureJa)
    : null;

  const activeSidebarId =
    selectedPrefectureCn != null ? `${region.id}:${selectedPrefectureCn}` : null;

  const handleSidebarSelect = (id: string) => {
    const cnName = id.split(":")[1];
    if (!cnName) return;
    const ja = prefectureCnToJa(cnName);
    if (ja) setSelectedPrefectureJa(ja);
  };

  const displayName = selectedPrefectureJa
    ? prefectureDisplayName(selectedPrefectureJa)
    : null;

  const profile = selectedPrefectureCn ? getPrefectureProfile(selectedPrefectureCn) : null;
  const entityBasePath =
    selectedPrefectureCn != null
      ? `/map/japan/${region.id}/${toPrefectureSlug(selectedPrefectureCn)}`
      : "";

  return (
    <div className="map-explorer-panel map-sub-panel">
      <div className="border-b border-border/50 bg-background/50 px-4 py-3 sm:px-5">
        <p className="text-sm font-medium text-foreground">{region.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          左侧选都道府县，地图同步高亮；上方选择分类查看内容（待录入）
        </p>
      </div>

      <div className="map-explorer-body map-explorer-body-aligned">
        <MapRegionSidebar
          items={sidebarItems}
          selectedId={activeSidebarId}
          onSelect={handleSidebarSelect}
          searchPlaceholder="搜索都道府县…"
          hint="可滚动或搜索"
          className="map-explorer-sidebar map-explorer-sidebar-japan"
        />

        <div className="map-explorer-main map-explorer-main-stacked">
          {displayName && selectedPrefectureCn && entityBasePath && (
            <MapCountryCategoryBar
              entityName={displayName}
              profile={profile}
              basePath={entityBasePath}
              entityType="prefecture"
            />
          )}

          <div className="map-explorer-map map-explorer-map-fill map-explorer-map-japan relative min-h-0 flex-1 overflow-hidden bg-gradient-to-br from-chart-1/15 via-background/40 to-primary/10">
            <MapPanZoomViewport
              resetKey={`${region.id}-${selectedPrefectureJa ?? ""}`}
              className="h-full w-full"
            >
              <GeoMapCanvas
                kind="japan"
                granularity="prefecture"
                layerMode="comprehensive"
                selectedRegionId={region.id}
                selectedPrefectureJa={selectedPrefectureJa}
                onPrefectureSelect={setSelectedPrefectureJa}
                fitToSelection
                showLabels={false}
                ariaLabel={`${region.name}都道府县地图`}
                className="h-full w-full"
              />
            </MapPanZoomViewport>
          </div>
        </div>
      </div>
    </div>
  );
}
