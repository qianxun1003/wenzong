import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { QuizModeConfig } from "@/lib/quiz-modes";
import { cn } from "@/lib/utils";
import { QuizWorkflowSteps } from "@/components/quiz/quiz-workflow-steps";

interface QuizModeHubCardProps {
  mode: QuizModeConfig;
}

export function QuizModeHubCard({ mode }: QuizModeHubCardProps) {
  const Icon = mode.icon;

  return (
    <Link
      href={mode.href}
      className="soft-card group block p-6 transition-all hover:-translate-y-1 hover:border-primary/20 hover:shadow-[var(--soft-glow)] sm:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-primary-foreground shadow-md",
            mode.accentClass
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <ArrowRight className="mt-1 h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </div>

      <p className="mt-5 text-xs font-medium tracking-wide text-muted-foreground">{mode.subtitle}</p>
      <h2 className="mt-1 text-xl font-semibold text-foreground">{mode.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{mode.description}</p>

      <div className="mt-5">
        <QuizWorkflowSteps steps={mode.workflow} />
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        适合：
        <span className="text-foreground/80">{mode.suitableFor}</span>
      </p>
    </Link>
  );
}
