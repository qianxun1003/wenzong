"use client";

import { useMemo } from "react";
import { Building2, Globe2 } from "lucide-react";
import { useDemoPlatform } from "@/lib/teacher/demo-platform-context";
import type { CoOpPartnership } from "@/lib/teacher/demo-co-op-store";
import type { PlatformOrgRecord } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";
import { GlossaryText } from "./glossary-text";

const MATCHA_LOCAL = "#4a7c59";
const MATCHA_TRANSFER = "#cde1cd";
const MATCHA_TRACK = "#f3f4f6";

const BOARD_HEIGHT =
  "h-[min(28rem,calc(100dvh-13.5rem))] min-h-[18rem] max-h-[32rem]";

function formatBindingTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "刚刚";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`;
  if (diff < 7 * 86_400_000) {
    return `${Math.floor(diff / 86_400_000)} 天前`;
  }
  return new Date(iso).toLocaleDateString("zh-CN", {
    month: "numeric",
    day: "numeric",
  });
}

export function PlatformDashboardTab() {
  const {
    getOrgSlots,
    crossBorderTransfers,
    coOpPartnerships,
    platformOrgRecords,
    orgSlots,
    demoOrgRevision,
  } = useDemoPlatform();

  void orgSlots;
  void demoOrgRevision;

  const cnOrgs = platformOrgRecords.filter((o) => o.region === "CN");
  const jpOrgs = platformOrgRecords.filter((o) => o.region === "JP");

  const partnershipsByTime = useMemo(
    () =>
      [...coOpPartnerships].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [coOpPartnerships]
  );

  const cnUsedTotal = cnOrgs.reduce((sum, org) => sum + getOrgSlots(org.id).used, 0);
  const cnLimitTotal = cnOrgs.reduce((sum, org) => sum + getOrgSlots(org.id).limit, 0);

  const transfersToOrg = (orgId: string) =>
    crossBorderTransfers.filter((t) => t.targetOrgId === orgId).length;

  const transfersForPair = (sourceOrgId: string, targetOrgId: string) =>
    crossBorderTransfers.filter(
      (t) => t.sourceOrgId === sourceOrgId && t.targetOrgId === targetOrgId
    );

  const transferTotal = crossBorderTransfers.length;

  const jpUsedTotal = jpOrgs.reduce((s, o) => s + getOrgSlots(o.id).used, 0);
  const jpLimitTotal = jpOrgs.reduce((s, o) => s + getOrgSlots(o.id).limit, 0);
  const jpTransferInTotal = jpOrgs.reduce((s, o) => s + transfersToOrg(o.id), 0);
  const jpLocalTotal = Math.max(0, jpUsedTotal - jpTransferInTotal);

  return (
    <div className="space-y-4">
      <header className="shrink-0">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">业务大屏</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          国内、日本两个区域；日本侧区分本地招生与国内转入学员
        </p>
      </header>

      <div className="grid gap-3 rounded-xl border border-border/80 bg-muted/20 p-3 sm:grid-cols-2 sm:gap-4 sm:p-4">
        <OverviewCell
          label="国内区域"
          value={String(cnUsedTotal)}
          unit="在读学员"
          hint={`${cnOrgs.length} 家机构 · 已用席位 ${cnUsedTotal}/${cnLimitTotal}`}
        />
        <OverviewCell
          label="日本区域"
          value={String(jpUsedTotal)}
          unit={`/ ${jpLimitTotal} 席`}
          hint={`本地招生 ${jpLocalTotal} · 国内转入 ${jpTransferInTotal} · 合作 ${partnershipsByTime.length} 组`}
        />
      </div>

      <div className={cn("grid gap-4 lg:grid-cols-2", BOARD_HEIGHT)}>
        <DashboardColumn
          title="国内区域"
          subtitle="CN"
          summary={
            <>
              <span className="text-2xl font-semibold tabular-nums text-foreground">
                {cnUsedTotal}
              </span>
              <span className="ml-1.5 text-sm text-muted-foreground">
                在读 · {cnOrgs.length} 家机构
              </span>
            </>
          }
          scrollHint={cnOrgs.length > 5 ? `共 ${cnOrgs.length} 家，可滚动查看` : undefined}
        >
          <ul className="space-y-2">
            {cnOrgs.map((org) => (
              <CnOrgRow key={org.id} org={org} getOrgSlots={getOrgSlots} />
            ))}
            {cnOrgs.length === 0 && <ColumnEmpty text="暂无国内机构" />}
          </ul>
        </DashboardColumn>

        <DashboardColumn
          title="日本区域"
          subtitle="JP"
          summary={
            <>
              <span className="text-2xl font-semibold tabular-nums text-foreground">
                {jpUsedTotal}
              </span>
              <span className="ml-1.5 text-sm text-muted-foreground">席已占用</span>
              <div className="mt-2 flex flex-wrap gap-3 text-[12px] text-muted-foreground">
                <span>
                  本地招生 <strong className="text-foreground">{jpLocalTotal}</strong>
                </span>
                <span>
                  国内转入 <strong className="text-foreground">{jpTransferInTotal}</strong>
                </span>
                {transferTotal > 0 && (
                  <span>
                    累计迁移 <strong className="text-foreground">{transferTotal}</strong> 人
                  </span>
                )}
              </div>
            </>
          }
          scrollHint={
            jpOrgs.length + partnershipsByTime.length > 6
              ? "合作与机构列表可滚动"
              : undefined
          }
          footer={
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              深色为本地招生、浅色为国内转入；执行
              <GlossaryText text="跨境数据通关" />后转入人数即时更新。
            </p>
          }
        >
          {partnershipsByTime.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-[11px] font-medium text-muted-foreground">
                机构合作关系（按建立时间，最新在前）
              </p>
              <ul className="space-y-2">
                {partnershipsByTime.map((p, index) => (
                  <PartnershipRow
                    key={p.id}
                    partnership={p}
                    transferCount={transfersForPair(p.sourceOrgId, p.targetOrgId).length}
                    isLatest={index === 0}
                  />
                ))}
              </ul>
            </div>
          )}

          {partnershipsByTime.length === 0 && (
            <p className="mb-4 rounded-lg border border-dashed border-border bg-muted/25 px-3 py-4 text-center text-[12px] text-muted-foreground">
              尚未配置国内—日本机构合作关系。请至「跨境合作 → 机构合作配置」添加。
            </p>
          )}

          <p className="mb-2 text-[11px] font-medium text-muted-foreground">各机构席位与生源</p>
          <ul className="space-y-2.5">
            {jpOrgs.map((org) => (
              <JpOrgCard
                key={org.id}
                org={org}
                getOrgSlots={getOrgSlots}
                transferIn={transfersToOrg(org.id)}
              />
            ))}
            {jpOrgs.length === 0 && <ColumnEmpty text="暂无日本机构" />}
          </ul>
        </DashboardColumn>
      </div>
    </div>
  );
}

function OverviewCell({
  label,
  value,
  unit,
  hint,
}: {
  label: string;
  value: string;
  unit: string;
  hint: string;
}) {
  return (
    <div className="rounded-lg border border-border/80 bg-card px-3 py-2.5 sm:px-4 sm:py-3">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 tabular-nums">
        <span className="text-xl font-semibold text-foreground">{value}</span>
        <span className="ml-1.5 text-xs text-muted-foreground">{unit}</span>
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function DashboardColumn({
  title,
  subtitle,
  summary,
  scrollHint,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  summary?: React.ReactNode;
  scrollHint?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--soft-glow-sm)]">
      <div className="shrink-0 border-b border-border/60 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {subtitle === "CN" ? (
              <Building2 className="h-4 w-4" />
            ) : (
              <Globe2 className="h-4 w-4" />
            )}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {subtitle}
            </p>
            <h2 className="text-[14px] font-semibold text-foreground">{title}</h2>
          </div>
        </div>
        {summary && <div className="mt-2.5">{summary}</div>}
        {scrollHint && (
          <p className="mt-1.5 text-[10px] text-muted-foreground/80">{scrollHint} ↓</p>
        )}
      </div>

      <div className="dashboard-column-scroll relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5">
        {children}
      </div>

      {footer && (
        <div className="shrink-0 border-t border-border/60 bg-muted/20 px-4 py-2 sm:px-5">
          {footer}
        </div>
      )}
    </section>
  );
}

function CnOrgRow({
  org,
  getOrgSlots,
}: {
  org: PlatformOrgRecord;
  getOrgSlots: (id: string) => { used: number; limit: number };
}) {
  const { used, limit } = getOrgSlots(org.id);
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <li className="flex items-center gap-2.5 rounded-lg border border-border/80 bg-background/90 px-2.5 py-2">
      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-2 text-[13px]">
          <span className="truncate font-medium text-foreground">{org.name}</span>
          <span className="shrink-0 tabular-nums text-muted-foreground">
            {used}/{limit} 席
          </span>
        </div>
        <div
          className="mt-1 h-1 overflow-hidden rounded-full"
          style={{ backgroundColor: MATCHA_TRACK }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: MATCHA_LOCAL }}
          />
        </div>
      </div>
    </li>
  );
}

function PartnershipRow({
  partnership,
  transferCount,
  isLatest,
}: {
  partnership: CoOpPartnership;
  transferCount: number;
  isLatest?: boolean;
}) {
  const timeLabel = formatBindingTime(partnership.createdAt);

  return (
    <li
      className={cn(
        "rounded-lg border px-3 py-2.5 text-[12px]",
        isLatest
          ? "border-primary/30 bg-primary/5"
          : "border-border/80 bg-muted/20"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-1">
        <span className="font-medium text-foreground">
          {partnership.sourceOrgName} → {partnership.targetOrgName}
        </span>
        <span className="tabular-nums text-muted-foreground">{timeLabel}</span>
      </div>
      {isLatest && (
        <span className="mt-0.5 inline-block text-[10px] font-medium text-primary">
          最新建立
        </span>
      )}
      <p className="mt-1 text-muted-foreground">
        累计转入 {transferCount} 人
      </p>
    </li>
  );
}

function JpOrgCard({
  org,
  getOrgSlots,
  transferIn,
}: {
  org: PlatformOrgRecord;
  getOrgSlots: (id: string) => { used: number; limit: number };
  transferIn: number;
}) {
  const { used, limit } = getOrgSlots(org.id);
  const cap = Math.max(1, limit);
  const occupied = Math.min(used, cap);
  const local = Math.max(0, occupied - transferIn);
  const remaining = Math.max(0, cap - occupied);

  const localPct = (local / cap) * 100;
  const transferPct = (transferIn / cap) * 100;
  const freePct = (remaining / cap) * 100;

  return (
    <li className="rounded-lg border border-border bg-background px-3 py-2.5">
      <div className="flex justify-between gap-2">
        <span className="text-[13px] font-semibold text-foreground">{org.name}</span>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {occupied}/{cap} 席
        </span>
      </div>

      <DualSeatBar localPct={localPct} transferPct={transferPct} freePct={freePct} className="mt-2" />

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px]">
        <span>
          <span
            className="mr-1 inline-block h-1.5 w-1.5 rounded-sm"
            style={{ backgroundColor: MATCHA_LOCAL }}
          />
          本地招生 <strong>{local}</strong>
        </span>
        <span>
          <span
            className="mr-1 inline-block h-1.5 w-1.5 rounded-sm"
            style={{ backgroundColor: MATCHA_TRANSFER }}
          />
          国内转入 <strong>{transferIn}</strong>
        </span>
        {remaining > 0 && (
          <span className="text-muted-foreground">空余 {remaining} 席</span>
        )}
      </div>
    </li>
  );
}

function DualSeatBar({
  localPct,
  transferPct,
  freePct,
  className,
}: {
  localPct: number;
  transferPct: number;
  freePct: number;
  className?: string;
}) {
  const total = localPct + transferPct + freePct;
  const scale = total > 100 ? 100 / total : 1;
  const l = localPct * scale;
  const t = transferPct * scale;
  const f = freePct * scale;

  return (
    <div
      className={cn("flex h-2 w-full overflow-hidden rounded-full", className)}
      style={{ backgroundColor: MATCHA_TRACK }}
    >
      {l > 0 && (
        <div
          className="h-full shrink-0 transition-all duration-700 ease-out"
          style={{ width: `${l}%`, backgroundColor: MATCHA_LOCAL }}
        />
      )}
      {t > 0 && (
        <div
          className="h-full shrink-0 transition-all duration-700 ease-out"
          style={{ width: `${t}%`, backgroundColor: MATCHA_TRANSFER }}
        />
      )}
      {f > 0 && (
        <div
          className="h-full shrink-0 transition-all duration-700 ease-out"
          style={{ width: `${f}%`, backgroundColor: MATCHA_TRACK }}
        />
      )}
    </div>
  );
}

function ColumnEmpty({ text }: { text: string }) {
  return <p className="py-6 text-center text-[12px] text-muted-foreground">{text}</p>;
}
