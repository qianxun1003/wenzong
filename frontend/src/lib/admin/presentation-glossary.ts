/** 对外讲解资料 · 基础设施关键词百科 */

export type PresentationGlossaryTermId =
  | "server"
  | "alibaba_cloud"
  | "aws"
  | "cross_border_bandwidth"
  | "vector_db"
  | "token_usage"
  | "domestic_llm"
  | "hybrid_routing"
  | "multi_modal_output";

export interface PresentationGlossarySection {
  heading: string;
  content: string;
}

export interface PresentationGlossaryEntry {
  id: PresentationGlossaryTermId;
  categoryLabel: string;
  title: string;
  patterns: string[];
  sections: PresentationGlossarySection[];
}

export const PRESENTATION_GLOSSARY_ENTRIES: PresentationGlossaryEntry[] = [
  {
    id: "server",
    categoryLabel: "第一大类：云计算与中日跨境服务器",
    title: "服务器 (Server)",
    patterns: ["服务器 (Server)", "服务器"],
    sections: [
      {
        heading: "专业解释",
        content:
          "服务器是提供高性能计算与数据存储服务的跨国数字化基础设施。",
      },
      {
        heading: "通俗讲解",
        content:
          "它是一台 7×24 小时永不关机、部署在安全机房中的超强计算机。整个学习平台的网页、AI 导师的底层算法、以及所有教学资料，都必须运行在服务器上。它是保障跨国师生顺畅访问的物理底座。",
      },
    ],
  },
  {
    id: "alibaba_cloud",
    categoryLabel: "第一大类：云计算与中日跨境服务器",
    title: "阿里云 (Alibaba Cloud)",
    patterns: ["阿里云 (Alibaba Cloud)", "阿里云"],
    sections: [
      {
        heading: "专业解释",
        content:
          "阿里云是服务于中国大陆及亚太区域的顶级云原生计算与存储控制台。",
      },
      {
        heading: "通俗讲解",
        content:
          "我们在中国大陆节点使用的数字化基础设施。它专门负责承载国内合作机构的「新机构快速开户」、「班级学情宏观大屏」等功能，充当国内还未赴日学生的「生源学情蓄水池」，确保国内访问绝对合规且零延迟。",
      },
    ],
  },
  {
    id: "aws",
    categoryLabel: "第一大类：云计算与中日跨境服务器",
    title: "AWS 亚马逊云 (Amazon Web Services · 东京节点)",
    patterns: [
      "AWS 亚马逊云 (Amazon Web Services · 东京节点)",
      "AWS 亚马逊云",
      "AWS",
    ],
    sections: [
      {
        heading: "专业解释",
        content:
          "AWS 东京节点是面向海外（日本本土）留学生及加盟私塾的超低延迟分布式计算中心。",
      },
      {
        heading: "通俗讲解",
        content:
          "我们在日本东京部署的数字化基础设施。它专门用来支撑已经赴日的留学生与「AI 文综导师」的高频交互，以及主页「AI Learning Coach 任务管理大厅」的流畅运行。",
      },
    ],
  },
  {
    id: "cross_border_bandwidth",
    categoryLabel: "第一大类：云计算与中日跨境服务器",
    title: "中日跨境加密数据同步带宽 (Cross-Border Data Pipeline)",
    patterns: [
      "中日跨境加密数据同步带宽 (Cross-Border Data Pipeline)",
      "中日跨境加密数据同步带宽",
      "跨境加密带宽",
    ],
    sections: [
      {
        heading: "专业解释",
        content:
          "中日跨境加密数据同步带宽是符合中日两国个人数据隐私法案的安全加密传输管道。",
      },
      {
        heading: "通俗讲解",
        content:
          "连接中国阿里云与日本 AWS 之间的专用安全数据网络。当机构教师在后台点击「跨境数据通关」时，系统通过这条带宽，在毫秒内将该学生在读期间的所有错题标签和学情档案无缝、合法地迁移到日本服务器上。",
      },
    ],
  },
  {
    id: "vector_db",
    categoryLabel: "第一大类：云计算与中日跨境服务器",
    title: "向量数据库 (Vector Database / 如 Milvus, Pinecone)",
    patterns: [
      "Milvus / Pinecone",
      "高频向量数据库",
      "向量数据库",
      "Milvus",
      "Pinecone",
    ],
    sections: [
      {
        heading: "专业解释",
        content:
          "向量数据库是专为高维向量化教研数据（Embeddings）提供海量检索与相似度匹配的 AI 原生数据库。",
      },
      {
        heading: "通俗讲解",
        content:
          "一种高级的「智能翻找数据库」。普通数据库只能按死板的关键词查找，而向量数据库把我们平台几十万字的文综教研大纲和真题切成带有逻辑含义的碎片。AI 只要接收到学生提问，就会在该数据库中以毫秒级速度精准定位、抽取出最对口的考点讲义，防止 AI 凭空胡编乱造。",
      },
    ],
  },
  {
    id: "token_usage",
    categoryLabel: "第二大类：AI 模型 Token 消耗",
    title: "Token 消耗 (Token Usage)",
    patterns: [
      "Token 消耗 (Token Usage)",
      "AI 模型 Token 消耗",
      "Token 消耗",
      "Token Usage",
      "每百万 Token",
    ],
    sections: [
      {
        heading: "专业解释",
        content:
          "Token 是生成式大语言模型（Generative AI）处理文本的最小计量单位（1 个 Token 约等于 0.75 个英文单词或 1–2 个汉字/日语字符）。",
      },
      {
        heading: "通俗讲解",
        content:
          "AI 模型的「计件计费单位」。AI 导师和学生之间的每一次问答、AI Learning Coach 每天根据错题自动生成 To-Do List，都会产生字符吞吐。大模型厂商不收固定月费，而是根据我们全站每天产生的 Token 字符数按量扣款，属于良性的变动业务成本。",
      },
    ],
  },
  {
    id: "domestic_llm",
    categoryLabel: "第二大类：AI 模型 Token 消耗",
    title: "国产大模型优先 (Domestic LLM First Policy)",
    patterns: [
      "国产大模型优先 (Domestic LLM First Policy)",
      "国产大模型优先",
    ],
    sections: [
      {
        heading: "专业解释",
        content:
          "国产大模型优先是在中国大陆节点下，强制采用通过网信办备案的本土商业级大模型 API（如 DeepSeek、通义千问）的合规控本策略。",
      },
      {
        heading: "通俗讲解",
        content:
          "在国内备考阶段，学生主要进行基础知识点检索和一轮复习。此时系统优先调用性能优异、响应极快的国产大模型。这不仅在国内法律上 100% 安全合规（避免跨国安全封杀风险），更在项目前期将全站的算力消耗成本锁定在极低区间。",
      },
    ],
  },
  {
    id: "hybrid_routing",
    categoryLabel: "第二大类：AI 模型 Token 消耗",
    title: "海外混合路由 (International Hybrid LLM Routing)",
    patterns: [
      "海外混合路由 (International Hybrid LLM Routing)",
      "海外混合路由",
    ],
    sections: [
      {
        heading: "专业解释",
        content:
          "海外混合路由是根据教务任务的复杂程度，动态分发算力请求的智能大模型路由调配算法。",
      },
      {
        heading: "通俗讲解",
        content:
          "一种兼顾「最聪明的大脑」与「最优省钱机制」的 AI 分流技术。当赴日学生刷新主页任务或进行简单查词时，系统会自动路由给便宜的轻量模型处理；而一旦学生发起高难度的 EJU 文综政治/经济逻辑推导或图表分析，系统会瞬间切换并调用部署在东京 AWS 的国际顶尖大模型（如 GPT-4o）。这既保证了日本私塾拥有最震撼的启发式讲题体验，又为平台大幅节约了 40% 的算力开支。",
      },
    ],
  },
  {
    id: "multi_modal_output",
    categoryLabel: "第二大类：AI 模型 Token 消耗",
    title: "多模式输出 (Multi-Modal & Adaptive Generative AI Output)",
    patterns: [
      "多模式输出 (Multi-Modal & Adaptive Generative AI Output)",
      "多模式输出",
      "不同模式的真人语言",
    ],
    sections: [
      {
        heading: "专业解释",
        content:
          "多模式输出是生成式大模型基于 RAG（检索增强生成）架构，针对用户画像执行个性化文本/语义重构的生成技术。",
      },
      {
        heading: "通俗讲解",
        content:
          "这就是 AI 导师在后台检索完教研资料后，「用嘴把它因材施教讲出来」的核心过程。AI 能够根据当前学生的底子和偏好，动态将干瘪的考点转化为【考前冲刺模式 / 零基础小白模式 / 启发式提问模式】三种不同的话术语气，用最拟人化、最易懂的逻辑对学生进行全天候的启发式教学。",
      },
    ],
  },
];

export const PRESENTATION_GLOSSARY_PATTERN_SORTED = [...PRESENTATION_GLOSSARY_ENTRIES].sort(
  (a, b) =>
    Math.max(...b.patterns.map((p) => p.length)) - Math.max(...a.patterns.map((p) => p.length))
);

export function findPresentationGlossaryByPattern(
  text: string
): PresentationGlossaryEntry | undefined {
  const lower = text.toLowerCase();
  return PRESENTATION_GLOSSARY_ENTRIES.find((entry) =>
    entry.patterns.some((pattern) => pattern.toLowerCase() === lower)
  );
}

export function findPresentationGlossaryById(
  id: PresentationGlossaryTermId
): PresentationGlossaryEntry | undefined {
  return PRESENTATION_GLOSSARY_ENTRIES.find((entry) => entry.id === id);
}
