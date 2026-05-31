"use client";

import { useMemo, useState } from "react";
import type { Feature, Geometry } from "geojson";
import { geoCentroid } from "d3-geo";
import { buildProjection, createPathGenerator } from "@/lib/geo/projection";
import { getJapanRegionId } from "@/lib/geo/japan-region-by-prefecture";
import { prefectureDisplayName } from "@/lib/geo/japan-prefecture-names";
import { getCnCountryName, getGeoCountryName } from "@/lib/geo/world-country-names";
import { formatCountryWithFlag } from "@/lib/geo/country-flags";
import { getWorldRegionId } from "@/lib/geo/world-region-by-iso";
import { getRegionFillStyle } from "@/lib/geo/layer-colors";
import { useGeoMapData } from "@/lib/geo/use-geo-map-data";
import type { MapLayerMode } from "@/lib/map-config";
import { cn } from "@/lib/utils";

type MapKind = "world" | "japan";
type JapanGranularity = "region" | "prefecture";
type WorldGranularity = "region" | "country";

interface GeoMapCanvasProps {
  kind: MapKind;
  layerMode?: MapLayerMode;
  selectedRegionId?: string | null;
  selectedPrefectureJa?: string | null;
  selectedCountryName?: string | null;
  granularity?: JapanGranularity | WorldGranularity;
  onSelect?: (id: string) => void;
  onPrefectureSelect?: (jaName: string) => void;
  onCountrySelect?: (cnName: string) => void;
  interactive?: boolean;
  fitToSelection?: boolean;
  fitPadding?: number;
  fitScale?: number;
  preserveAspect?: "meet" | "slice";
  showLabels?: boolean;
  className?: string;
  ariaLabel: string;
}

function getRegionIdFromFeature(kind: MapKind, feat: Feature<Geometry>): string | null {
  if (kind === "world") {
    const isoId = feat.id as string | number | undefined;
    const name = (feat.properties?.name as string) ?? "";
    return getWorldRegionId(isoId, name);
  }
  const prefecture = (feat.properties?.nam_ja as string) ?? "";
  return getJapanRegionId(prefecture);
}

function getPrefectureJa(feat: Feature<Geometry>): string {
  return (feat.properties?.nam_ja as string) ?? "";
}

function getFeatureGeoName(feat: Feature<Geometry>): string {
  return (feat.properties?.name as string) ?? "";
}

export function GeoMapCanvas({
  kind,
  layerMode = "comprehensive",
  selectedRegionId = null,
  selectedPrefectureJa = null,
  selectedCountryName = null,
  granularity = "region",
  onSelect,
  onPrefectureSelect,
  onCountrySelect,
  interactive = true,
  fitToSelection = true,
  fitPadding,
  fitScale = 1,
  preserveAspect = "meet",
  showLabels = true,
  className,
  ariaLabel,
}: GeoMapCanvasProps) {
  const isPrefectureMode = kind === "japan" && granularity === "prefecture";
  const isCountryMode = kind === "world" && granularity === "country";

  const { features, loading, error } = useGeoMapData(kind);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const width = kind === "world" ? (isCountryMode ? 960 : 800) : 400;
  const height = kind === "world" ? (isCountryMode ? 720 : 400) : 500;

  const renderFeatures = useMemo(() => {
    if (isPrefectureMode) {
      return features.filter(
        (f) => getRegionIdFromFeature("japan", f) === selectedRegionId
      );
    }
    if (isCountryMode && selectedRegionId) {
      return features.filter(
        (f) => getRegionIdFromFeature("world", f) === selectedRegionId
      );
    }
    return features;
  }, [features, isPrefectureMode, isCountryMode, selectedRegionId]);

  const projectionFeatures = useMemo(() => {
    if (!fitToSelection) return renderFeatures;

    if (isCountryMode && selectedCountryName) {
      const geoName = getGeoCountryName(selectedCountryName);
      if (geoName) {
        const matched = renderFeatures.filter((f) => getFeatureGeoName(f) === geoName);
        if (matched.length > 0) return matched;
      }
    }

    if (isPrefectureMode && selectedPrefectureJa) {
      const matched = renderFeatures.filter(
        (f) => getPrefectureJa(f) === selectedPrefectureJa
      );
      if (matched.length > 0) return matched;
    }

    if (!selectedRegionId) return renderFeatures;
    if (isPrefectureMode) return renderFeatures;

    const selected = renderFeatures.filter(
      (f) => getRegionIdFromFeature(kind, f) === selectedRegionId
    );
    return selected.length > 0 ? selected : renderFeatures;
  }, [
    renderFeatures,
    kind,
    selectedRegionId,
    fitToSelection,
    isPrefectureMode,
    isCountryMode,
    selectedCountryName,
    selectedPrefectureJa,
  ]);

  const projection = useMemo(() => {
    if (projectionFeatures.length === 0) return null;
    const padding =
      fitPadding ??
      (kind === "japan"
        ? isPrefectureMode || (fitToSelection && selectedRegionId)
          ? 16
          : 12
        : isCountryMode && selectedCountryName
          ? 52
          : isCountryMode
            ? 8
            : selectedRegionId
              ? 24
              : 16);
    return buildProjection(
      projectionFeatures,
      width,
      height,
      kind,
      padding,
      fitScale
    );
  }, [
    projectionFeatures,
    width,
    height,
    kind,
    selectedRegionId,
    fitToSelection,
    isPrefectureMode,
    isCountryMode,
    selectedCountryName,
    fitPadding,
    fitScale,
  ]);

  const pathGenerator = useMemo(
    () => (projection ? createPathGenerator(projection) : null),
    [projection]
  );

  const selectedCountryFeature = useMemo(() => {
    if (!isCountryMode || !selectedCountryName) return null;
    const geoName = getGeoCountryName(selectedCountryName);
    if (!geoName) return null;
    return renderFeatures.find((f) => getFeatureGeoName(f) === geoName) ?? null;
  }, [isCountryMode, selectedCountryName, renderFeatures]);

  const selectedCountryLabelPoint = useMemo(() => {
    if (!pathGenerator || !selectedCountryFeature) return null;
    return pathGenerator.centroid(selectedCountryFeature);
  }, [pathGenerator, selectedCountryFeature]);

  if (loading) {
    return (
      <div className={cn("flex h-full items-center justify-center", className)}>
        <p className="text-sm text-muted-foreground">地图加载中…</p>
      </div>
    );
  }

  if (error || !pathGenerator) {
    return (
      <div className={cn("flex h-full items-center justify-center", className)}>
        <p className="text-sm text-destructive">{error ?? "地图渲染失败"}</p>
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio={`xMidYMid ${preserveAspect}`}
      className={cn("h-full w-full max-h-full max-w-full transition-all duration-700 ease-out", className)}
      aria-label={ariaLabel}
    >
      {renderFeatures.map((feat, index) => {
        const regionId = getRegionIdFromFeature(kind, feat);
        const prefectureJa = getPrefectureJa(feat);
        const geoName = getFeatureGeoName(feat);
        const featureKey =
          kind === "japan"
            ? prefectureJa || `pref-${index}`
            : isCountryMode
              ? geoName || `country-${index}`
              : String(feat.id ?? geoName) || `feature-${index}`;
        const d = pathGenerator(feat);
        if (!d) return null;

        let state: "default" | "hover" | "active" | "dimmed" = "default";
        let hoverKey: string | null = null;

        if (isPrefectureMode) {
          const active =
            selectedPrefectureJa != null && prefectureJa === selectedPrefectureJa;
          const hovered = interactive && hoveredId === prefectureJa;
          const dimmed =
            selectedPrefectureJa != null && prefectureJa !== selectedPrefectureJa;
          state = active ? "active" : hovered ? "hover" : dimmed ? "dimmed" : "default";
          hoverKey = prefectureJa;
        } else if (isCountryMode) {
          const geoForSelected = selectedCountryName
            ? getGeoCountryName(selectedCountryName)
            : null;
          const cnName = getCnCountryName(geoName);
          const active =
            geoForSelected != null && geoName === geoForSelected;
          const hovered = interactive && cnName != null && hoveredId === cnName;
          const dimmed =
            geoForSelected != null && !active && cnName != null;
          state = active ? "active" : hovered ? "hover" : dimmed ? "dimmed" : "default";
          hoverKey = cnName;
        } else {
          const active = selectedRegionId != null && regionId === selectedRegionId;
          const hovered = interactive && hoveredId != null && regionId === hoveredId;
          const dimmed = selectedRegionId != null && regionId !== selectedRegionId;
          state = active ? "active" : hovered ? "hover" : dimmed ? "dimmed" : "default";
          hoverKey = regionId;
        }

        const { fill, stroke, strokeWidth } = getRegionFillStyle(
          kind,
          layerMode,
          regionId,
          state,
          { neutralDimmed: isCountryMode }
        );

        const label =
          isPrefectureMode && showLabels && kind !== "japan"
            ? prefectureDisplayName(prefectureJa)
            : null;
        const centroid =
          isPrefectureMode && showLabels && kind !== "japan" ? geoCentroid(feat) : null;

        const ariaName =
          kind === "japan"
            ? prefectureDisplayName(prefectureJa)
            : isCountryMode
              ? (getCnCountryName(geoName) ?? geoName)
              : label ?? undefined;

        return (
          <g key={featureKey}>
            <path
              d={d}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              className={cn(
                "transition-all duration-300",
                interactive && "cursor-pointer"
              )}
              onClick={() => {
                if (!interactive) return;
                if (isPrefectureMode && onPrefectureSelect) {
                  onPrefectureSelect(prefectureJa);
                  return;
                }
                if (isCountryMode && onCountrySelect) {
                  const cnName = getCnCountryName(geoName);
                  if (cnName) onCountrySelect(cnName);
                  return;
                }
                if (regionId && onSelect) onSelect(regionId);
              }}
              onMouseEnter={() => {
                if (interactive && hoverKey) setHoveredId(hoverKey);
              }}
              onMouseLeave={() => {
                if (interactive) setHoveredId(null);
              }}
              role={interactive ? "button" : undefined}
              aria-label={
                isCountryMode
                  ? (getCnCountryName(geoName) ?? geoName)
                  : (ariaName ?? regionId ?? undefined)
              }
            />
            {label && centroid && (
              <text
                x={centroid[0]}
                y={centroid[1]}
                textAnchor="middle"
                dominantBaseline="middle"
                className="map-prefecture-label pointer-events-none select-none"
                fontSize={isPrefectureMode && renderFeatures.length <= 3 ? 11 : 9}
              >
                {label}
              </text>
            )}
          </g>
        );
      })}
      {isCountryMode &&
        showLabels &&
        kind !== "world" &&
        selectedCountryName &&
        selectedCountryLabelPoint &&
        Number.isFinite(selectedCountryLabelPoint[0]) &&
        Number.isFinite(selectedCountryLabelPoint[1]) && (
          <g pointerEvents="none" className="select-none">
            <text
              x={selectedCountryLabelPoint[0]}
              y={selectedCountryLabelPoint[1]}
              textAnchor="middle"
              dominantBaseline="middle"
              className="map-country-label"
            >
              {formatCountryWithFlag(selectedCountryName)}
            </text>
          </g>
        )}
    </svg>
  );
}
