"use client";

import { Handshake, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CoOpPartnership } from "@/lib/teacher/demo-co-op-store";
import type { OrganizationPublic } from "@/lib/teacher/types";
import {
  tobLicensingBtn,
  tobLicensingPanel,
  tobLicensingSelect,
  tobTableHover,
} from "@/lib/teacher/styles";
import { cn } from "@/lib/utils";
import { GlossaryText } from "./glossary-text";
import { LicensingField } from "./licensing-shared";

function formatBindingTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "刚刚";
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`;
  return new Date(iso).toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface LicensingAlliancePanelProps {
  cnOrgs: OrganizationPublic[];
  jpOrgs: OrganizationPublic[];
  coOpSourceId: string;
  coOpTargetId: string;
  partnerships: CoOpPartnership[];
  loadingOrgs: boolean;
  bindingCoOp: boolean;
  onSourceChange: (id: string) => void;
  onTargetChange: (id: string) => void;
  onEstablish: () => void;
  onDissolve: (partnershipId: string) => void;
}

export function LicensingAlliancePanel({
  cnOrgs,
  jpOrgs,
  coOpSourceId,
  coOpTargetId,
  partnerships,
  loadingOrgs,
  bindingCoOp,
  onSourceChange,
  onTargetChange,
  onEstablish,
  onDissolve,
}: LicensingAlliancePanelProps) {
  const sortedPartnerships = [...partnerships].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <section className={cn(tobLicensingPanel, "rounded-2xl px-6 py-7 sm:px-8 sm:py-8")}>
      <header className="mb-6 border-b border-border/60 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[oklch(0.94_0.04_145/0.55)]">
            <Handshake className="h-4 w-4 text-[oklch(0.42_0.06_145)]" />
          </div>
          <div>
            <h2 className="text-[17px] font-semibold tracking-tight text-foreground">
              机构合作配置
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              建立国内机构与日本机构的对口关系，用于<GlossaryText text="跨境数据通关" />
              与业务大屏统计
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-3">
        <div className="min-w-0 flex-1">
          <LicensingField label="国内机构">
            <select
              value={coOpSourceId}
              onChange={(e) => onSourceChange(e.target.value)}
              disabled={loadingOrgs || cnOrgs.length === 0}
              className={tobLicensingSelect}
            >
              <option value="">请选择国内机构</option>
              {cnOrgs.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} · {org.region}
                </option>
              ))}
            </select>
          </LicensingField>
        </div>

        <div
          className="licensing-handshake flex shrink-0 items-center justify-center py-2 lg:pb-3"
          aria-hidden
        >
          <Handshake className="h-7 w-7 text-[oklch(0.58_0.09_145)]" />
        </div>

        <div className="min-w-0 flex-1">
          <LicensingField label="日本机构">
            <select
              value={coOpTargetId}
              onChange={(e) => onTargetChange(e.target.value)}
              disabled={loadingOrgs || jpOrgs.length === 0}
              className={tobLicensingSelect}
            >
              <option value="">请选择日本机构</option>
              {jpOrgs.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} · {org.region}
                </option>
              ))}
            </select>
          </LicensingField>
        </div>

        <Button
          className={cn("h-11 shrink-0 rounded-lg font-medium lg:min-w-[10rem]", tobLicensingBtn)}
          disabled={bindingCoOp || !coOpSourceId || !coOpTargetId}
          onClick={onEstablish}
        >
          {bindingCoOp ? "保存中…" : "保存合作"}
        </Button>
      </div>

      <div className="mt-8">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          已配置的合作关系（最新在前）
        </h3>
        {sortedPartnerships.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center text-[13px] text-muted-foreground">
            暂无合作关系。配置后可在业务大屏「日本区域」查看，并执行跨境数据迁移。
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/80">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-border/70 bg-muted/30 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">机构组合</th>
                  <th className="hidden px-4 py-3 sm:table-cell">建立时间</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {sortedPartnerships.map((p, index) => (
                  <tr
                    key={p.id}
                    className={cn("border-b border-border/50 last:border-0", tobTableHover)}
                  >
                    <td className="px-4 py-3.5 font-medium text-foreground">
                      {p.sourceOrgName} · CN → {p.targetOrgName} · JP
                      {index === 0 && (
                        <span className="ml-2 text-[10px] font-normal text-primary">
                          最新
                        </span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3.5 text-muted-foreground sm:table-cell">
                      {formatBindingTime(p.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => onDissolve(p.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 px-2.5 py-1.5 text-[12px] text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
                      >
                        <Unlink className="h-3.5 w-3.5" />
                        解除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
