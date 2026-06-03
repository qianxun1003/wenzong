"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { fetchOrganizations } from "@/lib/teacher/api";
import { useDemoPlatform } from "@/lib/teacher/demo-platform-context";
import type { OrganizationPublic, TeacherSession } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";
import {
  ConsoleSubTabsSwitcher,
  PIPELINE_SUB_TABS,
} from "./console-sub-tabs-switcher";
import { CrossBorderMigrationTab } from "./cross-border-migration-tab";
import { LicensingAlliancePanel } from "./licensing-alliance-panel";
import { GlossaryText } from "./glossary-text";

interface CrossBorderPipelineConsoleProps {
  session: TeacherSession;
}

export function CrossBorderPipelineConsole({ session }: CrossBorderPipelineConsoleProps) {
  const {
    establishCoOpPartnership,
    dissolveCoOpPartnership,
    coOpPartnerships,
    platformOrganizations,
    pipelineSubTab: activeSubTab,
    setPipelineSubTab,
    glossaryOpen,
  } = useDemoPlatform();

  const isDemo = session.demoMode && !session.accessToken;
  const [apiOrgs, setApiOrgs] = useState<OrganizationPublic[]>([]);
  const orgs = isDemo ? platformOrganizations : apiOrgs;
  const [loadingOrgs, setLoadingOrgs] = useState(!isDemo);

  const [coOpSourceId, setCoOpSourceId] = useState("");
  const [coOpTargetId, setCoOpTargetId] = useState("");
  const [bindingCoOp, setBindingCoOp] = useState(false);

  const cnOrgs = useMemo(() => orgs.filter((o) => o.region === "CN"), [orgs]);
  const jpOrgs = useMemo(() => orgs.filter((o) => o.region === "JP"), [orgs]);

  const loadOrgs = useCallback(async () => {
    if (isDemo) {
      setLoadingOrgs(false);
      return;
    }
    setLoadingOrgs(true);
    try {
      const list = await fetchOrganizations(session);
      setApiOrgs(list);
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

  const handleEstablishCoOp = () => {
    const source = cnOrgs.find((o) => o.id === coOpSourceId);
    const target = jpOrgs.find((o) => o.id === coOpTargetId);
    if (!source || !target) {
      toast.error("请选择国内机构与日本机构");
      return;
    }
    setBindingCoOp(true);
    try {
      const result = establishCoOpPartnership(
        source.id,
        source.name,
        target.id,
        target.name
      );
      if (result === "duplicate") {
        toast.info("该合作已存在", {
          description: `${source.name} 与 ${target.name} 的合作关系已配置`,
        });
        return;
      }
      toast.success("绑定已保存", {
        description: `${source.name} 与 ${target.name} 已建立对口关系。`,
      });
    } finally {
      setBindingCoOp(false);
    }
  };

  const handleDissolveCoOp = (partnershipId: string) => {
    const p = coOpPartnerships.find((x) => x.id === partnershipId);
    if (dissolveCoOpPartnership(partnershipId)) {
      toast.success("已解除绑定", {
        description: p
          ? `${p.sourceOrgName} ↔ ${p.targetOrgName} 合作已解除`
          : undefined,
      });
    }
  };

  return (
    <div className="space-y-5">
      <header className="rounded-2xl border border-[oklch(0.82_0.06_145/0.4)] bg-[oklch(0.98_0.02_145/0.45)] px-5 py-4 backdrop-blur-sm sm:px-6">
        <h1 className="text-[15px] font-semibold tracking-tight text-foreground">
          跨境合作
        </h1>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
          机构合作配置与<GlossaryText text="跨境数据通关" />；数据与业务大屏同步
        </p>
      </header>

      <ConsoleSubTabsSwitcher
        tabs={PIPELINE_SUB_TABS}
        active={activeSubTab}
        onChange={setPipelineSubTab}
        ariaLabel="跨境合作子页签"
      />

      <div className={cn(glossaryOpen && "pointer-events-none opacity-40 transition-opacity")}>
        <div
          className={cn(activeSubTab !== "alliance" && "hidden")}
          aria-hidden={activeSubTab !== "alliance"}
        >
          <LicensingAlliancePanel
            cnOrgs={cnOrgs}
            jpOrgs={jpOrgs}
            coOpSourceId={coOpSourceId}
            coOpTargetId={coOpTargetId}
            partnerships={coOpPartnerships}
            loadingOrgs={loadingOrgs}
            bindingCoOp={bindingCoOp}
            onSourceChange={setCoOpSourceId}
            onTargetChange={setCoOpTargetId}
            onEstablish={handleEstablishCoOp}
            onDissolve={handleDissolveCoOp}
          />
        </div>

        <div
          className={cn(activeSubTab !== "customs" && "hidden")}
          aria-hidden={activeSubTab !== "customs"}
        >
          <CrossBorderMigrationTab session={session} variant="global" />
        </div>
      </div>
    </div>
  );
}
