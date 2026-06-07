"use client";

import { findPresentationGlossaryById, type PresentationGlossaryTermId } from "@/lib/admin/presentation-glossary";
import { cn } from "@/lib/utils";

interface PresentationGlossaryViewerProps {
  termId: PresentationGlossaryTermId | null;
  onClose: () => void;
}

export function PresentationGlossaryViewer({ termId, onClose }: PresentationGlossaryViewerProps) {
  if (!termId) return null;

  const entry = findPresentationGlossaryById(termId);
  if (!entry) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/55 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal
      aria-labelledby="presentation-glossary-title"
      onClick={onClose}
    >
      <div
        className={cn(
          "relative max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-primary/20 bg-card p-6 shadow-lg sm:p-8",
          "animate-in fade-in duration-200"
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="mb-4 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          关闭讲解
        </button>

        <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
          {entry.categoryLabel}
        </p>
        <h2 id="presentation-glossary-title" className="mt-1 text-lg font-semibold text-foreground">
          {entry.title}
        </h2>

        <div className="mt-5 space-y-4">
          {entry.sections.map((section) => (
            <div key={section.heading}>
              <h3 className="mb-1.5 text-[13px] font-medium text-primary">{section.heading}</h3>
              <p className="text-[14px] leading-relaxed text-foreground/90">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
