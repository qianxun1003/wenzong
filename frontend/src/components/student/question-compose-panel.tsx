"use client";

import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ModeSelectorCards } from "./mode-selector-cards";
import { ModeSelectorPills } from "./mode-selector-pills";
import { cn } from "@/lib/utils";
import { EJU_CHAT_PLACEHOLDER } from "@/lib/eju-syllabus";
import type { AnswerMode } from "@/lib/types";

interface QuestionComposePanelProps {
  input: string;
  onInputChange: (value: string) => void;
  selectedMode: AnswerMode | null;
  onModeSelect: (mode: AnswerMode) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  hero?: boolean;
  suggestions?: string[];
}

export function QuestionComposePanel({
  input,
  onInputChange,
  selectedMode,
  onModeSelect,
  onSubmit,
  isLoading,
  hero = false,
  suggestions = [],
}: QuestionComposePanelProps) {
  const hasQuestion = input.trim().length > 0;
  const canSubmit = hasQuestion && selectedMode != null && !isLoading;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && canSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  if (!hero) {
    return (
      <div className="glass-compose-panel glass-compose-panel--inline">
        <div className="glass-input-wrap glass-input-wrap--inline glass-input-wrap--with-send">
          <Textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="继续提问…"
            className="glass-input-field min-h-[40px] max-h-24 min-w-0 flex-1 resize-none border-0 bg-transparent py-1 text-sm shadow-none focus-visible:ring-0"
            rows={1}
            disabled={isLoading}
          />
          <ComposeSendButton
            canSubmit={canSubmit}
            isLoading={isLoading}
            onSubmit={onSubmit}
            compact
          />
        </div>
        <div className="compose-mode-zone compose-mode-zone--inline mt-2.5">
          <ModeSelectorPills
            selected={selectedMode}
            onSelect={onModeSelect}
            disabled={isLoading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("glass-compose-panel", "glass-compose-panel--hero")}>
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-[var(--ui-ink-muted)] glass-hero-badge">
          <Sparkles className="h-3 w-3 text-[var(--ui-ink-muted)]" />
          基于老师讲义 · 四种回答方式
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--ui-ink)] sm:text-2xl">
          有什么文综问题？
        </h1>
        <p className="mt-2 text-sm text-[var(--ui-ink-muted)]">
          写下问题、选择模式后，在输入框旁点击发送
        </p>
      </div>

      <section aria-label="输入问题" className="compose-zone-input">
        <div className="glass-input-wrap glass-input-wrap--with-send glass-input-wrap--hero-send">
          <Textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={EJU_CHAT_PLACEHOLDER}
            className="glass-input-field min-h-[112px] min-w-0 flex-1 resize-none border-0 bg-transparent text-base shadow-none focus-visible:ring-0 sm:min-h-[128px]"
            rows={4}
            disabled={isLoading}
          />
          <ComposeSendButton
            canSubmit={canSubmit}
            isLoading={isLoading}
            onSubmit={onSubmit}
          />
        </div>

        {suggestions.length > 0 && !hasQuestion && (
          <div className="mt-5">
            <p className="compose-zone-label">试试这些问题</p>
            <div className="flex flex-wrap gap-2.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onInputChange(s)}
                  className="mode-chip suggestion-chip"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <hr className="compose-zone-divider" />

      <section
        aria-label="选择回答模式"
        className={cn(
          "compose-zone-modes compose-mode-zone",
          !hasQuestion && "compose-mode-zone--idle"
        )}
      >
        <p className="compose-zone-label">
          {hasQuestion ? "选择回答模式" : "输入问题后，选择一种回答模式"}
        </p>
        <div
          className={cn(
            "mode-selector-grid-wrap transition-opacity duration-300",
            hasQuestion ? "opacity-100" : "opacity-65"
          )}
        >
          <ModeSelectorCards
            selected={selectedMode}
            onSelect={onModeSelect}
            disabled={isLoading}
          />
        </div>
      </section>
    </div>
  );
}

function ComposeSendButton({
  canSubmit,
  isLoading,
  onSubmit,
  compact = false,
}: {
  canSubmit: boolean;
  isLoading?: boolean;
  onSubmit: () => void;
  compact?: boolean;
}) {
  return (
    <div className="glass-send-slot">
      <Button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        aria-label={isLoading ? "正在回答" : "发送"}
        className={cn(
          "glass-submit-btn rounded-full border-0 p-0",
          compact ? "size-10" : "size-11"
        )}
      >
        {isLoading ? (
          <Loader2 className="size-4 shrink-0 animate-spin" />
        ) : (
          <ArrowRight className="glass-send-icon size-4 shrink-0" strokeWidth={2} />
        )}
      </Button>
    </div>
  );
}
