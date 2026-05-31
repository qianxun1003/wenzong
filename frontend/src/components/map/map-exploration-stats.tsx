"use client";

import { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, Compass, Sparkles } from "lucide-react";
import { getMapProgress } from "@/lib/map-progress";

interface MapExplorationStatsProps {
  totalItems: number;
  exploredSlugs: string[];
  totalKnowledgePoints: number;
  label?: string;
}

export function MapExplorationStats({
  totalItems,
  exploredSlugs,
  totalKnowledgePoints,
  label = "探索进度",
}: MapExplorationStatsProps) {
  const [completedPoints, setCompletedPoints] = useState(0);

  useEffect(() => {
    setCompletedPoints(getMapProgress().completedExamPoints.length);
  }, []);

  const explored = exploredSlugs.length;
  const percent = totalItems > 0 ? Math.round((explored / totalItems) * 100) : 0;
  const completed = exploredSlugs.length >= totalItems && totalItems > 0 ? explored : 0;

  return (
    <div className="map-exploration-stats">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className="text-xs font-semibold text-primary">{percent}%</span>
      </div>
      <div className="map-progress-bar mb-4">
        <div className="map-progress-bar-fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatItem icon={Compass} label="总数" value={String(totalItems)} />
        <StatItem icon={Sparkles} label="已探索" value={String(explored)} />
        <StatItem icon={CheckCircle2} label="已完成" value={String(completed)} />
        <StatItem icon={BookOpen} label="知识点" value={String(totalKnowledgePoints)} />
      </div>
      {completedPoints > 0 && (
        <p className="mt-2 text-[10px] text-muted-foreground">
          已掌握考点 {completedPoints} 个
        </p>
      )}
    </div>
  );
}

function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="map-stat-chip">
      <Icon className="h-3 w-3 text-primary/70" />
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
