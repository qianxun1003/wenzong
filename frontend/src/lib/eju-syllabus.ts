/**
 * EJU 文综 · 真实考点与示例问题
 * 来源：雷老师考学笔记（经济体制 / 经济理论 / 国富景气 / 世界的国家 / 产业资源）
 * 演示占位、AI 导师推荐问、教师后台学情看板均引用此文件，避免使用虚构考点。
 */

export const EJU_CHAPTERS = {
  economicSystem: "第1章 经济体制",
  economicTheory: "第2章 经济理论",
  nationalWealth: "第3章 国富与景气",
  worldCountries: "第4章 世界的国家",
  industryResources: "第5章 产业与资源",
} as const;

/** AI 班级薄弱知识点 Top5（演示学情） */
export const EJU_CLASS_WEAK_POINTS = [
  { rank: 1, label: "修正资本主义·罗斯福新政五法一政一制度", errorRate: 68 },
  { rank: 2, label: "新自由主义·1973石油危机与滞涨", errorRate: 54 },
  { rank: 3, label: "市场机制·供给需求与均衡价格", errorRate: 47 },
  { rank: 4, label: "独占资本主义·帝国主义与垄断", errorRate: 41 },
  { rank: 5, label: "国民所得·GDP/GNP/NI 计算关系", errorRate: 36 },
] as const;

/** 知识点自测 · 待接入专题预览 */
export const EJU_SELF_TEST_TOPICS = [
  "经济体制·资本主义发展阶段",
  "经济理论·供给需求与市场失败",
  "国富景气·GDP 与景气循环",
  "世界的国家·欧洲与中东",
] as const;

/** AI 导师 · 各模式推荐问题 */
export const EJU_MODE_SUGGESTIONS = {
  basic: [
    "资本主义与社会主义在所有制上有什么区别？",
    "什么是重商主义？保护贸易是什么意思？",
    "可处分所得怎么计算？",
  ],
  eju: [
    "罗斯福新政的五法一政一制度分别是什么？",
    "1973年石油危机为何成为转向新自由主义的契机？",
    "亚当斯密《国富论》的两条理论与三个主张是什么？",
  ],
  deep: [
    "为什么修正资本主义时期政府从小政府变成了大政府？",
    "需要曲线向右移动有哪五个要因？",
    "马克思剩余价值说的结论和主张是什么？",
  ],
  chart: [
    "供给曲线与需求曲线的均衡点代表什么？",
    "名目GDP与实质GDP如何区分？",
    "景气循环好况·后退·不况·回复各有什么特征？",
  ],
} as const;

/** AI 导师首页 · 默认快捷问题 */
export const EJU_CHAT_SUGGESTIONS = [
  "罗斯福新政的五法一政一制度是什么？",
  "1973年石油危机导致了什么经济现象？",
  "荷兰为什么被称为「人造国家」？",
] as const;

/** 热门问题排行榜 · 无真实数据时的界面示例 */
export const EJU_POPULAR_DEMO = [
  {
    id: "demo-1",
    question_display: "罗斯福新政的五法一政一制度分别是什么？",
    ask_count: 31,
    last_answer_mode: "eju" as const,
    last_sections: [
      {
        key: "core_conclusion",
        title: "核心结论",
        content:
          "1933年罗斯福推行ニューデール政策：五法（全国产业复兴法·最低工资最高工时、全国劳动关系法、社会保障法、劳动调整法、紧急银行救济法）、一政（田纳西河流域开发公社）、一制度（废止金本位制，改为管理通货制度）。",
      },
      {
        key: "eju_points",
        title: "EJU考点",
        content:
          "修正资本主义＝大政府；理论来源凯恩斯（有效需求、福祉国家、扩大公共支出）。易混：农业调整法 vs 劳动调整法；金本位废止≠金本位停滞。",
      },
    ],
    last_citations: [],
    last_asked_at: "",
  },
  {
    id: "demo-2",
    question_display: "1973年石油危机导致了什么经济现象？新自由主义有哪些代表人物？",
    ask_count: 24,
    last_answer_mode: "eju" as const,
    last_sections: [
      {
        key: "core_conclusion",
        title: "核心结论",
        content:
          "1973年石油危机是生产过剩性质的金融危机，导致滞涨（物价上升与不况并存）。此后转向新自由主义（小政府）：学者弗里德曼（货币主义）、美国总统里根（レーガノミクス）、英国撒切尔、日本中曾根（三公社民营化）。",
      },
    ],
    last_citations: [],
    last_asked_at: "",
  },
  {
    id: "demo-3",
    question_display: "供给曲线与需求曲线相交的点叫什么？超过供给和超过需要时价格如何调整？",
    ask_count: 18,
    last_answer_mode: "basic" as const,
    last_sections: [
      {
        key: "core_conclusion",
        title: "核心结论",
        content:
          "两曲线交点为均衡点，对应均衡价格，此时供给＝需要。供给大于需要→降价；需要大于供给→提价。理想模型基于完全竞争市场（同质商品、买卖方多数、情报公开、进出自由）。",
      },
    ],
    last_citations: [],
    last_asked_at: "",
  },
] as const;

/** 教师录入考点 · 标签示例 */
export const EJU_KNOWLEDGE_TAG_EXAMPLE = "经济 · 修正资本主义 · 罗斯福新政";

/** 录入正文 placeholder 提示 */
export const EJU_KNOWLEDGE_BODY_HINT =
  "在此输入考点正文，如发展阶段时间线、五法一政一制度、供给需求曲线、GDP 计算公式等…";

/** AI 导师输入框 placeholder */
export const EJU_CHAT_PLACEHOLDER =
  "输入你的问题，例如：罗斯福新政的五法一政一制度是什么？";
