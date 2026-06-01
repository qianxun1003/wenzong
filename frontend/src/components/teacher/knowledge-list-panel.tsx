"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { fetchKnowledgeList } from "@/lib/api";
import type { KnowledgeGroupItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface KnowledgeListPanelProps {
  refreshKey?: number;
}

function formatSource(source: string) {
  if (source === "direct_entry") return "直接录入";
  return source;
}

function formatTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function GroupCard({ group }: { group: KnowledgeGroupItem }) {
  const [expanded, setExpanded] = useState(false);
  const isDirect = group.source === "direct_entry";

  return (
    <div className="rounded-xl border border-border/60 bg-background">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
      >
        <div className="mt-0.5 shrink-0 text-primary">
          {isDirect ? (
            <BookOpen className="h-4 w-4" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground">{group.tag}</span>
            <Badge variant="secondary" className="text-[10px]">
              {group.chunk_count} 片段
            </Badge>
            <Badge variant="outline" className="text-[10px] font-normal">
              {formatSource(group.source)}
            </Badge>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{group.preview}</p>
          <p className="text-[11px] text-muted-foreground/80">
            最近更新 · {formatTime(group.created_at)}
          </p>
        </div>
        <div className="mt-1 shrink-0 text-muted-foreground">
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="space-y-2 border-t border-border/60 bg-muted/20 px-4 py-3">
          {group.chunks.map((chunk, index) => (
            <div
              key={chunk.id}
              className="rounded-lg border border-border/50 bg-background px-3 py-2.5"
            >
              <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">
                片段 {index + 1}
                {chunk.created_at ? ` · ${formatTime(chunk.created_at)}` : ""}
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {chunk.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function KnowledgeListPanel({ refreshKey = 0 }: KnowledgeListPanelProps) {
  const [groups, setGroups] = useState<KnowledgeGroupItem[]>([]);
  const [totalChunks, setTotalChunks] = useState(0);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (term?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchKnowledgeList(term);
      setGroups(res.groups);
      setTotalChunks(res.total_chunks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
      setGroups([]);
      setTotalChunks(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load(query);
    });
  }, [load, query, refreshKey]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search.trim());
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <BookOpen className="h-5 w-5 text-primary" />
              已录入考点
            </CardTitle>
            <CardDescription className="mt-1.5">
              查看当前知识库中所有已向量化、可供学生端检索的内容。
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => load(query)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            刷新
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{groups.length} 个主题</Badge>
          <Badge variant="secondary">{totalChunks} 个知识片段</Badge>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索标签、来源或正文…"
              className="bg-background pl-9"
            />
          </div>
          <Button type="submit" variant="secondary" disabled={isLoading}>
            搜索
          </Button>
          {query && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearch("");
                setQuery("");
              }}
            >
              清除
            </Button>
          )}
        </form>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            正在加载知识库…
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-sm text-destructive">
            {error}
          </div>
        ) : groups.length === 0 ? (
          <div
            className={cn(
              "rounded-xl border border-dashed border-border/80 px-4 py-16 text-center",
              query ? "bg-muted/20" : "bg-muted/30"
            )}
          >
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">
              {query ? "没有匹配的考点" : "还没有录入任何考点"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {query
                ? "试试换个关键词，或清除搜索查看全部内容"
                : "在「文件上传」或「直接录入」中添加内容后，会显示在这里"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <GroupCard
                key={`${group.tag}::${group.source}`}
                group={group}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
