"use client";

import { Fragment, useMemo } from "react";
import { GLOSSARY_PATTERN_SORTED, findGlossaryEntryByPattern, type GlossaryTermId } from "@/lib/teacher/glossary";
import { useDemoPlatform } from "@/lib/teacher/demo-platform-context";
import { cn } from "@/lib/utils";

interface GlossaryTextProps {
  text: string;
  className?: string;
  as?: "span" | "p";
}

type Segment = { type: "text"; value: string } | { type: "term"; value: string; termId: GlossaryTermId };

function segmentText(input: string): Segment[] {
  if (!input) return [{ type: "text", value: "" }];

  const pattern = GLOSSARY_PATTERN_SORTED.flatMap((e) =>
    e.patterns.map((p) => ({ pattern: p, termId: e.id }))
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
    const entry = findGlossaryEntryByPattern(part);
    if (entry) {
      segments.push({ type: "term", value: part, termId: entry.id });
    } else {
      segments.push({ type: "text", value: part });
    }
  }
  return segments.length > 0 ? segments : [{ type: "text", value: input }];
}

export function GlossaryText({
  text,
  className,
  as: Tag = "span",
}: GlossaryTextProps) {
  const { openGlossary, currentNavigation } = useDemoPlatform();
  const segments = useMemo(() => segmentText(text), [text]);

  const handleTermClick = (termId: GlossaryTermId) => {
    if (!currentNavigation) return;
    openGlossary(termId, currentNavigation);
  };

  return (
    <Tag className={className}>
      {segments.map((seg, i) =>
        seg.type === "text" ? (
          <Fragment key={i}>{seg.value}</Fragment>
        ) : (
          <button
            key={i}
            type="button"
            onClick={() => handleTermClick(seg.termId)}
            className={cn(
              "cursor-pointer border-0 bg-transparent p-0 font-inherit text-inherit",
              "underline decoration-dashed decoration-[oklch(0.72_0.08_145)] decoration-2 underline-offset-[3px]",
              "transition-colors hover:decoration-[oklch(0.58_0.1_145)] hover:text-[oklch(0.42_0.06_145)]"
            )}
          >
            {seg.value}
          </button>
        )
      )}
    </Tag>
  );
}
