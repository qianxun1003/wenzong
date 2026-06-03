"use client";

import type { ComponentType } from "react";
import { BookMarked, Brain, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MigrationAssetPreview } from "@/lib/teacher/mock-data";
import { tobCard } from "@/lib/teacher/styles";

interface MigrationAssetPreviewPanelProps {
  studentName: string;
  assets: MigrationAssetPreview;
}

export function MigrationAssetPreviewPanel({
  studentName,
  assets,
}: MigrationAssetPreviewPanelProps) {
  return (
    <Card className={tobCard}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          待通关资产预览
          <span className="ml-2 font-normal text-muted-foreground">· {studentName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <AssetItem
          icon={BookMarked}
          title="错题本资产"
          value={assets.wrongBookLabel}
        />
        <AssetItem
          icon={Brain}
          title="AI 能力画像"
          value={assets.aiPortrait.join(" · ")}
        />
        <AssetItem
          icon={TrendingUp}
          title="学习进度"
          value={assets.progressLabel}
        />
      </CardContent>
    </Card>
  );
}

function AssetItem({
  icon: Icon,
  title,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/25 p-3">
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-primary">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </div>
      <p className="text-sm leading-snug text-foreground">{value}</p>
    </div>
  );
}
