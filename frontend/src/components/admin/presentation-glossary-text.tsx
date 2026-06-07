"use client";

import { Fragment, useMemo } from "react";
import {
  PRESENTATION_GLOSSARY_PATTERN_SORTED,
  findPresentationGlossaryByPattern,
  type PresentationGlossaryTermId,
} from "@/lib/admin/presentation-glossary";
import { cn } from "@/lib/utils";

interface PresentationGlossaryTextProps {
  text: string;
  className?: string;
  onTermClick: (termId: PresentationGlossaryTermId) => void;
}

type Segment =
  | { type: "text"; value: string }
  | { type: "term"; value: string; termId: PresentationGlossaryTermId };

function segmentPresentationText(input: string): Segment[] {
  if (!input) return [{ type: "text", value: "" }];

  const pattern = PRESENTATION_GLOSSARY_PATTERN_SORTED.flatMap((entry) =>
    entry.patterns.map((p) => ({ pattern: p, termId: entry.id }))
  )
    .sort((a, b) => b.pattern.length - a.pattern.length)
    .map(({ pattern }) => pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  if (!pattern) return [{ type: "text", value: input }];

  const re = new RegExp(`(${pattern})`, "gi");
  const parts = input.split(re);
  const segments: Segment[] = [];

  for (const part of parts) {
    if (!part) continue;
    const entry = findPresentationGlossaryByPattern(part);
    if (entry) {
      segments.push({ type: "term", value: part, termId: entry.id });
    } else {
      segments.push({ type: "text", value: part });
    }
  }

  return segments.length > 0 ? segments : [{ type: "text", value: input }];
}

export function PresentationGlossaryText({
  text,
  className,
  onTermClick,
}: PresentationGlossaryTextProps) {
  const segments = useMemo(() => segmentPresentationText(text), [text]);

  return (
    <span className={cn("whitespace-pre-wrap", className)}>
      {segments.map((seg, index) =>
        seg.type === "text" ? (
          <Fragment key={index}>{seg.value}</Fragment>
        ) : (
          <button
            key={index}
            type="button"
            data-glossary-term
            onClick={(event) => {
              event.stopPropagation();
              onTermClick(seg.termId);
            }}
            className={cn(
              "cursor-pointer border-0 bg-transparent p-0 font-inherit text-inherit",
              "underline decoration-dashed decoration-primary/55 decoration-2 underline-offset-[3px]",
              "transition-colors hover:decoration-primary hover:text-primary"
            )}
          >
            {seg.value}
          </button>
        )
      )}
    </span>
  );
}
