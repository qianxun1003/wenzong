import { MapPageShell } from "@/components/map/map-page-shell";
import { TeacherDashboard } from "@/components/teacher/teacher-dashboard";

export default function TeacherPage() {
  return (
    <MapPageShell scrollable ambientVariant="teacher" className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <TeacherDashboard />
      </div>
    </MapPageShell>
  );
}
