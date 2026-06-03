"use client";

import { useEffect, useState, type CSSProperties } from "react";
import {
  GROWTH_MILESTONES,
  getMilestoneStatus,
  getMilestoneStatusLabel,
  getNextMilestone,
  getTrajectoryFillPercent,
} from "@/lib/learning-growth";
import { cn } from "@/lib/utils";

interface GrowthTrajectoryRailProps {
  streakDays: number;
}

export function GrowthTrajectoryRail({ streakDays }: GrowthTrajectoryRailProps) {
  const [ready, setReady] = useState(false);
  const fillPercent = getTrajectoryFillPercent(streakDays);
  const nextMilestone = getNextMilestone(streakDays);
  const unlockedCount = GROWTH_MILESTONES.filter((m) => streakDays >= m.days).length;

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section
      className={cn("growth-section growth-trajectory", ready && "growth-trajectory--ready")}
      aria-labelledby="growth-milestone-heading"
    >
      <header className="growth-trajectory__head">
        <h2 id="growth-milestone-heading" className="growth-trajectory__title">
          成长轨迹
        </h2>
        <p className="growth-trajectory__meta">
          {streakDays > 0 ? (
            <>
              连续 <strong>{streakDays}</strong> 天
            </>
          ) : (
            <>连续 <strong>—</strong> 天</>
          )}
          <span className="growth-trajectory__meta-sep" aria-hidden>
            ·
          </span>
          里程碑 <strong>{unlockedCount}</strong>/{GROWTH_MILESTONES.length}
          {nextMilestone && streakDays < nextMilestone.days && (
            <>
              <span className="growth-trajectory__meta-sep" aria-hidden>
                ·
              </span>
              距{nextMilestone.label}{" "}
              <strong>{nextMilestone.days - streakDays}</strong> 天
            </>
          )}
        </p>
      </header>

      <div
        className="growth-trajectory-rail"
        style={{ "--rail-target": `${fillPercent}%` } as CSSProperties}
      >
        <div className="growth-trajectory-rail__track" aria-hidden>
          <div className="growth-trajectory-rail__track-bg" />
          <div className="growth-trajectory-rail__fill">
            <div className="growth-trajectory-rail__shimmer" />
          </div>
          <div className="growth-trajectory-rail__head" />
        </div>

        <ol className="growth-trajectory-rail__nodes" aria-label="打卡里程碑进度">
          {GROWTH_MILESTONES.map((m, index) => {
            const status = getMilestoneStatus(streakDays, m.days);
            return (
              <li
                key={m.id}
                className={cn(
                  "growth-trajectory-node",
                  `growth-trajectory-node--${status}`,
                  ready && "growth-trajectory-node--animate"
                )}
                style={{ "--node-index": index } as CSSProperties}
                title={`${m.label} · 连续 ${m.days} 天 · ${getMilestoneStatusLabel(status)}`}
              >
                <span className="growth-trajectory-node__ring">
                  <span className="growth-trajectory-node__core" />
                </span>
                <span className="growth-trajectory-node__label">{m.label}</span>
                <span className="growth-trajectory-node__days">{m.days} 天</span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
