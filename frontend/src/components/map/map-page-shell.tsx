import { cn } from "@/lib/utils";

interface MapPageShellProps {
  children: React.ReactNode;
  className?: string;
  /** 首页等长内容页：允许纵向滚动，避免底部区块被裁切 */
  scrollable?: boolean;
  /** 学生端默认暖→冷；教师后台为冷→暖 */
  ambientVariant?: "student" | "teacher";
}

export function MapPageShell({
  children,
  className,
  scrollable,
  ambientVariant = "student",
}: MapPageShellProps) {
  const isTeacher = ambientVariant === "teacher";

  return (
    <div
      className={cn(
        "map-page-shell relative min-h-[calc(100vh-3.5rem)]",
        isTeacher && "map-page-shell--teacher",
        scrollable ? "overflow-x-hidden overflow-y-auto" : "overflow-hidden",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 paper-texture" />
      <div
        className={cn(
          "pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full blur-3xl",
          isTeacher ? "bg-chart-3/12" : "bg-chart-2/10"
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute -right-16 bottom-0 h-96 w-96 rounded-full blur-3xl",
          isTeacher ? "bg-chart-1/12" : "bg-chart-3/10"
        )}
      />
      <div className="relative map-page-content h-full">{children}</div>
    </div>
  );
}
