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
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
          {step}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 shrink-0 text-primary" />
            <h2 id={`map-feature-heading-${step}`} className="text-lg font-semibold text-foreground sm:text-xl">
              {title}
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="map-feature-panel-body">{children}</div>
    </section>
  );
}
