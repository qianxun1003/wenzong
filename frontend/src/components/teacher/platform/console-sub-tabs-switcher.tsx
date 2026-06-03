"use client";

import { cn } from "@/lib/utils";

export type SubTabItem<T extends string> = {
  id: T;
  label: string;
};

interface ConsoleSubTabsSwitcherProps<T extends string> {
  tabs: SubTabItem<T>[];
  active: T;
  onChange: (tab: T) => void;
  ariaLabel: string;
}

export function ConsoleSubTabsSwitcher<T extends string>({
  tabs,
  active,
  onChange,
  ariaLabel,
}: ConsoleSubTabsSwitcherProps<T>) {
  return (
    <nav
      className="licensing-sub-tabs flex flex-wrap gap-2 rounded-xl border border-border bg-muted/30 p-1 shadow-[inset_0_1px_2px_oklch(0_0_0/0.03)]"
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative min-w-0 flex-1 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200 sm:px-4",
              isActive
                ? "licensing-sub-tabs__btn--active bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
            )}
          >
            <span className="truncate">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/** @deprecated 使用 OrgConsoleSubTabs 分组切换 */
export const ORG_CONSOLE_SUB_TABS = [
  { id: "onboarding" as const, label: "机构开户" },
  { id: "activation-codes" as const, label: "激活码生成" },
  { id: "org-management" as const, label: "机构信息管理" },
];

export const PIPELINE_SUB_TABS = [
  { id: "alliance" as const, label: "机构合作配置" },
  { id: "customs" as const, label: "跨境数据迁移" },
];
