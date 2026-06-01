import type { JapanRegionId, WorldRegionId } from "@/lib/map-config";
import { JAPAN_REGIONS, WORLD_REGIONS } from "@/lib/map-config";
import { fromPrefectureSlug, prefectureCnToJa } from "@/lib/geo/japan-prefecture-names";
import { getJapanRegionId } from "@/lib/geo/japan-region-by-prefecture";
import { fromCountrySlug, toCountrySlug } from "@/lib/map-content-data";

/** 根据已探索国家 slug，推导已点亮的世界区域 */
export function getLitWorldRegionIds(exploredCountrySlugs: string[]): Set<WorldRegionId> {
  const explored = new Set(exploredCountrySlugs);
  const lit = new Set<WorldRegionId>();

  for (const region of WORLD_REGIONS) {
    const hasVisit = region.countries.some((name) => explored.has(toCountrySlug(name)));
    if (hasVisit) lit.add(region.id);
  }

  return lit;
}

/** 根据已探索都道府县 slug，推导已点亮的日本地方 */
export function getLitJapanRegionIds(exploredPrefectureSlugs: string[]): Set<JapanRegionId> {
  const lit = new Set<JapanRegionId>();

  for (const slug of exploredPrefectureSlugs) {
    const cn = fromPrefectureSlug(slug);
    const ja = prefectureCnToJa(cn);
    if (!ja) continue;
    const regionId = getJapanRegionId(ja);
    if (regionId) lit.add(regionId);
  }

  return lit;
}

export function countWorldRegionsExplored(exploredCountrySlugs: string[]): number {
  return getLitWorldRegionIds(exploredCountrySlugs).size;
}

export function countJapanRegionsExplored(exploredPrefectureSlugs: string[]): number {
  return getLitJapanRegionIds(exploredPrefectureSlugs).size;
}

/** 反向：从 slug 解析国家中文名（调试用 / 列表展示） */
export function countryNameFromSlug(slug: string): string {
  return fromCountrySlug(slug);
}

export function prefectureNameFromSlug(slug: string): string {
  return fromPrefectureSlug(slug);
}

export const TOTAL_WORLD_REGIONS = WORLD_REGIONS.length;
export const TOTAL_JAPAN_REGIONS = JAPAN_REGIONS.length;
