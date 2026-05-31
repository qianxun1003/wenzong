"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, PanelLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ChatSidebar } from "./chat-sidebar";
import { ChatMain } from "./chat-main";
import { sendChatMessage, checkBackendHealth, getWelcomeMessages } from "@/lib/api";
import {
  createSession,
  deleteSession,
  formatSessionTime,
  loadMessages,
  loadSessions,
  saveMessages,
  saveSessions,
  titleFromMessage,
} from "@/lib/chat-storage";
import type { AnswerMode, ChatMessage, ChatSession } from "@/lib/types";

function createId() {
  return crypto.randomUUID();
}

function initState() {
  const sessions = loadSessions();
  if (sessions.length === 0) {
    const session = createSession();
    const welcome = getWelcomeMessages();
    saveSessions([session]);
    saveMessages(session.id, welcome);
    return { sessions: [session], activeId: session.id, messages: welcome };
  }
  const activeId = sessions[0].id;
  return {
    sessions,
    activeId,
    messages: loadMessages(activeId),
  };
}

export function StudentChatLayout() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => getWelcomeMessages());
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    const { sessions: s, activeId, messages: m } = initState();
    setSessions(s);
    setActiveSessionId(activeId);
    setMessages(m);
    setStorageReady(true);

    checkBackendHealth()
      .then((h) => setBackendOk(h.status === "ok"))
      .catch(() => setBackendOk(false));
  }, []);

  const persistSession = useCallback(
    (sessionId: string, nextMessages: ChatMessage[], preview?: string) => {
      saveMessages(sessionId, nextMessages);
      setSessions((prev) => {
        const next = prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                updatedAt: formatSessionTime(),
                preview: preview ?? s.preview,
                title:
                  preview && s.title === "新对话"
                    ? titleFromMessage(preview)
                    : s.title,
              }
            : s
        );
        saveSessions(next);
        return next;
      });
    },
    []
  );

  const handleNewChat = useCallback(() => {
    const session = createSession();
    const welcome = getWelcomeMessages();
    setSessions((prev) => {
      const next = [session, ...prev];
      saveSessions(next);
      return next;
    });
    setActiveSessionId(session.id);
    setMessages(welcome);
    saveMessages(session.id, welcome);
    setSidebarOpen(false);
  }, []);

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id);
    setMessages(loadMessages(id));
    setSidebarOpen(false);
  }, []);

  const handleDeleteSession = useCallback(
    (id: string) => {
      const remaining = deleteSession(id);

      if (remaining.length === 0) {
        const session = createSession();
        const welcome = getWelcomeMessages();
        saveSessions([session]);
        saveMessages(session.id, welcome);
        setSessions([session]);
        setActiveSessionId(session.id);
        setMessages(welcome);
        toast.success("对话已删除");
        return;
      }

      setSessions(remaining);

      if (activeSessionId === id) {
        const nextId = remaining[0].id;
        setActiveSessionId(nextId);
        setMessages(loadMessages(nextId));
      }

      toast.success("对话已删除");
    },
    [activeSessionId]
  );

  const handleSend = useCallback(
    async (content: string, mode: AnswerMode) => {
      if (!activeSessionId) return;

      const userMsg: ChatMessage = {
        id: createId(),
        role: "user",
        content,
        createdAt: new Date().toISOString(),
        answerMode: mode,
      };
      const withUser = [...messages, userMsg];
      setMessages(withUser);
      persistSession(activeSessionId, withUser, content);
      setIsLoading(true);

      try {
        const res = await sendChatMessage(content, activeSessionId, mode);
        const assistantMsg: ChatMessage = {
          id: createId(),
          role: "assistant",
          content: res.reply,
          createdAt: new Date().toISOString(),
          answerMode: res.answer_mode,
          sections: res.sections,
          citations: res.citations,
          ragUsed: res.rag_used,
        };
        const full = [...withUser, assistantMsg];
        setMessages(full);
        persistSession(res.session_id || activeSessionId, full, content);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "发送失败";
        toast.error("无法获取回答", { description: msg });
        const errorMsg: ChatMessage = {
          id: createId(),
          role: "assistant",
          content: `抱歉，暂时无法回答：${msg}`,
          createdAt: new Date().toISOString(),
        };
        const full = [...withUser, errorMsg];
        setMessages(full);
        persistSession(activeSessionId, full, content);
      } finally {
        setIsLoading(false);
      }
    },
    [activeSessionId, messages, persistSession]
  );

  const sidebar = (
    <ChatSidebar
      sessions={sessions}
      activeId={activeSessionId}
      onSelect={handleSelectSession}
      onNewChat={handleNewChat}
      onDelete={handleDeleteSession}
      className="h-full"
    />
  );

  return (
    <div className="relative flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden">
      {backendOk === false && (
        <div className="relative z-10 flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2 text-xs text-foreground">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-primary" />
          后端未连接。请先启动 FastAPI，并完成 Supabase / Gemini 配置（见 docs/GEMINI_SETUP.md）
        </div>
      )}

      <div className="student-ambient-shell relative z-10 flex min-h-0 flex-1 overflow-hidden">
        <div className="student-sidebar-rail hidden w-72 shrink-0 lg:block xl:w-80">
          {sidebar}
        </div>

        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="student-sidebar w-80 border-r p-0">
            {sidebar}
          </SheetContent>
        </Sheet>

        <div className="student-chat-pane flex min-w-0 flex-1 flex-col">
          <div className="student-chat-topbar flex items-center gap-2.5 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSidebarOpen(true)}
              aria-label="打开历史记录"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">文综小助手</span>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            {storageReady ? (
              <ChatMain messages={messages} onSend={handleSend} isLoading={isLoading} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                加载对话…
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
