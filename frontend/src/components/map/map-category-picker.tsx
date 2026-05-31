import Link from "next/link";
import {
  KNOWLEDGE_CATEGORIES,
  KNOWLEDGE_CATEGORY_LABELS,
  type EntityProfile,
  type KnowledgeCategory,
} from "@/lib/map-content-data";
import { cn } from "@/lib/utils";

const CATEGORY_CHIP: Record<KnowledgeCategory, { chip: string; dot: string; toolbar: string }> = {
  history: {
    chip: "border-chart-4/35 bg-chart-4/12 hover:bg-chart-4/22",
    dot: "bg-chart-4",
    toolbar: "border-chart-4/30 bg-chart-4/10 hover:bg-chart-4/18 hover:border-chart-4/45",
  },
  politics: {
    chip: "border-primary/35 bg-primary/10 hover:bg-primary/18",
    dot: "bg-primary",
    toolbar: "border-primary/30 bg-primary/8 hover:bg-primary/14 hover:border-primary/40",
  },
  economy: {
    chip: "border-chart-2/35 bg-chart-2/12 hover:bg-chart-2/22",
    dot: "bg-chart-2",
    toolbar: "border-chart-2/30 bg-chart-2/10 hover:bg-chart-2/18 hover:border-chart-2/45",
  },
  geography: {
    chip: "border-chart-3/35 bg-chart-3/12 hover:bg-chart-3/22",
    dot: "bg-chart-3",
    toolbar: "border-chart-3/30 bg-chart-3/10 hover:bg-chart-3/18 hover:border-chart-3/45",
  },
};

interface MapCategoryPickerProps {
  basePath: string;
  profile: EntityProfile | null;
  entityName: string;
  variant?: "default" | "toolbar";
}

export function MapCategoryPicker({
  basePath,
  profile,
  entityName,
  variant = "default",
}: MapCategoryPickerProps) {
  if (variant === "toolbar") {
    return (
      <div className="map-category-toolbar" role="navigation" aria-label={`${entityName}知识分类`}>
        {KNOWLEDGE_CATEGORIES.map((cat) => {
          const styles = CATEGORY_CHIP[cat];
          return (
            <Link
              key={cat}
              href={`${basePath}/${cat}`}
              className={cn("map-category-toolbar-item", styles.toolbar)}
            >
              <span className="flex items-center justify-center gap-1.5">
                <span className={cn("h-2 w-2 shrink-0 rounded-full", styles.dot)} />
                <span className="text-sm font-semibold text-foreground">
                  {KNOWLEDGE_CATEGORY_LABELS[cat]}
                </span>
              </span>
              <span className="mt-1 block text-[11px] text-muted-foreground">待录入</span>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="map-preview-panel">
      <p className="mb-1 text-sm font-medium text-foreground">{entityName} · 知识分类</p>
      <p className="mb-4 text-xs text-muted-foreground">选择维度查看内容（待教师后台录入）</p>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {KNOWLEDGE_CATEGORIES.map((cat) => {
          const styles = CATEGORY_CHIP[cat];
          return (
            <Link
              key={cat}
              href={`${basePath}/${cat}`}
              className={cn(
                "map-category-chip flex flex-col items-start gap-2 rounded-xl border p-3 transition-all hover:-translate-y-0.5 hover:shadow-sm",
                styles.chip
              )}
            >
              <span className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", styles.dot)} />
                <span className="text-sm font-semibold text-foreground">
                  {KNOWLEDGE_CATEGORY_LABELS[cat]}
                </span>
              </span>
              <span className="text-[10px] text-muted-foreground">待录入</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
