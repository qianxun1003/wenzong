import { cn } from "@/lib/utils";

interface QuizPageShellProps {
  children: React.ReactNode;
  className?: string;
}

export function QuizPageShell({ children, className }: QuizPageShellProps) {
  return (
    <div
      className={cn(
        "quiz-page-shell relative min-h-[calc(100vh-3.5rem)] overflow-hidden",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 paper-texture" />
      <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 bottom-0 h-80 w-80 rounded-full bg-chart-2/10 blur-3xl" />
      <div className="relative">{children}</div>
    </div>
  );
}
