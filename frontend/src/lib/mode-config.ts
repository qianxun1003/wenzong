import type { AnswerMode } from "./types";

export const SECTION_DEFINITIONS: { key: string; title: string }[] = [
  { key: "core_conclusion", title: "核心结论" },
  { key: "background", title: "背景原因" },
  { key: "process", title: "具体过程" },
  { key: "eju_points", title: "EJU考点" },
  { key: "pitfalls", title: "易错点" },
  { key: "related_knowledge", title: "相关知识点" },
  { key: "related_charts", title: "相关图表" },
  { key: "related_quiz", title: "相关Quiz" },
];

export interface ModeConfig {
  placeholder: string;
  readyHint: string;
  loadingFocus: string;
  sendHint: string;
  suggestions: string[];
  emphasizedSections: string[];
  welcomeContent: string;
}

export const MODE_CONFIG: Record<AnswerMode, ModeConfig> = {
  basic: {
    placeholder: "用简单语言帮你听懂、记住 — 输入你的问题…",
    readyHint: "下一题将用最易懂的方式组织，侧重核心结论与具体过程",
    loadingFocus: "核心结论 · 具体过程",
    sendHint: "以基础模式发送",
    suggestions: [
      "日本高度经济成长期是什么？",
      "什么是三权分立？",
      "板块构造学说的基本内容",
    ],
    emphasizedSections: ["core_conclusion", "process"],
    welcomeContent:
      "你好，当前为基础模式。我会用简单易懂的语言帮你先听懂、记住知识点，并优先整理核心结论与具体过程。有不懂的随时问我！",
  },
  eju: {
    placeholder: "输入题目或知识点，将按考点与得分思路回答…",
    readyHint: "下一题将围绕 EJU 考点、易错点与答题思路组织回答",
    loadingFocus: "EJU考点 · 易错点 · 相关Quiz",
    sendHint: "以 EJU 模式发送",
    suggestions: [
      "明治维新常考哪些点？",
      "EJU 政治题常见陷阱有哪些？",
      "如何排除历史选择题干扰项？",
    ],
    emphasizedSections: ["eju_points", "pitfalls", "related_quiz"],
    welcomeContent:
      "你好，当前为 EJU 模式。我会优先从考试考点、易错选项和答题框架角度组织答案，并引用老师讲义。把题目或知识点发给我吧！",
  },
  deep: {
    placeholder: "输入问题，将展开背景因果与跨学科联系…",
    readyHint: "下一题将展开背景原因、因果链条与相关知识点",
    loadingFocus: "背景原因 · 具体过程 · 相关知识点",
    sendHint: "以深度模式发送",
    suggestions: [
      "为什么日本会选择明治维新？",
      "气候与农业分布之间有什么关系？",
      "一战对国际秩序产生了哪些影响？",
    ],
    emphasizedSections: ["background", "process", "related_knowledge"],
    welcomeContent:
      "你好，当前为深度模式。我会帮你展开背景、因果链和跨学科联系，从「会背」提升到「真正理解」。欢迎提问！",
  },
  chart: {
    placeholder: "输入含资料、图表或数据的问题，将侧重读图与判读…",
    readyHint: "下一题将侧重相关图表、数据趋势与资料判读步骤",
    loadingFocus: "相关图表 · 具体过程",
    sendHint: "以图表模式发送",
    suggestions: [
      "这张人口金字塔说明什么？",
      "如何读统计图里的变化趋势？",
      "年表题应该先看什么？",
    ],
    emphasizedSections: ["related_charts", "process"],
    welcomeContent:
      "你好，当前为图表模式。我会结合地图、统计图、年表等资料帮你训练读图与综合分析能力。把资料题发给我吧！",
  },
};

export function getModeConfig(mode: AnswerMode): ModeConfig {
  return MODE_CONFIG[mode];
}
