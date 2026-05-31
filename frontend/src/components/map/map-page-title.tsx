import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type MapPageVariant = "world" | "japan";

interface MapPageTitleProps {
  variant: MapPageVariant;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  className?: string;
}

const VARIANT_STYLES: Record<
  MapPageVariant,
  { badge: string; accentClass: string; glow: string; label: string }
> = {
  world: {
    label: "World Map",
    badge: "全球视野",
    accentClass: "bg-gradient-to-br from-chart-2 to-chart-3",
    glow: "from-chart-2/20 via-transparent to-chart-3/15",
  },
  japan: {
    label: "Japan Map",
    badge: "日本专篇",
    accentClass: "gradient-academy",
    glow: "from-chart-1/20 via-transparent to-primary/15",
  },
};

export function MapPageTitle({ variant, title, subtitle, icon: Icon, className }: MapPageTitleProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-5 shadow-[var(--map-panel-shadow)] backdrop-blur-sm sm:p-6", className)}>
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl",
          styles.glow
        )}
      />
      <div className="relative flex items-start gap-4">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-primary-foreground shadow-md sm:h-16 sm:w-16",
            styles.accentClass
          )}
        >
          <Icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border/60 bg-background/60 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground">
              {styles.badge}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/80">
              {styles.label}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">{title}</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
