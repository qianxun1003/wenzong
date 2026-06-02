"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquarePlus, Search, Trash2, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ChatSession } from "@/lib/types";

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  className?: string;
}

export function ChatSidebar({
  sessions,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
  className,
}: ChatSidebarProps) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const filteredSessions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.preview?.toLowerCase().includes(q) ?? false)
    );
  }, [sessions, query]);

  const onPopularPage = pathname.startsWith("/student/popular");

  return (
    <aside className={cn("student-sidebar flex h-full w-full flex-col", className)}>
      <div className="student-sidebar-actions">
        <p className="student-sidebar-zone-label">对话工具</p>
        <div className="student-sidebar-actions__stack">
          <button
            type="button"
            onClick={onNewChat}
            className="student-sidebar-action-btn"
          >
            <MessageSquarePlus className="student-sidebar-action-btn__icon" aria-hidden />
            <span className="student-sidebar-action-btn__text">
              <span className="student-sidebar-action-btn__title">新建对话</span>
              <span className="student-sidebar-action-btn__sub">开始新话题</span>
            </span>
          </button>
          <Link
            href="/student/popular"
            className={cn(
              "student-sidebar-action-btn",
              onPopularPage && "student-sidebar-action-btn--active"
            )}
          >
            <TrendingUp className="student-sidebar-action-btn__icon" aria-hidden />
            <span className="student-sidebar-action-btn__text">
              <span className="student-sidebar-action-btn__title">热门问题榜</span>
              <span className="student-sidebar-action-btn__sub">排行与完整解答</span>
            </span>
          </Link>
        </div>
      </div>

      <div className="student-sidebar-history flex min-h-0 flex-1 flex-col">
        <p className="student-sidebar-history__label">历史对话</p>
        <div className="student-sidebar-history__search">
          <Search
            className="student-sidebar-history__search-icon"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索历史记录…"
            className="student-sidebar-input h-9 pl-9 text-sm"
            aria-label="搜索历史记录"
          />
        </div>
        <ScrollArea className="student-sidebar-list min-h-0 flex-1">
          <div className="student-sidebar-history__list space-y-2.5">
            {filteredSessions.length === 0 ? (
              <p className="px-1 py-6 text-center text-xs leading-relaxed text-muted-foreground">
                {query.trim() ? "没有匹配的对话" : "暂无历史记录"}
              </p>
            ) : (
              filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "group relative",
                    activeId === session.id
                      ? "student-sidebar-item student-sidebar-item-active"
                      : "student-sidebar-item"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(session.id)}
                    className="flex w-full flex-col gap-1 px-3.5 py-3 pr-10 text-left"
                  >
                    <div className="relative z-[1] flex items-start justify-between gap-3">
                      <span className="line-clamp-1 text-sm font-medium text-foreground/90">
                        {session.title}
                      </span>
                      <span className="shrink-0 text-[10px] text-muted-foreground/80">
                        {session.updatedAt}
                      </span>
                    </div>
                    {session.preview && (
                      <span className="relative z-[1] line-clamp-1 text-xs text-muted-foreground/85">
                        {session.preview}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(session.id);
                    }}
                    className={cn(
                      "absolute right-2 top-1/2 z-[2] flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors",
                      "opacity-60 hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100",
                      "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    )}
                    aria-label={`删除对话「${session.title}」`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="student-sidebar-foot">
        <p className="text-center text-[10px] leading-relaxed text-muted-foreground">
          回答均基于老师录入的讲义
        </p>
      </div>
    </aside>
  );
}
