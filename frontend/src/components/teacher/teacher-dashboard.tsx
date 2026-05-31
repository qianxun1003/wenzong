"use client";

import { useEffect, useState } from "react";
import { AlertCircle, BookOpen, CheckCircle2, Database, FileUp, PenLine } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploadPanel } from "./file-upload-panel";
import { DirectEntryPanel } from "./direct-entry-panel";
import { KnowledgeListPanel } from "./knowledge-list-panel";
import { checkBackendHealth } from "@/lib/api";
import { cn } from "@/lib/utils";

export function TeacherDashboard() {
  const [health, setHealth] = useState<{
    ok: boolean;
    supabase: boolean;
    llm: boolean;
    provider?: string | null;
  } | null>(null);
  const [listRefreshKey, setListRefreshKey] = useState(0);

  const bumpKnowledgeList = () => setListRefreshKey((v) => v + 1);

  useEffect(() => {
    checkBackendHealth()
      .then((h) =>
        setHealth({
          ok: h.status === "ok",
          supabase: h.supabase,
          llm: h.llm,
          provider: h.provider,
        })
      )
      .catch(() => setHealth({ ok: false, supabase: false, llm: false }));
  }, []);

  const allReady = health?.supabase && health?.llm;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold sm:text-3xl">
            教师管理后台
          </h1>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          管理文综知识库：批量上传讲义或直接录入考点，内容将自动切片并向量化，供学生端 RAG 检索使用。
        </p>
      </div>

      {health !== null && (
        <div
          className={cn(
            "flex flex-col gap-2 rounded-xl border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between",
            allReady
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-amber-200 bg-amber-50 text-amber-900"
          )}
        >
          <div className="flex items-start gap-2">
            {allReady ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <div>
              {allReady ? (
                <p className="font-medium">
                  {health.provider === "mock"
                    ? "免费测试模式：可录入考点（关键词检索，不调用大模型）"
                    : "后端已就绪，可以录入考点"}
                </p>
              ) : health.ok ? (
                <p className="font-medium">后端已连接，请配置 Gemini / OpenAI，或 LLM_PROVIDER=mock</p>
              ) : (
                <p className="font-medium">后端未连接</p>
              )}
              <p className="mt-0.5 text-xs opacity-80">
                Supabase {health.supabase ? "✓" : "✗"} · 大模型{" "}
                {health.llm ? `✓ (${health.provider ?? "ok"})` : "✗"} · 见 docs/GEMINI_SETUP.md
              </p>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
          <TabsTrigger value="library" className="gap-2 data-[state=active]:bg-background">
            <BookOpen className="h-4 w-4" />
            已录入考点
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2 data-[state=active]:bg-background">
            <FileUp className="h-4 w-4" />
            文件上传
          </TabsTrigger>
          <TabsTrigger value="direct" className="gap-2 data-[state=active]:bg-background">
            <PenLine className="h-4 w-4" />
            直接录入
          </TabsTrigger>
        </TabsList>
        <TabsContent value="library" className="mt-6">
          <KnowledgeListPanel refreshKey={listRefreshKey} />
        </TabsContent>
        <TabsContent value="upload" className="mt-6">
          <FileUploadPanel onUploaded={bumpKnowledgeList} />
        </TabsContent>
        <TabsContent value="direct" className="mt-6">
          <DirectEntryPanel onSaved={bumpKnowledgeList} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
