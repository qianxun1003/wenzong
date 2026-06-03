"use client";

import { useCallback, useId, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  ListTodo,
  Plus,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CentreTask = {
  id: string;
  text: string;
  done: boolean;
};

let centreTaskSeq = 0;

function createCentreTask(text: string, done = false): CentreTask {
  centreTaskSeq += 1;
  return { id: `task-${centreTaskSeq}`, text, done };
}

/** 主页日程摘要：略长于极简版，带时段感 */
const HOME_SCHEDULE_MY = [
  { time: "19:00", text: "复习经济第3章 · 国际收支平衡表" },
  { time: "21:00", text: "刷 10 道 EJU 气候图真题" },
] as const;

const HOME_SCHEDULE_AI = [
  { time: "加餐", text: "冷战错题本 · 针对昨日错题复盘" },
  { time: "推荐", text: "日本地理 Quiz · 留考冲刺" },
] as const;

const WEEKDAY_ZH = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"] as const;

function formatHomeAgendaDate(d: Date) {
  return `${d.getMonth() + 1}月${d.getDate()}日 · ${WEEKDAY_ZH[d.getDay()]}`;
}

/** 任务大厅：完整演示文案 */
const DEMO_MY_TODOS = [
  "晚上复习现代经济第 3 章：国际收支平衡表",
  "刷完 10 道 EJU 历年气候图真题",
] as const;

export function HomeDailyTasksPanel() {
  const [consoleOpen, setConsoleOpen] = useState(false);
  const agendaDate = formatHomeAgendaDate(new Date());

  return (
    <>
      <section className="home-daily-tasks" aria-labelledby="home-daily-tasks-heading">
        <div className="home-daily-tasks__head">
          <div className="home-daily-tasks__head-text">
            <h2 id="home-daily-tasks-heading" className="home-daily-tasks__title">
              今日安排
            </h2>
            <p className="home-daily-tasks__date">
              <time dateTime={new Date().toISOString().slice(0, 10)}>{agendaDate}</time>
              <span className="home-daily-tasks__date-sep" aria-hidden>
                ·
              </span>
              <span>Today&apos;s plan</span>
            </p>
          </div>
          <button
            type="button"
            className="home-daily-tasks__hall-btn"
            onClick={() => setConsoleOpen(true)}
            aria-label="进入日程管理中心"
          >
            日程管理 Centre
            <ArrowRight className="home-daily-tasks__hall-icon" aria-hidden />
          </button>
        </div>

        <div className="home-daily-tasks__planner">
          <div className="home-daily-tasks__block">
            <p className="home-daily-tasks__block-label">
              <ListTodo className="home-daily-tasks__track-icon" aria-hidden />
              Mine
            </p>
            <ul className="home-daily-tasks__agenda">
              {HOME_SCHEDULE_MY.map(({ time, text }) => (
                <li key={text} className="home-daily-tasks__slot home-daily-tasks__slot--mine">
                  <span className="home-daily-tasks__time">{time}</span>
                  <Circle className="home-daily-tasks__check" aria-hidden />
                  <span className="home-daily-tasks__item-text">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="home-daily-tasks__block home-daily-tasks__block--ai">
            <p className="home-daily-tasks__block-label">
              <Sparkles className="home-daily-tasks__track-icon" aria-hidden />
              AI Coach
            </p>
            <ul className="home-daily-tasks__agenda">
              {HOME_SCHEDULE_AI.map(({ time, text }) => (
                <li key={text} className="home-daily-tasks__slot home-daily-tasks__slot--ai">
                  <span className="home-daily-tasks__time home-daily-tasks__time--tag">{time}</span>
                  <span className="home-daily-tasks__item-text">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <HomeDailyTasksConsole open={consoleOpen} onOpenChange={setConsoleOpen} />
    </>
  );
}

function TaskCheckButton({
  done,
  label,
  onToggle,
}: {
  done: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "home-tasks-console__check-btn",
        done && "home-tasks-console__check-btn--done"
      )}
      onClick={onToggle}
      aria-pressed={done}
      aria-label={done ? `取消完成：${label}` : `标记完成：${label}`}
    >
      {done ? (
        <CheckCircle2 className="home-tasks-console__check-icon" aria-hidden />
      ) : (
        <Circle className="home-tasks-console__check-icon" aria-hidden />
      )}
    </button>
  );
}

function HomeDailyTasksConsole({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const completionId = useId();
  const [myTasks, setMyTasks] = useState<CentreTask[]>(() =>
    DEMO_MY_TODOS.map((text) => createCentreTask(text))
  );
  const [aiTasks, setAiTasks] = useState<CentreTask[]>([]);
  const [draft, setDraft] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);

  const allTasks = useMemo(() => [...myTasks, ...aiTasks], [myTasks, aiTasks]);
  const doneCount = useMemo(() => allTasks.filter((t) => t.done).length, [allTasks]);
  const allDone = allTasks.length > 0 && doneCount === allTasks.length;

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  const toggleMyTask = useCallback((id: string) => {
    setMyTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }, []);

  const toggleAiTask = useCallback((id: string) => {
    setAiTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }, []);

  const addTask = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setMyTasks((prev) => [...prev, createCentreTask(trimmed)]);
    setDraft("");
  }, [draft]);

  const generateAiTasks = useCallback(() => {
    setAiGenerating(true);
    window.setTimeout(() => {
      setAiTasks([
        createCentreTask("复盘错题本：国际收支 · 冷战国际关系 · 气候图判读"),
        createCentreTask("完成「日本地理·河流与地形」专项 Quiz（AI 根据近 7 日正确率推荐）"),
      ]);
      setAiGenerating(false);
    }, 900);
  }, []);

  if (!open) return null;

  return (
    <div
      className="home-tasks-console animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="home-tasks-console-title"
    >
      <button
        type="button"
        className="home-tasks-console__backdrop"
        aria-label="关闭任务管理大厅"
        onClick={close}
      />

      <div className="home-tasks-console__panel home-tasks-console__glass animate-in zoom-in-95 fade-in duration-250">
        <button
          type="button"
          className="home-tasks-console__close"
          aria-label="关闭"
          onClick={close}
        >
          <X className="h-4 w-4" />
        </button>

        <header className="home-tasks-console__header">
          <p className="home-tasks-console__eyebrow">
            <span className="home-tasks-console__emoji" aria-hidden>
              📅
            </span>{" "}
            Schedule Centre
          </p>
          <h2 id="home-tasks-console-title" className="home-tasks-console__title">
            日程管理 Centre
          </h2>
          {allTasks.length > 0 && (
            <p className="home-tasks-console__progress" aria-live="polite">
              今日进度 {doneCount}/{allTasks.length}
            </p>
          )}
        </header>

        {allDone && (
          <div
            id={completionId}
            className="home-tasks-console__complete animate-in fade-in zoom-in-95 duration-300"
            role="status"
            aria-live="polite"
          >
            <span className="home-tasks-console__complete-emoji" aria-hidden>
              🎉
            </span>
            <p className="home-tasks-console__complete-title">今天的任务都干完了！</p>
            <p className="home-tasks-console__complete-sub">All done for today · 继续保持</p>
          </div>
        )}

        <div className="home-tasks-console__dual">
          <section className="home-tasks-console__zone">
            <h3 className="home-tasks-console__zone-title">
              My tasks
              <span className="home-tasks-console__emoji home-tasks-console__emoji--mine" aria-hidden>
                📋
              </span>
            </h3>
            <p className="home-tasks-console__zone-hint">在此输入今天要完成的学习任务，回车或点击添加即可保存。</p>
            <div className="home-tasks-console__add-row">
              <input
                type="text"
                className="home-tasks-console__input"
                placeholder="输入任务，例如：复习冷战专题、刷 10 道地图题…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTask();
                }}
                aria-label="输入每日学习任务"
              />
              <button type="button" className="home-tasks-console__add-btn" onClick={addTask}>
                <Plus className="h-3.5 w-3.5" aria-hidden />
                添加任务
              </button>
            </div>
            <ul className="home-tasks-console__zone-list">
              {myTasks.map((task) => (
                <li
                  key={task.id}
                  className={cn(
                    "home-tasks-console__zone-item",
                    task.done && "home-tasks-console__zone-item--done"
                  )}
                >
                  <TaskCheckButton
                    done={task.done}
                    label={task.text}
                    onToggle={() => toggleMyTask(task.id)}
                  />
                  <span className="home-tasks-console__task-text">{task.text}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="home-tasks-console__zone home-tasks-console__zone--ai">
            <h3 className="home-tasks-console__zone-title">
              AI Suggest
              <span className="home-tasks-console__emoji home-tasks-console__emoji--ai" aria-hidden>
                ✨
              </span>
            </h3>
            {aiTasks.length > 0 ? (
              <ul className="home-tasks-console__zone-list">
                {aiTasks.map((task) => (
                  <li
                    key={task.id}
                    className={cn(
                      "home-tasks-console__zone-item home-tasks-console__zone-item--ai",
                      task.done && "home-tasks-console__zone-item--done"
                    )}
                  >
                    <TaskCheckButton
                      done={task.done}
                      label={task.text}
                      onToggle={() => toggleAiTask(task.id)}
                    />
                    <span className="home-tasks-console__task-text">{task.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="home-tasks-console__ai-hint">
                根据近期错题、Quiz 正确率与薄弱章节，一键生成今日加餐任务。
              </p>
            )}
            <button
              type="button"
              className={cn(
                "home-tasks-console__magic-btn",
                aiGenerating && "home-tasks-console__magic-btn--busy"
              )}
              disabled={aiGenerating}
              onClick={generateAiTasks}
            >
              <Wand2 className="h-4 w-4" aria-hidden />
              {aiGenerating ? "AI 分析中…" : "由 AI 根据近期错题一键生成今日任务"}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
