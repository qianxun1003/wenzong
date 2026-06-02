export type MessageRole = "user" | "assistant";

export type AnswerMode = "basic" | "eju" | "deep" | "chart";

export const ANSWER_MODES: { value: AnswerMode; label: string; description: string }[] = [
  {
    value: "basic",
    label: "基础模式",
    description: "简单易懂，先听懂记住",
  },
  {
    value: "eju",
    label: "EJU模式",
    description: "考点导向，助力得分",
  },
  {
    value: "deep",
    label: "深度模式",
    description: "因果链条，真正理解",
  },
  {
    value: "chart",
    label: "图表模式",
    description: "资料判读，图表分析",
  },
];

export interface AnswerSection {
  key: string;
  title: string;
  content: string;
}

export interface Citation {
  id?: string | null;
  tag?: string | null;
  snippet: string;
  similarity?: number | null;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  answerMode?: AnswerMode;
  sections?: AnswerSection[];
  citations?: Citation[];
  ragUsed?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  preview?: string;
}

export interface KnowledgeEntry {
  id?: string;
  tag: string;
  content: string;
  createdAt?: string;
}

export interface KnowledgeChunkItem {
  id: string;
  content: string;
  created_at?: string | null;
}

export interface KnowledgeGroupItem {
  tag: string;
  source: string;
  chunk_count: number;
  preview: string;
  created_at?: string | null;
  chunks: KnowledgeChunkItem[];
}

export interface KnowledgeListResponse {
  groups: KnowledgeGroupItem[];
  total_chunks: number;
  total_groups: number;
}

export interface UploadResult {
  filename: string;
  chunks: number;
  status: "success" | "error";
  message?: string;
}

export interface ChatApiResponse {
  reply: string;
  sections: AnswerSection[];
  citations: Citation[];
  answer_mode: AnswerMode;
  rag_used: boolean;
  session_id: string;
}

export interface PopularQuestionItem {
  id: string;
  question_display: string;
  ask_count: number;
  last_answer_mode: AnswerMode;
  last_reply: string;
  last_sections: AnswerSection[];
  last_citations: Citation[];
  last_asked_at: string;
}

export interface PopularQuestionsResponse {
  items: PopularQuestionItem[];
  updated_at: string;
}
