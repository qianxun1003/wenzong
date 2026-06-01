"use client";

import Link from "next/link";
import { MapPageShell } from "@/components/map/map-page-shell";
import { cn } from "@/lib/utils";

const MAP_ENTRIES = [
  {
    href: "/map/world",
    title: "世界地图",
    subtitle: "八大区域 · 国家画像",
    emoji: "🌍",
  },
  {
    href: "/map/japan",
    title: "日本地图",
    subtitle: "47 都道府县 · 区域地理",
    emoji: "🗾",
  },
] as const;

function MapFloatEntryCard({
  href,
  title,
  subtitle,
  emoji,
}: (typeof MAP_ENTRIES)[number]) {
  return (
    <Link
      href={href}
      className="map-float-card map-entry-float-card"
      aria-label={`进入${title}`}
      onPointerDown={(e) => e.preventDefault()}
      onClick={(e) => e.currentTarget.focus({ preventScroll: true })}
    >
      <span className="map-float-card__glow" aria-hidden />
      <span className="map-float-card__icon" aria-hidden>
        {emoji}
      </span>
      <h2 className="map-float-card__title">{title}</h2>
      <p className="map-float-card__subtitle">{subtitle}</p>
    </Link>
  );
}

export function MapEntryLayout() {
  return (
    <MapPageShell>
      <section className="map-entry-hub mx-auto flex min-h-[calc(100vh-3.5rem)] items-center px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto w-full max-w-2xl">
          <header className="map-entry-hub__header">
            <p className="map-entry-hub__eyebrow">
              <span className="map-entry-hub__eyebrow-line" aria-hidden />
              <span>地理 · 区域 · 备考</span>
              <span className="map-entry-hub__eyebrow-line" aria-hidden />
            </p>
            <h1 className="map-entry-hub__heading">地图探索</h1>
            <p className="map-entry-hub__lead">
              世界八大区域与日本 47 都道府县，以地理为线索展开历史、政治与经济。
            </p>
          </header>

          <div className={cn("map-entry-hub__grid", "grid grid-cols-2 gap-4 sm:gap-5")}>
            {MAP_ENTRIES.map((entry) => (
              <MapFloatEntryCard key={entry.href} {...entry} />
            ))}
          </div>
        </div>
      </section>
    </MapPageShell>
  );
}
