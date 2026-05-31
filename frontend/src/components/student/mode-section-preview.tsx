"use client";

import { cn } from "@/lib/utils";
import type { AnswerMode } from "@/lib/types";
import { SECTION_DEFINITIONS, getModeConfig } from "@/lib/mode-config";

interface ModeSectionPreviewProps {
  mode: AnswerMode;
}

export function ModeSectionPreview({ mode }: ModeSectionPreviewProps) {
  const emphasized = new Set(getModeConfig(mode).emphasizedSections);

  return (
    <div className="mode-section-preview soft-card px-4 py-3.5">
      <p className="mb-2 text-xs font-medium text-[var(--mode-ink)]">本模式回答结构预览</p>
      <div className="flex flex-wrap gap-1.5">
        {SECTION_DEFINITIONS.map(({ key, title }) => {
          const active = emphasized.has(key);
          return (
            <span
              key={key}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] sm:text-xs",
                active
                  ? "border-[var(--mode-accent)]/30 bg-[var(--mode-accent)]/8 font-medium text-[var(--mode-accent)]"
                  : "border-none bg-[var(--mode-surface)] text-[var(--mode-ink-muted)] opacity-70"
              )}
            >
              {title}
            </span>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-[var(--mode-ink-muted)] sm:text-xs">
        高亮板块为本模式重点展开；其余板块仍会按需呈现。
      </p>
    </div>
  );
}
