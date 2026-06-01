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

const VARIANT_STYLES: Record<MapPageVariant, { badge: string; accentClass: string }> = {
  world: {
    badge: "全球视野",
    accentClass: "bg-gradient-to-br from-chart-2 to-chart-3",
  },
  japan: {
    badge: "日本专篇",
    accentClass: "gradient-academy",
  },
};

export function MapPageTitle({ variant, title, subtitle, icon: Icon, className }: MapPageTitleProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <header className={cn("map-page-title", className)}>
      <p className="map-page-title__eyebrow">
        <span className="map-entry-hub__eyebrow-line" aria-hidden />
        <span>{styles.badge}</span>
        <span className="map-entry-hub__eyebrow-line" aria-hidden />
      </p>
      <div className="map-page-title__row">
        <div
          className={cn(
            "map-page-title__icon flex shrink-0 items-center justify-center rounded-xl text-primary-foreground shadow-sm",
            styles.accentClass
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <h1 className="map-page-title__heading">{title}</h1>
          <p className="map-page-title__lead">{subtitle}</p>
        </div>
      </div>
    </header>
  );
}
