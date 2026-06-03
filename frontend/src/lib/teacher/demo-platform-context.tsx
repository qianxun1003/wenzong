"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { GlossaryTermId } from "./glossary";
import {
  addCoOpPartnership,
  isCoOpPartnershipBound,
  loadCoOpPartnerships,
  removeCoOpPartnership,
  type CoOpPartnership,
} from "./demo-co-op-store";
import {
  demoOrgToPlatformRecord,
  listDemoOrganizations,
  loadCustomDemoOrgs,
} from "./demo-orgs-store";
import {
  loadPersistedOrgSlots,
  loadPersistedTransfers,
  savePersistedOrgSlots,
  savePersistedTransfers,
} from "./demo-platform-runtime-store";
import { MOCK_PLATFORM_ORGS } from "./mock-data";
import type {
  DemoViewRole,
  OrgConsoleSubTab,
  OrgTeacherTab,
  OrganizationPublic,
  PipelineSubTab,
  PlatformOrgRecord,
  SuperAdminTab,
} from "./types";

export interface DemoNavigationSnapshot {
  viewRole: DemoViewRole;
  superTab: SuperAdminTab;
  teacherTab: OrgTeacherTab;
  orgConsoleSubTab?: OrgConsoleSubTab;
  pipelineSubTab?: PipelineSubTab;
}

export interface DispatchedActivationCode {
  id: string;
  orgId: string;
  orgName: string;
  code: string;
  status: "unused" | "used";
  createdAt: string;
}

export interface OrgSlotState {
  used: number;
  limit: number;
}

export interface CrossBorderTransferRecord {
  id: string;
  studentCode: string;
  sourceOrgId: string;
  sourceOrgName: string;
  targetOrgId: string;
  targetOrgName: string;
  transferredAt: string;
}

export type { CoOpPartnership };

interface DemoPlatformContextValue {
  /** 全局机构注册表（开户 / 权益变更的唯一数据源） */
  platformOrganizations: OrganizationPublic[];
  platformOrgRecords: PlatformOrgRecord[];
  orgSlots: Record<string, OrgSlotState>;
  demoOrgRevision: number;
  coOpPartnerships: CoOpPartnership[];
  crossBorderTransfers: CrossBorderTransferRecord[];
  getOrgSlots: (orgId: string) => OrgSlotState;
  registerOrgFromOnboarding: (org: OrganizationPublic) => void;
  syncOrganizationUpdate: (org: OrganizationPublic) => void;
  isCoOpBound: (sourceOrgId: string, targetOrgId: string) => boolean;
  establishCoOpPartnership: (
    sourceOrgId: string,
    sourceOrgName: string,
    targetOrgId: string,
    targetOrgName: string
  ) => "created" | "duplicate";
  dissolveCoOpPartnership: (partnershipId: string) => boolean;
  orgConsoleSubTab: OrgConsoleSubTab;
  setOrgConsoleSubTab: (tab: OrgConsoleSubTab) => void;
  pipelineSubTab: PipelineSubTab;
  setPipelineSubTab: (tab: PipelineSubTab) => void;
  transferOrgSlots: (sourceOrgId: string, targetOrgId: string, count: number) => void;
  completeCrossBorderTransfer: (
    sourceOrgId: string,
    sourceOrgName: string,
    targetOrgId: string,
    targetOrgName: string,
    studentCodes: string[]
  ) => void;
  dispatchedCodes: DispatchedActivationCode[];
  dispatchActivationCodes: (orgId: string, orgName: string, codes: string[]) => void;
  getCodesForOrg: (orgName: string) => DispatchedActivationCode[];
  /** 学员激活入塾 · 占用 1 席 */
  consumeOrgSlot: (orgId: string) => boolean;
  /** 将已分发的激活码标为已核销 */
  markActivationCodeUsed: (codeId: string) => void;
  currentNavigation: DemoNavigationSnapshot | null;
  setCurrentNavigation: (snapshot: DemoNavigationSnapshot) => void;
  glossaryOpen: boolean;
  activeGlossaryTerm: GlossaryTermId | null;
  openGlossary: (termId: GlossaryTermId, snapshot: DemoNavigationSnapshot) => void;
  closeGlossary: () => DemoNavigationSnapshot | null;
}

const DemoPlatformContext = createContext<DemoPlatformContextValue | null>(null);

function buildInitialOrgSlots(): Record<string, OrgSlotState> {
  const slots: Record<string, OrgSlotState> = Object.fromEntries(
    MOCK_PLATFORM_ORGS.map((o) => [o.id, { used: o.slots_used, limit: o.slots_limit }])
  );
  for (const org of loadCustomDemoOrgs()) {
    slots[org.id] = { used: 0, limit: org.student_slots_limit };
  }
  return slots;
}

function loadInitialOrgSlots(): Record<string, OrgSlotState> {
  const persisted = loadPersistedOrgSlots();
  const base = buildInitialOrgSlots();
  if (!persisted) return base;
  return { ...base, ...persisted };
}

export function orgNameToCodeSlug(name: string): string {
  const base = name.split("(")[0]?.trim() ?? name;
  if (/^Org-/i.test(base)) {
    return base.replace(/^Org-/i, "ORG").replace(/-/g, "").toUpperCase();
  }
  return base.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 4) || "ORG";
}

export function generateDemoActivationCodes(orgName: string, count = 3): string[] {
  const slug = orgNameToCodeSlug(orgName);
  const seen = new Set<string>();
  const codes: string[] = [];
  while (codes.length < count) {
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    const code = `EJU-${slug}-${rand}`;
    if (!seen.has(code)) {
      seen.add(code);
      codes.push(code);
    }
  }
  return codes;
}

export function DemoPlatformProvider({ children }: { children: ReactNode }) {
  const [platformOrganizations, setPlatformOrganizations] = useState<OrganizationPublic[]>(
    listDemoOrganizations
  );
  const [orgSlots, setOrgSlots] = useState<Record<string, OrgSlotState>>(loadInitialOrgSlots);
  const [demoOrgRevision, setDemoOrgRevision] = useState(0);
  const [coOpPartnerships, setCoOpPartnerships] = useState<CoOpPartnership[]>(loadCoOpPartnerships);
  const [crossBorderTransfers, setCrossBorderTransfers] =
    useState<CrossBorderTransferRecord[]>(loadPersistedTransfers);
  const [dispatchedCodes, setDispatchedCodes] = useState<DispatchedActivationCode[]>([]);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [activeGlossaryTerm, setActiveGlossaryTerm] = useState<GlossaryTermId | null>(null);
  const [returnSnapshot, setReturnSnapshot] = useState<DemoNavigationSnapshot | null>(null);
  const [currentNavigation, setCurrentNavigation] = useState<DemoNavigationSnapshot | null>(null);
  const [orgConsoleSubTab, setOrgConsoleSubTab] = useState<OrgConsoleSubTab>("onboarding");
  const [pipelineSubTab, setPipelineSubTab] = useState<PipelineSubTab>("alliance");

  const platformOrgRecords = useMemo(
    () => platformOrganizations.map(demoOrgToPlatformRecord),
    [platformOrganizations]
  );

  const persistOrgSlots = useCallback((next: Record<string, OrgSlotState>) => {
    savePersistedOrgSlots(next);
  }, []);

  const persistTransfers = useCallback((next: CrossBorderTransferRecord[]) => {
    savePersistedTransfers(next);
  }, []);

  const getOrgSlots = useCallback(
    (orgId: string): OrgSlotState => {
      return orgSlots[orgId] ?? { used: 0, limit: 50 };
    },
    [orgSlots]
  );

  const registerOrgFromOnboarding = useCallback(
    (org: OrganizationPublic) => {
      setPlatformOrganizations((prev) => {
        if (prev.some((o) => o.id === org.id)) return prev;
        return [org, ...prev];
      });
      setOrgSlots((prev) => {
        const next = {
          ...prev,
          [org.id]: { used: 0, limit: org.student_slots_limit },
        };
        persistOrgSlots(next);
        return next;
      });
      setDemoOrgRevision((v) => v + 1);
    },
    [persistOrgSlots]
  );

  const syncOrganizationUpdate = useCallback(
    (org: OrganizationPublic) => {
      setPlatformOrganizations((prev) => prev.map((o) => (o.id === org.id ? org : o)));
      setOrgSlots((prev) => {
        const current = prev[org.id] ?? { used: 0, limit: org.student_slots_limit };
        const next = {
          ...prev,
          [org.id]: { ...current, limit: org.student_slots_limit },
        };
        persistOrgSlots(next);
        return next;
      });
      setDemoOrgRevision((v) => v + 1);
    },
    [persistOrgSlots]
  );

  const isCoOpBound = useCallback(
    (sourceOrgId: string, targetOrgId: string) =>
      coOpPartnerships.some(
        (p) => p.sourceOrgId === sourceOrgId && p.targetOrgId === targetOrgId
      ),
    [coOpPartnerships]
  );

  const establishCoOpPartnership = useCallback(
    (
      sourceOrgId: string,
      sourceOrgName: string,
      targetOrgId: string,
      targetOrgName: string
    ): "created" | "duplicate" => {
      if (isCoOpPartnershipBound(sourceOrgId, targetOrgId)) {
        return "duplicate";
      }
      const created = addCoOpPartnership({
        sourceOrgId,
        sourceOrgName,
        targetOrgId,
        targetOrgName,
      });
      setCoOpPartnerships((prev) => [created, ...prev]);
      return "created";
    },
    []
  );

  const dissolveCoOpPartnership = useCallback((partnershipId: string) => {
    const removed = removeCoOpPartnership(partnershipId);
    if (removed) {
      setCoOpPartnerships((prev) => prev.filter((p) => p.id !== partnershipId));
    }
    return removed;
  }, []);

  const transferOrgSlots = useCallback(
    (sourceOrgId: string, targetOrgId: string, count: number) => {
      setOrgSlots((prev) => {
        const source = prev[sourceOrgId] ?? { used: 0, limit: 50 };
        const target = prev[targetOrgId] ?? { used: 0, limit: 50 };
        const next = {
          ...prev,
          [sourceOrgId]: { ...source, used: Math.max(0, source.used - count) },
          [targetOrgId]: { ...target, used: target.used + count },
        };
        persistOrgSlots(next);
        return next;
      });
    },
    [persistOrgSlots]
  );

  const completeCrossBorderTransfer = useCallback(
    (
      sourceOrgId: string,
      sourceOrgName: string,
      targetOrgId: string,
      targetOrgName: string,
      studentCodes: string[]
    ) => {
      const count = studentCodes.length;
      if (count === 0) return;
      transferOrgSlots(sourceOrgId, targetOrgId, count);
      const now = new Date().toISOString();
      setCrossBorderTransfers((prev) => {
        const next = [
          ...prev,
          ...studentCodes.map((studentCode, i) => ({
            id: `xfr-${sourceOrgId}-${targetOrgId}-${Date.now()}-${i}`,
            studentCode,
            sourceOrgId,
            sourceOrgName,
            targetOrgId,
            targetOrgName,
            transferredAt: now,
          })),
        ];
        persistTransfers(next);
        return next;
      });
    },
    [transferOrgSlots, persistTransfers]
  );

  const dispatchActivationCodes = useCallback(
    (orgId: string, orgName: string, codes: string[]) => {
      const now = new Date().toISOString();
      const batch: DispatchedActivationCode[] = codes.map((code, i) => ({
        id: `disp-${orgId}-${Date.now()}-${i}`,
        orgId,
        orgName,
        code,
        status: "unused" as const,
        createdAt: now,
      }));
      setDispatchedCodes((prev) => [...batch, ...prev]);
    },
    []
  );

  const getCodesForOrg = useCallback(
    (orgName: string) =>
      dispatchedCodes.filter((c) => c.orgName === orgName.split("(")[0]?.trim()),
    [dispatchedCodes]
  );

  const consumeOrgSlot = useCallback(
    (orgId: string): boolean => {
      let ok = false;
      setOrgSlots((prev) => {
        const current = prev[orgId] ?? { used: 0, limit: 50 };
        if (current.used >= current.limit) return prev;
        ok = true;
        const next = {
          ...prev,
          [orgId]: { ...current, used: current.used + 1 },
        };
        persistOrgSlots(next);
        return next;
      });
      return ok;
    },
    [persistOrgSlots]
  );

  const markActivationCodeUsed = useCallback((codeId: string) => {
    setDispatchedCodes((prev) =>
      prev.map((c) => (c.id === codeId ? { ...c, status: "used" as const } : c))
    );
  }, []);

  const openGlossary = useCallback((termId: GlossaryTermId, snapshot: DemoNavigationSnapshot) => {
    setReturnSnapshot(snapshot);
    setActiveGlossaryTerm(termId);
    setGlossaryOpen(true);
  }, []);

  const closeGlossary = useCallback((): DemoNavigationSnapshot | null => {
    setGlossaryOpen(false);
    setActiveGlossaryTerm(null);
    const snap = returnSnapshot;
    setReturnSnapshot(null);
    return snap;
  }, [returnSnapshot]);

  const value = useMemo(
    () => ({
      platformOrganizations,
      platformOrgRecords,
      orgSlots,
      demoOrgRevision,
      coOpPartnerships,
      crossBorderTransfers,
      getOrgSlots,
      registerOrgFromOnboarding,
      syncOrganizationUpdate,
      isCoOpBound,
      establishCoOpPartnership,
      dissolveCoOpPartnership,
      orgConsoleSubTab,
      setOrgConsoleSubTab,
      pipelineSubTab,
      setPipelineSubTab,
      transferOrgSlots,
      completeCrossBorderTransfer,
      dispatchedCodes,
      dispatchActivationCodes,
      getCodesForOrg,
      consumeOrgSlot,
      markActivationCodeUsed,
      currentNavigation,
      setCurrentNavigation,
      glossaryOpen,
      activeGlossaryTerm,
      openGlossary,
      closeGlossary,
    }),
    [
      platformOrganizations,
      platformOrgRecords,
      orgSlots,
      demoOrgRevision,
      coOpPartnerships,
      crossBorderTransfers,
      getOrgSlots,
      registerOrgFromOnboarding,
      syncOrganizationUpdate,
      isCoOpBound,
      establishCoOpPartnership,
      dissolveCoOpPartnership,
      orgConsoleSubTab,
      pipelineSubTab,
      transferOrgSlots,
      completeCrossBorderTransfer,
      dispatchedCodes,
      dispatchActivationCodes,
      getCodesForOrg,
      consumeOrgSlot,
      markActivationCodeUsed,
      currentNavigation,
      glossaryOpen,
      activeGlossaryTerm,
      openGlossary,
      closeGlossary,
    ]
  );

  return <DemoPlatformContext.Provider value={value}>{children}</DemoPlatformContext.Provider>;
}

export function useDemoPlatform() {
  const ctx = useContext(DemoPlatformContext);
  if (!ctx) {
    throw new Error("useDemoPlatform must be used within DemoPlatformProvider");
  }
  return ctx;
}

/** 演示机构 Org-A 的 mock id */
export const DEMO_ORG_A_ID = "org-5";
