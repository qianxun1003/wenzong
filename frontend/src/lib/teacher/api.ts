import type {
  ActivationCodeBatchResponse,
  ActivationCodePublic,
  CrossBorderMigrationResponse,
  DbUploadLogPublic,
  OrganizationCreatePayload,
  OrganizationPublic,
  OrganizationUpdatePayload,
  TeacherDashboardResponse,
  TeacherSession,
} from "./types";
import { MOCK_DASHBOARD, MOCK_PLATFORM_ORGS } from "./mock-data";
import {
  addCustomDemoOrg,
  listDemoOrganizations,
  mockRecordToPublic,
  patchMockDemoOrg,
  updateCustomDemoOrg,
} from "./demo-orgs-store";
import { authHeaders } from "./session";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function platformRequest<T>(
  path: string,
  session: TeacherSession,
  options?: RequestInit
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(options?.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...authHeaders(session),
        ...options?.headers,
      },
    });
  } catch {
    throw new Error(`无法连接后端（${API_BASE}）`);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const detail = err.detail;
    throw new Error(typeof detail === "string" ? detail : "请求失败");
  }
  return res.json();
}

export async function fetchTeacherAnalytics(
  session: TeacherSession,
  classId?: string
): Promise<TeacherDashboardResponse> {
  if (session.demoMode && !session.accessToken) {
    return MOCK_DASHBOARD;
  }
  const params = new URLSearchParams({ org_id: session.orgId });
  if (classId) params.set("class_id", classId);
  try {
    return await platformRequest<TeacherDashboardResponse>(
      `/api/teacher/dashboard/analytics?${params}`,
      session
    );
  } catch {
    if (session.demoMode) return MOCK_DASHBOARD;
    throw new Error("学情数据加载失败，请确认已登录教师账号且数据库已迁移");
  }
}

export async function createActivationCode(
  session: TeacherSession,
  maxUses = 50
): Promise<ActivationCodePublic> {
  if (session.demoMode && !session.accessToken) {
    const code = `EJU-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
    return {
      id: `demo-${Date.now()}`,
      org_id: session.orgId,
      code,
      max_uses: maxUses,
      used_count: 0,
      is_active: true,
    };
  }
  return platformRequest<ActivationCodePublic>(
    `/api/org/${session.orgId}/activation-codes`,
    session,
    {
      method: "POST",
      body: JSON.stringify({ max_uses: maxUses }),
    }
  );
}

function mockOrgFromRecord(id: string): OrganizationPublic | undefined {
  const fromList = listDemoOrganizations().find((o) => o.id === id);
  if (fromList) return fromList;
  const rec = MOCK_PLATFORM_ORGS.find((o) => o.id === id);
  if (!rec) return undefined;
  return mockRecordToPublic(rec);
}

export async function fetchOrganizations(
  session: TeacherSession
): Promise<OrganizationPublic[]> {
  if (session.demoMode && !session.accessToken) {
    return listDemoOrganizations();
  }
  return platformRequest<OrganizationPublic[]>("/api/org/organizations", session);
}

export async function createOrganization(
  session: TeacherSession,
  payload: OrganizationCreatePayload
): Promise<OrganizationPublic> {
  if (session.demoMode && !session.accessToken) {
    const created: OrganizationPublic = {
      id: `org-demo-${Date.now()}`,
      name: payload.name,
      region: payload.region,
      status: "active",
      expire_at: payload.expire_at ?? null,
      student_slots_limit: payload.student_slots_limit,
      ai_model_route: payload.ai_model_route ?? "domestic",
      cross_border_migration_enabled: payload.cross_border_migration_enabled ?? false,
    };
    addCustomDemoOrg(created);
    return created;
  }
  return platformRequest<OrganizationPublic>("/api/org/organizations", session, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateOrganization(
  session: TeacherSession,
  orgId: string,
  payload: OrganizationUpdatePayload
): Promise<OrganizationPublic> {
  if (session.demoMode && !session.accessToken) {
    const fromCustom = updateCustomDemoOrg(orgId, payload);
    if (fromCustom) return fromCustom;
    const fromMock = patchMockDemoOrg(orgId, payload);
    if (fromMock) return fromMock;
    throw new Error("机构不存在");
  }
  return platformRequest<OrganizationPublic>(`/api/org/organizations/${orgId}`, session, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function batchCreateActivationCodes(
  session: TeacherSession,
  orgId: string,
  count: number
): Promise<ActivationCodeBatchResponse> {
  if (session.demoMode && !session.accessToken) {
    await new Promise((r) => setTimeout(r, 600));
    const org = MOCK_PLATFORM_ORGS.find((o) => o.id === orgId);
    const prefix = org?.region === "JP" ? "JP" : "CN";
    const n = Math.min(100, Math.max(1, count));
    const codes = Array.from({ length: n }, (_, i) =>
      `${prefix}-${org?.name.slice(0, 2) ?? "XX"}-${Date.now().toString(36).slice(-4).toUpperCase()}${i}`
    );
    return { org_id: orgId, codes };
  }
  return platformRequest<ActivationCodeBatchResponse>(
    `/api/org/${orgId}/activation-codes/batch`,
    session,
    {
      method: "POST",
      body: JSON.stringify({ count, max_uses: 1 }),
    }
  );
}

export async function initiateCrossBorderMigration(
  session: TeacherSession,
  studentId: string
): Promise<CrossBorderMigrationResponse> {
  if (session.demoMode && !session.accessToken) {
    await new Promise((r) => setTimeout(r, 1800));
    return {
      migration: {
        id: `demo-mig-${Date.now()}`,
        user_id: studentId,
        source_org_id: session.orgId,
        target_org_id: session.targetOrgId,
        status: "completed",
        completed_at: new Date().toISOString(),
      },
      student_org_id: session.targetOrgId,
      message: "迁移完成（演示模式）",
    };
  }
  return platformRequest<CrossBorderMigrationResponse>(
    "/api/migration/cross-border",
    session,
    {
      method: "POST",
      body: JSON.stringify({
        student_id: studentId,
        source_org_id: session.orgId,
        target_org_id: session.targetOrgId,
      }),
    }
  );
}

export async function fetchDbUploadLogs(
  session: TeacherSession
): Promise<DbUploadLogPublic[]> {
  if (session.demoMode && !session.accessToken) {
    return [
      {
        id: "1",
        filename: "eju_2026_syllabus_bundle.zip",
        target_version: "2026版文综大纲",
        created_at: new Date().toISOString(),
      },
    ];
  }
  try {
    return await platformRequest<DbUploadLogPublic[]>(
      "/api/db-management/upload-logs",
      session
    );
  } catch {
    return [];
  }
}

export async function recordDbUploadLog(
  session: TeacherSession,
  payload: { filename: string; target_version: string; file_size_bytes?: number }
): Promise<DbUploadLogPublic> {
  if (session.demoMode && !session.accessToken) {
    return {
      id: `demo-${Date.now()}`,
      ...payload,
      uploaded_by: session.userId,
      created_at: new Date().toISOString(),
    };
  }
  return platformRequest<DbUploadLogPublic>(
    "/api/db-management/upload-logs",
    session,
    { method: "POST", body: JSON.stringify(payload) }
  );
}
