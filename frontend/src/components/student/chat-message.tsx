"use client";

import { Bot, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ANSWER_MODES, type ChatMessage } from "@/lib/types";

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

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
        <pre className="mode-bubble-code overflow-x-auto p-3 text-xs leading-relaxed whitespace-pre-wrap font-mono">
          {content}
        </pre>
      ) : (
        <div className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--mode-ink)]">
          {content}
        </div>
      )}
    </div>
  );
}

function AssistantMetaHeader({ message }: { message: ChatMessage }) {
  const modeLabel = ANSWER_MODES.find((m) => m.value === message.answerMode)?.label;
  const sectionCount =
    message.sections?.filter((s) => !isUncovered(s.content)).length ?? 0;
  const citationCount = message.citations?.length ?? 0;

  if (!modeLabel && message.ragUsed === undefined) return null;

  const parts: string[] = [];
  if (modeLabel) parts.push(modeLabel);
  if (message.ragUsed === true && citationCount > 0) {
    parts.push(`引用 ${citationCount} 条讲义`);
  } else if (message.ragUsed === false) {
    parts.push("未命中讲义");
  }
  if (sectionCount > 0) {
    parts.push(`${sectionCount} 个板块已呈现`);
  }

  return (
    <div className="mb-3 flex flex-wrap items-center gap-1.5 border-b border-[var(--mode-divider)] pb-2.5">
      {modeLabel && (
        <span className="mode-tag font-medium">{modeLabel}</span>
      )}
      <span className="text-[10px] text-[var(--mode-ink-muted)] sm:text-xs">
        {parts.slice(modeLabel ? 1 : 0).join(" · ")}
      </span>
    </div>
  );
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === "user";
  const userModeLabel = ANSWER_MODES.find((m) => m.value === message.answerMode)?.label;
  const visibleSections = message.sections?.filter((s) => !isUncovered(s.content)) ?? [];
  const isWelcomeOnly =
    message.id === "welcome" && !message.sections?.length;
  return (
    <div
      className={cn(
        "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className="h-8 w-8 shrink-0 border border-[var(--ui-border)] bg-[var(--ui-card)]">
        <AvatarFallback
          className={cn(
            "text-xs",
            isUser
              ? "bg-[var(--ui-ink)] text-[var(--ui-card)]"
              : "bg-[var(--ui-muted)] text-[var(--ui-ink-muted)]"
          )}
        >
          {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser ? "mode-bubble-user rounded-tr-sm" : "mode-bubble-assistant rounded-tl-sm"
        )}
      >
        {isUser ? (
          <div className="space-y-1.5">
            {userModeLabel && (
              <p className="text-[10px] opacity-80">提问于 · {userModeLabel}</p>
            )}
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        ) : visibleSections.length > 0 ? (
          <div className="space-y-4">
            <AssistantMetaHeader message={message} />
            {visibleSections.map((section) => (
              <SectionBlock key={section.key} title={section.title} content={section.content} />
            ))}
            {message.citations && message.citations.length > 0 && (
              <details className="mode-bubble-code px-3 py-2 text-xs">
                <summary className="cursor-pointer text-[var(--mode-ink-muted)] hover:text-[var(--mode-ink)]">
                  查看讲义引用
                </summary>
                <ul className="mt-2 space-y-2 text-[var(--mode-ink-muted)]">
                  {message.citations.map((c, i) => (
                    <li key={c.id ?? i}>
                      {c.tag && (
                        <span className="font-medium text-[var(--mode-ink)]">[{c.tag}] </span>
                      )}
                      {c.snippet}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            {isWelcomeOnly && message.answerMode && (
              <span className="mode-tag text-[10px]">
                {ANSWER_MODES.find((m) => m.value === message.answerMode)?.label}
              </span>
            )}
            <p className="whitespace-pre-wrap text-[var(--mode-ink)]">{message.content}</p>
          </div>
        )}
      </div>
    </div>
  );
}
