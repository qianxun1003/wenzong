"use client";

import { useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import type { PresentationGlossaryTermId } from "@/lib/admin/presentation-glossary";
import { cn } from "@/lib/utils";
import { PresentationGlossaryText } from "./presentation-glossary-text";

interface PresentationTableCellProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  variant?: "header" | "body";
  onTermClick: (termId: PresentationGlossaryTermId) => void;
}

export function PresentationTableCell({
  value,
  onChange,
  ariaLabel,
  variant = "body",
  onTermClick,
}: PresentationTableCellProps) {
  const [editing, setEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const enterEditMode = () => {
    setEditing(true);
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  };

  if (editing) {
    return (
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => setEditing(false)}
        aria-label={ariaLabel}
        className={cn(
          "presentation-cell-input",
          variant === "header" && "presentation-cell-input--header"
        )}
      />
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${ariaLabel}，点击编辑`}
      onClick={enterEditMode}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          enterEditMode();
        }
      }}
      className={cn(
        "presentation-cell-display presentation-cell-input cursor-text",
        variant === "header" && "presentation-cell-input--header text-center font-semibold"
      )}
    >
      <PresentationGlossaryText text={value} onTermClick={onTermClick} />
    </div>
  );
}
