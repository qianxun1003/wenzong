import type { MapProgressState } from "@/lib/map-progress";
import {
  countJapanRegionsExplored,
  countWorldRegionsExplored,
  TOTAL_JAPAN_REGIONS,
  TOTAL_WORLD_REGIONS,
} from "@/lib/map-exploration-lit";

export interface GrowthSnapshot {
  displayName: string;
  level: number;
  title: string;
  studyHours: number;
  studyMinutes: number;
  questionsDone: number;
  accuracyPercent: number | null;
  knowledgeMastered: number;
  streakDays: number;
  mapCountries: number;
  mapPrefectures: number;
  mapWorldRegionsLit: number;
  mapJapanRegionsLit: number;
  examPointsDone: number;
  isPreview: boolean;
}

/** 未接入学习记录前的展示数据；地图进度来自 localStorage */
export function buildGrowthSnapshot(progress: MapProgressState): GrowthSnapshot {
  const mapWorldRegionsLit = countWorldRegionsExplored(progress.exploredCountries);
  const mapJapanRegionsLit = countJapanRegionsExplored(progress.exploredPrefectures);

  return {
    displayName: "EJU 学习者",
    level: 1,
    title: "知识旅人",
    studyHours: 0,
    studyMinutes: 0,
    questionsDone: 0,
    accuracyPercent: null,
    knowledgeMastered: progress.completedExamPoints.length,
    streakDays: 0,
    mapCountries: progress.exploredCountries.length,
    mapPrefectures: progress.exploredPrefectures.length,
    mapWorldRegionsLit,
    mapJapanRegionsLit,
    examPointsDone: progress.completedExamPoints.length,
    isPreview: true,
  };
}

export const SUBJECT_LABELS = ["历史", "政治", "经济", "地理"] as const;

export type SubjectLabel = (typeof SUBJECT_LABELS)[number];

/** 能力条预览（接入答题记录后替换） */
export const SUBJECT_ABILITY_PREVIEW: Record<SubjectLabel, number | null> = {
  历史: null,
  政治: null,
  经济: null,
  地理: null,
};

export const GROWTH_MILESTONES = [
  { id: "start", label: "启程", days: 1 },
  { id: "week", label: "坚持一周", days: 7 },
  { id: "month", label: "满月", days: 30 },
  { id: "year", label: "周岁", days: 365 },
] as const;

export { TOTAL_JAPAN_REGIONS, TOTAL_WORLD_REGIONS };
