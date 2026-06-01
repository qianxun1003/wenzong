import { BookOpen, ClipboardList, Globe2 } from "lucide-react";
import { HomeFloatCard } from "@/components/home/home-float-card";
import { MapPageShell } from "@/components/map/map-page-shell";
import { cn } from "@/lib/utils";

const HOME_ENTRIES = [
  {
    href: "/student",
    title: "文综 AI 导师",
    subtitle: "讲义检索 · 四种答疑模式",
    icon: BookOpen,
    accentClass: "gradient-academy",
  },
  {
    href: "/map",
    title: "地图探索",
    subtitle: "八大区域 · 都道府县",
    icon: Globe2,
    accentClass: "bg-gradient-to-br from-chart-2 to-chart-3",
  },
  {
    href: "/quiz",
    title: "Quiz 练习",
    subtitle: "不熟之处，再练一遍",
    icon: ClipboardList,
    accentClass: "bg-gradient-to-br from-chart-1 to-chart-4",
  },
] as const;

export function HomeHubLayout() {
  return (
    <MapPageShell className="flex flex-1 flex-col">
      <section className="home-entry-hub map-entry-hub mx-auto flex min-h-0 flex-1 flex-col px-4 pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] pt-8 sm:px-6 sm:pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] sm:pt-10">
        <div className="home-entry-hub__shell mx-auto flex w-full max-w-4xl min-h-0 flex-1 flex-col">
          <header className="map-entry-hub__header home-entry-hub__header">
            <p className="map-entry-hub__eyebrow">
              <span className="map-entry-hub__eyebrow-line" aria-hidden />
              <span>EJU · 文综 · 备考</span>
              <span className="map-entry-hub__eyebrow-line" aria-hidden />
            </p>
            <h1 className="map-entry-hub__heading home-entry-hub__heading">文综学习平台</h1>
            <p className="map-entry-hub__lead home-entry-hub__lead">
              智能答疑、地图探索与分层练习，覆盖 EJU 文综备考主线。
            </p>
          </header>

          <div className={cn("home-entry-hub__grid")}>
            {HOME_ENTRIES.map((entry) => (
              <HomeFloatCard key={entry.href} {...entry} />
            ))}
          </div>
        </div>
      </section>
    </MapPageShell>
  );
}
