"use client";

import type { OrgConsoleSubTab } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";

const FLOW_TABS: { id: OrgConsoleSubTab; label: string }[] = [
  { id: "onboarding", label: "机构开户" },
  { id: "activation-codes", label: "激活码生成" },
];

const ADMIN_TAB: { id: OrgConsoleSubTab; label: string } = {
  id: "org-management",
  label: "机构信息管理",
};

interface OrgConsoleSubTabsProps {
  active: OrgConsoleSubTab;
  onChange: (tab: OrgConsoleSubTab) => void;
}

export function OrgConsoleSubTabs({ active, onChange }: OrgConsoleSubTabsProps) {
  const inFlow = active === "onboarding" || active === "activation-codes";

  return (
    <nav
      className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4"
      aria-label="机构与授权"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="px-0.5 text-[11px] font-medium text-muted-foreground">开户与发卡</p>
        <div className="flex gap-1.5 rounded-xl border border-[oklch(0.82_0.05_145/0.3)] bg-[oklch(0.98_0.02_145/0.35)] p-1">
          {FLOW_TABS.map((tab) => (
            <TabButton
              key={tab.id}
              label={tab.label}
              active={active === tab.id}
              onClick={() => onChange(tab.id)}
              className="flex-1"
            />
          ))}
        </div>
      </div>

      <div
        className="hidden w-px shrink-0 bg-border sm:block"
        aria-hidden
      />

      <div className="flex min-w-0 flex-col gap-1.5 sm:w-[11.5rem] sm:shrink-0">
        <p className="px-0.5 text-[11px] font-medium text-muted-foreground">日常运维</p>
        <div
          className={cn(
            "rounded-xl border p-1 transition-colors",
            !inFlow ? "border-border bg-muted/30" : "border-border/70 bg-muted/15"
          )}
        >
          <TabButton
            label={ADMIN_TAB.label}
            active={active === ADMIN_TAB.id}
            onClick={() => onChange(ADMIN_TAB.id)}
            className="w-full"
          />
        </div>
      </div>
    </nav>
  );
}

function TabButton({
  label,
  active,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition-all duration-200",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
        className
      )}
    >
      <span className="truncate">{label}</span>
    </button>
  );
}
