import { EJU_CHAPTERS, EJU_CLASS_WEAK_POINTS } from "@/lib/eju-syllabus";
import type {
  OrgStudentDirectoryItem,
  PlatformOrgRecord,
  StudentActivityLevel,
  StudentActivationLog,
  StudentAnalyticsItem,
  TeacherDashboardResponse,
  TeacherSession,
  MockClassSummary,
} from "./types";

export { EJU_CLASS_WEAK_POINTS as MOCK_CLASS_AI_DIAGNOSIS };

/** 投资人演示 · 本地 Mock Session（机构/教师视角） */
export const DEMO_TEACHER_SESSION: TeacherSession = {
  accessToken: "",
  demoMode: true,
  userId: "a1000001-0000-4000-8000-000000000001",
  teacherId: "a1000001-0000-4000-8000-000000000001",
  orgId: "org-5",
  role: "teacher",
  orgName: "Org-A",
  targetOrgId: "org-1",
  targetOrgName: "Org-C",
  region: "JP",
  status: "active",
  slotsUsed: 25,
  slotsLimit: 50,
  teacherDisplayName: "Teacher-A",
};

/** 超级管理员 · 平台指标 */
export const MOCK_PLATFORM_STATS = {
  org_count: 12,
  active_students: 1420,
} as const;

/** 全球加盟机构清册 · 朴素代号 Org-A … */
export const MOCK_PLATFORM_ORGS: PlatformOrgRecord[] = [
  {
    id: "org-1",
    name: "Org-C",
    region: "CN",
    expires_at: "2027-06-30",
    slots_used: 88,
    slots_limit: 120,
    status: "healthy" as const,
    student_count: 102,
    ai_model_route: "domestic",
    cross_border_migration_enabled: true,
  },
  {
    id: "org-2",
    name: "Org-D",
    region: "CN",
    expires_at: "2026-08-15",
    slots_used: 67,
    slots_limit: 80,
    status: "healthy" as const,
    student_count: 71,
    ai_model_route: "domestic",
    cross_border_migration_enabled: false,
  },
  {
    id: "org-3",
    name: "Org-G",
    region: "CN",
    expires_at: "2027-01-10",
    slots_used: 45,
    slots_limit: 60,
    status: "healthy" as const,
    student_count: 48,
    ai_model_route: "global_hybrid",
    cross_border_migration_enabled: true,
  },
  {
    id: "org-4",
    name: "Org-J",
    region: "CN",
    expires_at: "2026-11-30",
    slots_used: 32,
    slots_limit: 50,
    status: "healthy" as const,
    student_count: 35,
    ai_model_route: "domestic",
    cross_border_migration_enabled: false,
  },
  {
    id: "org-5",
    name: "Org-A",
    region: "JP",
    expires_at: "2027-03-31",
    slots_used: 25,
    slots_limit: 50,
    status: "healthy" as const,
    student_count: 48,
    ai_model_route: "global_hybrid",
    cross_border_migration_enabled: true,
  },
  {
    id: "org-6",
    name: "Org-B",
    region: "JP",
    expires_at: "2026-11-30",
    slots_used: 41,
    slots_limit: 45,
    status: "warning" as const,
    student_count: 39,
    ai_model_route: "global_hybrid",
    cross_border_migration_enabled: true,
  },
  {
    id: "org-7",
    name: "Org-E",
    region: "JP",
    expires_at: "2026-05-20",
    slots_used: 28,
    slots_limit: 30,
    status: "critical" as const,
    student_count: 26,
    ai_model_route: "domestic",
    cross_border_migration_enabled: false,
  },
  {
    id: "org-8",
    name: "Org-F",
    region: "JP",
    expires_at: "2027-01-10",
    slots_used: 19,
    slots_limit: 40,
    status: "healthy" as const,
    student_count: 22,
    ai_model_route: "global_hybrid",
    cross_border_migration_enabled: true,
  },
  {
    id: "org-9",
    name: "Org-H",
    region: "JP",
    expires_at: "2027-08-31",
    slots_used: 15,
    slots_limit: 35,
    status: "healthy" as const,
    student_count: 18,
    ai_model_route: "domestic",
    cross_border_migration_enabled: true,
  },
  {
    id: "org-10",
    name: "Org-I",
    region: "JP",
    expires_at: "2027-04-30",
    slots_used: 12,
    slots_limit: 40,
    status: "healthy" as const,
    student_count: 15,
    ai_model_route: "domestic",
    cross_border_migration_enabled: true,
  },
];

/** 本塾学生激活日志（教师视角） */
export const MOCK_ACTIVATION_LOGS = [
  {
    id: "act-1",
    student_name: "student-a",
    activated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    code_suffix: "XK7M",
    status: "active" as const,
  },
  {
    id: "act-2",
    student_name: "student-b",
    activated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    code_suffix: "P2RN",
    status: "active" as const,
  },
  {
    id: "act-3",
    student_name: "student-c",
    activated_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    code_suffix: "8QWT",
    status: "active" as const,
  },
  {
    id: "act-4",
    student_name: "student-d",
    activated_at: new Date(Date.now() - 86400000 * 28).toISOString(),
    code_suffix: "L9FD",
    status: "expired" as const,
  },
];

/** 本塾教学班 · 宏观看板卡片数据 */
export const MOCK_CLASSES: MockClassSummary[] = [
  {
    id: "class-1",
    name: "文综冲刺 A 班",
    studentCount: 2,
    avgCorrectRate: 0.765,
    sevenDayActiveCount: 2,
    syllabusProgress: [
      { chapter: EJU_CHAPTERS.economicSystem, percent: 88 },
      { chapter: EJU_CHAPTERS.economicTheory, percent: 62 },
      { chapter: EJU_CHAPTERS.nationalWealth, percent: 35 },
    ],
  },
  {
    id: "class-2",
    name: "地理专项 B 班",
    studentCount: 2,
    avgCorrectRate: 0.765,
    sevenDayActiveCount: 2,
    syllabusProgress: [
      { chapter: EJU_CHAPTERS.worldCountries, percent: 71 },
      { chapter: EJU_CHAPTERS.industryResources, percent: 48 },
    ],
  },
  {
    id: "class-3",
    name: "基础复习 C 班",
    studentCount: 3,
    avgCorrectRate: 0.58,
    sevenDayActiveCount: 1,
    syllabusProgress: [
      { chapter: EJU_CHAPTERS.economicSystem, percent: 42 },
      { chapter: EJU_CHAPTERS.economicTheory, percent: 18 },
    ],
  },
  {
    id: "class-4",
    name: "历史专题 D 班",
    studentCount: 4,
    avgCorrectRate: 0.71,
    sevenDayActiveCount: 3,
    syllabusProgress: [
      { chapter: "第6章 近世日本", percent: 55 },
      { chapter: "第7章 两次大战", percent: 38 },
    ],
  },
  {
    id: "class-5",
    name: "政治经济 E 班",
    studentCount: 5,
    avgCorrectRate: 0.63,
    sevenDayActiveCount: 4,
    syllabusProgress: [
      { chapter: EJU_CHAPTERS.economicSystem, percent: 60 },
      { chapter: EJU_CHAPTERS.nationalWealth, percent: 44 },
    ],
  },
  {
    id: "class-6",
    name: "周末强化 F 班",
    studentCount: 6,
    avgCorrectRate: 0.69,
    sevenDayActiveCount: 5,
    syllabusProgress: [
      { chapter: EJU_CHAPTERS.worldCountries, percent: 52 },
      { chapter: EJU_CHAPTERS.industryResources, percent: 41 },
    ],
  },
  {
    id: "class-7",
    name: "一对一 G 班",
    studentCount: 1,
    avgCorrectRate: 0.82,
    sevenDayActiveCount: 1,
    syllabusProgress: [{ chapter: EJU_CHAPTERS.economicTheory, percent: 90 }],
  },
  {
    id: "class-8",
    name: "暑期集训 H 班",
    studentCount: 8,
    avgCorrectRate: 0.55,
    sevenDayActiveCount: 6,
    syllabusProgress: [
      { chapter: EJU_CHAPTERS.economicSystem, percent: 30 },
      { chapter: EJU_CHAPTERS.economicTheory, percent: 22 },
    ],
  },
];

/** AI 全塾宏观知识点缺陷诊断 */
export const MOCK_ORG_AI_DIAGNOSIS = [
  {
    rank: 1,
    label: "明治维新·大政奉还与废藩置县",
    orgAvgCorrectRate: 45,
    alert: "全塾平均正确率仅 45%，建议近期统一加餐",
  },
  {
    rank: 2,
    label: "修正资本主义·罗斯福新政五法一政一制度",
    orgAvgCorrectRate: 42,
    alert: "跨 3 个班级均低于 50%，优先安排专题课",
  },
  {
    rank: 3,
    label: "新自由主义·1973 石油危机与滞涨",
    orgAvgCorrectRate: 51,
    alert: "A 班与 C 班差距 22%，建议分班差异化辅导",
  },
  {
    rank: 4,
    label: "市场机制·供给需求与均衡价格",
    orgAvgCorrectRate: 58,
    alert: "基础复习 C 班拖后腿，需巩固前置知识",
  },
  {
    rank: 5,
    label: "国民所得·GDP/GNP/NI 计算关系",
    orgAvgCorrectRate: 64,
    alert: "整体可控，维持现有节奏",
  },
] as const;

/** 尚未编入任何班级的学员（教务控制台 · 拉入班级用） */
export const MOCK_UNASSIGNED_STUDENTS: StudentAnalyticsItem[] = [
  {
    user_id: "s1000005-0000-4000-8000-000000000005",
    display_name: "student-e",
    class_ids: [],
    current_chapter_id: EJU_CHAPTERS.economicSystem,
    total_quiz_count: 24,
    correct_rate: 0.54,
    last_active_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    top_error_tags: [],
    weak_knowledge_points: [],
  },
  {
    user_id: "s1000006-0000-4000-8000-000000000006",
    display_name: "student-f",
    class_ids: [],
    current_chapter_id: EJU_CHAPTERS.economicTheory,
    total_quiz_count: 12,
    correct_rate: 0.61,
    last_active_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    top_error_tags: [],
    weak_knowledge_points: [],
  },
];

export const MOCK_DASHBOARD: TeacherDashboardResponse = {
  org_id: DEMO_TEACHER_SESSION.orgId,
  teacher_id: DEMO_TEACHER_SESSION.teacherId,
  class_count: 3,
  students: [
    {
      user_id: "s1000001-0000-4000-8000-000000000001",
      display_name: "student-a",
      class_ids: ["class-1"],
      current_chapter_id: EJU_CHAPTERS.economicSystem,
      total_quiz_count: 186,
      correct_rate: 0.72,
      last_active_at: new Date().toISOString(),
      top_error_tags: [
        { error_tag_id: "ET_CAUSE_EFFECT", count: 12 },
        { error_tag_id: "ET_TIMELINE", count: 9 },
      ],
      weak_knowledge_points: [
        {
          knowledge_point_id: "KP_ROOSEVELT_NEW_DEAL",
          mastery: 0.38,
          label: "罗斯福新政·五法一政一制度",
        },
        {
          knowledge_point_id: "KP_ADAM_SMITH",
          mastery: 0.45,
          label: "亚当斯密·自由放任",
        },
      ],
    },
    {
      user_id: "s1000002-0000-4000-8000-000000000002",
      display_name: "student-b",
      class_ids: ["class-1"],
      current_chapter_id: EJU_CHAPTERS.economicTheory,
      total_quiz_count: 142,
      correct_rate: 0.81,
      last_active_at: new Date(Date.now() - 86400000).toISOString(),
      top_error_tags: [{ error_tag_id: "ET_GEO_MAP", count: 6 }],
      weak_knowledge_points: [
        {
          knowledge_point_id: "KP_SUPPLY_DEMAND",
          mastery: 0.52,
          label: "供给需求·均衡价格",
        },
      ],
    },
    {
      user_id: "s1000003-0000-4000-8000-000000000003",
      display_name: "student-c",
      class_ids: ["class-2"],
      current_chapter_id: EJU_CHAPTERS.nationalWealth,
      total_quiz_count: 98,
      correct_rate: 0.65,
      last_active_at: new Date(Date.now() - 172800000).toISOString(),
      top_error_tags: [{ error_tag_id: "ET_DATA_READ", count: 8 }],
      weak_knowledge_points: [
        {
          knowledge_point_id: "KP_GDP_CALC",
          mastery: 0.41,
          label: "GDP·三面等价与NI",
        },
      ],
    },
    {
      user_id: "s1000004-0000-4000-8000-000000000004",
      display_name: "student-d",
      class_ids: ["class-2"],
      current_chapter_id: EJU_CHAPTERS.worldCountries,
      total_quiz_count: 210,
      correct_rate: 0.88,
      last_active_at: new Date().toISOString(),
      top_error_tags: [],
      weak_knowledge_points: [],
    },
    {
      user_id: "s1000007-0000-4000-8000-000000000007",
      display_name: "student-g",
      class_ids: ["class-3"],
      current_chapter_id: EJU_CHAPTERS.economicSystem,
      total_quiz_count: 56,
      correct_rate: 0.52,
      last_active_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      top_error_tags: [{ error_tag_id: "ET_TIMELINE", count: 5 }],
      weak_knowledge_points: [
        {
          knowledge_point_id: "KP_MEIJI_RESTORATION",
          mastery: 0.35,
          label: "明治维新·大政奉还",
        },
      ],
    },
    {
      user_id: "s1000008-0000-4000-8000-000000000008",
      display_name: "student-h",
      class_ids: ["class-3"],
      current_chapter_id: EJU_CHAPTERS.economicTheory,
      total_quiz_count: 41,
      correct_rate: 0.59,
      last_active_at: new Date(Date.now() - 86400000 * 8).toISOString(),
      top_error_tags: [],
      weak_knowledge_points: [],
    },
    {
      user_id: "s1000009-0000-4000-8000-000000000009",
      display_name: "student-i",
      class_ids: ["class-3"],
      current_chapter_id: EJU_CHAPTERS.economicSystem,
      total_quiz_count: 33,
      correct_rate: 0.63,
      last_active_at: new Date().toISOString(),
      top_error_tags: [],
      weak_knowledge_points: [],
    },
  ],
};

function resolveActivityLevel(lastActiveAt?: string | null): StudentActivityLevel {
  if (!lastActiveAt) return "inactive";
  const days = (Date.now() - new Date(lastActiveAt).getTime()) / 86400000;
  if (days <= 1) return "high";
  if (days <= 7) return "weekly";
  if (days <= 14) return "low";
  return "inactive";
}

function resolveClassLabels(classIds: string[]): string[] {
  if (classIds.length === 0) return ["未分班"];
  return classIds.map((id) => MOCK_CLASSES.find((c) => c.id === id)?.name ?? id);
}

/** 合并学情 + 激活日志，生成全塾学员花名册 */
export function buildOrgStudentDirectory(
  students: StudentAnalyticsItem[] = [
    ...MOCK_DASHBOARD.students,
    ...MOCK_UNASSIGNED_STUDENTS,
  ],
  extraLogs: StudentActivationLog[] = []
): OrgStudentDirectoryItem[] {
  const activationByName = new Map(
    [...MOCK_ACTIVATION_LOGS, ...extraLogs].map((log) => [log.student_name, log])
  );

  return students.map((s, idx) => {
    const name = s.display_name ?? "未命名";
    const activation = activationByName.get(name);
    const joinedAt =
      activation?.activated_at ??
      new Date(Date.now() - 86400000 * (30 + idx * 7)).toISOString();

    return {
      user_id: s.user_id,
      display_name: name,
      joined_at: joinedAt,
      class_labels: resolveClassLabels(s.class_ids),
      activity_level: resolveActivityLevel(s.last_active_at),
      last_active_at: s.last_active_at,
      total_quiz_count: s.total_quiz_count,
      correct_rate: s.correct_rate,
      account_status: activation?.status ?? "active",
    };
  });
}

export interface MigrationAssetPreview {
  wrongBookCount: number;
  wrongBookLabel: string;
  aiPortrait: string[];
  progressPercent: number;
  progressLabel: string;
}

const DEFAULT_MIGRATION_ASSETS: MigrationAssetPreview = {
  wrongBookCount: 142,
  wrongBookLabel: "142 道文综经济/地理错题",
  aiPortrait: ["罗斯福新政五法一政一制度薄弱", "供给需求·均衡价格较熟悉"],
  progressPercent: 82,
  progressLabel: "一轮复习已完成 82%",
};

/** 待通关资产预览（按学生微调，默认 142 题模板） */
export function getMigrationAssetPreview(
  student: StudentAnalyticsItem | undefined
): MigrationAssetPreview {
  if (!student) return DEFAULT_MIGRATION_ASSETS;
  const count = student.total_quiz_count > 0 ? 142 : 0;
  const weak = student.weak_knowledge_points
    .slice(0, 2)
    .map((w) => `${w.label ?? w.knowledge_point_id}考点薄弱`);
  const strong =
    student.correct_rate >= 0.75
      ? ["供给需求·均衡价格较熟悉"]
      : ["经济体制发展阶段待巩固"];
  return {
    wrongBookCount: count,
    wrongBookLabel: `${count} 道文综经济/地理错题`,
    aiPortrait: weak.length > 0 ? [...weak, ...strong].slice(0, 2) : DEFAULT_MIGRATION_ASSETS.aiPortrait,
    progressPercent: Math.round(student.correct_rate * 100 * 0.95) || 82,
    progressLabel: `一轮复习已完成 ${Math.round(student.correct_rate * 100 * 0.95) || 82}%`,
  };
}

export function aggregateWeakPoints(students: StudentAnalyticsItem[]) {
  const map = new Map<string, { label: string; count: number; mastery: number }>();
  for (const s of students) {
    for (const w of s.weak_knowledge_points) {
      const key = w.knowledge_point_id;
      const prev = map.get(key);
      const label = w.label ?? w.knowledge_point_id;
      if (!prev) {
        map.set(key, { label, count: 1, mastery: w.mastery });
      } else {
        map.set(key, {
          label,
          count: prev.count + 1,
          mastery: Math.min(prev.mastery, w.mastery),
        });
      }
    }
  }
  return [...map.values()]
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 5);
}

export const MIGRATION_SUCCESS_MESSAGE =
  "该学生核心资产已成功通关至目标节点，国内席位已释放。";

export function batchMigrationSuccessMessage(
  count: number,
  sourceName: string,
  targetName: string
): string {
  return `跨境迁移完成：${count} 名学员由「${sourceName}」交接至「${targetName}」；国内席位已释放，日本侧席位已扣减。`;
}

export interface BatchMigrationPreview {
  studentCount: number;
  sourceSeatsReleased: number;
  targetRemainingSlots: number;
  seatCheckOk: boolean;
  seatCheckLabel: string;
}

/** 机构对机构批量通关 · Mock 汇总预览 */
export function getBatchMigrationPreview(
  source: PlatformOrgRecord,
  target: PlatformOrgRecord,
  slotOverrides?: {
    sourceUsed?: number;
    targetUsed?: number;
    targetLimit?: number;
  }
): BatchMigrationPreview {
  const studentCount = 20;
  const targetUsed = slotOverrides?.targetUsed ?? target.slots_used;
  const targetLimit = slotOverrides?.targetLimit ?? target.slots_limit;
  const targetRemaining = Math.max(0, targetLimit - targetUsed);
  const seatCheckOk = targetRemaining >= studentCount;

  return {
    studentCount,
    sourceSeatsReleased: studentCount,
    targetRemainingSlots: targetRemaining,
    seatCheckOk,
    seatCheckLabel: seatCheckOk
      ? "席位充足，允许通关"
      : `席位不足（缺 ${studentCount - targetRemaining} 席），拒绝通关`,
  };
}

export function remainingOrgSlots(session: TeacherSession): number {
  return Math.max(0, session.slotsLimit - session.slotsUsed);
}
