"use client";

import { findGlossaryEntryById } from "@/lib/teacher/glossary";
import { useDemoPlatform } from "@/lib/teacher/demo-platform-context";
import { cn } from "@/lib/utils";

interface GlossaryViewerProps {
  onReturn: () => void;
}

export function GlossaryViewer({ onReturn }: GlossaryViewerProps) {
  const { glossaryOpen, activeGlossaryTerm } = useDemoPlatform();

  if (!glossaryOpen || !activeGlossaryTerm) return null;

  const entry = findGlossaryEntryById(activeGlossaryTerm);
  if (!entry) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/55 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal
      aria-labelledby="glossary-title"
    >
      <div
        className={cn(
          "relative max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[oklch(0.78_0.09_145/0.45)] bg-card p-6 shadow-lg sm:p-8",
          "animate-in fade-in duration-200"
        )}
      >
        <button
          type="button"
          onClick={onReturn}
          className="mb-5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ⬅️ 返回原本操作界面
        </button>

        <h2 id="glossary-title" className="text-lg font-semibold text-foreground">
          {entry.title}
        </h2>

        <div className="mt-5 space-y-4">
          {entry.sections.map((section) => (
            <div key={section.heading}>
              <h3 className="mb-1 text-[13px] font-medium text-muted-foreground">
                {section.heading}
              </h3>
              <p className="text-[14px] leading-relaxed text-foreground/90">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
