/** 系统术语小百科 · 官方功能说明 */

export type GlossaryTermId =
  | "activation_code"
  | "slots_limit"
  | "seat_circuit_breaker"
  | "cross_border"
  | "tenant_rls";

export interface GlossarySection {
  heading: string;
  content: string;
}

export interface GlossaryEntry {
  id: GlossaryTermId;
  title: string;
  patterns: string[];
  sections: GlossarySection[];
}

export const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    id: "activation_code",
    title: "激活码 (Activation Code)",
    patterns: ["激活码"],
    sections: [
      {
        heading: "功能概述",
        content:
          "激活码是平台面向合作机构发放的标准化系统授权凭证，用于机构在线下完成学员招生后进行线上系统的使用授权。",
      },
      {
        heading: "业务流程",
        content:
          "机构根据实际招收的学生数量向平台申请对应数量的激活码。机构将激活码分发给学员，学员在注册系统时输入此码，即可完成账号激活并自动绑定至该机构。",
      },
      {
        heading: "核心功能",
        content:
          "实现移动端/网页端无缝激活，一个激活码严格对应一个系统名额。学生激活后，该激活码自动失效，确保机构的教研资产与平台的系统授权安全。",
      },
    ],
  },
  {
    id: "slots_limit",
    title: "席位上限 (Seats/Slots Limit)",
    patterns: ["席位上限", "Slots"],
    sections: [
      {
        heading: "功能概述",
        content:
          "指该合作机构在合同服务期内，系统允许其绑定并提供服务的最大「在读学生总人数」。",
      },
      {
        heading: "核心功能",
        content:
          "它是机构根据自身教学规模向平台订阅对应系统版本的计数标准。例如：系统支持开通 20 席、50 席或 100 席等不同规模。系统会实时监控当前已激活的学生数量，当在读学生数达到该上限时，系统将暂停新学员的激活绑定，直至机构根据新一期的招生规模申请调高席位上限。",
      },
    ],
  },
  {
    id: "seat_circuit_breaker",
    title: "并发席位熔断 (Concurrent Seat Circuit Breaker)",
    patterns: ["并发席位熔断"],
    sections: [
      {
        heading: "功能概述",
        content: "这是系统底层的名额安全校验机制。",
      },
      {
        heading: "核心功能",
        content:
          "当某家合作机构的剩余可用名额仅剩 1 个时，若线下有多名学员同时尝试输入激活码激活系统，后端的并发控制锁机制会在微秒级进行严格判别，仅允许最早提交的一名学员成功激活。另一名学员的激活操作将被系统安全拦截（即熔断保护），并提示「机构席位已满」，从而严格确保机构资产和平台计费系统的精确性，杜绝数据超额冲突。",
      },
    ],
  },
  {
    id: "tenant_rls",
    title: "多租户 RLS 隔离 (Multi-Tenant Row-Level Security)",
    patterns: ["多租户 RLS 隔离", "多租户数据隔离"],
    sections: [
      {
        heading: "功能概述",
        content:
          "平台在数据库层为每家合作机构分配独立的「数据围栏」。不同机构的学员、讲义、学情与激活码在物理存储上彼此不可见。",
      },
      {
        heading: "核心功能",
        content:
          "RLS（行级安全策略）会在每次查询时自动注入 org_id 过滤条件，超级管理员视角可跨租户汇总，而机构教师只能访问本塾数据，从根上杜绝串库与越权读取。",
      },
    ],
  },
  {
    id: "cross_border",
    title: "跨境数据通关 (Cross-Border Data Migration)",
    patterns: ["跨境数据通关"],
    sections: [
      {
        heading: "功能概述",
        content:
          "这是平台专为跨国留学培训机构打造的「生源与教学资产交接」核心功能。",
      },
      {
        heading: "业务流程",
        content:
          "学员在国内合作机构（如 Org-C）结业后赴日，将进入日本合作机构（如 Org-A）继续学习。该功能仅在两家机构已建立合作关系的前提下启用。",
      },
      {
        heading: "核心功能",
        content:
          "系统支持将学员过去在国内产生的【所有 AI 错题资产、AI 能力画像、学习进度】进行大批量打包、通关并一键空运合并至日本接收机构的班级中。这保证了学员的跨国教学数据不会断层，日本本土老师能够无缝承接学生的历史学情进行精准教学；同时，通关完成后，系统会自动释放国内机构的席位名额，并扣减日本机构对应的接收席位。",
      },
    ],
  },
];

export const GLOSSARY_PATTERN_SORTED = [...GLOSSARY_ENTRIES].sort(
  (a, b) =>
    Math.max(...b.patterns.map((p) => p.length)) -
    Math.max(...a.patterns.map((p) => p.length))
);

export function findGlossaryEntryByPattern(text: string): GlossaryEntry | undefined {
  const lower = text.toLowerCase();
  return GLOSSARY_ENTRIES.find((e) =>
    e.patterns.some((p) => p.toLowerCase() === lower)
  );
}

export function findGlossaryEntryById(id: GlossaryTermId): GlossaryEntry | undefined {
  return GLOSSARY_ENTRIES.find((e) => e.id === id);
}
