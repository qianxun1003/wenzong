"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ClipboardList,
  LayoutGrid,
  MinusCircle,
  Plus,
  Search,
  Trash2,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EJU_CHAPTERS } from "@/lib/eju-syllabus";
import { fetchTeacherAnalytics } from "@/lib/teacher/api";
import { MOCK_CLASSES, MOCK_DASHBOARD, MOCK_UNASSIGNED_STUDENTS } from "@/lib/teacher/mock-data";
import {
  tobBadgeAccent,
  tobBtnPrimary,
  tobCard,
  tobClassPillActive,
  tobClassPillBase,
  tobClassPillIdle,
  tobLicensingField,
  tobSpinner,
  tobTableHover,
} from "@/lib/teacher/styles";
import type { MockClassSummary, StudentAnalyticsItem, TeacherSession } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";

const DEFAULT_CLASS_ID = MOCK_CLASSES[0]?.id ?? "class-1";

function cloneClasses(source: MockClassSummary[]): MockClassSummary[] {
  return source.map((c) => ({
    ...c,
    syllabusProgress: [...c.syllabusProgress],
  }));
}

function cloneStudents(source: StudentAnalyticsItem[]): StudentAnalyticsItem[] {
  return source.map((s) => ({
    ...s,
    class_ids: [...s.class_ids],
    top_error_tags: [...s.top_error_tags],
    weak_knowledge_points: [...s.weak_knowledge_points],
  }));
}

interface ClassAdminTabProps {
  session: TeacherSession;
}

export function ClassAdminTab({ session }: ClassAdminTabProps) {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<MockClassSummary[]>([]);
  const [selectedClassId, setSelectedClassId] = useState(DEFAULT_CLASS_ID);
  const [students, setStudents] = useState<StudentAnalyticsItem[]>([]);
  const [unassigned, setUnassigned] = useState<StudentAnalyticsItem[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [classSearch, setClassSearch] = useState("");
  const [rosterSearch, setRosterSearch] = useState("");
  const [unassignedSearch, setUnassignedSearch] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addClassDialogOpen, setAddClassDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [pendingAddIds, setPendingAddIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    setClasses(cloneClasses(MOCK_CLASSES));
    fetchTeacherAnalytics(session)
      .then((data) => {
        setStudents(cloneStudents(data.students));
        setUnassigned(cloneStudents(MOCK_UNASSIGNED_STUDENTS));
      })
      .catch(() => {
        setStudents(cloneStudents(MOCK_DASHBOARD.students));
        setUnassigned(cloneStudents(MOCK_UNASSIGNED_STUDENTS));
      })
      .finally(() => setLoading(false));
  }, [session]);

  const filteredClasses = useMemo(() => {
    const q = classSearch.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter((c) => c.name.toLowerCase().includes(q));
  }, [classes, classSearch]);

  useEffect(() => {
    if (
      filteredClasses.length > 0 &&
      !filteredClasses.some((c) => c.id === selectedClassId)
    ) {
      setSelectedClassId(filteredClasses[0].id);
      setSelectedStudentId(null);
    }
  }, [filteredClasses, selectedClassId]);

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  const classStudents = useMemo(
    () => students.filter((s) => s.class_ids.includes(selectedClassId)),
    [students, selectedClassId]
  );

  const filteredRoster = useMemo(() => {
    const q = rosterSearch.trim().toLowerCase();
    if (!q) return classStudents;
    return classStudents.filter((s) =>
      (s.display_name ?? "").toLowerCase().includes(q)
    );
  }, [classStudents, rosterSearch]);

  const filteredUnassigned = useMemo(() => {
    const q = unassignedSearch.trim().toLowerCase();
    if (!q) return unassigned;
    return unassigned.filter((s) =>
      (s.display_name ?? "").toLowerCase().includes(q)
    );
  }, [unassigned, unassignedSearch]);

  const selectedStudent = useMemo(
    () => students.find((s) => s.user_id === selectedStudentId) ?? null,
    [students, selectedStudentId]
  );

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    setSelectedStudentId(null);
    setRosterSearch("");
  };

  const handleAddClass = () => {
    const name = newClassName.trim();
    if (!name) {
      toast.error("请输入班级名称");
      return;
    }
    const id = `class-${Date.now()}`;
    const newClass: MockClassSummary = {
      id,
      name,
      studentCount: 0,
      avgCorrectRate: 0,
      sevenDayActiveCount: 0,
      syllabusProgress: [{ chapter: EJU_CHAPTERS.economicSystem, percent: 0 }],
    };
    setClasses((prev) => [...prev, newClass]);
    setSelectedClassId(id);
    setNewClassName("");
    setAddClassDialogOpen(false);
    toast.success(`已创建班级「${name}」`);
  };

  const handleRemoveClass = () => {
    if (classes.length <= 1) {
      toast.error("至少保留一个班级");
      return;
    }
    const cls = selectedClass;
    if (!cls) return;

    const affected = students.filter((s) => s.class_ids.includes(selectedClassId));
    if (affected.length > 0) {
      setUnassigned((prev) => [
        ...prev,
        ...affected.map((s) => ({ ...s, class_ids: [] })),
      ]);
      setStudents((prev) => prev.filter((s) => !s.class_ids.includes(selectedClassId)));
    }

    const remaining = classes.filter((c) => c.id !== selectedClassId);
    setClasses(remaining);
    setSelectedClassId(remaining[0]?.id ?? "");
    setSelectedStudentId(null);
    toast.success(
      affected.length > 0
        ? `已删除「${cls.name}」，${affected.length} 名学员移至未分配池`
        : `已删除「${cls.name}」`
    );
  };

  const openAddDialog = () => {
    setPendingAddIds(new Set());
    setUnassignedSearch("");
    setAddDialogOpen(true);
  };

  const togglePendingAdd = (userId: string) => {
    setPendingAddIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleAddStudents = useCallback(() => {
    if (!selectedClassId || pendingAddIds.size === 0) return;
    const className = selectedClass?.name ?? "本班";
    const toAdd = unassigned.filter((s) => pendingAddIds.has(s.user_id));
    setStudents((prev) => [
      ...prev,
      ...toAdd.map((s) => ({ ...s, class_ids: [selectedClassId] })),
    ]);
    setUnassigned((prev) => prev.filter((s) => !pendingAddIds.has(s.user_id)));
    setPendingAddIds(new Set());
    setAddDialogOpen(false);
    toast.success(`已将 ${toAdd.length} 名学员编入 ${className}`);
  }, [pendingAddIds, selectedClass?.name, selectedClassId, unassigned]);

  const handleRemoveStudent = (userId: string, displayName: string) => {
    const student = students.find((s) => s.user_id === userId);
    if (!student) return;
    setStudents((prev) => prev.filter((s) => s.user_id !== userId));
    setUnassigned((prev) => [...prev, { ...student, class_ids: [] }]);
    if (selectedStudentId === userId) setSelectedStudentId(null);
    toast.success(`已将 ${displayName ?? "学员"} 移出 ${selectedClass?.name ?? "本班"}`);
  };

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
        <h2 className="text-lg font-semibold tracking-tight text-foreground">班级教务管理</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          班级层面 · 编制教学班、管理本班花名册与学员入退班
        </p>
      </div>

      <Card className={tobCard}>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base text-foreground">
                <LayoutGrid className="h-4 w-4 text-primary" />
                本塾班级编制
              </CardTitle>
              <CardDescription className="mt-1">
                共 {classes.length} 个班 · 支持关键词搜索后切换
              </CardDescription>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button size="sm" variant="outline" className="h-9 gap-1.5" onClick={() => setAddClassDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                新建班级
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={handleRemoveClass}
                disabled={classes.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
                删除当前班
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
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
            <p className="text-sm text-muted-foreground">未找到匹配的班级</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filteredClasses.map((cls) => {
                const count = students.filter((s) => s.class_ids.includes(cls.id)).length;
                const active = selectedClassId === cls.id;
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => handleClassChange(cls.id)}
                    className={cn(
                      tobClassPillBase,
                      "flex items-center gap-2",
                      active ? tobClassPillActive : tobClassPillIdle
                    )}
                  >
                    <span>{cls.name}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] tabular-nums",
                        active ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {count} 人
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={cn(tobCard, "overflow-hidden")}>
        <CardHeader className="border-b border-border/60 bg-muted/15 pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <ClipboardList className="h-5 w-5 shrink-0 text-primary" />
                {selectedClass?.name} · 本班花名册
              </CardTitle>
              <CardDescription className="mt-1.5">
                {classStudents.length} 名在籍
                {rosterSearch && ` · 筛选显示 ${filteredRoster.length} 人`}
              </CardDescription>
              <div className="relative mt-3 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  placeholder="搜索本班学员姓名…"
                  className="h-9 pl-9 text-sm"
                />
              </div>
            </div>
            <Button size="lg" className={cn("shrink-0 gap-2", tobBtnPrimary)} onClick={openAddDialog}>
              <UserPlus className="h-5 w-5" />
              添加学生入班
              {unassigned.length > 0 && (
                <Badge className="ml-1 border-0 bg-primary-foreground/20 text-primary-foreground">
                  {unassigned.length} 待分配
                </Badge>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredRoster.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                {rosterSearch ? "没有匹配的学员" : "本班暂无学员"}
              </p>
              {!rosterSearch && (
                <Button className={cn("gap-2", tobBtnPrimary)} onClick={openAddDialog}>
                  <UserPlus className="h-4 w-4" />
                  从未分配池添加入班
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/25 text-left text-xs text-muted-foreground">
                    <th className="px-5 py-3 font-medium">#</th>
                    <th className="px-5 py-3 font-medium">学员</th>
                    <th className="px-5 py-3 font-medium">章节</th>
                    <th className="px-5 py-3 font-medium">答题量</th>
                    <th className="px-5 py-3 font-medium">正确率</th>
                    <th className="px-5 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoster.map((s, idx) => {
                    const active = selectedStudentId === s.user_id;
                    return (
                      <tr
                        key={s.user_id}
                        className={cn(
                          "cursor-pointer border-b border-border/60 transition-colors",
                          tobTableHover,
                          active && "bg-primary/5"
                        )}
                        onClick={() => setSelectedStudentId(active ? null : s.user_id)}
                      >
                        <td className="px-5 py-3 text-muted-foreground">{idx + 1}</td>
                        <td className="px-5 py-3 font-medium text-foreground">
                          <span className="inline-flex items-center gap-1">
                            {s.display_name ?? "未命名"}
                            <ChevronDown
                              className={cn(
                                "h-3.5 w-3.5 transition-transform",
                                active && "rotate-180 text-primary"
                              )}
                            />
                          </span>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {s.current_chapter_id ?? "—"}
                        </td>
                        <td className="px-5 py-3 tabular-nums">{s.total_quiz_count}</td>
                        <td className="px-5 py-3">
                          <RateBadge rate={s.correct_rate} />
                        </td>
                        <td className="px-5 py-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 gap-1 text-xs text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveStudent(s.user_id, s.display_name ?? "");
                            }}
                          >
                            <UserMinus className="h-3.5 w-3.5" />
                            移出
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedStudent && (
        <Card className={tobCard}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{selectedStudent.display_name} · 个人学情</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatBox label="答题量" value={String(selectedStudent.total_quiz_count)} />
              <StatBox
                label="正确率"
                value={`${Math.round(selectedStudent.correct_rate * 100)}%`}
              />
              <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
                <p className="text-[10px] text-muted-foreground">当前进度</p>
                <Badge variant="outline" className={cn("mt-1 text-xs", tobBadgeAccent)}>
                  {selectedStudent.current_chapter_id ?? "未开始"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedStudent && filteredRoster.length > 0 && (
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <MinusCircle className="h-3.5 w-3.5" />
          点击学员行展开个人学情
        </p>
      )}

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent onClose={() => setAddDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>添加学生至 {selectedClass?.name}</DialogTitle>
            <DialogDescription>从未分配学员池勾选后确认入班</DialogDescription>
          </DialogHeader>
          {unassigned.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">暂无未分配学员</p>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={unassignedSearch}
                  onChange={(e) => setUnassignedSearch(e.target.value)}
                  placeholder="搜索待分配学员…"
                  className="h-9 pl-9 text-sm"
                />
              </div>
              <ul className="max-h-60 space-y-2 overflow-y-auto">
                {filteredUnassigned.length === 0 ? (
                  <li className="py-4 text-center text-sm text-muted-foreground">无匹配学员</li>
                ) : (
                  filteredUnassigned.map((s) => (
                    <li key={s.user_id}>
                      <label
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5",
                          pendingAddIds.has(s.user_id)
                            ? "border-primary/40 bg-primary/5"
                            : "border-border hover:bg-muted/40"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={pendingAddIds.has(s.user_id)}
                          onChange={() => togglePendingAdd(s.user_id)}
                          className="accent-primary"
                        />
                        <span className="text-sm">{s.display_name}</span>
                      </label>
                    </li>
                  ))
                )}
              </ul>
              <Button
                className={cn("w-full gap-2", tobBtnPrimary)}
                disabled={pendingAddIds.size === 0}
                onClick={handleAddStudents}
              >
                确认添加入班
                {pendingAddIds.size > 0 ? `（${pendingAddIds.size} 人）` : ""}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={addClassDialogOpen} onOpenChange={setAddClassDialogOpen}>
        <DialogContent onClose={() => setAddClassDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>新建教学班</DialogTitle>
            <DialogDescription>创建后可在花名册中向该班添加学员</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="例如：文综冲刺 D 班"
              className={tobLicensingField}
              onKeyDown={(e) => e.key === "Enter" && handleAddClass()}
            />
            <Button className={cn("w-full", tobBtnPrimary)} onClick={handleAddClass}>
              确认创建
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-center">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-base font-semibold tabular-nums">{value}</p>
    </div>
  );
}
