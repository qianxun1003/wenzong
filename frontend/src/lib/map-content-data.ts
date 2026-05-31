import type { JapanRegionId, WorldRegionId } from "@/lib/map-config";

export type KnowledgeCategory = "history" | "politics" | "economy" | "geography";

export const KNOWLEDGE_CATEGORY_LABELS: Record<KnowledgeCategory, string> = {
  history: "历史",
  politics: "政治",
  economy: "经济",
  geography: "地理",
};

export const KNOWLEDGE_CATEGORIES: KnowledgeCategory[] = [
  "history",
  "politics",
  "economy",
  "geography",
];

export const EMPTY_KNOWLEDGE_COUNTS: Record<KnowledgeCategory, number> = {
  history: 0,
  politics: 0,
  economy: 0,
  geography: 0,
};

export const KNOWLEDGE_SLOTS_PER_CATEGORY = 3;

export interface ExamPoint {
  id: string;
  title: string;
  category: KnowledgeCategory;
}

export interface QuickFact {
  label: string;
  value: string;
}

export interface EntityProfile {
  slug: string;
  name: string;
  regionLabel: string;
  quickFacts: QuickFact[];
  knowledgeCounts: Record<KnowledgeCategory, number>;
  examPoints: ExamPoint[];
  ejuTags: string[];
  overview: Partial<Record<KnowledgeCategory, string>>;
}

export interface RegionLearningMeta {
  totalKnowledgePoints: number;
}

/** 教师后台录入前，前端不展示任何硬编码知识点 */
export const COUNTRY_PROFILES: Record<string, EntityProfile> = {};

export const PREFECTURE_PROFILES: Record<string, EntityProfile> = {};

function emptyRegionMeta(): RegionLearningMeta {
  return { totalKnowledgePoints: 0 };
}

export const WORLD_REGION_META: Record<WorldRegionId, RegionLearningMeta> = {
  europe: emptyRegionMeta(),
  asia: emptyRegionMeta(),
  africa: emptyRegionMeta(),
  "north-america": emptyRegionMeta(),
  "south-america": emptyRegionMeta(),
  oceania: emptyRegionMeta(),
  mena: emptyRegionMeta(),
  "russia-central-asia": emptyRegionMeta(),
};

export const JAPAN_REGION_META: Record<JapanRegionId, RegionLearningMeta> = {
  hokkaido: emptyRegionMeta(),
  tohoku: emptyRegionMeta(),
  kanto: emptyRegionMeta(),
  chubu: emptyRegionMeta(),
  kinki: emptyRegionMeta(),
  chugoku: emptyRegionMeta(),
  shikoku: emptyRegionMeta(),
  kyushu: emptyRegionMeta(),
};

export function sumKnowledgeCounts(
  counts: Record<KnowledgeCategory, number>
): number {
  return Object.values(counts).reduce((a, b) => a + b, 0);
}

export function getCountryProfile(_name: string): EntityProfile | null {
  return null;
}

export function getPrefectureProfile(_name: string): EntityProfile | null {
  return null;
}

export function isKnowledgeCategory(value: string): value is KnowledgeCategory {
  return (KNOWLEDGE_CATEGORIES as string[]).includes(value);
}

export function getCountriesByRegion(_regionId: WorldRegionId): EntityProfile[] {
  return [];
}

export function getPrefecturesByRegion(_regionId: JapanRegionId): EntityProfile[] {
  return [];
}

export function toCountrySlug(name: string): string {
  return encodeURIComponent(name);
}

export function fromCountrySlug(slug: string): string {
  return decodeURIComponent(slug);
}
