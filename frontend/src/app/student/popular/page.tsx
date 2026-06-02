import { PopularQuestionsPage } from "@/components/student/popular-questions-page";

export default function StudentPopularQuestionsPage() {
  return (
    <div className="relative flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden">
      <div className="student-ambient-shell relative z-10 flex min-h-0 flex-1 overflow-hidden p-3 sm:p-4">
        <div className="student-chat-pane flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <PopularQuestionsPage />
        </div>
      </div>
    </div>
  );
}
