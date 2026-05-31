import type { AnswerMode } from "./types";

export interface MapTutorContext {
  entityName: string;
  regionLabel: string;
  examPoint?: string;
}

export function buildTutorQuestion(ctx: MapTutorContext): string {
  if (ctx.examPoint) {
    return `关于${ctx.entityName}（${ctx.regionLabel}）的「${ctx.examPoint}」，请按 EJU 考点帮我讲解。`;
  }
  return `请介绍${ctx.entityName}（${ctx.regionLabel}）的文综核心考点与易错点。`;
}

export function buildTutorUrl(
  ctx: MapTutorContext,
  mode: AnswerMode = "eju"
): string {
  const params = new URLSearchParams({
    q: buildTutorQuestion(ctx),
    mode,
    from: "map",
  });
  return `/student?${params.toString()}`;
}
