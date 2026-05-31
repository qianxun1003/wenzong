import {
  KNOWLEDGE_CATEGORIES,
  KNOWLEDGE_CATEGORY_LABELS,
  KNOWLEDGE_SLOTS_PER_CATEGORY,
  type KnowledgeCategory,
} from "@/lib/map-content-data";

interface KnowledgePointsTemplateProps {
  entityName: string;
  subtitle?: string;
  category?: KnowledgeCategory;
}

export function KnowledgePointsTemplate({
  entityName,
  subtitle,
  category,
}: KnowledgePointsTemplateProps) {
  const categories = category ? [category] : KNOWLEDGE_CATEGORIES;

  return (
    <div className="map-knowledge-template">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">
          {entityName} · {category ? KNOWLEDGE_CATEGORY_LABELS[category] : "知识分类"}
        </h3>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        <p className="mt-2 text-sm text-muted-foreground">
          内容待教师后台录入后显示。
        </p>
      </div>

      <div className="space-y-4">
        {categories.map((cat) => (
          <section key={cat} className="map-knowledge-category-block">
            <h4 className="mb-2 text-sm font-medium text-foreground">
              {KNOWLEDGE_CATEGORY_LABELS[cat]}
            </h4>
            <ul className="space-y-2">
              {Array.from({ length: KNOWLEDGE_SLOTS_PER_CATEGORY }, (_, i) => (
                <li key={i} className="map-knowledge-slot-empty">
                  待录入
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
