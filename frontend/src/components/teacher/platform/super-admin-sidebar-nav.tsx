"use client";

import type { ComponentType } from "react";
import { Globe2, LayoutDashboard, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  tobNavActive,
  tobNavIdle,
  tobSidebarShell,
  tobSidebarSubBtnActive,
  tobSidebarSubBtnBase,
  tobSidebarSubBtnIdle,
  tobSidebarSubGroup,
} from "@/lib/teacher/styles";
import type { OrgConsoleSubTab, PipelineSubTab, SuperAdminTab } from "@/lib/teacher/types";

type SuperAdminSidebarNavProps = {
  superTab: SuperAdminTab;
  orgConsoleSubTab: OrgConsoleSubTab;
  pipelineSubTab: PipelineSubTab;
  onSuperTabChange: (tab: SuperAdminTab) => void;
  onOrgConsoleSubTabChange: (tab: OrgConsoleSubTab) => void;
  onPipelineSubTabChange: (tab: PipelineSubTab) => void;
};

type SubItem = { id: OrgConsoleSubTab | PipelineSubTab; label: string };

const MAIN_ITEMS: {
  id: SuperAdminTab;
  label: string;
  icon: ComponentType<{ className?: string }>;
  subs?: SubItem[];
}[] = [
  { id: "platform-dashboard", label: "业务大屏", icon: LayoutDashboard },
  {
    id: "org-console",
    label: "机构与授权",
    icon: Settings2,
    subs: [
      { id: "onboarding", label: "机构开户" },
      { id: "activation-codes", label: "激活码生成" },
      { id: "org-management", label: "机构信息管理" },
    ],
  },
  {
    id: "cross-border-pipeline",
    label: "跨境合作",
    icon: Globe2,
    subs: [
      { id: "alliance", label: "机构合作配置" },
      { id: "customs", label: "跨境数据迁移" },
    ],
  },
];

export function SuperAdminSidebarNav({
  superTab,
  orgConsoleSubTab,
  pipelineSubTab,
  onSuperTabChange,
  onOrgConsoleSubTabChange,
  onPipelineSubTabChange,
}: SuperAdminSidebarNavProps) {
  return (
    <nav
      className={cn(
        tobSidebarShell,
        "flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible"
      )}
    >
      {MAIN_ITEMS.map(({ id, label, icon: Icon, subs }) => {
        const isMainActive = superTab === id;

        return (
          <div key={id} className="flex shrink-0 flex-col gap-1 lg:shrink">
            <button
              type="button"
              onClick={() => onSuperTabChange(id)}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-[box-shadow,background-color,border-color] duration-200",
                isMainActive ? tobNavActive : tobNavIdle
              )}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-85" />
              <span className="whitespace-nowrap">{label}</span>
            </button>

            {subs && (
              <div className={tobSidebarSubGroup}>
                {subs.map((sub) => {
                  const active =
                    id === "org-console"
                      ? orgConsoleSubTab === sub.id
                      : pipelineSubTab === sub.id;

                  return (
                    <SidebarSubButton
                      key={sub.id}
                      label={sub.label}
                      active={active}
                      onClick={() => {
                        onSuperTabChange(id);
                        if (id === "org-console") {
                          onOrgConsoleSubTabChange(sub.id as OrgConsoleSubTab);
                        } else {
                          onPipelineSubTabChange(sub.id as PipelineSubTab);
                        }
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function SidebarSubButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        tobSidebarSubBtnBase,
        active ? tobSidebarSubBtnActive : tobSidebarSubBtnIdle
      )}
    >
      <span className="truncate">{label}</span>
    </button>
  );
}
