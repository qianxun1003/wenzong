"use client";

import { Input } from "@/components/ui/input";
import type { OrganizationPublic, AiModelRoute } from "@/lib/teacher/types";
import {
  tobLicensingField,
  tobLicensingPanel,
  tobLicensingSelect,
} from "@/lib/teacher/styles";
import { cn } from "@/lib/utils";
import { GlossaryText } from "./glossary-text";
import {
  LicensingField,
  LicensingPrimaryButton,
  LicensingToggleRow,
} from "./licensing-shared";

const AI_ROUTE_OPTIONS: { value: AiModelRoute; label: string }[] = [
  { value: "domestic", label: "国产大模型优先" },
  { value: "global_hybrid", label: "海外混合路由" },
];

interface LicensingOrgManagementPanelProps {
  orgs: OrganizationPublic[];
  loadingOrgs: boolean;
  selectedOrgId: string;
  selectedOrg: OrganizationPublic | undefined;
  editSlots: string;
  editExpire: string;
  editAiRoute: AiModelRoute;
  editCrossBorder: boolean;
  saving: boolean;
  onOrgChange: (id: string) => void;
  onEditSlotsChange: (v: string) => void;
  onEditExpireChange: (v: string) => void;
  onEditAiRouteChange: (v: AiModelRoute) => void;
  onEditCrossBorderChange: (v: boolean) => void;
  onSave: () => void;
}

export function LicensingOrgManagementPanel({
  orgs,
  loadingOrgs,
  selectedOrgId,
  selectedOrg,
  editSlots,
  editExpire,
  editAiRoute,
  editCrossBorder,
  saving,
  onOrgChange,
  onEditSlotsChange,
  onEditExpireChange,
  onEditAiRouteChange,
  onEditCrossBorderChange,
  onSave,
}: LicensingOrgManagementPanelProps) {
  return (
    <section className={cn(tobLicensingPanel, "rounded-2xl px-5 py-6 sm:px-8 sm:py-7")}>
      <header className="mb-6 border-b border-border/60 pb-4">
        <h2 className="text-[17px] font-semibold tracking-tight text-foreground">
          机构信息管理
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          日常运维：调整<GlossaryText text="席位上限" />、合同、模型路由等（与开户、发卡流程独立，可随时进入）
        </p>
      </header>

      <div className="space-y-5">
        <div className="max-w-md">
          <LicensingField label="选择机构">
            <select
              value={selectedOrgId}
              onChange={(e) => onOrgChange(e.target.value)}
              disabled={loadingOrgs || orgs.length === 0}
              className={tobLicensingSelect}
            >
              {orgs.length === 0 ? (
                <option value="">暂无机构，请先在「机构开户」创建</option>
              ) : (
                orgs.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} · {org.region}
                  </option>
                ))
              )}
            </select>
          </LicensingField>
        </div>

        {selectedOrg ? (
          <>
            {selectedOrg.region && (
              <p className="text-[12px] text-muted-foreground">
                当前区域：<span className="font-medium text-foreground">{selectedOrg.region}</span>
                {" · "}
                机构 ID：<code className="text-[11px]">{selectedOrg.id.slice(0, 12)}…</code>
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <LicensingField label="席位上限">
                <Input
                  className={tobLicensingField}
                  type="number"
                  min={1}
                  value={editSlots}
                  onChange={(e) => onEditSlotsChange(e.target.value)}
                />
              </LicensingField>
              <LicensingField label="合同到期">
                <Input
                  className={tobLicensingField}
                  type="date"
                  value={editExpire}
                  onChange={(e) => onEditExpireChange(e.target.value)}
                />
              </LicensingField>
              <LicensingField label="模型路由">
                <select
                  value={editAiRoute}
                  onChange={(e) => onEditAiRouteChange(e.target.value as AiModelRoute)}
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
                  checked={editCrossBorder}
                  onChange={onEditCrossBorderChange}
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-border/60 pt-5">
              <LicensingPrimaryButton
                className="h-11 min-w-[10rem]"
                disabled={saving}
                onClick={onSave}
              >
                {saving ? "保存中…" : "保存变更"}
              </LicensingPrimaryButton>
            </div>
          </>
        ) : (
          <p className="rounded-lg border border-dashed border-border py-12 text-center text-[13px] text-muted-foreground">
            请先完成机构开户，或从上方下拉框选择要管理的机构
          </p>
        )}
      </div>
    </section>
  );
}
