"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  DEFAULT_JAPAN_VIEWPORT,
  JAPAN_REGION_HOTSPOTS,
  JAPAN_REGIONS,
  JAPAN_REGION_VIEWPORTS,
  type JapanRegionId,
} from "@/lib/map-config";
import { cn } from "@/lib/utils";

interface JapanRegionPanelProps {
  selectedId: JapanRegionId | null;
  onSelect: (id: JapanRegionId) => void;
  layerLabel: string;
}

function getTransform(viewport: { x: number; y: number; scale: number }) {
  const tx = 200 - viewport.x * viewport.scale;
  const ty = 250 - viewport.y * viewport.scale;
  return `translate(${tx} ${ty}) scale(${viewport.scale})`;
}

export function JapanRegionPanel({ selectedId, onSelect, layerLabel }: JapanRegionPanelProps) {
  const selectedRegion = JAPAN_REGIONS.find((r) => r.id === selectedId);
  const viewport = selectedId ? JAPAN_REGION_VIEWPORTS[selectedId] : DEFAULT_JAPAN_VIEWPORT;

  return (
    <div className="space-y-6">
      <div className="map-sub-panel">
        <div className="flex items-center justify-between border-b border-border/50 bg-background/50 px-4 py-3 sm:px-5">
          <div>
            <p className="text-sm font-medium text-foreground">区域地图</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {selectedRegion ? `当前聚焦：${selectedRegion.name}` : "点击地方区分或地图热区进行选择"}
            </p>
          </div>
          <Badge variant="outline" className="bg-background/60">
            {layerLabel}视图
          </Badge>
        </div>

        <div className="relative h-[260px] overflow-hidden bg-gradient-to-br from-chart-1/15 via-background/40 to-primary/10 sm:h-[300px]">
          <svg viewBox="0 0 400 500" className="mx-auto h-full max-w-[320px]" aria-label="日本区域地图">
            <g
              transform={getTransform(viewport)}
              className="transition-all duration-700 ease-out"
            >
              <path
                d="M220 40 L280 70 L300 130 L290 200 L250 260 L210 320 L180 400 L150 460 L120 420 L100 350 L110 280 L130 210 L160 140 L190 80 Z"
                fill="currentColor"
                className="text-primary/[0.06]"
                stroke="currentColor"
                strokeWidth="2"
              />
              {JAPAN_REGIONS.map((region) => {
                const spot = JAPAN_REGION_HOTSPOTS[region.id];
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
                        className="pointer-events-none fill-foreground text-[10px] font-semibold"
                      >
                        {region.name.replace("地方", "")}
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
                href={`/map/japan/${selectedRegion.id}`}
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
        <p className="compose-zone-label mb-4">选择地方区分</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {JAPAN_REGIONS.map((region) => {
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
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {region.prefectures.slice(0, 3).map((pref) => (
                    <span key={pref} className="mode-tag">
                      {pref}
                    </span>
                  ))}
                  {region.prefectures.length > 3 && (
                    <span className="mode-tag">+{region.prefectures.length - 3}</span>
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
