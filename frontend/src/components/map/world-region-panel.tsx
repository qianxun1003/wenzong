"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  DEFAULT_WORLD_VIEWPORT,
  WORLD_REGION_HOTSPOTS,
  WORLD_REGION_VIEWPORTS,
  WORLD_REGIONS,
  type WorldRegionId,
} from "@/lib/map-config";
import { cn } from "@/lib/utils";

interface WorldRegionPanelProps {
  selectedId: WorldRegionId | null;
  onSelect: (id: WorldRegionId) => void;
  layerLabel: string;
}

function getTransform(viewport: { x: number; y: number; scale: number }) {
  const tx = 400 - viewport.x * viewport.scale;
  const ty = 200 - viewport.y * viewport.scale;
  return `translate(${tx} ${ty}) scale(${viewport.scale})`;
}

export function WorldRegionPanel({ selectedId, onSelect, layerLabel }: WorldRegionPanelProps) {
  const selectedRegion = WORLD_REGIONS.find((r) => r.id === selectedId);
  const viewport = selectedId ? WORLD_REGION_VIEWPORTS[selectedId] : DEFAULT_WORLD_VIEWPORT;

  return (
    <div className="space-y-6">
      <div className="map-sub-panel">
        <div className="flex items-center justify-between border-b border-border/50 bg-background/50 px-4 py-3 sm:px-5">
          <div>
            <p className="text-sm font-medium text-foreground">区域地图</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {selectedRegion ? `当前聚焦：${selectedRegion.name}` : "点击区域卡片或地图热区进行选择"}
            </p>
          </div>
          <Badge variant="outline" className="bg-background/60">
            {layerLabel}视图
          </Badge>
        </div>

        <div className="relative h-[260px] overflow-hidden bg-gradient-to-br from-chart-4/20 via-background/40 to-chart-2/20 sm:h-[300px]">
          <svg viewBox="0 0 800 400" className="h-full w-full" aria-label="世界区域地图">
            <g
              transform={getTransform(viewport)}
              className="transition-all duration-700 ease-out"
            >
              <ellipse cx="400" cy="200" rx="360" ry="170" fill="currentColor" className="text-primary/[0.04]" />
              <path
                d="M120 180 Q180 120 260 140 T420 130 T580 160 T700 190 M140 240 Q220 280 320 260 T520 270 T680 230"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-primary/15"
              />
              {WORLD_REGIONS.map((region) => {
                const spot = WORLD_REGION_HOTSPOTS[region.id];
                const active = selectedId === region.id;
                return (
                  <g key={region.id}>
                    <ellipse
                      cx={spot.cx}
                      cy={spot.cy}
                      rx={spot.rx}
                      ry={spot.ry}
                      className={cn(
                        "cursor-pointer transition-all duration-300",
                        active ? "fill-primary/30 stroke-primary/50" : "fill-primary/10 stroke-primary/20 hover:fill-primary/18"
                      )}
                      strokeWidth={active ? 2.5 : 1.5}
                      onClick={() => onSelect(region.id)}
                      role="button"
                      aria-label={region.name}
                    />
                    {active && (
                      <text
                        x={spot.cx}
                        y={spot.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="pointer-events-none fill-foreground text-[11px] font-semibold"
                      >
                        {region.name.replace("篇", "")}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {selectedRegion && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center px-4">
              <Link
                href={`/map/world/${selectedRegion.id}`}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "gap-1.5 gradient-academy shadow-md"
                )}
              >
                进入{selectedRegion.name}学习
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>

      <div>
        <p className="compose-zone-label mb-4">选择区域篇章</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WORLD_REGIONS.map((region) => {
            const active = selectedId === region.id;
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => onSelect(region.id)}
                className={cn("mode-card text-left", active && "mode-card-active")}
              >
                <p className="text-base font-semibold text-foreground">{region.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{region.subtitle}</p>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{region.highlight}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {region.countries.slice(0, 3).map((country) => (
                    <span key={country} className="mode-tag">
                      {country}
                    </span>
                  ))}
                  {region.countries.length > 3 && (
                    <span className="mode-tag">+{region.countries.length - 3}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
