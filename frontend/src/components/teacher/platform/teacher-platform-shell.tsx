"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, GraduationCap, KeyRound, Sparkles, UserCircle2, UserCog, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { refreshDemoSessionIfNeeded } from "@/lib/teacher/session";
import {
  DEMO_ORG_A_ID,
  useDemoPlatform,
} from "@/lib/teacher/demo-platform-context";
import { MOCK_PLATFORM_ORGS } from "@/lib/teacher/mock-data";
import {
  tobSpinner,
  tobBadgeAccent,
} from "@/lib/teacher/styles";
import type {
  DemoViewRole,
  OrgConsoleSubTab,
  OrgTeacherTab,
  PipelineSubTab,
  SuperAdminTab,
  TeacherSession,
} from "@/lib/teacher/types";
import { RoleSwitcher } from "./role-switcher";
import { PlatformDashboardTab } from "./platform-dashboard-tab";
import { OrgLicensingConsole } from "./org-licensing-console";
import { CrossBorderPipelineConsole } from "./cross-border-pipeline-console";
import { SuperAdminSidebarNav } from "./super-admin-sidebar-nav";
import { AnalyticsDashboardTab } from "./analytics-dashboard-tab";
import { ClassAdminTab } from "./class-admin-tab";
import { OrgStudentManagementTab } from "./org-student-management-tab";
import { MyOrgSlotsTab } from "./my-org-slots-tab";
import { OrgTeacherSidebarNav } from "./org-teacher-sidebar-nav";
import { GlossaryViewer } from "./glossary-viewer";

/** 全塾层面：宏观学情 + 全体学员 */
const ORG_TEACHER_NAV_ORG_WIDE = [
  { id: "macro-analytics" as const, label: "学情宏观大屏", icon: BarChart3 },
  { id: "student-directory" as const, label: "学员用户管理", icon: UserCog },
] as const;

/** 班级层面：单班编制与花名册 */
const ORG_TEACHER_NAV_CLASS = [
  { id: "class-admin" as const, label: "班级教务管理", icon: UsersRound },
] as const;

const ORG_TEACHER_NAV_TOOLBOX = {
  id: "slots-toolbox" as const,
  label: "席位与激活码",
  icon: KeyRound,
};

const DEFAULT_TAB: Record<DemoViewRole, SuperAdminTab | OrgTeacherTab> = {
  super_admin: "platform-dashboard",
  org_teacher: "macro-analytics",
};

export function TeacherPlatformShell() {
  const {
    setCurrentNavigation,
    closeGlossary,
    getOrgSlots,
    getCodesForOrg,
    orgSlots,
    orgConsoleSubTab,
    setOrgConsoleSubTab,
    pipelineSubTab,
    setPipelineSubTab,
  } = useDemoPlatform();
  const [session, setSession] = useState<TeacherSession | null>(null);
  const [viewRole, setViewRole] = useState<DemoViewRole>("super_admin");
  const [superTab, setSuperTab] = useState<SuperAdminTab>("platform-dashboard");
  const [teacherTab, setTeacherTab] = useState<OrgTeacherTab>("macro-analytics");

  useEffect(() => {
    setSession(refreshDemoSessionIfNeeded());
  }, []);

  useEffect(() => {
    setCurrentNavigation({
      viewRole,
      superTab,
      teacherTab,
      orgConsoleSubTab,
      pipelineSubTab,
    });
  }, [
    viewRole,
    superTab,
    teacherTab,
    orgConsoleSubTab,
    pipelineSubTab,
    setCurrentNavigation,
  ]);

  useEffect(() => {
    if (viewRole !== "org_teacher" || !session) return;
    const slots = getOrgSlots(session.orgId);
    setSession((prev) =>
      prev && (prev.slotsUsed !== slots.used || prev.slotsLimit !== slots.limit)
        ? { ...prev, slotsUsed: slots.used, slotsLimit: slots.limit }
        : prev
    );
  }, [orgSlots, viewRole, session?.orgId, getOrgSlots]);

  const handleGlossaryReturn = useCallback(() => {
    const snap = closeGlossary();
    if (!snap) return;
    setViewRole(snap.viewRole);
    setSuperTab(snap.superTab);
    setTeacherTab(snap.teacherTab);
    if (snap.orgConsoleSubTab) {
      const tab =
        (snap.orgConsoleSubTab as string) === "seats" ? "org-management" : snap.orgConsoleSubTab;
      setOrgConsoleSubTab(tab);
    }
    if (snap.pipelineSubTab) setPipelineSubTab(snap.pipelineSubTab);
  }, [closeGlossary, setOrgConsoleSubTab, setPipelineSubTab]);

  const handleSuperTabChange = useCallback((tab: SuperAdminTab) => {
    setSuperTab(tab);
  }, []);

  const handleRoleChange = useCallback(
    (role: DemoViewRole) => {
      if (role === "org_teacher") {
        const orgA = MOCK_PLATFORM_ORGS.find((o) => o.id === DEMO_ORG_A_ID);
        if (orgA) {
          const slots = getOrgSlots(orgA.id);
          setSession((prev) =>
            prev
              ? {
                  ...prev,
                  orgId: orgA.id,
                  orgName: orgA.name,
                  region: "JP",
                  slotsUsed: slots.used,
                  slotsLimit: slots.limit,
                  targetOrgId: "org-1",
                  targetOrgName: "Org-C",
                }
              : prev
          );
          if (getCodesForOrg(orgA.name).length > 0) {
            setTeacherTab("slots-toolbox");
          }
        }
      }
      setViewRole(role);
    },
    [getOrgSlots, getCodesForOrg]
  );

  const roleMeta = useMemo(
    () =>
      viewRole === "super_admin"
        ? {
            badge: "Super Admin",
            scope: "全球 SaaS 平台管控",
            icon: Sparkles,
          }
        : {
            badge: session?.orgName ?? "机构",
            scope: `${session?.teacherDisplayName ?? "教师"} · 教学管理`,
            icon: GraduationCap,
          },
    [viewRole, session]
  );

  if (!session) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className={cn("h-9 w-9 animate-spin rounded-full border-2", tobSpinner)} />
      </div>
    );
  }

  const RoleIcon = roleMeta.icon;

  return (
    <div className="teacher-platform flex min-h-[calc(100dvh-8rem)] flex-col gap-0">
      <GlossaryViewer onReturn={handleGlossaryReturn} />
      <header className="teacher-platform__header mb-6 rounded-2xl border border-border bg-card/70 px-4 py-4 shadow-[var(--soft-glow-sm)] backdrop-blur-xl sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[var(--soft-glow-sm)]">
              <RoleIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                文综学习平台
              </h1>
              <p className="text-[11px] text-muted-foreground">{roleMeta.scope}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="outline" className={cn("text-[10px]", tobBadgeAccent)}>
                  {roleMeta.badge}
                </Badge>
                {session.demoMode && (
                  <Badge variant="outline" className="border-border text-[10px] text-muted-foreground">
                    Demo Show
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
            <RoleSwitcher value={viewRole} onChange={handleRoleChange} />
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/50">
                <UserCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-foreground">{session.teacherDisplayName}</p>
                <p className="text-[10px] text-muted-foreground">
                  {viewRole === "super_admin" ? "platform@wenzong.app" : session.orgName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row lg:gap-8">
        <aside
          key={viewRole}
          className="teacher-platform__sidebar lg:w-60 lg:shrink-0 animate-in fade-in slide-in-from-left-3 duration-300"
        >
          <div className="sticky top-20 space-y-3">
            <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {viewRole === "super_admin" ? "平台超级管理员" : "教学运营"}
            </p>
            {viewRole === "super_admin" ? (
              <SuperAdminSidebarNav
                superTab={superTab}
                orgConsoleSubTab={orgConsoleSubTab}
                pipelineSubTab={pipelineSubTab}
                onSuperTabChange={handleSuperTabChange}
                onOrgConsoleSubTabChange={setOrgConsoleSubTab}
                onPipelineSubTabChange={setPipelineSubTab}
              />
            ) : (
              <OrgTeacherSidebarNav
                active={teacherTab}
                orgWide={ORG_TEACHER_NAV_ORG_WIDE}
                classLevel={ORG_TEACHER_NAV_CLASS}
                toolbox={ORG_TEACHER_NAV_TOOLBOX}
                onChange={setTeacherTab}
              />
            )}
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-12">
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-400">
            {viewRole === "super_admin" && (
              <>
                <div className={cn(superTab !== "platform-dashboard" && "hidden")}>
                  <PlatformDashboardTab />
                </div>
                <div className={cn(superTab !== "org-console" && "hidden")}>
                  <OrgLicensingConsole session={session} />
                </div>
                <div className={cn(superTab !== "cross-border-pipeline" && "hidden")}>
                  <CrossBorderPipelineConsole session={session} />
                </div>
              </>
            )}
            {viewRole === "org_teacher" && teacherTab === "macro-analytics" && (
              <AnalyticsDashboardTab session={session} />
            )}
            {viewRole === "org_teacher" && teacherTab === "student-directory" && (
              <OrgStudentManagementTab session={session} />
            )}
            {viewRole === "org_teacher" && teacherTab === "class-admin" && (
              <ClassAdminTab session={session} />
            )}
            {viewRole === "org_teacher" && teacherTab === "slots-toolbox" && (
              <MyOrgSlotsTab session={session} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export { DEFAULT_TAB };
