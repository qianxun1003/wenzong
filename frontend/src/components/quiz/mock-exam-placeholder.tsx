"use client";

import { Clock, Trophy } from "lucide-react";
import { QuizPageShell } from "@/components/quiz/quiz-page-shell";
import { QuizDataNotice } from "@/components/quiz/quiz-data-notice";
import { QuizSubpageHeader } from "@/components/quiz/quiz-subpage-header";
import { QuizWorkflowSteps } from "@/components/quiz/quiz-workflow-steps";
import { Button } from "@/components/ui/button";
import { MOCK_EXAM_PLACEHOLDER, QUIZ_MODES } from "@/lib/quiz-modes";
import { cn } from "@/lib/utils";

const mode = QUIZ_MODES.find((m) => m.id === "mock-exam")!;

const { questionCount, durationMinutes, subjects } = MOCK_EXAM_PLACEHOLDER;

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} 分钟`;
  if (m === 0) return `${h} 小时`;
  return `${h} 小时 ${m} 分钟`;
}

export function MockExamPlaceholder() {
  return (
    <QuizPageShell>
      <section className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">
        <QuizSubpageHeader
          title={mode.title}
          subtitle={mode.subtitle}
          icon={Trophy}
          accentClass={mode.accentClass}
        />

        <QuizDataNotice />

        <div className="soft-card space-y-6 p-6 sm:p-8">
          <div>
            <h2 className="text-sm font-medium text-foreground">考试流程</h2>
            <QuizWorkflowSteps steps={mode.workflow} className="mt-3" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border/80 bg-primary/5 p-4">
              <p className="text-xs font-medium text-primary">EJU 仿真参数（预览）</p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">题量</dt>
                  <dd className="font-medium text-foreground">{questionCount} 题</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">时限</dt>
                  <dd className="font-medium text-foreground">
                    {formatDuration(durationMinutes)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">科目</dt>
                  <dd className="font-medium text-foreground">{subjects.join(" · ")}</dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-6">
              <div className="flex items-center gap-2 text-3xl font-semibold tabular-nums text-muted-foreground">
                <Clock className="h-7 w-7" aria-hidden />
                <span>{String(durationMinutes).padStart(2, "0")}:00:00</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">倒计时（接入后启用）</p>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-medium text-foreground">成绩统计（预览）</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-4">
              {subjects.map((subject) => (
                <div
                  key={subject}
                  className="rounded-lg border border-dashed border-border px-3 py-2.5 text-center"
                >
                  <p className="text-xs text-muted-foreground">{subject}</p>
                  <p className="mt-1 text-lg font-semibold text-muted-foreground/50">—</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              交卷后将展示用时、正确率、各科得分与能力分析。
            </p>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-border/60 pt-6">
            <Button disabled className={cn("gradient-academy opacity-60")}>
              开始模拟考试
            </Button>
            <Button variant="outline" disabled>
              查看历史成绩
            </Button>
          </div>
        </div>
      </section>
    </QuizPageShell>
  );
}
