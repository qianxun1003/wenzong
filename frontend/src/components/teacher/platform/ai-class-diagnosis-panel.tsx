"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_ORG_AI_DIAGNOSIS } from "@/lib/teacher/mock-data";
import { tobBadgeAccent, tobCard, tobProgressFill } from "@/lib/teacher/styles";
import { cn } from "@/lib/utils";

interface AiClassDiagnosisPanelProps {
  /** 默认展示条数，其余折叠 */
  previewCount?: number;
}

/** AI 全塾实时知识点缺陷诊断 */
export function AiClassDiagnosisPanel({ previewCount = 3 }: AiClassDiagnosisPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = MOCK_ORG_AI_DIAGNOSIS.length > previewCount;
  const visibleItems = expanded
    ? MOCK_ORG_AI_DIAGNOSIS
    : MOCK_ORG_AI_DIAGNOSIS.slice(0, previewCount);

  return (
    <Card className={cn(tobCard, "border-primary/10 bg-gradient-to-br from-card/95 to-primary/[0.03]")}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </span>
          AI 全塾实时知识点缺陷诊断
          <Badge variant="outline" className={cn("ml-auto text-[10px] font-normal", tobBadgeAccent)}>
            跨班级聚合 · EJU 文综
          </Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          实时抓取本塾所有班级刷题与错因数据，提炼宏观教研干预优先级
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleItems.map((item) => (
          <DiagnosisItem key={item.rank} item={item} compact={!expanded && item.rank > 1} />
        ))}

        {hasMore && (
          <Button
            variant="outline"
            size="sm"
            className="mt-1 w-full gap-1.5 text-xs"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded
              ? "收起诊断详情"
              : `展开完整诊断（还有 ${MOCK_ORG_AI_DIAGNOSIS.length - previewCount} 项）`}
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function DiagnosisItem({
  item,
  compact,
}: {
  item: (typeof MOCK_ORG_AI_DIAGNOSIS)[number];
  compact?: boolean;
}) {
  const critical = item.orgAvgCorrectRate < 50;

  return (
    <div
      className={cn(
        "rounded-xl border bg-background/60",
        critical ? "border-destructive/20" : "border-border/70",
        compact ? "p-2.5" : "p-3.5"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className={cn("text-foreground", compact ? "text-xs" : "text-sm")}>
            <span className="mr-2 tabular-nums text-muted-foreground">{item.rank}.</span>
            {item.label}
          </p>
          {!compact && (
            <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-primary/70" />
              {item.alert}
            </p>
          )}
        </div>
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 text-[11px] font-medium",
            critical
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : tobBadgeAccent
          )}
        >
          全塾 {item.orgAvgCorrectRate}%
        </Badge>
      </div>
      <div className={cn("overflow-hidden rounded-full bg-muted", compact ? "mt-2 h-1.5" : "mt-2.5 h-2")}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            critical ? "bg-destructive/60" : tobProgressFill
          )}
          style={{ width: `${item.orgAvgCorrectRate}%` }}
        />
      </div>
    </div>
  );
}
