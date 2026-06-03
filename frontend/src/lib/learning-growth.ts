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
  subjectAbility: Record<SubjectLabel, number | null>;
  /** 仍为演示数据，接入学习记录 API 后改为 false */
  isPreview: boolean;
}

export const SUBJECT_LABELS = ["历史", "政治", "经济", "地理"] as const;

export type SubjectLabel = (typeof SUBJECT_LABELS)[number];

/**
 * 个人主页演示档案：模拟已达成「满月」的学习者。
 * 地图相关数字与 localStorage 探索进度取较大值；接入后端后由 buildGrowthSnapshot 替换。
 */
const DEMO_GROWTH_PROFILE = {
  displayName: "EJU 文综学习者",
  level: 5,
  title: "满月学者",
  studyHours: 47,
  studyMinutes: 35,
  questionsDone: 286,
  accuracyPercent: 78,
  streakDays: 30,
  knowledgeMastered: 24,
  mapCountries: 6,
  mapPrefectures: 9,
  mapWorldRegionsLit: 4,
  mapJapanRegionsLit: 3,
  examPointsDone: 24,
  subjectAbility: {
    历史: 82,
    政治: 71,
    经济: 76,
    地理: 68,
  } satisfies Record<SubjectLabel, number>,
} as const;

/** 未接入学习记录前的展示数据；地图进度与演示档案合并 */
export function buildGrowthSnapshot(progress: MapProgressState): GrowthSnapshot {
  const mapWorldRegionsLit = countWorldRegionsExplored(progress.exploredCountries);
  const mapJapanRegionsLit = countJapanRegionsExplored(progress.exploredPrefectures);
  const examPointsDone = progress.completedExamPoints.length;

  return {
    displayName: DEMO_GROWTH_PROFILE.displayName,
    level: DEMO_GROWTH_PROFILE.level,
    title: DEMO_GROWTH_PROFILE.title,
    studyHours: DEMO_GROWTH_PROFILE.studyHours,
    studyMinutes: DEMO_GROWTH_PROFILE.studyMinutes,
    questionsDone: DEMO_GROWTH_PROFILE.questionsDone,
    accuracyPercent: DEMO_GROWTH_PROFILE.accuracyPercent,
    streakDays: DEMO_GROWTH_PROFILE.streakDays,
    knowledgeMastered: Math.max(examPointsDone, DEMO_GROWTH_PROFILE.knowledgeMastered),
    mapCountries: Math.max(
      progress.exploredCountries.length,
      DEMO_GROWTH_PROFILE.mapCountries
    ),
    mapPrefectures: Math.max(
      progress.exploredPrefectures.length,
      DEMO_GROWTH_PROFILE.mapPrefectures
    ),
    mapWorldRegionsLit: Math.max(
      mapWorldRegionsLit,
      DEMO_GROWTH_PROFILE.mapWorldRegionsLit
    ),
    mapJapanRegionsLit: Math.max(
      mapJapanRegionsLit,
      DEMO_GROWTH_PROFILE.mapJapanRegionsLit
    ),
    examPointsDone: Math.max(examPointsDone, DEMO_GROWTH_PROFILE.examPointsDone),
    subjectAbility: { ...DEMO_GROWTH_PROFILE.subjectAbility },
    isPreview: true,
  };
}

export const GROWTH_MILESTONES = [
  { id: "start", label: "启程", days: 1 },
  { id: "week", label: "坚持一周", days: 7 },
  { id: "month", label: "满月", days: 30 },
  { id: "year", label: "周岁", days: 365 },
] as const;

export type MilestoneStatus = "unlocked" | "current" | "locked";

export function getNextMilestone(streakDays: number) {
  return GROWTH_MILESTONES.find((m) => streakDays < m.days) ?? null;
}

export function getMilestoneStatus(streakDays: number, targetDays: number): MilestoneStatus {
  if (streakDays >= targetDays) return "unlocked";
  const next = getNextMilestone(streakDays);
  if (next?.days === targetDays) return "current";
  return "locked";
}

const MILESTONE_STATUS_LABEL: Record<MilestoneStatus, string> = {
  unlocked: "已达成",
  current: "进行中",
  locked: "未开始",
};

export function getMilestoneStatusLabel(status: MilestoneStatus) {
  return MILESTONE_STATUS_LABEL[status];
}

/** 轨迹连线填充比例（0–100），用于进度条动画 */
export function getTrajectoryFillPercent(streakDays: number): number {
  if (streakDays <= 0) return 0;

  const last = GROWTH_MILESTONES[GROWTH_MILESTONES.length - 1];
  if (streakDays >= last.days) return 100;

  const maxIndex = GROWTH_MILESTONES.length - 1;

  for (let i = GROWTH_MILESTONES.length - 1; i >= 0; i--) {
    const milestone = GROWTH_MILESTONES[i];
    if (streakDays >= milestone.days) {
      const nodePct = (i / maxIndex) * 100;
      const next = GROWTH_MILESTONES[i + 1];
      if (!next) return nodePct;
      const nextPct = ((i + 1) / maxIndex) * 100;
      const t =
        (streakDays - milestone.days) / Math.max(1, next.days - milestone.days);
      return nodePct + t * (nextPct - nodePct);
    }
  }

  const first = GROWTH_MILESTONES[0];
  const t = Math.min(1, streakDays / Math.max(1, first.days));
  return t * 0;
}

export function getActiveMilestoneIndex(streakDays: number): number {
  if (streakDays <= 0) return 0;
  for (let i = GROWTH_MILESTONES.length - 1; i >= 0; i--) {
    if (streakDays >= GROWTH_MILESTONES[i].days) return i;
  }
  return 0;
}

export { TOTAL_JAPAN_REGIONS, TOTAL_WORLD_REGIONS };
