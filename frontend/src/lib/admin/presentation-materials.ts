export const INFRA_COST_TABLE_STORAGE_KEY = "wenzong_presentation_infra_cost_table";

export interface InfraCostTableRow {
  id: string;
  cells: [string, string, string, string, string];
}

export interface InfraCostTableDoc {
  title: string;
  columns: [string, string, string, string, string];
  rows: InfraCostTableRow[];
}

export const DEFAULT_INFRA_COST_TABLE: InfraCostTableDoc = {
  title: "BP 技术基础设施成本预估",
  columns: [
    "费用大类",
    "功能与系统职责",
    "底层具体包含",
    "计费与消耗模式",
    "首年预算预估(年)",
  ],
  rows: [
    {
      id: "cloud-cross-border",
      cells: [
        "1. 云计算与中日跨境服务器",
        `【核心作用】 搭建中日"双轨云原生"底层，解决跨境网络延迟。

【负责系统板块】 负责国内和日本两端的数据物理存储。支撑系统里"超级管理端"的"机构快速开户"与"联合办学缔结"功能。

【为什么必须用】 必须通过跨境加密带宽，才能在点击"数据通关"时，将国内学生的学情无缝迁移至日本服务器。同时，必须使用高频向量数据库，才能支撑 AI 官方教研讲义的高速检索。`,
        `1. 中国大陆区：阿里云服务器 (用于国内生源蓄水池与基础教务数据)
2. 东京区域：AWS 亚马逊云 (用于日本私塾端与留学生高频交互)
3. 中日跨境加密数据同步带宽
4. Milvus / Pinecone 高频向量数据库 (专门用于存储、比对全站学生的错题本与知识点标签)`,
        "固定配置费用 + 弹性带宽计费 (按月/按年固定订阅服务器硬件；带宽按 GB 流量消耗)",
        "约 3.5万 - 5万 RMB/年 (约 80万 - 110万 日元/年)",
      ],
    },
    {
      id: "ai-token",
      cells: [
        "2. AI 模型 Token 消耗",
        `【核心作用】 不仅负责后台的学情诊断，更负责将检索出的教研资料，转化为"不同模式的真人语言"对学生进行高智商启发式讲解。

【负责系统板块】 核心对应学生主页"AI 文综导师"、"每日 To-Do List"以及教师端的"AI 全塾实时知识点缺陷诊断"等等部分。

【为什么必须用】 通用大模型无法直接留客教学，必须付费调用 API 接口，并把私有化的文综教研资料喂给 AI，才能实现精准的考点诊断与任务下发。`,
        `1. 国内主流低延迟大模型 API (如 DeepSeek)
2. 国际顶尖大模型 API (如 OpenAI GPT-4o / Claude 3.5)

使用方式：
国内 (国产大模型优先)：对接已备案的国内顶尖大模型。
日本私塾 (海外混合路由)：切换为国内外 AI 混合模型。`,
        "纯弹性后付费 (学生用得越多，这个钱花得越多：根据学生每天刷题量、与 AI 导师聊天的字符数，按每百万 Token 计费)",
        "约 2万 - 4万 RMB/年 (约 45万 - 90万 日元/年)",
      ],
    },
  ],
};
