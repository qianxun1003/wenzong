"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessageBubble } from "./chat-message";
import { QuestionComposePanel } from "./question-compose-panel";
import { getModeShellClass } from "@/lib/mode-theme";
import { getModeConfig } from "@/lib/mode-config";
import { ANSWER_MODES, type AnswerMode, type ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChatMainProps {
  messages: ChatMessage[];
  onSend: (content: string, mode: AnswerMode) => Promise<void>;
  isLoading?: boolean;
  initialQuestion?: string;
  initialMode?: AnswerMode;
  fromMap?: boolean;
}

function hasUserMessages(messages: ChatMessage[]) {
  return messages.some((m) => m.role === "user");
}

const DEFAULT_SUGGESTIONS = [
  "日本高度经济成长是什么时候？",
  "美国的政治体制是什么？",
  "世界上的峡湾地貌的具体例子？",
];

export function ChatMain({
  messages,
  onSend,
  isLoading,
  initialQuestion,
  initialMode,
  fromMap,
}: ChatMainProps) {
  const [input, setInput] = useState(initialQuestion ?? "");
  const [selectedMode, setSelectedMode] = useState<AnswerMode | null>(initialMode ?? null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [wasPrefilled, setWasPrefilled] = useState(Boolean(initialQuestion));

  const userHasSent = hasUserMessages(messages);
  const themeClass = getModeShellClass();

  useEffect(() => {
    if (!initialQuestion && !initialMode) return;
    queueMicrotask(() => {
      if (initialQuestion) {
        setInput(initialQuestion);
        setWasPrefilled(true);
      }
      if (initialMode) setSelectedMode(initialMode);
    });
  }, [initialQuestion, initialMode]);

  useEffect(() => {
    if (userHasSent) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, userHasSent]);

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text || !selectedMode || isLoading) return;
    setInput("");
    setSelectedMode(null);
    await onSend(text, selectedMode);
  };

  if (!userHasSent) {
    return (
      <div className={cn("chat-ambient", themeClass)}>
        <div className="hero-scroll-area">
          <div className="hero-scroll-inner">
            {fromMap && wasPrefilled && (
              <div className="welcome-banner mb-4 text-xs text-muted-foreground">
                来自地图探索 · 已预填考点问题，选择模式后即可发送
              </div>
            )}
            <QuestionComposePanel
              input={input}
              onInputChange={setInput}
              selectedMode={selectedMode}
              onModeSelect={setSelectedMode}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              hero
              suggestions={DEFAULT_SUGGESTIONS}
            />
          </div>
        </div>
      </div>
    );
  }

  const visibleMessages = messages.filter((msg) => msg.id !== "welcome");

  return (
    <div className={cn("chat-ambient", themeClass)}>
      <ScrollArea className="chat-messages-scroll min-h-0 flex-1">
        <div className="mx-auto w-full max-w-3xl space-y-7">
          {visibleMessages.map((msg) => (
            <ChatMessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-[var(--ui-ink-muted)]">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--ui-ink-muted)]" />
              正在检索讲义，并按
              {ANSWER_MODES.find(
                (m) =>
                  m.value ===
                  [...messages].reverse().find((msg) => msg.role === "user")?.answerMode
              )?.label ?? "所选模式"}
              组织{" "}
              <span className="font-medium text-[var(--ui-ink)]">
                {getModeConfig(
                  [...messages].reverse().find((msg) => msg.role === "user")?.answerMode ??
                    "basic"
                ).loadingFocus}
              </span>
              …
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="glass-compose-footer">
        <div className="mx-auto w-full max-w-3xl">
          <QuestionComposePanel
            input={input}
            onInputChange={setInput}
            selectedMode={selectedMode}
            onModeSelect={setSelectedMode}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
