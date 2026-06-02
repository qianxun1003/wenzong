"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Loader2, RefreshCw, TrendingUp } from "lucide-react";
import { AssistantAnswerDetail } from "@/components/student/assistant-answer-detail";
import { buttonVariants } from "@/components/ui/button";
import { fetchPopularQuestions } from "@/lib/api";
import { ANSWER_MODES, type AnswerMode, type PopularQuestionItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const POLL_MS = 12_000;

const DEMO_ITEMS: PopularQuestionItem[] = [
  {
    id: "demo-1",
    question_display: "日本高度经济成长期是什么？",
    ask_count: 28,
    last_answer_mode: "eju",
    last_reply: "",
    last_sections: [
      { key: "core_conclusion", title: "核心结论", content: "1955—1973 年前后日本经济高速增长…" },
      { key: "eju_points", title: "EJU考点", content: "时期、特征、与贸易结构变化…" },
    ],
    last_citations: [],
    last_asked_at: "",
  },
  {
    id: "demo-2",
    question_display: "美国的政治体制有何特点？",
    ask_count: 19,
    last_answer_mode: "basic",
    last_reply: "",
    last_sections: [
      { key: "core_conclusion", title: "核心结论", content: "三权分立、联邦制…" },
    ],
    last_citations: [],
    last_asked_at: "",
  },
  {
    id: "demo-3",
    question_display: "世界上的峡湾地貌典型例子？",
    ask_count: 12,
    last_answer_mode: "deep",
    last_reply: "",
    last_sections: [
      { key: "core_conclusion", title: "核心结论", content: "挪威西海岸、新西兰峡湾等…" },
    ],
    last_citations: [],
    last_asked_at: "",
  },
];

function formatAskedAt(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function modeLabel(mode: AnswerMode) {
  return ANSWER_MODES.find((m) => m.value === mode)?.label ?? mode;
}

export function PopularQuestionsPage() {
  const [items, setItems] = useState<PopularQuestionItem[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isDemo = !loading && !error && items.length === 0;
  const displayItems = isDemo ? DEMO_ITEMS : items;

  const stats = useMemo(() => {
    if (isDemo) {
      return { count: 3, totalAsks: 59 };
    }
    return {
      count: items.length,
      totalAsks: items.reduce((sum, i) => sum + i.ask_count, 0),
    };
  }, [items, isDemo]);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const data = await fetchPopularQuestions(50);
      setItems(data.items);
      setUpdatedAt(data.updated_at);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(true), POLL_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (loading) return;
    if (displayItems.length === 0) {
      setExpandedId(null);
      return;
    }
    setExpandedId((cur) => {
      if (cur && displayItems.some((i) => i.id === cur)) return cur;
      return displayItems[0].id;
    });
  }, [displayItems, loading]);

  return (
    <div className="popular-questions-page ui-shell flex h-full min-h-0 flex-col">
      <div className="popular-questions-page__shell mx-auto flex h-full min-h-0 w-full max-w-3xl flex-col px-3 sm:px-5">
        <header className="popular-questions-page__header shrink-0 pt-1">
          <Link
            href="/student"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "mb-3 gap-1.5 text-muted-foreground"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            返回 AI 导师
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="popular-questions-page__eyebrow">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                全站统计 · 自动更新
              </p>
              <h1 className="popular-questions-page__title">热门问题排行榜</h1>
              <p className="popular-questions-page__lead">
                按提问次数排序；点击任意问题可展开查看最近一次完整解答（分板块呈现，与对话页一致）
              </p>
            </div>
            <button
              type="button"
              onClick={() => void load(true)}
              disabled={refreshing || isDemo}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5 shrink-0"
              )}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
              刷新
            </button>
          </div>
          {updatedAt && !isDemo && (
            <p className="mt-2 text-[10px] text-muted-foreground">
              上次更新：{formatAskedAt(updatedAt)} · 约每 12 秒自动刷新
            </p>
          )}
        </header>

        <div className="popular-questions-page__intro shrink-0">
          <div className="popular-questions-page__stats">
            <div className="popular-questions-page__stat">
              <span className="popular-questions-page__stat-value">{stats.count}</span>
              <span className="popular-questions-page__stat-label">上榜问题</span>
            </div>
            <div className="popular-questions-page__stat-divider" aria-hidden />
            <div className="popular-questions-page__stat">
              <span className="popular-questions-page__stat-value">{stats.totalAsks}</span>
              <span className="popular-questions-page__stat-label">累计提问</span>
            </div>
          </div>
          <p className="popular-questions-page__howto">
            点击问题行展开 · 含回答模式、分板块正文与讲义引用
          </p>
        </div>

        {isDemo && (
          <p className="popular-questions-page__demo-banner shrink-0">
            暂无真实统计数据，以下为界面示例。在 AI 导师提问后，将自动收录并更新排行。
          </p>
        )}

        <div className="popular-questions-page__body min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6">
          {loading && items.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              加载排行榜…
            </div>
          ) : error && items.length === 0 ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-sm text-destructive">
              {error}
            </div>
          ) : (
            <ol className={cn("popular-questions-list", isDemo && "popular-questions-list--demo")}>
              {displayItems.map((item, index) => {
                const expanded = expandedId === item.id;
                const rank = index + 1;
                return (
                  <li key={item.id} className="popular-questions-item">
                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : item.id)}
                      className="popular-questions-item__trigger w-full text-left"
                      aria-expanded={expanded}
                    >
                      <span
                        className={cn(
                          "popular-questions-item__rank",
                          rank <= 3 && "popular-questions-item__rank--top"
                        )}
                        aria-hidden
                      >
                        {rank}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="popular-questions-item__question">
                          {item.question_display}
                        </span>
                        <span className="popular-questions-item__meta">
                          被问 {item.ask_count} 次
                          {item.last_asked_at
                            ? ` · 最近 ${formatAskedAt(item.last_asked_at)}`
                            : isDemo
                              ? ` · ${modeLabel(item.last_answer_mode)}`
                              : ""}
                        </span>
                      </span>
                      <ChevronDown
                        className={cn(
                          "popular-questions-item__chevron h-4 w-4 shrink-0 transition-transform duration-200",
                          expanded && "rotate-180"
                        )}
                        aria-hidden
                      />
                    </button>
                    {expanded && (
                      <div className="popular-questions-item__answer">
                        <p className="popular-questions-item__answer-heading">完整解答</p>
                        <AssistantAnswerDetail
                          answerMode={item.last_answer_mode}
                          reply={item.last_reply}
                          sections={item.last_sections}
                          citations={item.last_citations}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
