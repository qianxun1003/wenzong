import { BarChart3, BookOpen, Network, Target, type LucideIcon } from "lucide-react";
import type { AnswerMode } from "./types";

/** 模式书签图标：单色线型符号，非 emoji */
export const MODE_ICONS: Record<AnswerMode, LucideIcon> = {
  basic: BookOpen,
  eju: Target,
  deep: Network,
  chart: BarChart3,
};
