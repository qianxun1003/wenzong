import type { JapanRegionId, MapLayerMode, WorldRegionId } from "@/lib/map-config";

const REGION_ORDER: (WorldRegionId | JapanRegionId)[] = [
  "europe",
  "asia",
  "africa",
  "north-america",
  "south-america",
  "oceania",
  "mena",
  "russia-central-asia",
];

const JAPAN_REGION_ORDER: JapanRegionId[] = [
  "hokkaido",
  "tohoku",
  "kanto",
  "chubu",
  "kinki",
  "chugoku",
  "shikoku",
  "kyushu",
];

/** 各图层模式下的区域配色（8 色） */
export const LAYER_PALETTES: Record<MapLayerMode, string[]> = {
  comprehensive: ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#64748b"],
  geo: ["#047857", "#059669", "#10b981", "#0891b2", "#0284c7", "#0369a1", "#0d9488", "#14b8a6"],
  politics: ["#1e40af", "#2563eb", "#4f46e5", "#7c3aed", "#6d28d9", "#4338ca", "#3730a3", "#312e81"],
  economy: ["#b45309", "#d97706", "#f59e0b", "#eab308", "#ca8a04", "#a16207", "#92400e", "#78350f"],
  history: ["#991b1b", "#b91c1c", "#dc2626", "#c2410c", "#9a3412", "#7f1d1d", "#be123c", "#881337"],
};

const UNKNOWN_FILL = "#e2e8f0";
const UNKNOWN_STROKE = "#94a3b8";

function getRegionIndex(kind: "world" | "japan", regionId: string): number {
  const order = kind === "japan" ? JAPAN_REGION_ORDER : REGION_ORDER;
  const index = (order as string[]).indexOf(regionId);
  return index >= 0 ? index : 0;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export interface RegionFillStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export function getRegionFillStyle(
  kind: "world" | "japan",
  layerMode: MapLayerMode,
  regionId: string | null,
  state: "default" | "hover" | "active" | "dimmed",
  options?: { neutralDimmed?: boolean }
): RegionFillStyle {
  if (!regionId) {
    return {
      fill: hexToRgba(UNKNOWN_FILL, state === "dimmed" ? 0.3 : 0.5),
      stroke: hexToRgba(UNKNOWN_STROKE, 0.4),
      strokeWidth: 0.5,
    };
  }

  const palette = LAYER_PALETTES[layerMode];
  const base = palette[getRegionIndex(kind, regionId) % palette.length];

  switch (state) {
    case "active":
      return { fill: hexToRgba(base, 0.85), stroke: hexToRgba(base, 1), strokeWidth: 1.2 };
    case "hover":
      return { fill: hexToRgba(base, 0.65), stroke: hexToRgba(base, 0.9), strokeWidth: 0.9 };
    case "dimmed":
      if (options?.neutralDimmed) {
        return {
          fill: hexToRgba("#94a3b8", 0.28),
          stroke: hexToRgba("#64748b", 0.4),
          strokeWidth: 0.45,
        };
      }
      return { fill: hexToRgba(base, 0.12), stroke: hexToRgba(base, 0.25), strokeWidth: 0.4 };
    default:
      return { fill: hexToRgba(base, 0.45), stroke: hexToRgba(base, 0.7), strokeWidth: 0.6 };
  }
}

export function getRegionBaseColor(
  kind: "world" | "japan",
  layerMode: MapLayerMode,
  regionId: string
): string {
  const palette = LAYER_PALETTES[layerMode];
  return palette[getRegionIndex(kind, regionId) % palette.length];
}
