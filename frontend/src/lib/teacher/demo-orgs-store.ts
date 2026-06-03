/** 演示模式 · 开户机构 localStorage 持久化（刷新/切 Tab 不丢失） */

import { MOCK_PLATFORM_ORGS } from "./mock-data";
import type {
  AiModelRoute,
  OrganizationPublic,
  OrganizationUpdatePayload,
  PlatformOrgRecord,
} from "./types";

const CUSTOM_ORGS_KEY = "wenzong_demo_custom_orgs";
const ORG_PATCHES_KEY = "wenzong_demo_org_patches";

type OrgPatchMap = Record<string, Partial<OrganizationPublic>>;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function mockRecordToPublic(rec: PlatformOrgRecord): OrganizationPublic {
  return {
    id: rec.id,
    name: rec.name,
    region: rec.region === "GLOBAL" ? "CN" : rec.region,
    status: "active",
    expire_at: rec.expires_at,
    student_slots_limit: rec.slots_limit,
    ai_model_route: rec.ai_model_route ?? "domestic",
    cross_border_migration_enabled: rec.cross_border_migration_enabled ?? false,
  };
}

export function loadCustomDemoOrgs(): OrganizationPublic[] {
  return readJson<OrganizationPublic[]>(CUSTOM_ORGS_KEY, []);
}

export function loadDemoOrgPatches(): OrgPatchMap {
  return readJson<OrgPatchMap>(ORG_PATCHES_KEY, {});
}

export function addCustomDemoOrg(org: OrganizationPublic) {
  const next = [org, ...loadCustomDemoOrgs()];
  writeJson(CUSTOM_ORGS_KEY, next);
}

export function updateCustomDemoOrg(
  orgId: string,
  patch: OrganizationUpdatePayload
): OrganizationPublic | null {
  const list = loadCustomDemoOrgs();
  const idx = list.findIndex((o) => o.id === orgId);
  if (idx < 0) return null;
  const merged: OrganizationPublic = {
    ...list[idx],
    student_slots_limit: patch.student_slots_limit ?? list[idx].student_slots_limit,
    expire_at: patch.expire_at !== undefined ? patch.expire_at : list[idx].expire_at,
    ai_model_route: (patch.ai_model_route ?? list[idx].ai_model_route) as AiModelRoute,
    cross_border_migration_enabled:
      patch.cross_border_migration_enabled ?? list[idx].cross_border_migration_enabled,
  };
  const next = [...list];
  next[idx] = merged;
  writeJson(CUSTOM_ORGS_KEY, next);
  return merged;
}

export function patchMockDemoOrg(
  orgId: string,
  patch: OrganizationUpdatePayload
): OrganizationPublic | null {
  const base = MOCK_PLATFORM_ORGS.find((o) => o.id === orgId);
  if (!base) return null;
  const patches = loadDemoOrgPatches();
  const prev = patches[orgId] ?? {};
  const mergedPatch: Partial<OrganizationPublic> = {
    ...prev,
    ...(patch.student_slots_limit !== undefined
      ? { student_slots_limit: patch.student_slots_limit }
      : {}),
    ...(patch.expire_at !== undefined ? { expire_at: patch.expire_at } : {}),
    ...(patch.ai_model_route !== undefined ? { ai_model_route: patch.ai_model_route } : {}),
    ...(patch.cross_border_migration_enabled !== undefined
      ? { cross_border_migration_enabled: patch.cross_border_migration_enabled }
      : {}),
  };
  writeJson(ORG_PATCHES_KEY, { ...patches, [orgId]: mergedPatch });
  return { ...mockRecordToPublic(base), ...mergedPatch };
}

/** 自定义开户机构 + 内置 Mock 机构（含权益变更补丁） */
export function listDemoOrganizations(): OrganizationPublic[] {
  const custom = loadCustomDemoOrgs();
  const patches = loadDemoOrgPatches();
  const builtIn = MOCK_PLATFORM_ORGS.map((rec) => ({
    ...mockRecordToPublic(rec),
    ...(patches[rec.id] ?? {}),
  }));
  return [...custom, ...builtIn];
}

export function demoOrgToPlatformRecord(org: OrganizationPublic): PlatformOrgRecord {
  const mock = MOCK_PLATFORM_ORGS.find((m) => m.id === org.id);
  return {
    id: org.id,
    name: org.name,
    region: org.region,
    expires_at: org.expire_at?.slice(0, 10) ?? mock?.expires_at ?? "—",
    slots_used: mock?.slots_used ?? 0,
    slots_limit: org.student_slots_limit,
    status: mock?.status ?? "healthy",
    student_count: mock?.student_count ?? 0,
    ai_model_route: org.ai_model_route,
    cross_border_migration_enabled: org.cross_border_migration_enabled,
  };
}

export function listDemoPlatformOrgs(): PlatformOrgRecord[] {
  return listDemoOrganizations().map(demoOrgToPlatformRecord);
}
