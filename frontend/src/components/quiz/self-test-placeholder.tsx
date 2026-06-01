"use client";

import { ClipboardList } from "lucide-react";
import { QuizPageShell } from "@/components/quiz/quiz-page-shell";
import { QuizDataNotice } from "@/components/quiz/quiz-data-notice";
import { QuizSubpageHeader } from "@/components/quiz/quiz-subpage-header";
import { QuizWorkflowSteps } from "@/components/quiz/quiz-workflow-steps";
import { Button } from "@/components/ui/button";
import { QUIZ_MODES } from "@/lib/quiz-modes";

const mode = QUIZ_MODES.find((m) => m.id === "self-test")!;

const PLACEHOLDER_TOPICS = [
  "冷战开端",
  "欧盟成立",
  "日本经济高速增长",
  "德国统一",
];

export function SelfTestPlaceholder() {
  return (
    <QuizPageShell>
      <section className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">
        <QuizSubpageHeader
          title={mode.title}
          subtitle={mode.subtitle}
          icon={ClipboardList}
          accentClass={mode.accentClass}
        />

        <QuizDataNotice />

        <div className="soft-card space-y-6 p-6 sm:p-8">
          <div>
            <h2 className="text-sm font-medium text-foreground">练习流程</h2>
            <QuizWorkflowSteps steps={mode.workflow} className="mt-3" />
          </div>

          <div>
            <h2 className="text-sm font-medium text-foreground">选择知识点</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              接入题库后，将按专题与难度层级展示可选知识点。
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {PLACEHOLDER_TOPICS.map((topic) => (
                <li key={topic}>
                  <button
                    type="button"
                    disabled
                    className="w-full rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-left text-sm text-muted-foreground"
                  >
                    {topic}
                    <span className="mt-0.5 block text-xs opacity-70">待接入</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-border/60 pt-6">
            <Button disabled className="gradient-academy opacity-60">
              开始测试
            </Button>
            <Button variant="outline" disabled>
              提交答卷
            </Button>
            <Button variant="ghost" disabled>
              查看解析
            </Button>
          </div>
        </div>
      </section>
    </QuizPageShell>
  );
}
