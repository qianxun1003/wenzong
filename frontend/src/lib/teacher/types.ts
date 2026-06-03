/** 教师后台 · 与后端 Schema 对齐 */

/** 路演 Demo：顶部身份切换视角 */
export type DemoViewRole = "super_admin" | "org_teacher";

export type SuperAdminTab =
  | "platform-dashboard"
  | "org-console"
  | "cross-border-pipeline";

/** 机构与授权 · 子页签 */
export type OrgConsoleSubTab = "onboarding" | "org-management" | "activation-codes";

/** 跨境合作 · 子页签 */
export type PipelineSubTab = "alliance" | "customs";

/** @deprecated 使用 OrgConsoleSubTab | PipelineSubTab */
export type LicensingSubTab = OrgConsoleSubTab | PipelineSubTab;

export type OrgTeacherTab =
  | "macro-analytics"
  | "class-admin"
  | "student-directory"
  | "slots-toolbox";

export type TeacherTab = SuperAdminTab | OrgTeacherTab;

/** @deprecated 使用 SuperAdminTab | OrgTeacherTab */
export type LegacyTeacherTab = "dashboard" | "org" | "migration" | "knowledge";

export interface TeacherSession {
  accessToken: string;
  demoMode: boolean;
  userId: string;
  teacherId: string;
  orgId: string;
  role: "teacher" | "org_admin" | "super_admin";
  orgName: string;
  targetOrgId: string;
  targetOrgName: string;
  region: "CN" | "JP";
  status: "active" | "expired" | "frozen";
  slotsUsed: number;
  slotsLimit: number;
  teacherDisplayName: string;
}

export interface ErrorTagStat {
  error_tag_id: string;
  count: number;
}

export interface KnowledgeWeakness {
  knowledge_point_id: string;
  mastery: number;
  label?: string | null;
}

export interface StudentAnalyticsItem {
  user_id: string;
  display_name?: string | null;
  class_ids: string[];
  current_chapter_id?: string | null;
  total_quiz_count: number;
  correct_rate: number;
  last_active_at?: string | null;
  top_error_tags: ErrorTagStat[];
  weak_knowledge_points: KnowledgeWeakness[];
}

export interface TeacherDashboardResponse {
  org_id: string;
  teacher_id: string;
  class_count: number;
  students: StudentAnalyticsItem[];
}

export interface ActivationCodePublic {
  id: string;
  org_id: string;
  code: string;
  class_id?: string | null;
  max_uses: number;
  used_count: number;
  is_active: boolean;
}

export interface CrossBorderMigrationResponse {
  migration: {
    id: string;
    user_id: string;
    source_org_id: string;
    target_org_id: string;
    status: string;
    error_message?: string | null;
    created_at?: string | null;
    completed_at?: string | null;
  };
  student_org_id: string;
  message: string;
}

export interface DbUploadLogPublic {
  id: string;
  filename: string;
  uploaded_by?: string | null;
  target_version: string;
  created_at?: string | null;
}

export interface OrganizationPublic {
  id: string;
  name: string;
  region: "CN" | "JP";
  status: string;
  expire_at: string | null;
  student_slots_limit: number;
  ai_model_route: AiModelRoute;
  cross_border_migration_enabled: boolean;
}

export type AiModelRoute = "domestic" | "global_hybrid";

export interface OrganizationCreatePayload {
  name: string;
  region: "CN" | "JP";
  student_slots_limit: number;
  expire_at?: string | null;
  ai_model_route?: AiModelRoute;
  cross_border_migration_enabled?: boolean;
}

export interface OrganizationUpdatePayload {
  student_slots_limit?: number;
  expire_at?: string | null;
  ai_model_route?: AiModelRoute;
  cross_border_migration_enabled?: boolean;
}

export interface ActivationCodeBatchResponse {
  org_id: string;
  codes: string[];
}

export interface PlatformOrgRecord {
  id: string;
  name: string;
  region: "CN" | "JP" | "GLOBAL";
  partner_label?: string;
  expires_at: string;
  slots_used: number;
  slots_limit: number;
  status: "healthy" | "warning" | "critical";
  student_count: number;
  ai_model_route?: AiModelRoute;
  cross_border_migration_enabled?: boolean;
}

export interface PlatformStats {
  org_count: number;
  active_students: number;
}

export interface StudentActivationLog {
  id: string;
  student_name: string;
  activated_at: string;
  code_suffix: string;
  status: "active" | "expired";
}

/** 全塾学员花名册 · 汇总行 */
export type StudentActivityLevel = "high" | "weekly" | "low" | "inactive";

export interface OrgStudentDirectoryItem {
  user_id: string;
  display_name: string;
  joined_at: string;
  class_labels: string[];
  activity_level: StudentActivityLevel;
  last_active_at?: string | null;
  total_quiz_count: number;
  correct_rate: number;
  account_status: "active" | "expired";
}

/** 本塾教学班 · 宏观看板卡片数据 */
export interface MockClassSummary {
  id: string;
  name: string;
  studentCount: number;
  avgCorrectRate: number;
  sevenDayActiveCount: number;
  syllabusProgress: { chapter: string; percent: number }[];
}
