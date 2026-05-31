"use client";

import { KnowledgePointsTemplate } from "@/components/map/knowledge-points-template";
import {
  KNOWLEDGE_CATEGORY_LABELS,
  type EntityProfile,
  type KnowledgeCategory,
} from "@/lib/map-content-data";

interface MapCategoryDetailViewProps {
  category: KnowledgeCategory;
  entityName: string;
  regionLabel: string;
  profile: EntityProfile | null;
}

export function MapCategoryDetailView({
  category,
  entityName,
  regionLabel,
}: MapCategoryDetailViewProps) {
  const label = KNOWLEDGE_CATEGORY_LABELS[category];

  return (
    <KnowledgePointsTemplate
      entityName={entityName}
      subtitle={`${regionLabel} · ${label}`}
      category={category}
    />
  );
}
