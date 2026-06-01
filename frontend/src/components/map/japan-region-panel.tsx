"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { GeoMapCanvas } from "@/components/map/geo-map-canvas";
import { MapPanZoomViewport } from "@/components/map/map-pan-zoom-viewport";
import { MapRegionSidebar } from "@/components/map/map-region-sidebar";
import { toPrefectureSlug } from "@/lib/geo/japan-prefecture-names";
import {
  buildJapanPrefectureSidebarItemsForRegion,
  buildJapanRegionSidebarItems,
  getJapanPrefectureLabel,
  isJapanPrefectureSelection,
  parseJapanPrefectureSelection,
} from "@/lib/map-sidebar-items";
import { JAPAN_REGIONS, type JapanRegionId, type MapLayerMode } from "@/lib/map-config";
import { cn } from "@/lib/utils";

type JapanBrowseMode = "region" | "prefecture";

interface JapanRegionPanelProps {
  selectedId: JapanRegionId | null;
  onSelect: (id: JapanRegionId) => void;
  layerMode: MapLayerMode;
  layerLabel: string;
}

export function JapanRegionPanel({ selectedId, onSelect, layerMode, layerLabel }: JapanRegionPanelProps) {
  const [browseMode, setBrowseMode] = useState<JapanBrowseMode>("region");
  const [sidebarSelectionId, setSidebarSelectionId] = useState<string | null>(null);

  const selectedRegion = JAPAN_REGIONS.find((r) => r.id === selectedId);
  const selectedPrefectureName = getJapanPrefectureLabel(sidebarSelectionId);

  const sidebarItems = useMemo(() => {
    if (browseMode === "region") return buildJapanRegionSidebarItems();
    if (!selectedId) return [];
    return buildJapanPrefectureSidebarItemsForRegion(selectedId);
  }, [browseMode, selectedId]);

  const activeSidebarId =
    browseMode === "region"
      ? selectedId
      : selectedPrefectureName && selectedId
        ? `${selectedId}:${selectedPrefectureName}`
        : sidebarSelectionId;

  const handleSidebarSelect = (id: string) => {
    if (browseMode === "region") {
      setSidebarSelectionId(null);
      onSelect(id as JapanRegionId);
      return;
    }

    setSidebarSelectionId(id);
    const regionId = parseJapanPrefectureSelection(id);
    if (regionId) onSelect(regionId);
  };

  const handleMapSelect = (id: JapanRegionId) => {
    onSelect(id);
    if (browseMode === "prefecture" && sidebarSelectionId && !isJapanPrefectureSelection(sidebarSelectionId)) {
      setSidebarSelectionId(null);
    }
  };

  const handleBrowseModeChange = (mode: JapanBrowseMode) => {
    setBrowseMode(mode);
    setSidebarSelectionId(null);
  };

  const handleBrowseModePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  const handleBrowseModeClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    mode: JapanBrowseMode
  ) => {
    handleBrowseModeChange(mode);
    e.currentTarget.focus({ preventScroll: true });
  };

  return (
    <div className="map-explorer-panel map-sub-panel">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 bg-background/50 px-3 py-2 sm:px-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">区域探索</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {browseMode === "region"
              ? selectedRegion
                ? `当前聚焦：${selectedRegion.name} · 点击下方按钮进入篇章学习`
                : "从左侧选择地方区分，或在地图上点击"
              : selectedRegion
                ? selectedPrefectureName
                  ? `当前聚焦：${selectedPrefectureName}（${selectedRegion.name}）`
                  : `当前聚焦：${selectedRegion.name}`
                : "请先在地图或侧栏选择地方区分"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="map-explorer-mode-toggle" role="tablist" aria-label="浏览方式">
            <button
              type="button"
              role="tab"
              aria-selected={browseMode === "region"}
              onPointerDown={handleBrowseModePointerDown}
              onClick={(e) => handleBrowseModeClick(e, "region")}
              className={cn(browseMode === "region" && "map-explorer-mode-toggle-active")}
            >
              地方区分
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={browseMode === "prefecture"}
              onPointerDown={handleBrowseModePointerDown}
              onClick={(e) => handleBrowseModeClick(e, "prefecture")}
              className={cn(browseMode === "prefecture" && "map-explorer-mode-toggle-active")}
            >
              都道府县
            </button>
          </div>
          <Badge variant="outline" className="bg-background/60">
            {layerLabel}视图
          </Badge>
        </div>
      </div>

      <div className="map-explorer-body map-explorer-body-japan">
        <MapRegionSidebar
          items={sidebarItems}
          selectedId={activeSidebarId}
          onSelect={handleSidebarSelect}
          searchPlaceholder={browseMode === "region" ? "搜索地方区分…" : "搜索都道府县…"}
          emptyMessage={
            browseMode === "prefecture" && !selectedId
              ? "请先在地图或「地方区分」中选择区域"
              : undefined
          }
          className="map-explorer-sidebar map-explorer-sidebar-japan"
        />

        <div className="map-explorer-main map-explorer-main-japan flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="map-explorer-map map-explorer-map-japan relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-chart-1/15 via-background/40 to-primary/10">
            <MapPanZoomViewport
              resetKey={`${selectedId ?? ""}-${browseMode}-${sidebarSelectionId ?? ""}`}
              className="h-full w-full"
            >
              <GeoMapCanvas
                kind="japan"
                layerMode={layerMode}
                selectedRegionId={selectedId}
                onSelect={(id) => handleMapSelect(id as JapanRegionId)}
                fitToSelection={false}
                fitPadding={20}
                showLabels={false}
                ariaLabel="日本都道府县地图"
                className="h-full w-full"
              />
            </MapPanZoomViewport>

            {browseMode === "region" && selectedRegion && (
              <div className="absolute inset-x-0 bottom-3 flex justify-center px-4">
                <Link
                  href={`/map/japan/${selectedRegion.id}`}
                  className={cn(buttonVariants({ size: "sm" }), "gap-1.5 gradient-academy shadow-md")}
                >
                  进入{selectedRegion.name}学习
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            {browseMode === "prefecture" && selectedRegion && selectedPrefectureName && (
              <div className="absolute inset-x-0 bottom-3 flex justify-center px-4">
                <Link
                  href={`/map/japan/${selectedRegion.id}/${toPrefectureSlug(selectedPrefectureName)}`}
                  className={cn(buttonVariants({ size: "sm" }), "gap-1.5 gradient-academy shadow-md")}
                >
                  进入{selectedPrefectureName}学习
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
