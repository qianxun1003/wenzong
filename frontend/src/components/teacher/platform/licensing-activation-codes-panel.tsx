"use client";

import { Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { OrganizationPublic } from "@/lib/teacher/types";
import {
  tobLicensingCodeBox,
  tobLicensingField,
  tobLicensingPanel,
  tobLicensingSelect,
  tobLicensingSurface,
} from "@/lib/teacher/styles";
import { cn } from "@/lib/utils";
import { GlossaryText } from "./glossary-text";
import { LicensingField, LicensingPrimaryButton } from "./licensing-shared";

interface LicensingActivationCodesPanelProps {
  orgs: OrganizationPublic[];
  loadingOrgs: boolean;
  selectedOrgId: string;
  selectedOrg: OrganizationPublic | undefined;
  batchCount: string;
  generatedCodes: string[];
  generating: boolean;
  onOrgChange: (id: string) => void;
  onBatchCountChange: (v: string) => void;
  onGenerate: () => void;
  onCopyAll: () => void;
}

export function LicensingActivationCodesPanel({
  orgs,
  loadingOrgs,
  selectedOrgId,
  selectedOrg,
  batchCount,
  generatedCodes,
  generating,
  onOrgChange,
  onBatchCountChange,
  onGenerate,
  onCopyAll,
}: LicensingActivationCodesPanelProps) {
  return (
    <section className={cn(tobLicensingPanel, "rounded-2xl px-5 py-6 sm:px-8 sm:py-7")}>
      <header className="mb-6 border-b border-border/60 pb-4">
        <h2 className="text-[17px] font-semibold tracking-tight text-foreground">
          激活码生成
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          紧接机构开户的下一步：为指定机构批量生成<GlossaryText text="激活码" />，同步至教学后台供教师分发
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start">
        <div className="space-y-4">
          <LicensingField label="目标机构">
            <select
              value={selectedOrgId}
              onChange={(e) => onOrgChange(e.target.value)}
              disabled={loadingOrgs || orgs.length === 0}
              className={tobLicensingSelect}
            >
              {orgs.length === 0 ? (
                <option value="">暂无机构</option>
              ) : (
                orgs.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} · {org.region}
                  </option>
                ))
              )}
            </select>
          </LicensingField>

          {selectedOrg && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <LicensingField label="生成数量">
                  <Input
                    className={tobLicensingField}
                    type="number"
                    min={1}
                    max={50}
                    value={batchCount}
                    onChange={(e) => onBatchCountChange(e.target.value)}
                  />
                </LicensingField>
                <div className="flex items-end">
                  <LicensingPrimaryButton
                    className="h-10 w-full"
                    disabled={generating}
                    onClick={onGenerate}
                  >
                    {generating ? "生成中…" : "生成激活码"}
                  </LicensingPrimaryButton>
                </div>
              </div>
              <p className="text-[12px] leading-relaxed text-muted-foreground">
                单次最多 50 个；超额兑换将触发<GlossaryText text="并发席位熔断" />。
              </p>
            </>
          )}
        </div>

        <div className="flex min-h-[12rem] flex-col rounded-xl border border-border bg-muted/20 p-4">
          {!selectedOrg ? (
            <p className="m-auto text-center text-[13px] text-muted-foreground">
              请选择目标机构后生成激活码
            </p>
          ) : generatedCodes.length > 0 ? (
            <>
              <div className="mb-2 flex items-center justify-between text-[12px] text-muted-foreground">
                <span>
                  {selectedOrg.name} · 共 {generatedCodes.length} 个
                </span>
                <button
                  type="button"
                  onClick={onCopyAll}
                  className="inline-flex items-center gap-1 font-medium text-foreground transition-colors hover:text-primary"
                >
                  <Copy className="h-3.5 w-3.5" />
                  复制全部
                </button>
              </div>
              <div
                className={cn(
                  "flex-1 overflow-y-auto font-mono text-[12px] leading-relaxed",
                  tobLicensingCodeBox
                )}
              >
                {generatedCodes.map((code) => (
                  <p key={code}>{code}</p>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                可复制后分发给学员；机构教师端「本塾席位管家」可同步查看。
              </p>
            </>
          ) : (
            <div
              className={cn(
                "m-auto flex w-full items-center justify-center text-[13px] text-muted-foreground",
                tobLicensingSurface,
                "min-h-[8rem] border-0 bg-transparent shadow-none"
              )}
            >
              生成后将在此列出，例如 EJU-ORGA-A7B8
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
