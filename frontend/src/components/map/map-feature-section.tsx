import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapFeatureSectionProps {
  step: 1 | 2;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function MapFeatureSection({
  step,
  title,
  subtitle,
  icon: Icon,
  children,
  className,
}: MapFeatureSectionProps) {
  return (
    <section
      id={`map-feature-${step}`}
      className={cn("map-feature-panel scroll-mt-24", className)}
      aria-labelledby={`map-feature-heading-${step}`}
    >
      <div className="map-feature-panel-head">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-semibold text-primary">
          {step}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 shrink-0 text-primary/80" />
            <h2
              id={`map-feature-heading-${step}`}
              className="text-sm font-semibold tracking-tight text-foreground sm:text-base"
            >
              {title}
            </h2>
          </div>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="map-feature-panel-body">{children}</div>
    </section>
  );
}
