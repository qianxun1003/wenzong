"use client";

import { cn } from "@/lib/utils";
import { MODE_ICONS } from "@/lib/mode-icons";
import { ANSWER_MODES, type AnswerMode } from "@/lib/types";

interface ModeSelectorPillsProps {
  selected: AnswerMode | null;
  onSelect: (mode: AnswerMode) => void;
  disabled?: boolean;
}

const SHORT_LABELS: Record<AnswerMode, string> = {
  basic: "基础",
  eju: "EJU",
  deep: "深度",
  chart: "图表",
};

export function ModeSelectorPills({ selected, onSelect, disabled }: ModeSelectorPillsProps) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="选择回答模式">
      {ANSWER_MODES.map((mode) => {
        const Icon = MODE_ICONS[mode.value];
        const active = selected === mode.value;

        return (
          <button
            key={mode.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={mode.label}
            disabled={disabled}
            onClick={() => onSelect(mode.value)}
            className={cn(
              "mode-pill",
              active && "mode-pill-active",
              disabled && "pointer-events-none opacity-50"
            )}
          >
            <Icon className="h-3 w-3 shrink-0" strokeWidth={1.75} />
            <span>{SHORT_LABELS[mode.value]}</span>
          </button>
        );
      })}
    </div>
  );
}
