"use client";

import { MapCategoryPicker } from "@/components/map/map-category-picker";
import type { EntityProfile } from "@/lib/map-content-data";

interface MapEntityOverviewProps {
  entityName: string;
  regionLabel: string;
  profile: EntityProfile | null;
  entityType: "country" | "prefecture";
  basePath: string;
}

export function MapEntityOverview({
  entityName,
  regionLabel,
  basePath,
}: MapEntityOverviewProps) {
  return (
    <div className="space-y-4">
      <div className="map-detail-hero">
        <div>
          <h3 className="text-base font-semibold text-foreground">{entityName}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{regionLabel}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            内容待教师后台录入后显示。
          </p>
        </div>
      </div>

      <MapCategoryPicker basePath={basePath} profile={null} entityName={entityName} />
    </div>
  );
}
