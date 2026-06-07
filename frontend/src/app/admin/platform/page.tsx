import { AdminBackLink } from "@/components/admin/admin-back-link";
import { MapPageShell } from "@/components/map/map-page-shell";
import { TeacherDashboard } from "@/components/teacher/teacher-dashboard";

export default function AdminPlatformPage() {
  return (
    <MapPageShell scrollable ambientVariant="teacher" className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
        <AdminBackLink className="-ml-2 mb-4" />
        <TeacherDashboard />
      </div>
    </MapPageShell>
  );
}
