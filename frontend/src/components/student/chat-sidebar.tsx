"use client";

import { MessageSquarePlus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  return (
    <aside className={cn("flex h-full w-full flex-col", className)}>
      <div className="student-sidebar-head space-y-4">
        <p className="student-sidebar-zone-label">对话历史</p>
        <Button
          onClick={onNewChat}
          className="mode-send-btn-basic h-10 w-full gap-2 border-0 shadow-sm hover:opacity-90"
        >
          <MessageSquarePlus className="h-4 w-4" />
          新建对话
        </Button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索历史记录..."
            className="student-sidebar-input h-10 pl-9 text-sm"
          />
        </div>
      </div>

      <ScrollArea className="student-sidebar-list flex-1">
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                "group relative",
                activeId === session.id
                  ? "student-sidebar-item-active student-sidebar-item"
                  : "student-sidebar-item"
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(session.id)}
                className="flex w-full flex-col gap-1 px-3.5 py-3.5 pr-10 text-left"
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
                  "absolute right-2 top-1/2 z-[2] flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-all",
                  "opacity-60 hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100",
                  "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                )}
                aria-label={`删除对话「${session.title}」`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="student-sidebar-foot">
        <p className="text-center text-[10px] leading-relaxed text-muted-foreground">
          回答均基于老师录入的讲义
        </p>
      </div>
    </aside>
  );
}
