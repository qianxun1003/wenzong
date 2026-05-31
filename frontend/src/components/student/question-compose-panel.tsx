"use client";

import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ModeSelectorCards } from "./mode-selector-cards";
import { ModeSelectorPills } from "./mode-selector-pills";
import { cn } from "@/lib/utils";
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
  const canSubmit = hasQuestion && selectedMode && !isLoading;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && canSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  if (!hero) {
    return (
      <div className="glass-compose-panel glass-compose-panel--inline">
        <div className="flex items-end gap-2">
          <div className="glass-input-wrap glass-input-wrap--inline min-w-0 flex-1">
            <Textarea
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="继续提问…"
              className="glass-input-field min-h-[40px] max-h-24 resize-none border-0 bg-transparent py-1 text-sm shadow-none focus-visible:ring-0"
              rows={1}
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={onSubmit}
            disabled={!canSubmit}
            size="icon"
            aria-label="发送"
            className="glass-submit-btn h-10 w-10 shrink-0 rounded-full border-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="mt-2.5">
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
          先写下你的问题，再选一种模式，一起发送
        </p>
      </div>

      <section aria-label="输入问题">
        <div className="glass-input-wrap">
          <Textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的问题，例如：日本高度经济成长期是什么？"
            className="glass-input-field min-h-[112px] resize-none border-0 bg-transparent text-base shadow-none focus-visible:ring-0 sm:min-h-[128px]"
            rows={4}
            disabled={isLoading}
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

      <section aria-label="选择回答模式">
        <p className="compose-zone-label">
          {hasQuestion ? "选择回答模式" : "输入问题后，选择一种回答模式"}
        </p>
        <div
          className={cn(
            "transition-all duration-500",
            hasQuestion ? "opacity-100 translate-y-0" : "opacity-60 translate-y-0.5"
          )}
        >
          <ModeSelectorCards
            selected={selectedMode}
            onSelect={onModeSelect}
            disabled={isLoading}
          />
        </div>
      </section>

      <hr className="compose-zone-divider" />

      <section aria-label="发送" className="compose-zone-actions justify-end">
        <Button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="glass-submit-btn h-11 shrink-0 gap-2 rounded-full border-0 px-5"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              正在回答…
            </>
          ) : (
            <>
              发送
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </section>
    </div>
  );
}
