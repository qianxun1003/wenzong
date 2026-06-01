import { cn } from "@/lib/utils";

interface QuizWorkflowStepsProps {
  steps: string[];
  className?: string;
}

export function QuizWorkflowSteps({ steps, className }: QuizWorkflowStepsProps) {
  return (
    <ol className={cn("flex flex-wrap items-center gap-2 sm:gap-3", className)}>
      {steps.map((step, index) => (
        <li key={step} className="flex items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm sm:text-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
              {index + 1}
            </span>
            {step}
          </span>
          {index < steps.length - 1 && (
            <span className="hidden text-muted-foreground sm:inline" aria-hidden>
              →
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
