import { QuizPageShell } from "@/components/quiz/quiz-page-shell";
import { QuizDataNotice } from "@/components/quiz/quiz-data-notice";
import { QuizModeHubCard } from "@/components/quiz/quiz-mode-hub-card";
import { QUIZ_MODES } from "@/lib/quiz-modes";

export function QuizHubLayout() {
  return (
    <QuizPageShell>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="quiz-entry-hub__header mx-auto max-w-xl text-center">
          <p className="quiz-entry-hub__eyebrow">
            <span className="quiz-entry-hub__eyebrow-line" aria-hidden />
            <span>自测 · 错题 · 模考</span>
            <span className="quiz-entry-hub__eyebrow-line" aria-hidden />
          </p>
          <h1 className="quiz-entry-hub__heading">Quiz 练习</h1>
          <p className="quiz-entry-hub__lead">不熟之处，再练一遍</p>
        </header>

        <div className="mt-8">
          <QuizDataNotice />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {QUIZ_MODES.map((mode) => (
            <QuizModeHubCard key={mode.id} mode={mode} />
          ))}
        </div>
      </section>
    </QuizPageShell>
  );
}
