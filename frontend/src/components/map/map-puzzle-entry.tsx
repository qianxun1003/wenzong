import Link from "next/link";
import { Puzzle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** 拼图模式暂未开放，改为 true 即可启用入口 */
const PUZZLE_ENTRY_ENABLED = false;

interface MapPuzzleEntryProps {
  label: string;
  mode: "world" | "japan";
  className?: string;
}

export function MapPuzzleEntry({ label, mode, className }: MapPuzzleEntryProps) {
  return (
    <div
      className={cn(
        "mt-4 flex flex-col gap-3 rounded-xl border border-border/50 bg-background/45 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5",
        !PUZZLE_ENTRY_ENABLED && "opacity-75",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Puzzle className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">拼图模式</p>
          <p className="text-xs text-muted-foreground">
            {PUZZLE_ENTRY_ENABLED
              ? "计时挑战 · 星级评定 · 强化位置记忆"
              : "功能开发中，敬请期待"}
          </p>
        </div>
      </div>
      {PUZZLE_ENTRY_ENABLED ? (
        <Link
          href={`/map/puzzle?mode=${mode}`}
          className={cn(buttonVariants({ size: "sm" }), "gap-1.5 gradient-academy shadow-md sm:shrink-0")}
        >
          <Puzzle className="h-3.5 w-3.5" />
          {label}
        </Link>
      ) : (
        <Button
          type="button"
          size="sm"
          disabled
          className="gap-1.5 sm:shrink-0"
          aria-disabled
        >
          <Puzzle className="h-3.5 w-3.5" />
          暂未开放
        </Button>
      )}
    </div>
  );
}
