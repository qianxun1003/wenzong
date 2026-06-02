"use client";

import { ANSWER_MODES, type AnswerMode, type AnswerSection, type Citation } from "@/lib/types";
import { cn } from "@/lib/utils";

function isUncovered(content: string) {
  return !content.trim() || content.trim() === "讲义未覆盖";
}

function SectionBlock({ title, content }: { title: string; content: string }) {
  if (isUncovered(content)) return null;

  const isChartSection = title === "相关图表";
  const looksLikeMermaid = /^(graph|flowchart|timeline|gantt|sequenceDiagram)/m.test(content.trim());

  return (
    <div className="space-y-1.5">
      <h4 className="text-xs font-medium text-[var(--ui-ink)]">{title}</h4>
      {isChartSection && looksLikeMermaid ? (
        <pre className="mode-bubble-code overflow-x-auto rounded-lg p-3 text-xs leading-relaxed whitespace-pre-wrap font-mono">
          {content}
        </pre>
      ) : (
        <div className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--ui-ink)]">
          {content}
        </div>
      )}
    </div>
  );
}

interface AssistantAnswerDetailProps {
  answerMode?: AnswerMode;
  reply: string;
  sections?: AnswerSection[];
  citations?: Citation[];
  ragUsed?: boolean;
  className?: string;
}

export function AssistantAnswerDetail({
  answerMode,
  reply,
  sections,
  citations,
  ragUsed,
  className,
}: AssistantAnswerDetailProps) {
  const modeLabel = ANSWER_MODES.find((m) => m.value === answerMode)?.label;
  const visibleSections = sections?.filter((s) => !isUncovered(s.content)) ?? [];
  const citationCount = citations?.length ?? 0;

  return (
    <div className={cn("space-y-4", className)}>
      {(modeLabel || ragUsed !== undefined) && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--ui-border)] pb-2.5">
          {modeLabel && <span className="mode-tag font-medium">{modeLabel}</span>}
          <span className="text-[10px] text-[var(--ui-ink-muted)] sm:text-xs">
            {ragUsed === true && citationCount > 0
              ? `引用 ${citationCount} 条讲义`
              : ragUsed === false
                ? "未命中讲义"
                : null}
          </span>
        </div>
      )}

      {visibleSections.length > 0 ? (
        <div className="space-y-4">
          {visibleSections.map((section) => (
            <SectionBlock key={section.key} title={section.title} content={section.content} />
          ))}
        </div>
      ) : (
        <div className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--ui-ink)]">
          {reply}
        </div>
      )}

      {citations && citations.length > 0 && (
        <div className="space-y-2 border-t border-[var(--ui-border)] pt-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--ui-ink-muted)]">
            引用讲义
          </p>
          <ul className="space-y-1.5">
            {citations.map((c, i) => (
              <li
                key={c.id ?? i}
                className="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-card)] px-3 py-2 text-xs text-[var(--ui-ink-muted)]"
              >
                {c.tag && <span className="font-medium text-[var(--ui-ink)]">{c.tag} · </span>}
                {c.snippet}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
