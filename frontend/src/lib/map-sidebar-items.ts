import { JAPAN_REGIONS, WORLD_REGIONS, type JapanRegionId, type WorldRegionId } from "@/lib/map-config";
import type { MapSidebarItem } from "@/components/map/map-region-sidebar";

export function buildWorldSidebarItems(): MapSidebarItem[] {
  return WORLD_REGIONS.map((region) => ({
    id: region.id,
    label: region.name,
    keywords: [region.subtitle, region.highlight, ...region.countries],
  }));
}

export function buildJapanRegionSidebarItems(): MapSidebarItem[] {
  return JAPAN_REGIONS.map((region) => ({
    id: region.id,
    label: region.name,
    subtitle: region.subtitle,
    keywords: region.prefectures,
  }));
}

export function buildJapanPrefectureSidebarItems(): MapSidebarItem[] {
  return JAPAN_REGIONS.flatMap((region) => buildJapanPrefectureSidebarItemsForRegion(region.id));
}

/** 仅返回某一地方区内的都道府县，避免侧栏一次列出全部 47 县 */
export function buildJapanPrefectureSidebarItemsForRegion(
  regionId: JapanRegionId
): MapSidebarItem[] {
  const region = JAPAN_REGIONS.find((r) => r.id === regionId);
  if (!region) return [];

  return region.prefectures.map((prefecture) => ({
    id: `${region.id}:${prefecture}`,
    label: prefecture,
    subtitle: region.name,
    keywords: [region.subtitle, ...region.prefectures],
  }));
}

export function parseJapanPrefectureSelection(id: string): JapanRegionId | null {
  const regionId = id.split(":")[0] as JapanRegionId;
  return JAPAN_REGIONS.some((r) => r.id === regionId) ? regionId : null;
}

export function isJapanPrefectureSelection(id: string | null): id is string {
  return id != null && id.includes(":");
}

export function getJapanPrefectureLabel(id: string | null): string | null {
  if (!isJapanPrefectureSelection(id)) return null;
  return id.split(":")[1] ?? null;
}

export function toWorldRegionId(id: string): WorldRegionId | null {
  return WORLD_REGIONS.some((r) => r.id === id) ? (id as WorldRegionId) : null;
}
