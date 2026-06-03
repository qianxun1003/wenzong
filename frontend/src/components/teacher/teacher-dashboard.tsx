"use client";

import { TeacherPlatformShell } from "./platform/teacher-platform-shell";
import { DemoPlatformProvider } from "@/lib/teacher/demo-platform-context";

export function TeacherDashboard() {
  return (
    <DemoPlatformProvider>
      <TeacherPlatformShell />
    </DemoPlatformProvider>
  );
}
