"use client";

import { BookMarked, Plus } from "lucide-react";
import { QuizPageShell } from "@/components/quiz/quiz-page-shell";
import { QuizDataNotice } from "@/components/quiz/quiz-data-notice";
import { QuizSubpageHeader } from "@/components/quiz/quiz-subpage-header";
import { QuizWorkflowSteps } from "@/components/quiz/quiz-workflow-steps";
import { Button } from "@/components/ui/button";
import { QUIZ_MODES } from "@/lib/quiz-modes";

const mode = QUIZ_MODES.find((m) => m.id === "wrong-book")!;

const FEATURE_CARDS = [
  {
    title: "自动记录",
    description: "答错题目将自动收录至错题集（需接入答题记录）。",
  },
  {
    title: "手动添加",
    description: "支持从练习或讲义中手动标记难题入库。",
  },
  {
    title: "错题重做",
    description: "按科目、专题筛选错题，生成专项重做卷。",
  },
] as const;

export function WrongBookPlaceholder() {
  return (
    <QuizPageShell>
      <section className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">
        <QuizSubpageHeader
          title={mode.title}
          subtitle={mode.subtitle}
          icon={BookMarked}
          accentClass={mode.accentClass}
        />

        <QuizDataNotice />

        <div className="soft-card space-y-6 p-6 sm:p-8">
          <div>
            <h2 className="text-sm font-medium text-foreground">功能说明</h2>
            <QuizWorkflowSteps steps={mode.workflow} className="mt-3" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURE_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-dashed border-border bg-muted/20 p-4"
              >
                <h3 className="text-sm font-medium text-foreground">{card.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {card.description}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border/80 bg-background/60 p-8 text-center">
            <BookMarked className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">暂无错题记录</p>
            <p className="mt-1 text-xs text-muted-foreground/80">
              完成自测或模拟考后，错题将显示在此处
            </p>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-border/60 pt-6">
            <Button disabled variant="outline" className="gap-2 opacity-60">
              <Plus className="h-4 w-4" />
              手动添加错题
            </Button>
            <Button disabled className="gradient-academy opacity-60">
              开始错题重做
            </Button>
          </div>
        </div>
      </section>
    </QuizPageShell>
  );
}
