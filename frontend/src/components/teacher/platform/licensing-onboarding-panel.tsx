"use client";

import { Input } from "@/components/ui/input";
import {
  tobLicensingField,
  tobLicensingPanel,
  tobLicensingSelect,
} from "@/lib/teacher/styles";
import type { AiModelRoute } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";
import { GlossaryText } from "./glossary-text";
import { LicensingField, LicensingPrimaryButton, LicensingToggleRow } from "./licensing-shared";

type RegionChoice = "CN" | "JP";

const AI_ROUTE_OPTIONS: { value: AiModelRoute; label: string }[] = [
  { value: "domestic", label: "国产大模型优先" },
  { value: "global_hybrid", label: "海外混合路由" },
];

const REGION_OPTIONS: { value: RegionChoice; label: string; sub: string }[] = [
  { value: "CN", label: "CN", sub: "国内机构" },
  { value: "JP", label: "JP", sub: "日本机构" },
];

interface LicensingOnboardingPanelProps {
  name: string;
  regionChoice: RegionChoice;
  slots: string;
  expire: string;
  aiRoute: AiModelRoute;
  crossBorder: boolean;
  onboarding: boolean;
  onNameChange: (v: string) => void;
  onRegionChoiceChange: (v: RegionChoice) => void;
  onSlotsChange: (v: string) => void;
  onExpireChange: (v: string) => void;
  onAiRouteChange: (v: AiModelRoute) => void;
  onCrossBorderChange: (v: boolean) => void;
  onSubmit: () => void;
}

export function LicensingOnboardingPanel({
  name,
  regionChoice,
  slots,
  expire,
  aiRoute,
  crossBorder,
  onboarding,
  onNameChange,
  onRegionChoiceChange,
  onSlotsChange,
  onExpireChange,
  onAiRouteChange,
  onCrossBorderChange,
  onSubmit,
}: LicensingOnboardingPanelProps) {
  return (
    <section className={cn(tobLicensingPanel, "rounded-2xl px-5 py-6 sm:px-8 sm:py-7")}>
      <header className="mb-6 border-b border-border/60 pb-4">
        <h2 className="text-[17px] font-semibold tracking-tight text-foreground">机构开户</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          录入新机构并初始化<GlossaryText text="多租户 RLS 隔离" />租户
        </p>
      </header>

      <div className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end">
          <LicensingField label="机构名称">
            <Input
              className={tobLicensingField}
              placeholder="例如 Org-K"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </LicensingField>

          <div className="space-y-2">
            <span className={cn("block text-[13px] font-medium text-muted-foreground")}>区域</span>
            <div className="flex gap-2">
              {REGION_OPTIONS.map((opt) => {
                const active = regionChoice === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onRegionChoiceChange(opt.value)}
                    className={cn(
                      "flex min-h-10 flex-1 flex-col items-center justify-center rounded-lg border px-3 py-2 text-center transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-foreground shadow-sm"
                        : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted/40"
                    )}
                  >
                    <span className="text-sm font-semibold">{opt.label}</span>
                    <span className="text-[11px]">{opt.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <LicensingField label="席位上限">
            <Input
              className={tobLicensingField}
              type="number"
              min={1}
              value={slots}
              onChange={(e) => onSlotsChange(e.target.value)}
            />
          </LicensingField>
          <LicensingField label="合同到期">
            <Input
              className={tobLicensingField}
              type="date"
              value={expire}
              onChange={(e) => onExpireChange(e.target.value)}
            />
          </LicensingField>
          <LicensingField label="模型路由">
            <select
              value={aiRoute}
              onChange={(e) => onAiRouteChange(e.target.value as AiModelRoute)}
              className={tobLicensingSelect}
            >
              {AI_ROUTE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </LicensingField>
          <div className="flex items-end">
            <LicensingToggleRow
              label="允许跨境数据迁移"
              checked={crossBorder}
              onChange={onCrossBorderChange}
            />
          </div>
        </div>

        <p className="text-[12px] leading-relaxed text-muted-foreground">
          提交后将进入「激活码生成」，为刚开户的机构发放<GlossaryText text="激活码" />。续期、调额等请在「机构信息管理」中操作。
        </p>

        <div className="flex justify-end border-t border-border/60 pt-5">
          <LicensingPrimaryButton
            className="h-11 min-w-[14rem] px-8"
            disabled={onboarding}
            onClick={onSubmit}
          >
            {onboarding ? "提交中…" : "确认开户"}
          </LicensingPrimaryButton>
        </div>
      </div>
    </section>
  );
}
