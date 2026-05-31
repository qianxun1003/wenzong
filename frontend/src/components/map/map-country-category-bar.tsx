"use client";

import { useEffect } from "react";
import { formatCountryWithFlag } from "@/lib/geo/country-flags";
import { MapCategoryPicker } from "@/components/map/map-category-picker";
import type { EntityProfile } from "@/lib/map-content-data";
import { markCountryExplored, markPrefectureExplored } from "@/lib/map-progress";

interface MapCountryCategoryBarProps {
  entityName: string;
  profile: EntityProfile | null;
  basePath: string;
  entityType?: "country" | "prefecture";
}

export function MapCountryCategoryBar({
  entityName,
  profile,
  basePath,
  entityType = "country",
}: MapCountryCategoryBarProps) {
  useEffect(() => {
    if (!profile) return;
    if (entityType === "country") {
      markCountryExplored(profile.slug);
    } else {
      markPrefectureExplored(profile.slug);
    }
  }, [profile, entityType]);

  return (
    <div className="map-country-category-bar">
      <div className="map-country-category-bar-inner">
        <p className="map-country-category-bar-title">
          {entityType === "country" ? formatCountryWithFlag(entityName) : entityName}
        </p>
        <MapCategoryPicker
          basePath={basePath}
          profile={profile}
          entityName={entityName}
          variant="toolbar"
        />
      </div>
    </div>
  );
}
