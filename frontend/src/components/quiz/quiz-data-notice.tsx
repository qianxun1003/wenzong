import { Database } from "lucide-react";

export function QuizDataNotice() {
  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-dashed border-primary/25 bg-primary/5 px-4 py-3 text-sm text-muted-foreground"
      role="status"
    >
      <Database className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
      <p>
        当前为功能框架预览，尚未接入题库与知识点数据。界面流程已就绪，接入数据后即可开始练习。
      </p>
    </div>
  );
}
