"use client";

import { useMemo, useState } from "react";
import { KeyRound, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EJU_CHAPTERS } from "@/lib/eju-syllabus";
import type { DispatchedActivationCode } from "@/lib/teacher/demo-platform-context";
import {
  tobBtnPrimary,
  tobLicensingField,
  tobLicensingSelect,
} from "@/lib/teacher/styles";
import type { MockClassSummary, StudentActivationLog, StudentAnalyticsItem } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";

export interface EnrollmentResult {
  student: StudentAnalyticsItem;
  activationLog: StudentActivationLog;
  code: string;
  codeId?: string;
}

interface OrgStudentEnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgName: string;
  classes: MockClassSummary[];
  unusedCodes: DispatchedActivationCode[];
  slotsRemaining: number;
  onEnroll: (result: EnrollmentResult) => boolean;
}

function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}

function codeSuffix(code: string) {
  const parts = code.split("-");
  return parts[parts.length - 1]?.slice(0, 4) ?? code.slice(-4);
}

export function OrgStudentEnrollmentDialog({
  open,
  onOpenChange,
  orgName,
  classes,
  unusedCodes,
  slotsRemaining,
  onEnroll,
}: OrgStudentEnrollmentDialogProps) {
  const [studentName, setStudentName] = useState("");
  const [activationCode, setActivationCode] = useState("");
  const [selectedCodeId, setSelectedCodeId] = useState("");
  const [classId, setClassId] = useState("");

  const effectiveCode = useMemo(() => {
    if (selectedCodeId) {
      return unusedCodes.find((c) => c.id === selectedCodeId)?.code ?? "";
    }
    return activationCode;
  }, [selectedCodeId, activationCode, unusedCodes]);

  const resetForm = () => {
    setStudentName("");
    setActivationCode("");
    setSelectedCodeId("");
    setClassId("");
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const handleSubmit = () => {
    const name = studentName.trim();
    const code = normalizeCode(effectiveCode);

    if (!name) {
      toast.error("请填写学员姓名");
      return;
    }
    if (!code) {
      toast.error("请选择或输入激活码");
      return;
    }
    if (slotsRemaining <= 0) {
      toast.error("本塾席位已满", {
        description: "请至「席位与激活码」申请扩容或释放席位",
      });
      return;
    }

    const matched = unusedCodes.find((c) => normalizeCode(c.code) === code);
    if (unusedCodes.length > 0 && !matched && !code.startsWith("EJU-")) {
      toast.error("激活码无效", { description: "请从本塾未使用激活码中选择" });
      return;
    }
    if (matched && matched.status !== "unused") {
      toast.error("该激活码已核销");
      return;
    }

    const now = new Date().toISOString();
    const student: StudentAnalyticsItem = {
      user_id: `s-enroll-${Date.now()}`,
      display_name: name,
      class_ids: classId ? [classId] : [],
      current_chapter_id: EJU_CHAPTERS.economicSystem,
      total_quiz_count: 0,
      correct_rate: 0,
      last_active_at: null,
      top_error_tags: [],
      weak_knowledge_points: [],
    };

    const activationLog: StudentActivationLog = {
      id: `act-${Date.now()}`,
      student_name: name,
      activated_at: now,
      code_suffix: codeSuffix(code),
      status: "active",
    };

    const ok = onEnroll({
      student,
      activationLog,
      codeId: matched?.id,
      code,
    });

    if (!ok) return;

    toast.success(`「${name}」已登记入塾`, {
      description: classId
        ? `激活码已核销 · 已编入班级`
        : `激活码已核销 · 已进入花名册（待分班）`,
    });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : handleClose())}>
      <DialogContent onClose={handleClose} className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            登记学员入塾
          </DialogTitle>
          <DialogDescription>
            {orgName} · 学员凭激活码绑定席位后，登记至全塾花名册
            {slotsRemaining > 0 ? (
              <span className="mt-1 block text-foreground/80">
                剩余可用席位：{slotsRemaining} 席
              </span>
            ) : (
              <span className="mt-1 block text-destructive">当前无可用席位</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">学员姓名</label>
            <Input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="与学员注册名一致，便于检索"
              className={tobLicensingField}
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <KeyRound className="h-3.5 w-3.5" />
              绑定激活码
            </label>
            {unusedCodes.length > 0 ? (
              <select
                value={selectedCodeId}
                onChange={(e) => {
                  setSelectedCodeId(e.target.value);
                  setActivationCode("");
                }}
                className={tobLicensingSelect}
              >
                <option value="">从本塾未使用码中选择…</option>
                {unusedCodes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}
                  </option>
                ))}
              </select>
            ) : null}
            <Input
              value={activationCode}
              onChange={(e) => {
                setActivationCode(e.target.value);
                setSelectedCodeId("");
              }}
              placeholder={unusedCodes.length > 0 ? "或手动粘贴激活码" : "粘贴学员持有的激活码"}
              className={cn(tobLicensingField, "font-mono text-sm")}
            />
            <p className="text-[11px] text-muted-foreground">
              一码一席 · 核销后自动计入本塾在籍人数
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              入塾后分班（可选）
            </label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className={tobLicensingSelect}
            >
              <option value="">暂不分配 · 进入待分班池</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            className={cn("w-full gap-2", tobBtnPrimary)}
            disabled={slotsRemaining <= 0}
            onClick={handleSubmit}
          >
            <KeyRound className="h-4 w-4" />
            核销激活码并加入花名册
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
