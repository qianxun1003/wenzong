"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Flame, MapPin, Target } from "lucide-react";
import {
  TOTAL_JAPAN_REGIONS,
  TOTAL_WORLD_REGIONS,
  buildGrowthSnapshot,
} from "@/lib/learning-growth";
import {
  getMapProgress,
  getMapProgressServerSnapshot,
  subscribeMapProgress,
} from "@/lib/map-progress";

/** 首页「今日概览」：数据与个人主页 growth 同步，仅展示核心指标 */
export function HomeUserSnapshot() {
  const progress = useSyncExternalStore(
    subscribeMapProgress,
    getMapProgress,
    getMapProgressServerSnapshot
  );

  const snapshot = useMemo(() => buildGrowthSnapshot(progress), [progress]);

  const streakLabel =
    snapshot.streakDays > 0 ? `${snapshot.streakDays} 天` : "—";

  const questionsLabel =
    snapshot.questionsDone > 0 ? String(snapshot.questionsDone) : "—";

  const hasMapProgress =
    snapshot.mapWorldRegionsLit > 0 || snapshot.mapJapanRegionsLit > 0;

  return (
    <section className="home-user-snapshot" aria-labelledby="home-snapshot-heading">
      <div className="home-user-snapshot__head">
        <h2 id="home-snapshot-heading" className="home-user-snapshot__title">
          今日概览
        </h2>
        <p className="home-user-snapshot__meta">
          <span className="home-user-snapshot__level">Lv.{snapshot.level}</span>
          {snapshot.title}
        </p>
      </div>

      <ul className="home-user-snapshot__stats">
        <SnapshotStat icon={MapPin} label="考点掌握" value={String(snapshot.knowledgeMastered)} />
        <SnapshotStat icon={Target} label="答题量" value={questionsLabel} />
        <SnapshotStat icon={Flame} label="连续学习" value={streakLabel} />
      </ul>

      {hasMapProgress && (
        <p className="home-user-snapshot__map-line">
          地图 · 世界 {snapshot.mapWorldRegionsLit}/{TOTAL_WORLD_REGIONS} · 日本{" "}
          {snapshot.mapJapanRegionsLit}/{TOTAL_JAPAN_REGIONS}
        </p>
      )}
    </section>
  );
}

function SnapshotStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <li className="home-user-snapshot__stat">
      <Icon className="home-user-snapshot__stat-icon" aria-hidden />
      <span className="home-user-snapshot__stat-label">{label}</span>
      <span className="home-user-snapshot__stat-value">{value}</span>
    </li>
  );
}
