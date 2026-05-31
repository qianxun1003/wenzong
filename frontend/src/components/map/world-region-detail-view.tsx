"use client";

import { useMemo, useState } from "react";
import { GeoMapCanvas } from "@/components/map/geo-map-canvas";
import { MapPanZoomViewport } from "@/components/map/map-pan-zoom-viewport";
import { MapCountryCategoryBar } from "@/components/map/map-country-category-bar";
import { MapRegionSidebar } from "@/components/map/map-region-sidebar";
import { formatCountryWithFlag } from "@/lib/geo/country-flags";
import { getGeoCountryName } from "@/lib/geo/world-country-names";
import {
  fromCountrySlug,
  getCountryProfile,
  toCountrySlug,
} from "@/lib/map-content-data";
import type { WorldRegion } from "@/lib/map-config";

interface WorldRegionDetailViewProps {
  region: WorldRegion;
  initialCountryName?: string;
}

export function WorldRegionDetailView({ region, initialCountryName }: WorldRegionDetailViewProps) {
  const sidebarItems = useMemo(
    () =>
      region.countries.map((country) => ({
        id: country,
        label: formatCountryWithFlag(country),
        keywords: [country, region.name],
      })),
    [region]
  );

  const [selectedCountry, setSelectedCountry] = useState<string | null>(
    initialCountryName ?? region.countries[0] ?? null
  );

  const profile = selectedCountry ? getCountryProfile(selectedCountry) : null;
  const entityBasePath =
    selectedCountry != null
      ? `/map/world/${region.id}/${toCountrySlug(selectedCountry)}`
      : "";

  const handleCountrySelect = (cnName: string) => {
    const resolved =
      region.countries.find(
        (c) => c === cnName || getGeoCountryName(c) === getGeoCountryName(cnName)
      ) ?? cnName;
    setSelectedCountry(resolved);
  };

  return (
    <div className="map-explorer-panel map-sub-panel map-explorer-panel-fill min-h-0 flex-1">
      <div className="map-explorer-body map-explorer-body-aligned map-explorer-body-fill">
        <MapRegionSidebar
          items={sidebarItems}
          selectedId={selectedCountry}
          onSelect={setSelectedCountry}
          searchPlaceholder="搜索国家…"
          compact
          className="map-explorer-sidebar"
        />

        <div className="map-explorer-main map-explorer-main-stacked">
          {selectedCountry && entityBasePath && (
            <MapCountryCategoryBar
              entityName={selectedCountry}
              profile={profile}
              basePath={entityBasePath}
            />
          )}

          <div className="map-explorer-map map-explorer-map-fill relative flex min-h-0 flex-1 overflow-hidden bg-gradient-to-br from-chart-1/10 via-background/30 to-primary/10">
            <MapPanZoomViewport
              resetKey={`${region.id}-${selectedCountry ?? ""}`}
              className="h-full w-full"
            >
              <GeoMapCanvas
                kind="world"
                granularity="country"
                layerMode="comprehensive"
                selectedRegionId={region.id}
                selectedCountryName={selectedCountry}
                onCountrySelect={handleCountrySelect}
                fitToSelection
                fitScale={1.12}
                preserveAspect="meet"
                showLabels={false}
                ariaLabel={`${region.name}地图`}
                className="h-full w-full"
              />
            </MapPanZoomViewport>
          </div>
        </div>
      </div>
    </div>
  );
}

export { toCountrySlug, fromCountrySlug };
