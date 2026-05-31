import type { ChatMessage, ChatSession } from "./types";
import { getWelcomeMessages } from "./api";

const SESSIONS_KEY = "wenzong-chat-sessions";
const messagesKey = (sessionId: string) => `wenzong-chat-messages-${sessionId}`;

export function loadSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? (JSON.parse(raw) as ChatSession[]) : [];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: ChatSession[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function loadMessages(sessionId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(messagesKey(sessionId));
    return raw ? (JSON.parse(raw) as ChatMessage[]) : getWelcomeMessages();
  } catch {
    return getWelcomeMessages();
  }
}

export function saveMessages(sessionId: string, messages: ChatMessage[]) {
  localStorage.setItem(messagesKey(sessionId), JSON.stringify(messages));
}

export function deleteSession(sessionId: string) {
  const sessions = loadSessions().filter((s) => s.id !== sessionId);
  saveSessions(sessions);
  localStorage.removeItem(messagesKey(sessionId));
  return sessions;
}

export function createSession(): ChatSession {
  return {
    id: crypto.randomUUID(),
    title: "新对话",
    updatedAt: "刚刚",
  };
}

export function formatSessionTime(date: Date = new Date()): string {
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

export function titleFromMessage(text: string): string {
  const t = text.trim();
  return t.length > 18 ? `${t.slice(0, 18)}…` : t || "新对话";
}
