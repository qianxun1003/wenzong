import type { LucideIcon } from "lucide-react";
import { BookMarked, ClipboardList, Trophy } from "lucide-react";

export type QuizModeId = "self-test" | "wrong-book" | "mock-exam";

export interface QuizModeConfig {
  id: QuizModeId;
  href: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  accentClass: string;
  workflow: string[];
  suitableFor: string;
}

export const QUIZ_MODES: QuizModeConfig[] = [
  {
    id: "self-test",
    href: "/quiz/self-test",
    title: "知识点自测",
    subtitle: "按知识点 · 专题巩固",
    description: "选择知识点后开始测试，提交后可查看解析，适合单点巩固。",
    icon: ClipboardList,
    accentClass: "bg-gradient-to-br from-primary to-chart-2",
    workflow: ["选择知识点", "开始测试", "提交答卷", "查看解析"],
    suitableFor: "知识点巩固与查漏补缺",
  },
  {
    id: "wrong-book",
    href: "/quiz/wrong-book",
    title: "错题集",
    subtitle: "自动记录 · 专项重做",
    description: "自动收录答错题目，支持手动添加与错题重做，集中攻克薄弱项。",
    icon: BookMarked,
    accentClass: "bg-gradient-to-br from-chart-3 to-chart-4",
    workflow: ["自动记录错题", "手动添加错题", "错题重做"],
    suitableFor: "薄弱点反复训练",
  },
  {
    id: "mock-exam",
    href: "/quiz/mock-exam",
    title: "模拟考试",
    subtitle: "EJU 仿真 · 限时测评",
    description: "随机抽题、限时作答、自动评分与成绩统计，模拟真实考场节奏。",
    icon: Trophy,
    accentClass: "bg-gradient-to-br from-chart-1 to-primary",
    workflow: ["随机抽取题目", "限时测试", "自动评分", "成绩统计"],
    suitableFor: "综合能力与应试策略提升",
  },
];

export const MOCK_EXAM_PLACEHOLDER = {
  questionCount: 100,
  durationMinutes: 80,
  subjects: ["历史", "政治", "经济", "地理"] as const,
};
