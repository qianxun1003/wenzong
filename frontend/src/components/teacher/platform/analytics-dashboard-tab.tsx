"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Activity, GraduationCap, LayoutGrid, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AiClassDiagnosisPanel } from "./ai-class-diagnosis-panel";
import { MatchaRing } from "./matcha-ring";
import { fetchTeacherAnalytics } from "@/lib/teacher/api";
import { MOCK_CLASSES } from "@/lib/teacher/mock-data";
import {
  tobCard,
  tobClassPillActive,
  tobClassPillBase,
  tobClassPillIdle,
  tobProgressFill,
  tobSpinner,
} from "@/lib/teacher/styles";
import type { MockClassSummary, TeacherDashboardResponse, TeacherSession } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";

const DEFAULT_CLASS_ID = MOCK_CLASSES[0]?.id ?? "class-1";
const CLASS_STRIP_MAX_VISIBLE = 6;

interface AnalyticsDashboardTabProps {
  session: TeacherSession;
}

export function AnalyticsDashboardTab({ session }: AnalyticsDashboardTabProps) {
  const [data, setData] = useState<TeacherDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState(DEFAULT_CLASS_ID);
  const [showAllClasses, setShowAllClasses] = useState(false);
  const [classSearch, setClassSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchTeacherAnalytics(session)
      .then(setData)
      .finally(() => setLoading(false));
  }, [session]);

  const classes = buildClassSummaries(data, MOCK_CLASSES);
  const orgSummary = useMemo(() => buildOrgSummary(classes), [classes]);

  const filteredClasses = useMemo(() => {
    const q = classSearch.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter((c) => c.name.toLowerCase().includes(q));
  }, [classes, classSearch]);

  const needsClassExpand = filteredClasses.length > CLASS_STRIP_MAX_VISIBLE;
  const visibleClasses =
    needsClassExpand && !showAllClasses
      ? filteredClasses.slice(0, CLASS_STRIP_MAX_VISIBLE)
      : filteredClasses;
  const hiddenClassCount = Math.max(0, filteredClasses.length - CLASS_STRIP_MAX_VISIBLE);

  const selectedClass =
    filteredClasses.find((c) => c.id === selectedClassId) ??
    classes.find((c) => c.id === selectedClassId) ??
    classes[0] ??
    null;

  useEffect(() => {
    if (
      selectedClassId &&
      filteredClasses.length > 0 &&
      !filteredClasses.some((c) => c.id === selectedClassId)
    ) {
      setSelectedClassId(filteredClasses[0].id);
    }
  }, [filteredClasses, selectedClassId]);

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className={cn("h-8 w-8 animate-spin rounded-full border-2", tobSpinner)} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">全塾学情宏观大屏</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {session.orgName} · 全塾层面学情概览 · 班级明细请至「班级教务管理」
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <SummaryPill icon={LayoutGrid} label="教学班" value={String(classes.length)} sub="个在运营" />
        <SummaryPill
          icon={GraduationCap}
          label="全塾均正确率"
          value={`${Math.round(orgSummary.avgCorrectRate * 100)}%`}
          sub={`${orgSummary.totalStudents} 名学员`}
        />
        <SummaryPill
          icon={Activity}
          label="7 日活跃"
          value={`${Math.round(orgSummary.activeRate * 100)}%`}
          sub={`${orgSummary.activeCount}/${orgSummary.totalStudents} 人`}
        />
      </div>

      <Card className={tobCard}>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <CardTitle className="text-base text-foreground">班级学情一览</CardTitle>
              <CardDescription className="mt-0.5">
                切换班级查看正确率与教学大纲 · 默认展示文综冲刺 A 班
              </CardDescription>
            </div>
            {needsClassExpand && (
              <button
                type="button"
                onClick={() => setShowAllClasses((v) => !v)}
                className="text-xs text-primary hover:underline"
              >
                {showAllClasses ? "收起列表" : `全部 ${filteredClasses.length} 班`}
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={classSearch}
              onChange={(e) => setClassSearch(e.target.value)}
              placeholder="搜索班级名称…"
              className="h-9 pl-9 text-sm"
            />
          </div>

          {filteredClasses.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">未找到匹配的班级</p>
          ) : (
          <div
            className={cn(
              showAllClasses
                ? "grid max-h-[160px] grid-cols-2 gap-1.5 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4"
                : "flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            )}
          >
            {visibleClasses.map((cls) => (
              <ClassTab
                key={cls.id}
                name={cls.name}
                count={cls.studentCount}
                rate={cls.avgCorrectRate}
                active={selectedClassId === cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                compact={!showAllClasses}
              />
            ))}
            {!showAllClasses && needsClassExpand && (
              <button
                type="button"
                onClick={() => setShowAllClasses(true)}
                className={cn(
                  "shrink-0 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary",
                  "min-w-[88px]"
                )}
              >
                +{hiddenClassCount} 班
              </button>
            )}
          </div>
          )}

          {selectedClass && filteredClasses.some((c) => c.id === selectedClass.id) && (
            <div className="grid gap-4 border-t border-border/60 pt-4 lg:grid-cols-[auto_1fr]">
              <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-muted/20 px-6 py-4">
                <p className="mb-2 text-sm font-medium text-foreground">{selectedClass.name}</p>
                <MatchaRing value={selectedClass.avgCorrectRate} label="班级正确率" size={96} />
                <p className="mt-2 text-xs text-muted-foreground">
                  {selectedClass.studentCount} 名学员 · 7 日活跃{" "}
                  {selectedClass.sevenDayActiveCount}/{selectedClass.studentCount}
                </p>
              </div>
              <div>
                <p className="mb-3 text-xs font-medium text-muted-foreground">教学大纲进度</p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {selectedClass.syllabusProgress.map((item) => (
                    <div key={item.chapter} className="space-y-1">
                      <div className="flex justify-between gap-2 text-xs">
                        <span className="min-w-0 truncate text-foreground">{item.chapter}</span>
                        <span className="shrink-0 tabular-nums text-muted-foreground">
                          {item.percent}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full", tobProgressFill)}
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AiClassDiagnosisPanel previewCount={3} />
    </div>
  );
}

function ClassTab({
  name,
  count,
  rate,
  active,
  onClick,
  compact,
}: {
  name: string;
  count: number;
  rate: number;
  active: boolean;
  onClick: () => void;
  compact: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        tobClassPillBase,
        compact && "min-w-[148px] shrink-0 snap-start",
        active ? tobClassPillActive : tobClassPillIdle
      )}
    >
      <span className="block truncate">{name}</span>
      <span
        className={cn(
          "mt-0.5 block text-[11px] tabular-nums",
          active ? "text-primary-foreground/85" : "text-muted-foreground"
        )}
      >
        {count} 人 · {Math.round(rate * 100)}%
      </span>
    </button>
  );
}

function SummaryPill({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/15 px-3 py-2.5 text-center">
      <Icon className="mx-auto mb-0.5 h-4 w-4 text-primary/80" />
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-base font-semibold tabular-nums text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function buildOrgSummary(classes: MockClassSummary[]) {
  const totalStudents = classes.reduce((s, c) => s + c.studentCount, 0);
  const activeCount = classes.reduce((s, c) => s + c.sevenDayActiveCount, 0);
  const avgCorrectRate =
    classes.length > 0
      ? classes.reduce((s, c) => s + c.avgCorrectRate, 0) / classes.length
      : 0;
  const activeRate = totalStudents > 0 ? activeCount / totalStudents : 0;
  return { totalStudents, activeCount, avgCorrectRate, activeRate };
}

function buildClassSummaries(
  data: TeacherDashboardResponse | null,
  fallback: MockClassSummary[]
): MockClassSummary[] {
  if (!data?.students.length) return fallback;

  return fallback.map((cls) => {
    const inClass = data.students.filter((s) => s.class_ids.includes(cls.id));
    if (inClass.length === 0) return cls;

    const avgCorrectRate =
      inClass.reduce((sum, s) => sum + s.correct_rate, 0) / inClass.length;
    const sevenDayActiveCount = inClass.filter((s) => {
      if (!s.last_active_at) return false;
      return Date.now() - new Date(s.last_active_at).getTime() < 7 * 86400000;
    }).length;

    return {
      ...cls,
      studentCount: inClass.length,
      avgCorrectRate,
      sevenDayActiveCount,
    };
  });
}
