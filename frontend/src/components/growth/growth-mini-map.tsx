"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { JapanRegionId, WorldRegionId } from "@/lib/map-config";
import {
  JAPAN_REGION_HOTSPOTS,
  JAPAN_REGIONS,
  WORLD_REGION_HOTSPOTS,
  WORLD_REGIONS,
} from "@/lib/map-config";
import { cn } from "@/lib/utils";

type RegionHotspot = { cx: number; cy: number; rx: number; ry: number };

const NAVIGATE_DELAY_MS = 280;

interface GrowthMiniMapBaseProps {
  href: string;
  className?: string;
}

interface GrowthWorldMiniMapProps extends GrowthMiniMapBaseProps {
  kind: "world";
  litRegionIds: Set<WorldRegionId>;
}

interface GrowthJapanMiniMapProps extends GrowthMiniMapBaseProps {
  kind: "japan";
  litRegionIds: Set<JapanRegionId>;
}

export type GrowthMiniMapProps = GrowthWorldMiniMapProps | GrowthJapanMiniMapProps;

export function GrowthMiniMap(props: GrowthMiniMapProps) {
  const { kind, litRegionIds, href, className } = props;
  const router = useRouter();
  const [pressed, setPressed] = useState(false);
  const navigateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isWorld = kind === "world";
  const viewBox = isWorld ? "0 0 800 400" : "0 0 400 450";
  const regions = isWorld ? WORLD_REGIONS : JAPAN_REGIONS;
  const hotspots: Record<string, RegionHotspot> = isWorld
    ? WORLD_REGION_HOTSPOTS
    : JAPAN_REGION_HOTSPOTS;

  const releasePress = useCallback(() => setPressed(false), []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }
      e.preventDefault();
      setPressed(true);
      const delay =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? 0
          : NAVIGATE_DELAY_MS;
      if (navigateTimer.current) clearTimeout(navigateTimer.current);
      navigateTimer.current = setTimeout(() => {
        setPressed(false);
        router.push(href);
      }, delay);
    },
    [href, router]
  );

  useEffect(() => {
    return () => {
      if (navigateTimer.current) clearTimeout(navigateTimer.current);
    };
  }, []);

  return (
    <Link
      href={href}
      onClick={handleClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={releasePress}
      onPointerLeave={releasePress}
      onPointerCancel={releasePress}
      className={cn(
        "growth-mini-map group block",
        !isWorld && "growth-mini-map--japan",
        pressed && "growth-mini-map--pressed",
        className
      )}
      aria-label={isWorld ? "查看世界地图探索" : "查看日本地图探索"}
    >
      <span className="growth-mini-map__cta">
        <span className="growth-mini-map__cta-label">去探索</span>
        <span className="growth-mini-map__cta-arrow" aria-hidden>
          →
        </span>
      </span>
      <div className="growth-mini-map__canvas">
        <svg
          viewBox={viewBox}
          className="growth-mini-map__svg h-full w-full"
          role="img"
          aria-hidden
        >
          <rect
            width="100%"
            height="100%"
            className="growth-mini-map__ocean"
            rx={isWorld ? 12 : 10}
          />
          {!isWorld && (
            <path
              d="M120 60 Q200 40 280 80 T320 200 Q300 320 200 400 Q120 360 100 240 T120 60"
              className="growth-mini-map__landmass"
            />
          )}
          {isWorld && (
            <ellipse
              cx="400"
              cy="200"
              rx="340"
              ry="150"
              className="growth-mini-map__landmass"
            />
          )}
          {regions.map((region) => {
            const spot = hotspots[region.id];
            const lit = isWorld
              ? (litRegionIds as Set<WorldRegionId>).has(region.id as WorldRegionId)
              : (litRegionIds as Set<JapanRegionId>).has(region.id as JapanRegionId);
            return (
              <g key={region.id}>
                <ellipse
                  cx={spot.cx}
                  cy={spot.cy}
                  rx={spot.rx}
                  ry={spot.ry}
                  className={cn(
                    "growth-mini-map__region transition-all duration-500",
                    lit ? "growth-mini-map__region--lit" : "growth-mini-map__region--dim"
                  )}
                />
                {lit && (
                  <ellipse
                    cx={spot.cx}
                    cy={spot.cy}
                    rx={spot.rx * 0.55}
                    ry={spot.ry * 0.55}
                    className="growth-mini-map__region-core"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </Link>
  );
}
