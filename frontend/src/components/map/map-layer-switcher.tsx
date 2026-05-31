"use client";

import { cn } from "@/lib/utils";
import { MAP_LAYER_OPTIONS, type MapLayerMode } from "@/lib/map-config";

interface MapLayerSwitcherProps {
  value: MapLayerMode;
  onChange: (mode: MapLayerMode) => void;
  className?: string;
}

export function MapLayerSwitcher({ value, onChange, className }: MapLayerSwitcherProps) {
  const activeLayer = MAP_LAYER_OPTIONS.find((item) => item.id === value)!;

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {MAP_LAYER_OPTIONS.map(({ id, shortLabel, icon: Icon }) => {
          const active = value === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={cn("mode-pill", active && "mode-pill-active")}
            >
              <Icon className="h-3 w-3" />
              {shortLabel}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        当前图层：<span className="font-medium text-foreground">{activeLayer.label}</span>
        <span className="mx-2 text-border">—</span>
        {activeLayer.description}
      </p>
    </div>
  );
}
