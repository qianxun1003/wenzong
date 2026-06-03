"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { UserCog } from "lucide-react";
import { fetchTeacherAnalytics } from "@/lib/teacher/api";
import { useDemoPlatform } from "@/lib/teacher/demo-platform-context";
import { MOCK_CLASSES, MOCK_DASHBOARD, MOCK_UNASSIGNED_STUDENTS } from "@/lib/teacher/mock-data";
import { tobSpinner } from "@/lib/teacher/styles";
import type { MockClassSummary, StudentActivationLog, StudentAnalyticsItem, TeacherSession } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";
import {
  OrgStudentEnrollmentDialog,
  type EnrollmentResult,
} from "./org-student-enrollment-dialog";
import { OrgStudentDirectoryPanel } from "./org-student-directory-panel";

function cloneStudents(source: StudentAnalyticsItem[]): StudentAnalyticsItem[] {
  return source.map((s) => ({
    ...s,
    class_ids: [...s.class_ids],
    top_error_tags: [...s.top_error_tags],
    weak_knowledge_points: [...s.weak_knowledge_points],
  }));
}

interface OrgStudentManagementTabProps {
  session: TeacherSession;
}

/** 全塾学员用户管理 · 登记入塾 + 花名册 */
export function OrgStudentManagementTab({ session }: OrgStudentManagementTabProps) {
  const {
    getOrgSlots,
    getCodesForOrg,
    consumeOrgSlot,
    markActivationCodeUsed,
    dispatchedCodes,
  } = useDemoPlatform();

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentAnalyticsItem[]>([]);
  const [unassigned, setUnassigned] = useState<StudentAnalyticsItem[]>([]);
  const [enrollmentLogs, setEnrollmentLogs] = useState<StudentActivationLog[]>([]);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [classes] = useState<MockClassSummary[]>(MOCK_CLASSES);

  useEffect(() => {
    setLoading(true);
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

  const slots = getOrgSlots(session.orgId);
  const slotsRemaining = Math.max(0, slots.limit - slots.used);

  const unusedCodes = useMemo(
    () => getCodesForOrg(session.orgName).filter((c) => c.status === "unused"),
    [getCodesForOrg, session.orgName, dispatchedCodes]
  );

  const handleEnroll = useCallback(
    (result: EnrollmentResult): boolean => {
      if (!consumeOrgSlot(session.orgId)) {
        return false;
      }

      if (result.codeId) {
        markActivationCodeUsed(result.codeId);
      }

      setEnrollmentLogs((prev) => [...prev, result.activationLog]);

      if (result.student.class_ids.length > 0) {
        setStudents((prev) => [...prev, result.student]);
      } else {
        setUnassigned((prev) => [...prev, result.student]);
      }

      return true;
    },
    [consumeOrgSlot, markActivationCodeUsed, session.orgId]
  );

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
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <UserCog className="h-5 w-5 text-primary" />
          学员用户管理
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          全塾层面 · 新生凭激活码入塾后在此登记花名册，再至「班级教务」分班编班
        </p>
      </div>

      <OrgStudentDirectoryPanel
        classes={classes}
        students={students}
        unassigned={unassigned}
        extraActivationLogs={enrollmentLogs}
        slotsRemaining={slotsRemaining}
        onRegisterClick={() => setEnrollOpen(true)}
      />

      <OrgStudentEnrollmentDialog
        open={enrollOpen}
        onOpenChange={setEnrollOpen}
        orgName={session.orgName}
        classes={classes}
        unusedCodes={unusedCodes}
        slotsRemaining={slotsRemaining}
        onEnroll={handleEnroll}
      />
    </div>
  );
}
