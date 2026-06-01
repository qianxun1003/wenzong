import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizSubpageHeaderProps {
  backHref?: string;
  backLabel?: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accentClass?: string;
  className?: string;
}

export function QuizSubpageHeader({
  backHref = "/quiz",
  backLabel = "返回练习中心",
  title,
  subtitle,
  icon: Icon,
  accentClass = "bg-gradient-to-br from-primary to-chart-2",
  className,
}: QuizSubpageHeaderProps) {
  return (
    <header className={cn("space-y-4", className)}>
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-primary-foreground shadow-md",
            accentClass
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </header>
  );
}
