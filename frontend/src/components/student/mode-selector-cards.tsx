"use client";

import { cn } from "@/lib/utils";
import { MODE_ICONS } from "@/lib/mode-icons";
import { getModeConfig } from "@/lib/mode-config";
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
        "grid gap-3.5",
        compact ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"
      )}
      role="radiogroup"
      aria-label="选择回答模式"
    >
      {ANSWER_MODES.map((mode) => {
        const Icon = MODE_ICONS[mode.value];
        const active = selected === mode.value;
        const config = getModeConfig(mode.value);

        return (
          <button
            key={mode.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onSelect(mode.value)}
            className={cn(
              "mode-card text-left transition-all duration-200",
              active && "mode-card-active",
              compact && "mode-card-compact",
              disabled && "pointer-events-none opacity-50"
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mode-card-icon flex shrink-0 items-center justify-center",
                  compact && "h-8 w-8"
                )}
              >
                <Icon className={cn("shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4")} strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("font-medium text-[var(--ui-ink)]", compact ? "text-xs" : "text-sm")}>
                  {mode.label}
                </p>
                {!compact && (
                  <p className="mt-0.5 text-[11px] leading-snug text-[var(--ui-ink-muted)]">
                    {mode.description}
                  </p>
                )}
                {!compact && active && (
                  <p className="mt-2 text-[10px] text-[var(--ui-ink-muted)]">
                    重点：{config.emphasizedSections.map((k) => {
                      const titles: Record<string, string> = {
                        core_conclusion: "核心结论",
                        background: "背景原因",
                        process: "具体过程",
                        eju_points: "EJU考点",
                        pitfalls: "易错点",
                        related_knowledge: "相关知识点",
                        related_charts: "相关图表",
                        related_quiz: "相关Quiz",
                      };
                      return titles[k] ?? k;
                    }).join(" · ")}
                  </p>
                )}
              </div>
              {active && (
                <span className="mode-card-check shrink-0" aria-hidden>
                  ✓
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
