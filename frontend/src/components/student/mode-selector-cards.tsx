"use client";

import { cn } from "@/lib/utils";
import { MODE_ICONS } from "@/lib/mode-icons";
import { ANSWER_MODES, type AnswerMode } from "@/lib/types";

interface ModeSelectorCardsProps {
  selected: AnswerMode | null;
  onSelect: (mode: AnswerMode) => void;
  compact?: boolean;
  disabled?: boolean;
}

export function ModeSelectorCards({
  selected,
  onSelect,
  compact = false,
  disabled = false,
}: ModeSelectorCardsProps) {
  return (
    <div
      className={cn(
        "mode-selector-grid grid gap-3.5",
        compact ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"
      )}
      role="radiogroup"
      aria-label="选择回答模式"
    >
      {ANSWER_MODES.map((mode) => {
        const Icon = MODE_ICONS[mode.value];
        const active = selected === mode.value;

        return (
          <button
            key={mode.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onSelect(mode.value)}
            className={cn(
              "mode-card",
              active && "mode-card-active",
              compact && "mode-card-compact",
              disabled && "pointer-events-none opacity-50"
            )}
          >
            <span
              className={cn(
                "mode-card-check",
                !active && "mode-card-check--hidden"
              )}
              aria-hidden
            >
              ✓
            </span>
            <span
              className={cn(
                "mode-card-icon flex shrink-0 items-center justify-center",
                compact && "h-8 w-8"
              )}
            >
              <Icon className={cn("shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4")} strokeWidth={1.75} />
            </span>
            <div className="mode-card__copy">
              <p className={cn("mode-card__title", compact ? "text-xs" : "text-sm")}>
                {mode.label}
              </p>
              {!compact && (
                <p className="mode-card__desc">{mode.description}</p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
