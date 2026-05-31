import Link from "next/link";
import { ArrowRight, Globe2, MapPinned } from "lucide-react";
import { MapPageShell } from "@/components/map/map-page-shell";
import { cn } from "@/lib/utils";

const MAP_ENTRIES = [
  {
    href: "/map/world",
    title: "世界地图",
    badge: "全球视野",
    enLabel: "World Map",
    subtitle: "按区域板块探索各国考点",
    description: "欧洲、亚洲、非洲等八大区域，点击进入国家画像学习。",
    icon: Globe2,
    gradient: "from-chart-2/30 via-chart-4/20 to-chart-3/25",
    accentClass: "bg-gradient-to-br from-chart-2 to-chart-3",
    glow: "from-chart-2/25 via-transparent to-chart-3/20",
  },
  {
    href: "/map/japan",
    title: "日本地图",
    badge: "日本专篇",
    enLabel: "Japan Map",
    subtitle: "47 都道府县 · 拼图记忆",
    description: "地方区分、县厅所在地、产业与气候等 EJU 日本地理考点。",
    icon: MapPinned,
    gradient: "from-primary/15 via-chart-1/20 to-accent/30",
    accentClass: "gradient-academy",
    glow: "from-chart-1/20 via-transparent to-primary/15",
  },
] as const;

export function MapEntryLayout() {
  return (
    <MapPageShell>
      <section className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-6xl items-center px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid w-full gap-5 lg:grid-cols-2 lg:gap-8">
          {MAP_ENTRIES.map(
            ({
              href,
              title,
              badge,
              enLabel,
              subtitle,
              description,
              icon: Icon,
              gradient,
              accentClass,
              glow,
            }) => (
              <Link
                key={href}
                href={href}
                className="group block overflow-hidden rounded-3xl border border-border/60 bg-card/70 shadow-[var(--map-panel-shadow)] backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/20 hover:shadow-[var(--soft-glow)]"
              >
                <div
                  className={cn(
                    "relative flex min-h-[300px] flex-col justify-between bg-gradient-to-br p-6 sm:min-h-[380px] sm:p-8",
                    gradient
                  )}
                >
                  <div
                    className={cn(
                      "pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br blur-3xl",
                      glow
                    )}
                  />
                  <div className="pointer-events-none absolute inset-0 opacity-40">
                    {href === "/map/world" ? (
                      <svg viewBox="0 0 800 400" className="h-full w-full" aria-hidden>
                        <ellipse
                          cx="400"
                          cy="210"
                          rx="300"
                          ry="140"
                          fill="currentColor"
                          className="text-primary/10"
                        />
                        <path
                          d="M160 190 Q240 130 360 150 T560 160 T720 200"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-primary/25"
                        />
                        <path
                          d="M180 250 Q280 290 400 270 T640 250"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-primary/20"
                        />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 400 500" className="mx-auto h-full max-w-[220px]" aria-hidden>
                        <path
                          d="M220 40 L280 70 L300 130 L290 200 L250 260 L210 320 L180 400 L150 460 L120 420 L100 350 L110 280 L130 210 L160 140 L190 80 Z"
                          fill="currentColor"
                          className="text-primary/12"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    )}
                  </div>

                  <div className="relative">
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-primary-foreground shadow-lg transition-transform group-hover:scale-105 sm:h-16 sm:w-16",
                          accentClass
                        )}
                      >
                        <Icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-border/50 bg-background/70 px-2.5 py-0.5 text-[10px] font-medium text-foreground/80 backdrop-blur-sm">
                            {badge}
                          </span>
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/75">
                            {enLabel}
                          </span>
                        </div>
                        <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">{title}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-8 flex items-end justify-between gap-4 border-t border-border/40 pt-5">
                    <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-background/70 px-3 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur-sm transition-all group-hover:gap-2">
                      进入
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          )}
        </div>
      </section>
    </MapPageShell>
  );
}
