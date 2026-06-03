"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
  Plane,
  Server,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MigrationAssetPreviewPanel } from "./migration-asset-preview";
import { fetchTeacherAnalytics, initiateCrossBorderMigration } from "@/lib/teacher/api";
import {
  batchMigrationSuccessMessage,
  getBatchMigrationPreview,
  getMigrationAssetPreview,
  MIGRATION_SUCCESS_MESSAGE,
} from "@/lib/teacher/mock-data";
import { useDemoPlatform } from "@/lib/teacher/demo-platform-context";
import { tobBtnPrimary, tobCard, tobCardSoft } from "@/lib/teacher/styles";
import type { PlatformOrgRecord, StudentAnalyticsItem, TeacherSession } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";
import { GlossaryText } from "./glossary-text";

const SELECT_CLASS =
  "w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40";

interface CrossBorderMigrationTabProps {
  session: TeacherSession;
  variant?: "global" | "org";
}

export function CrossBorderMigrationTab({
  session,
  variant = "org",
}: CrossBorderMigrationTabProps) {
  if (variant === "global") {
    return <GlobalBatchMigrationView session={session} />;
  }
  return <OrgStudentMigrationView session={session} />;
}

/** 超级管理员 · 机构对机构批量通关海关 */
function GlobalBatchMigrationView({ session: _session }: { session: TeacherSession }) {
  const {
    getOrgSlots,
    completeCrossBorderTransfer,
    orgSlots,
    platformOrgRecords,
    isCoOpBound,
    coOpPartnerships,
  } = useDemoPlatform();
  const cnOrgsAll = useMemo(
    () => platformOrgRecords.filter((o) => o.region === "CN"),
    [platformOrgRecords]
  );
  const jpOrgsAll = useMemo(
    () => platformOrgRecords.filter((o) => o.region === "JP"),
    [platformOrgRecords]
  );

  const boundCnOrgIds = useMemo(
    () => new Set(coOpPartnerships.map((p) => p.sourceOrgId)),
    [coOpPartnerships]
  );

  const cnOrgs = useMemo(
    () => cnOrgsAll.filter((o) => boundCnOrgIds.has(o.id)),
    [cnOrgsAll, boundCnOrgIds]
  );

  const [sourceOrgId, setSourceOrgId] = useState("");
  const [targetOrgId, setTargetOrgId] = useState("");
  const [migrating, setMigrating] = useState(false);

  const jpOrgsForSource = useMemo(() => {
    if (!sourceOrgId) return [];
    const targetIds = new Set(
      coOpPartnerships
        .filter((p) => p.sourceOrgId === sourceOrgId)
        .map((p) => p.targetOrgId)
    );
    return jpOrgsAll.filter((o) => targetIds.has(o.id));
  }, [sourceOrgId, coOpPartnerships, jpOrgsAll]);

  useEffect(() => {
    if (targetOrgId && !jpOrgsForSource.some((o) => o.id === targetOrgId)) {
      setTargetOrgId("");
    }
  }, [sourceOrgId, jpOrgsForSource, targetOrgId]);

  const sourceOrg = cnOrgsAll.find((o) => o.id === sourceOrgId);
  const targetOrg = jpOrgsAll.find((o) => o.id === targetOrgId);

  const routeBound =
    !!sourceOrg &&
    !!targetOrg &&
    isCoOpBound(sourceOrg.id, targetOrg.id);

  const batchPreview = useMemo(() => {
    if (!routeBound || !sourceOrg || !targetOrg) return null;
    const targetLive = getOrgSlots(targetOrg.id);
    return getBatchMigrationPreview(sourceOrg, targetOrg, {
      sourceUsed: getOrgSlots(sourceOrg.id).used,
      targetUsed: targetLive.used,
      targetLimit: targetLive.limit,
    });
  }, [routeBound, sourceOrg, targetOrg, getOrgSlots, orgSlots]);

  const handleBatchMigrate = async () => {
    if (!sourceOrg || !targetOrg || !batchPreview?.seatCheckOk) return;
    setMigrating(true);
    try {
      await new Promise((r) => setTimeout(r, 2200));
      completeCrossBorderTransfer(
        sourceOrg.id,
        sourceOrg.name,
        targetOrg.id,
        targetOrg.name,
        Array.from({ length: batchPreview.studentCount }, (_, i) => `MIG-${i + 1}`)
      );
      toast.success("跨国交接成功", {
        description: batchMigrationSuccessMessage(
          batchPreview.studentCount,
          sourceOrg.name,
          targetOrg.name
        ),
        duration: 8000,
      });
      setSourceOrgId("");
      setTargetOrgId("");
    } catch (e) {
      toast.error("批量通关失败", {
        description: e instanceof Error ? e.message : "请确认机构席位与跨境许可配置",
      });
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="relative space-y-6">
      <Card className={tobCard}>
        <CardHeader>
          <CardTitle className="text-foreground">
            <GlossaryText text="跨境数据通关" />
          </CardTitle>
          <CardDescription>
            对已建立合作关系的机构执行批量学籍交接与席位过户；仅可选择已配置合作的机构组合
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-stretch gap-6 lg:flex-row lg:items-stretch">
            <OrgRouteCard
              label="国内机构"
              subtitle="国内机构 · CN"
              region="CN"
              orgs={cnOrgs}
              selectedId={sourceOrgId}
              onSelect={setSourceOrgId}
              placeholder={
                coOpPartnerships.length === 0
                  ? "请先在「机构合作配置」中建立合作关系"
                  : "请选择国内机构"
              }
              disabled={coOpPartnerships.length === 0}
            />
            <div className="flex flex-col items-center justify-center gap-2 px-2 py-4 lg:py-8">
              <p className="text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                跨境数据通道
              </p>
              <div
                className={cn(
                  "flex items-center gap-2 text-primary",
                  migrating && "animate-pulse"
                )}
              >
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
                <Plane className="h-6 w-6 sm:h-7 sm:w-7" />
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              {sourceOrg && targetOrg ? (
                <p className="max-w-[10rem] text-center text-[10px] leading-tight text-muted-foreground">
                  {sourceOrg.name} → {targetOrg.name}
                </p>
              ) : (
                <p className="max-w-[10rem] text-center text-[10px] leading-tight text-muted-foreground/60">
                  待选定通道
                </p>
              )}
            </div>
            <OrgRouteCard
              label="日本机构"
              subtitle="日本本土 · JP"
              region="JP"
              orgs={jpOrgsForSource}
              selectedId={targetOrgId}
              onSelect={setTargetOrgId}
              highlight
              disabled={!sourceOrgId}
              placeholder={
                !sourceOrgId
                  ? "请先选择国内源头机构"
                  : jpOrgsForSource.length === 0
                    ? "该国内机构暂无已合作的日本机构"
                    : "请选择日本机构"
              }
            />
          </div>
        </CardContent>
      </Card>

      {!routeBound && (
        <Card
          className={cn(
            tobCardSoft,
            "border border-dashed border-border/80 bg-muted/20"
          )}
        >
          <CardContent className="flex min-h-[12rem] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/60">
              <Plane className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              {coOpPartnerships.length === 0
                ? "请先在「跨境合作 → 机构合作配置」中建立国内—日本机构合作关系。"
                : "请先在上方选择已合作的机构组合，以预览本批次迁移与席位校验。"}
            </p>
            {sourceOrgId && targetOrgId && !routeBound && (
              <p className="mt-3 text-xs text-muted-foreground/70">
                当前所选机构尚未建立合作关系，请先在机构合作配置中完成设置。
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {routeBound && batchPreview && sourceOrg && targetOrg && (
        <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-500">
          {migrating && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-background/75 backdrop-blur-[2px]">
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card/95 px-10 py-8 shadow-[var(--soft-glow)]">
                <div className="relative">
                  <Server className="h-10 w-10 text-primary/40" />
                  <Plane className="absolute -right-4 -top-3 h-6 w-6 animate-[bounce_1s_ease-in-out_infinite] text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">正在执行跨境数据同步…</p>
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            </div>
          )}

          <div className="space-y-6">
            <Card className={tobCard}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-foreground">
                  本批次迁移概览
                </CardTitle>
                <CardDescription>
                  {sourceOrg.name} · CN → {targetOrg.name} · JP · 整班打包，按机构维度交接
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <ScaleCard
                    icon={Users}
                    label="本批次迁移规模"
                    value={`${batchPreview.studentCount} 人`}
                    sub="整班打包，不可按单员勾选"
                    large
                  />
                  <ScaleCard
                    icon={Building2}
                    label={`${sourceOrg.name} 席位`}
                    value={`释放 ${batchPreview.sourceSeatsReleased} 席`}
                    sub="交接完成后国内占用席位回充"
                  />
                  <div className="rounded-xl border border-border bg-muted/25 p-4">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-primary">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {targetOrg.name} · 日本侧席位校验
                    </div>
                    <p className="text-sm text-foreground">
                      当前可用剩余席位{" "}
                      <strong className="text-lg tabular-nums">
                        {batchPreview.targetRemainingSlots}
                      </strong>{" "}
                      席
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      本批次需占用 {batchPreview.studentCount} 席 · 后端
                      <GlossaryText text="并发席位熔断" />校验
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "mt-3 text-[11px] font-semibold",
                        batchPreview.seatCheckOk
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-destructive/40 bg-destructive/10 text-destructive"
                      )}
                    >
                      {batchPreview.seatCheckLabel}
                    </Badge>
                  </div>
                </div>

                <p className="rounded-lg border border-border/80 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                  平台侧仅展示机构路由、批次人数与席位变动；学员教学明细由机构教师在各自后台查看。
                </p>

                <div className="flex justify-end pt-1">
                  <Button
                    size="lg"
                    disabled={migrating || !batchPreview.seatCheckOk}
                    className={cn(
                      "min-w-[18rem] px-8 shadow-[var(--soft-glow-sm)]",
                      tobBtnPrimary
                    )}
                    onClick={handleBatchMigrate}
                  >
                    {migrating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        跨境迁移处理中…
                      </>
                    ) : (
                      "执行跨境数据迁移与席位过户"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function OrgRouteCard({
  label,
  subtitle,
  region,
  orgs,
  selectedId,
  onSelect,
  highlight,
  placeholder = "请选择机构",
  disabled,
}: {
  label: string;
  subtitle: string;
  region: "CN" | "JP";
  orgs: PlatformOrgRecord[];
  selectedId: string;
  onSelect: (id: string) => void;
  highlight?: boolean;
  placeholder?: string;
  disabled?: boolean;
}) {
  const { getOrgSlots } = useDemoPlatform();
  const selected = orgs.find((o) => o.id === selectedId);
  const liveSlots = selected ? getOrgSlots(selected.id) : null;

  return (
    <div
      className={cn(
        "flex flex-1 flex-col rounded-2xl border p-5",
        highlight
          ? "border-primary/30 bg-primary/5 shadow-[var(--soft-glow-sm)]"
          : "border-border bg-card/90"
      )}
    >
      <div className="mb-4 text-center">
        <span
          className={cn(
            "inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide",
            highlight ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-muted/50 text-muted-foreground"
          )}
        >
          {region}
        </span>
        <p className="mt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-semibold text-foreground">{subtitle}</p>
      </div>
      <div className="space-y-2">
        <label htmlFor={`org-select-${region}`} className="text-xs text-muted-foreground">
          选择具体机构
        </label>
        <select
          id={`org-select-${region}`}
          value={selectedId}
          onChange={(e) => onSelect(e.target.value)}
          disabled={disabled}
          className={SELECT_CLASS}
        >
          <option value="">{placeholder}</option>
          {orgs.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name} · {org.region}
            </option>
          ))}
        </select>
      </div>
      {selected && liveSlots && (
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          席位 {liveSlots.used}/{liveSlots.limit}
        </p>
      )}
    </div>
  );
}

function ScaleCard({
  icon: Icon,
  label,
  value,
  sub,
  large,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  large?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/25 p-4">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-primary">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p
        className={cn(
          "font-semibold tabular-nums text-foreground",
          large ? "text-3xl tracking-tight" : "text-lg"
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

/** 机构教师 · 单学生迁移（保留原流程） */
function OrgStudentMigrationView({ session }: { session: TeacherSession }) {
  const [students, setStudents] = useState<StudentAnalyticsItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [migrating, setMigrating] = useState(false);
  const [migratePhase, setMigratePhase] = useState<"idle" | "sync" | "done">("idle");

  useEffect(() => {
    fetchTeacherAnalytics(session).then((d) => {
      setStudents(d.students);
      if (d.students[0]) setSelectedId(d.students[0].user_id);
    });
  }, [session]);

  const selected = students.find((s) => s.user_id === selectedId);
  const assets = useMemo(() => getMigrationAssetPreview(selected), [selected]);

  const handleMigrate = async () => {
    if (!selectedId || !selected) return;
    setMigrating(true);
    setMigratePhase("sync");
    try {
      await new Promise((r) => setTimeout(r, 600));
      const res = await initiateCrossBorderMigration(session, selectedId);
      setMigratePhase("done");
      await new Promise((r) => setTimeout(r, 800));
      const msg =
        session.demoMode && !session.accessToken ? MIGRATION_SUCCESS_MESSAGE : res.message;
      toast.success("跨境迁移完成", {
        description: msg,
        duration: 7000,
      });
    } catch (e) {
      toast.error("迁移失败", {
        description: e instanceof Error ? e.message : "请确认数据库已迁移且机构配置正确",
      });
    } finally {
      setMigrating(false);
      setTimeout(() => setMigratePhase("idle"), 400);
    }
  };

  return (
    <div className="space-y-6">
      <Card className={cn(tobCard, "relative overflow-hidden")}>
        {migratePhase !== "idle" && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card/95 px-8 py-6 shadow-[var(--soft-glow)]">
              {migratePhase === "done" ? (
                <>
                  <CheckCircle2 className="h-10 w-10 text-primary animate-in zoom-in duration-300" />
                  <p className="text-sm font-medium text-foreground">通关完成</p>
                </>
              ) : (
                <>
                  <div className="relative">
                    <Server className="h-8 w-8 text-primary/40" />
                    <Plane className="absolute -right-3 -top-2 h-5 w-5 animate-[bounce_1s_ease-in-out_infinite] text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">正在同步至目标节点…</p>
                  <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-2/3 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-primary" />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <CardHeader>
          <CardTitle className="text-foreground">跨境档案一键迁移</CardTitle>
          <CardDescription>学籍迁移方向（不可逆向）：国内机构 → 日本机构 · 须已建立合作关系</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-stretch gap-6 lg:flex-row lg:items-stretch">
            <OrgNode title={session.orgName} subtitle="国内机构" region="CN" icon={Building2} />
            <div className="flex flex-col items-center justify-center gap-2 px-2 py-4 lg:py-8">
              <p className="text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                学情资产通关
              </p>
              <div className={cn("flex items-center gap-2 text-primary", migrating && "animate-pulse")}>
                <ArrowRight className="h-5 w-5" />
                <Plane className="h-6 w-6" />
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
            <OrgNode
              title={session.targetOrgName}
              subtitle="日本机构"
              region="JP"
              icon={Building2}
              highlight
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label htmlFor="student-select" className="text-sm font-medium text-foreground">
              选择国内机构在读学生
            </label>
            <select
              id="student-select"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className={SELECT_CLASS}
            >
              {students.map((s) => (
                <option key={s.user_id} value={s.user_id}>
                  {s.display_name ?? "未命名"} · 正确率 {Math.round(s.correct_rate * 100)}%
                </option>
              ))}
            </select>
          </div>
        </div>

        <MigrationAssetPreviewPanel
          studentName={selected?.display_name ?? "—"}
          assets={assets}
        />

        <Card className={tobCardSoft}>
          <CardContent className="flex justify-end pt-6">
            <Button
              size="lg"
              disabled={!selectedId || migrating}
              className={cn("min-w-[12rem] shadow-[var(--soft-glow-sm)]", tobBtnPrimary)}
              onClick={handleMigrate}
            >
              {migrating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  迁移处理中…
                </>
              ) : (
                "执行学情迁移"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OrgNode({
  title,
  subtitle,
  region,
  icon: Icon,
  highlight,
}: {
  title: string;
  subtitle: string;
  region: "CN" | "JP";
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center rounded-2xl border p-6 text-center",
        highlight
          ? "border-primary/30 bg-primary/5 shadow-[var(--soft-glow-sm)]"
          : "border-border bg-card/90"
      )}
    >
      <span className="mb-2 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground">
        {region}
      </span>
      <Icon className="mb-2 h-8 w-8 text-primary" />
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}
