import type {
  AnswerMode,
  ChatApiResponse,
  ChatMessage,
  KnowledgeEntry,
  KnowledgeListResponse,
  UploadResult,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function parseErrorDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) =>
        typeof item === "object" && item && "msg" in item
          ? String((item as { msg: string }).msg)
          : String(item)
      )
      .join("；");
  }
  return "请求失败，请确认后端已启动且配置正确";
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(options?.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...options?.headers,
      },
    });
  } catch {
    throw new Error(
      `无法连接后端（${API_BASE}），请先启动：cd backend && uvicorn app.main:app --reload`
    );
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(parseErrorDetail(err.detail));
  }
  return res.json();
}

export async function checkBackendHealth(): Promise<{
  status: string;
  supabase: boolean;
  llm: boolean;
  provider?: string | null;
  openai?: boolean;
  gemini?: boolean;
}> {
  return request("/health");
}

export async function sendChatMessage(
  message: string,
  sessionId?: string,
  answerMode: AnswerMode = "basic"
): Promise<ChatApiResponse> {
  return request("/api/chat", {
    method: "POST",
    body: JSON.stringify({ message, session_id: sessionId, answer_mode: answerMode }),
  });
}

export async function uploadDocuments(files: File[]): Promise<UploadResult[]> {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  return request("/api/documents/upload", { method: "POST", body: form });
}

export async function createKnowledgeEntry(
  entry: Omit<KnowledgeEntry, "id" | "createdAt">
): Promise<KnowledgeEntry> {
  return request("/api/knowledge", {
    method: "POST",
    body: JSON.stringify({ tag: entry.tag, content: entry.content }),
  });
}

export async function fetchKnowledgeList(query?: string): Promise<KnowledgeListResponse> {
  const params = new URLSearchParams();
  if (query?.trim()) params.set("q", query.trim());
  const qs = params.toString();
  return request(`/api/knowledge${qs ? `?${qs}` : ""}`);
}

export function getWelcomeMessages(): ChatMessage[] {
  return [];
}
