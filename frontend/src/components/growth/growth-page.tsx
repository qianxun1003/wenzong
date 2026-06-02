"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { Flame, MapPin, Target, Timer } from "lucide-react";
import { GrowthMiniMap } from "@/components/growth/growth-mini-map";
import { MapPageShell } from "@/components/map/map-page-shell";
import {
  GROWTH_MILESTONES,
  SUBJECT_ABILITY_PREVIEW,
  SUBJECT_LABELS,
  TOTAL_JAPAN_REGIONS,
  TOTAL_WORLD_REGIONS,
  buildGrowthSnapshot,
} from "@/lib/learning-growth";
import {
  getLitJapanRegionIds,
  getLitWorldRegionIds,
} from "@/lib/map-exploration-lit";
import {
  getMapProgress,
  getMapProgressServerSnapshot,
  subscribeMapProgress,
} from "@/lib/map-progress";
import { cn } from "@/lib/utils";

export function GrowthPage() {
  const progress = useSyncExternalStore(
    subscribeMapProgress,
    getMapProgress,
    getMapProgressServerSnapshot
  );

  const snapshot = useMemo(() => buildGrowthSnapshot(progress), [progress]);
  const litWorld = useMemo(
    () => getLitWorldRegionIds(progress.exploredCountries),
    [progress.exploredCountries]
  );
  const litJapan = useMemo(
    () => getLitJapanRegionIds(progress.exploredPrefectures),
    [progress.exploredPrefectures]
  );

  const studyTimeLabel =
    snapshot.studyHours > 0 || snapshot.studyMinutes > 0
      ? `${snapshot.studyHours}h ${snapshot.studyMinutes}m`
      : "—";

  return (
    <MapPageShell className="flex flex-1 flex-col">
      <div className="growth-page">
        <div className="growth-page__inner">
        {/* I · 概要 */}
        <section className="growth-section" aria-labelledby="growth-profile-heading">
          <div className="growth-profile">
            <div className="growth-profile__avatar" aria-hidden>
              <span className="growth-profile__avatar-inner">学</span>
            </div>
            <div className="growth-profile__meta">
              <p className="growth-section__eyebrow">Profile</p>
              <h1 id="growth-profile-heading" className="growth-profile__name">
                {snapshot.displayName}
              </h1>
              <p className="growth-profile__title">
                <span className="growth-profile__level">Lv.{snapshot.level}</span>
                {snapshot.title}
              </p>
            </div>
          </div>

          {snapshot.isPreview && (
            <p className="growth-preview-note">
              学习时长、答题与连续打卡将在接入记录后自动更新；地图探索进度已实时同步。
            </p>
          )}

          <div className="growth-stats">
            <StatCard
              icon={Timer}
              label="累计学习"
              value={studyTimeLabel}
              hint={snapshot.studyHours === 0 ? "待记录" : undefined}
            />
            <StatCard
              icon={Target}
              label="答题量"
              value={snapshot.questionsDone > 0 ? String(snapshot.questionsDone) : "—"}
              hint={
                snapshot.accuracyPercent != null
                  ? `正确率 ${snapshot.accuracyPercent}%`
                  : "待记录"
              }
            />
            <StatCard
              icon={MapPin}
              label="考点掌握"
              value={String(snapshot.knowledgeMastered)}
              hint="地图标记"
            />
            <StatCard
              icon={Flame}
              label="连续学习"
              value={snapshot.streakDays > 0 ? `${snapshot.streakDays} 天` : "—"}
              hint="待记录"
            />
          </div>
        </section>

        {/* II · 能力 */}
        <section className="growth-section" aria-labelledby="growth-ability-heading">
          <header className="growth-section__head">
            <p className="growth-section__eyebrow">Ability</p>
            <h2 id="growth-ability-heading" className="growth-section__title">
              科目正确率
            </h2>
          </header>
          <div className="growth-ability-list">
            {SUBJECT_LABELS.map((subject) => {
              const value = SUBJECT_ABILITY_PREVIEW[subject];
              return (
                <div key={subject} className="growth-ability-row">
                  <span className="growth-ability-row__label">{subject}</span>
                  <div className="growth-ability-row__track">
                    <div
                      className="growth-ability-row__fill"
                      style={{ width: value != null ? `${value}%` : "0%" }}
                    />
                  </div>
                  <span className="growth-ability-row__value">
                    {value != null ? `${value}%` : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* III · 探索足迹 */}
        <section className="growth-section" aria-labelledby="growth-map-heading">
          <header className="growth-section__head">
            <p className="growth-section__eyebrow">Journey</p>
            <h2 id="growth-map-heading" className="growth-section__title">
              探索足迹
            </h2>
            <p className="growth-section__desc">
              在地图探索中到访过的区域会在此点亮，记录你的文综版图扩张。
            </p>
          </header>

          <div className="growth-map-grid">
            <div className="growth-map-card">
              <div className="growth-map-card__head">
                <h3 className="growth-map-card__title">世界地图</h3>
                <p className="growth-map-card__stat">
                  <span className="growth-map-card__stat-lit">
                    {snapshot.mapWorldRegionsLit}
                  </span>
                  <span className="text-muted-foreground"> / {TOTAL_WORLD_REGIONS} 区域</span>
                  {snapshot.mapCountries > 0 && (
                    <span className="block text-[10px] text-muted-foreground">
                      已访国家 {snapshot.mapCountries}
                    </span>
                  )}
                </p>
              </div>
              <GrowthMiniMap kind="world" litRegionIds={litWorld} href="/map/world" />
            </div>

            <div className="growth-map-card">
              <div className="growth-map-card__head">
                <h3 className="growth-map-card__title">日本地图</h3>
                <p className="growth-map-card__stat">
                  <span className="growth-map-card__stat-lit">
                    {snapshot.mapJapanRegionsLit}
                  </span>
                  <span className="text-muted-foreground"> / {TOTAL_JAPAN_REGIONS} 地方</span>
                  {snapshot.mapPrefectures > 0 && (
                    <span className="block text-[10px] text-muted-foreground">
                      已访都道府县 {snapshot.mapPrefectures}
                    </span>
                  )}
                </p>
              </div>
              <GrowthMiniMap kind="japan" litRegionIds={litJapan} href="/map/japan" />
            </div>
          </div>

          {litWorld.size === 0 && litJapan.size === 0 && (
            <p className="growth-map-empty">
              尚未点亮任何区域。
              <Link href="/map" className="growth-link">
                去地图探索
              </Link>
            </p>
          )}
        </section>

        {/* IV · 里程碑 */}
        <section className="growth-section growth-section--last" aria-labelledby="growth-milestone-heading">
          <header className="growth-section__head">
            <p className="growth-section__eyebrow">Milestone</p>
            <h2 id="growth-milestone-heading" className="growth-section__title">
              成长轨迹
            </h2>
          </header>
          <ol className="growth-milestones">
            {GROWTH_MILESTONES.map((m, index) => {
              const unlocked = snapshot.streakDays >= m.days;
              return (
                <li
                  key={m.id}
                  className={cn(
                    "growth-milestone",
                    unlocked && "growth-milestone--unlocked"
                  )}
                >
                  <span className="growth-milestone__dot" aria-hidden />
                  <div>
                    <p className="growth-milestone__label">{m.label}</p>
                    <p className="growth-milestone__days">{m.days} 天</p>
                  </div>
                  {index < GROWTH_MILESTONES.length - 1 && (
                    <span className="growth-milestone__line" aria-hidden />
                  )}
                </li>
              );
            })}
          </ol>
        </section>
        </div>
      </div>
    </MapPageShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="growth-stat-card">
      <Icon aria-hidden />
      <p className="growth-stat-card__label">{label}</p>
      <p className="growth-stat-card__value">{value}</p>
      {hint && <p className="growth-stat-card__hint">{hint}</p>}
    </div>
  );
}
