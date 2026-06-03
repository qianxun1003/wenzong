"use client";

import { useMemo, useState, type ComponentType } from "react";
import { Activity, CalendarDays, Search, UserPlus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buildOrgStudentDirectory } from "@/lib/teacher/mock-data";
import {
  tobBadgeAccent,
  tobBtnPrimary,
  tobCard,
  tobLicensingSelect,
  tobTableHover,
} from "@/lib/teacher/styles";
import type {
  MockClassSummary,
  OrgStudentDirectoryItem,
  StudentActivityLevel,
  StudentActivationLog,
  StudentAnalyticsItem,
} from "@/lib/teacher/types";
import { cn } from "@/lib/utils";

const ACTIVITY_META: Record<
  StudentActivityLevel,
  { label: string; className: string }
> = {
  high: { label: "高度活跃", className: "border-primary/30 bg-primary/10 text-primary" },
  weekly: { label: "本周活跃", className: "border-primary/20 bg-primary/5 text-primary" },
  low: { label: "低频登录", className: "border-border bg-muted text-muted-foreground" },
  inactive: { label: "长期沉默", className: "border-destructive/20 bg-destructive/10 text-destructive" },
};

interface OrgStudentDirectoryPanelProps {
  classes: MockClassSummary[];
  students: StudentAnalyticsItem[];
  unassigned: StudentAnalyticsItem[];
  extraActivationLogs?: StudentActivationLog[];
  slotsRemaining?: number;
  onRegisterClick?: () => void;
}

/** 全塾学员汇总表 */
export function OrgStudentDirectoryPanel({
  classes,
  students,
  unassigned,
  extraActivationLogs = [],
  slotsRemaining,
  onRegisterClick,
}: OrgStudentDirectoryPanelProps) {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState<StudentActivityLevel | "all">("all");

  const directory = useMemo(
    () => buildOrgStudentDirectory([...students, ...unassigned], extraActivationLogs),
    [students, unassigned, extraActivationLogs]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return directory.filter((row) => {
      if (q && !row.display_name.toLowerCase().includes(q)) return false;
      if (classFilter === "unassigned") {
        if (!row.class_labels.includes("未分班")) return false;
      } else if (classFilter !== "all") {
        const cls = classes.find((c) => c.id === classFilter);
        if (!cls || !row.class_labels.includes(cls.name)) return false;
      }
      if (activityFilter !== "all" && row.activity_level !== activityFilter) return false;
      return true;
    });
  }, [directory, search, classFilter, activityFilter, classes]);

  const stats = useMemo(
    () => ({
      total: directory.length,
      active: directory.filter((r) => r.activity_level === "high" || r.activity_level === "weekly")
        .length,
      unassigned: directory.filter((r) => r.class_labels.includes("未分班")).length,
    }),
    [directory]
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatChip icon={Users} label="在籍学员" value={String(stats.total)} />
        <StatChip icon={Activity} label="近 7 日活跃" value={String(stats.active)} />
        <StatChip icon={CalendarDays} label="待分班" value={String(stats.unassigned)} />
      </div>

      <Card className={tobCard}>
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <CardTitle className="text-base text-foreground">全塾学员花名册</CardTitle>
              <CardDescription className="mt-1">
                入塾时间、激活绑定、班级归属 · 输入关键词快速定位
                {typeof slotsRemaining === "number" && (
                  <span className="mt-1 block text-foreground/70">
                    剩余席位 {slotsRemaining} 席
                  </span>
                )}
              </CardDescription>
            </div>
            {onRegisterClick && (
              <Button
                size="lg"
                className={cn("shrink-0 gap-2", tobBtnPrimary)}
                onClick={onRegisterClick}
                disabled={slotsRemaining !== undefined && slotsRemaining <= 0}
              >
                <UserPlus className="h-5 w-5" />
                登记学员入塾
              </Button>
            )}
          </div>
          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索学员姓名关键词…"
                className="h-10 pl-9"
              />
            </div>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className={cn(tobLicensingSelect, "lg:w-44")}
            >
              <option value="all">全部班级</option>
              <option value="unassigned">未分班</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            <select
              value={activityFilter}
              onChange={(e) =>
                setActivityFilter(e.target.value as StudentActivityLevel | "all")
              }
              className={cn(tobLicensingSelect, "lg:w-40")}
            >
              <option value="all">全部活跃度</option>
              <option value="high">高度活跃</option>
              <option value="weekly">本周活跃</option>
              <option value="low">低频登录</option>
              <option value="inactive">长期沉默</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <DirectoryTable rows={filtered} total={directory.length} />
        </CardContent>
      </Card>
    </div>
  );
}

function DirectoryTable({ rows, total }: { rows: OrgStudentDirectoryItem[]; total: number }) {
  return (
    <>
      <table className="w-full min-w-[880px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
            <th className="px-5 py-3 font-medium">学员</th>
            <th className="px-5 py-3 font-medium">入塾时间</th>
            <th className="px-5 py-3 font-medium">所属班级</th>
            <th className="px-5 py-3 font-medium">活跃程度</th>
            <th className="px-5 py-3 font-medium">最后登录</th>
            <th className="px-5 py-3 font-medium">答题量</th>
            <th className="px-5 py-3 font-medium">正确率</th>
            <th className="px-5 py-3 font-medium">账号</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">
                没有符合筛选条件的学员
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.user_id}
                className={cn("border-b border-border/60 transition-colors", tobTableHover)}
              >
                <td className="px-5 py-3 font-medium text-foreground">{row.display_name}</td>
                <td className="px-5 py-3 tabular-nums text-muted-foreground">
                  {formatDate(row.joined_at)}
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {row.class_labels.map((label) => (
                      <Badge
                        key={label}
                        variant="outline"
                        className={cn(
                          "text-[10px] font-normal",
                          label === "未分班"
                            ? "border-border text-muted-foreground"
                            : tobBadgeAccent
                        )}
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <Badge
                    variant="outline"
                    className={cn("text-[10px]", ACTIVITY_META[row.activity_level].className)}
                  >
                    {ACTIVITY_META[row.activity_level].label}
                  </Badge>
                </td>
                <td className="px-5 py-3 tabular-nums text-muted-foreground">
                  {row.last_active_at ? formatDateTime(row.last_active_at) : "—"}
                </td>
                <td className="px-5 py-3 tabular-nums">{row.total_quiz_count}</td>
                <td className="px-5 py-3">
                  <RateBadge rate={row.correct_rate} />
                </td>
                <td className="px-5 py-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px]",
                      row.account_status === "active"
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {row.account_status === "active" ? "在读" : "已过期"}
                  </Badge>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <p className="border-t border-border/60 px-5 py-3 text-xs text-muted-foreground">
        共 {rows.length} 条记录
        {rows.length !== total && `（已筛选，全塾 ${total} 人）`}
      </p>
    </>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-center">
      <Icon className="mx-auto mb-0.5 h-4 w-4 text-primary/80" />
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-base font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

function RateBadge({ rate }: { rate: number }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        rate >= 0.8
          ? "bg-primary/15 text-primary"
          : rate >= 0.6
            ? "bg-muted text-foreground"
            : "bg-destructive/10 text-destructive"
      )}
    >
      {Math.round(rate * 100)}%
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
