"use client";

import type { TeacherSession } from "./types";
import { DEMO_TEACHER_SESSION } from "./mock-data";

const STORAGE_KEY = "wenzong_teacher_session";

export function loadTeacherSession(): TeacherSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TeacherSession;
  } catch {
    return null;
  }
}

export function saveTeacherSession(session: TeacherSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearTeacherSession() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * 初始化演示 Session。
 * 若后端已配置且存在真实 Token，则保留；否则写入 Mock（含 org_id / role 供 API 尝试）。
 */
export function initDemoTeacherSession(): TeacherSession {
  const existing = loadTeacherSession();
  if (existing?.accessToken && !existing.demoMode) {
    return existing;
  }
  const session: TeacherSession = {
    ...DEMO_TEACHER_SESSION,
    accessToken: existing?.accessToken ?? "",
    demoMode: !existing?.accessToken,
  };
  saveTeacherSession(session);
  return session;
}

/** 演示数据更新后刷新本地 Session（如雷老师 / 机构ABC 命名） */
export function refreshDemoSessionIfNeeded(): TeacherSession {
  const existing = loadTeacherSession();
  if (existing?.accessToken && !existing.demoMode) return existing;
  return initDemoTeacherSession();
}

/** 将后端登录响应合并进 Session（register-or-bind 成功后调用） */
export function mergeAuthIntoSession(
  base: TeacherSession,
  payload: {
    access_token: string;
    user: {
      id: string;
      role: string;
      org_id?: string | null;
      region: string;
    };
  }
): TeacherSession {
  const next: TeacherSession = {
    ...base,
    accessToken: payload.access_token,
    demoMode: false,
    userId: payload.user.id,
    teacherId: payload.user.id,
    orgId: payload.user.org_id ?? base.orgId,
    role:
      payload.user.role === "org_admin"
        ? "org_admin"
        : payload.user.role === "super_admin"
          ? "super_admin"
          : "teacher",
    region: payload.user.region === "JP" ? "JP" : "CN",
  };
  saveTeacherSession(next);
  return next;
}

export function authHeaders(session: TeacherSession): HeadersInit {
  if (!session.accessToken) return {};
  return { Authorization: `Bearer ${session.accessToken}` };
}
