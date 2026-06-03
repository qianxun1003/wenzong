"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  batchCreateActivationCodes,
  createOrganization,
  fetchOrganizations,
  updateOrganization,
} from "@/lib/teacher/api";
import {
  generateDemoActivationCodes,
  useDemoPlatform,
} from "@/lib/teacher/demo-platform-context";
import type { AiModelRoute, OrganizationPublic, TeacherSession } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";
import { OrgConsoleSubTabs } from "./org-console-sub-tabs";
import { LicensingOnboardingPanel } from "./licensing-onboarding-panel";
import { LicensingOrgManagementPanel } from "./licensing-org-management-panel";
import { LicensingActivationCodesPanel } from "./licensing-activation-codes-panel";
import { GlossaryText } from "./glossary-text";

type RegionChoice = "CN" | "JP";

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function defaultExpireDate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

interface OrgLicensingConsoleProps {
  session: TeacherSession;
}

export function OrgLicensingConsole({ session }: OrgLicensingConsoleProps) {
  const {
    dispatchActivationCodes,
    registerOrgFromOnboarding,
    syncOrganizationUpdate,
    platformOrganizations,
    orgConsoleSubTab: activeSubTab,
    setOrgConsoleSubTab,
    glossaryOpen,
  } = useDemoPlatform();

  const isDemo = session.demoMode && !session.accessToken;
  const [apiOrgs, setApiOrgs] = useState<OrganizationPublic[]>([]);
  const orgs = isDemo ? platformOrganizations : apiOrgs;
  const [loadingOrgs, setLoadingOrgs] = useState(!isDemo);

  const [onboardName, setOnboardName] = useState("");
  const [onboardRegionChoice, setOnboardRegionChoice] = useState<RegionChoice>("CN");
  const [onboardSlots, setOnboardSlots] = useState("50");
  const [onboardExpire, setOnboardExpire] = useState(defaultExpireDate);
  const [onboardAiRoute, setOnboardAiRoute] = useState<AiModelRoute>("domestic");
  const [onboardCrossBorder, setOnboardCrossBorder] = useState(false);
  const [onboarding, setOnboarding] = useState(false);

  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [editSlots, setEditSlots] = useState("");
  const [editExpire, setEditExpire] = useState("");
  const [editAiRoute, setEditAiRoute] = useState<AiModelRoute>("domestic");
  const [editCrossBorder, setEditCrossBorder] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [batchCount, setBatchCount] = useState("10");

  const loadOrgs = useCallback(async () => {
    if (isDemo) {
      setLoadingOrgs(false);
      return;
    }
    setLoadingOrgs(true);
    try {
      const list = await fetchOrganizations(session);
      setApiOrgs(list);
      const orgA = list.find((o) => o.name === "Org-A");
      setSelectedOrgId((prev) => prev || orgA?.id || list[0]?.id || "");
    } catch (e) {
      toast.error("机构列表加载失败", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setLoadingOrgs(false);
    }
  }, [session, isDemo]);

  useEffect(() => {
    void loadOrgs();
  }, [loadOrgs]);

  useEffect(() => {
    if (!isDemo || orgs.length === 0) return;
    const orgA = orgs.find((o) => o.name === "Org-A");
    setSelectedOrgId((prev) => prev || orgA?.id || orgs[0]?.id || "");
  }, [isDemo, orgs]);

  const selectedOrg = useMemo(
    () => orgs.find((o) => o.id === selectedOrgId),
    [orgs, selectedOrgId]
  );

  useEffect(() => {
    if (!selectedOrg) return;
    setEditSlots(String(selectedOrg.student_slots_limit));
    setEditExpire(toDateInputValue(selectedOrg.expire_at));
    setEditAiRoute(selectedOrg.ai_model_route);
    setEditCrossBorder(selectedOrg.cross_border_migration_enabled);
  }, [selectedOrg]);

  useEffect(() => {
    setGeneratedCodes([]);
  }, [selectedOrgId]);

  const handleOnboard = async () => {
    const baseName = onboardName.trim();
    if (!baseName) {
      toast.error("请填写机构名称");
      return;
    }
    const slots = parseInt(onboardSlots, 10);
    if (!Number.isFinite(slots) || slots < 1) {
      toast.error("席位上限须为正整数");
      return;
    }

    setOnboarding(true);
    try {
      const created = await createOrganization(session, {
        name: baseName,
        region: onboardRegionChoice,
        student_slots_limit: slots,
        expire_at: onboardExpire ? `${onboardExpire}T23:59:59Z` : null,
        ai_model_route: onboardAiRoute,
        cross_border_migration_enabled: onboardCrossBorder,
      });
      registerOrgFromOnboarding(created);
      setSelectedOrgId(created.id);
      setOnboardName("");
      setOrgConsoleSubTab("activation-codes");
      toast.success("开户完成", {
        description: `${created.name} · ${created.region}。下一步可为本机构生成激活码`,
      });
    } catch (e) {
      toast.error("开户失败", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setOnboarding(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedOrg) return;
    const slots = parseInt(editSlots, 10);
    if (!Number.isFinite(slots) || slots < 1) {
      toast.error("席位上限须为正整数");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateOrganization(session, selectedOrg.id, {
        student_slots_limit: slots,
        expire_at: editExpire ? `${editExpire}T23:59:59Z` : null,
        ai_model_route: editAiRoute,
        cross_border_migration_enabled: editCrossBorder,
      });
      if (isDemo) {
        syncOrganizationUpdate(updated);
      } else {
        setApiOrgs((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      }
      toast.success("变更已保存");
    } catch (e) {
      toast.error("保存失败", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateBatch = async () => {
    if (!selectedOrg) return;
    const count = Math.min(50, Math.max(1, parseInt(batchCount, 10) || 10));
    setGenerating(true);
    try {
      let codes: string[];
      if (session.demoMode && !session.accessToken) {
        await new Promise((r) => setTimeout(r, 600));
        codes = generateDemoActivationCodes(selectedOrg.name, count);
      } else {
        const result = await batchCreateActivationCodes(session, selectedOrg.id, count);
        codes = result.codes;
      }
      setGeneratedCodes(codes);
      dispatchActivationCodes(selectedOrg.id, selectedOrg.name, codes);
      toast.success(`已为 ${selectedOrg.name} 生成 ${codes.length} 个激活码`, {
        description: "可在本页复制，或至机构教师端「本塾席位管家」查看",
      });
    } catch (e) {
      toast.error("批量生成失败", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyAllCodes = () => {
    if (generatedCodes.length === 0) return;
    void navigator.clipboard.writeText(generatedCodes.join("\n"));
    toast.success("已复制全部激活码");
  };

  return (
    <div className="space-y-5">
      <header className="rounded-2xl border border-border/80 bg-card/60 px-5 py-4 backdrop-blur-sm sm:px-6">
        <h1 className="text-[15px] font-semibold tracking-tight text-foreground">
          机构与授权
        </h1>
        <p className="mt-1 text-[12px] text-muted-foreground">
          开户与<GlossaryText text="激活码" />发卡前后衔接；机构信息管理与上述流程分开维护
        </p>
      </header>

      <OrgConsoleSubTabs active={activeSubTab} onChange={setOrgConsoleSubTab} />

      <div className={cn(glossaryOpen && "pointer-events-none opacity-40 transition-opacity")}>
        <div
          className={cn(activeSubTab !== "onboarding" && "hidden")}
          aria-hidden={activeSubTab !== "onboarding"}
        >
          <LicensingOnboardingPanel
            name={onboardName}
            regionChoice={onboardRegionChoice}
            slots={onboardSlots}
            expire={onboardExpire}
            aiRoute={onboardAiRoute}
            crossBorder={onboardCrossBorder}
            onboarding={onboarding}
            onNameChange={setOnboardName}
            onRegionChoiceChange={setOnboardRegionChoice}
            onSlotsChange={setOnboardSlots}
            onExpireChange={setOnboardExpire}
            onAiRouteChange={setOnboardAiRoute}
            onCrossBorderChange={setOnboardCrossBorder}
            onSubmit={handleOnboard}
          />
        </div>

        <div
          className={cn(activeSubTab !== "org-management" && "hidden")}
          aria-hidden={activeSubTab !== "org-management"}
        >
          <LicensingOrgManagementPanel
            orgs={orgs}
            loadingOrgs={loadingOrgs}
            selectedOrgId={selectedOrgId}
            selectedOrg={selectedOrg}
            editSlots={editSlots}
            editExpire={editExpire}
            editAiRoute={editAiRoute}
            editCrossBorder={editCrossBorder}
            saving={saving}
            onOrgChange={setSelectedOrgId}
            onEditSlotsChange={setEditSlots}
            onEditExpireChange={setEditExpire}
            onEditAiRouteChange={setEditAiRoute}
            onEditCrossBorderChange={setEditCrossBorder}
            onSave={handleSaveChanges}
          />
        </div>

        <div
          className={cn(activeSubTab !== "activation-codes" && "hidden")}
          aria-hidden={activeSubTab !== "activation-codes"}
        >
          <LicensingActivationCodesPanel
            orgs={orgs}
            loadingOrgs={loadingOrgs}
            selectedOrgId={selectedOrgId}
            selectedOrg={selectedOrg}
            batchCount={batchCount}
            generatedCodes={generatedCodes}
            generating={generating}
            onOrgChange={setSelectedOrgId}
            onBatchCountChange={setBatchCount}
            onGenerate={handleGenerateBatch}
            onCopyAll={copyAllCodes}
          />
        </div>
      </div>
    </div>
  );
}
