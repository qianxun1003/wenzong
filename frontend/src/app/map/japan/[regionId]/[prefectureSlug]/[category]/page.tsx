import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BackToMapHubLink } from "@/components/map/back-to-map-hub-link";
import { MapCategoryDetailView } from "@/components/map/map-category-detail-view";
import { MapPageShell } from "@/components/map/map-page-shell";
import { fromPrefectureSlug } from "@/lib/geo/japan-prefecture-names";
import {
  getPrefectureProfile,
  isKnowledgeCategory,
} from "@/lib/map-content-data";
import { buttonVariants } from "@/components/ui/button";
import { JAPAN_REGIONS } from "@/lib/map-config";
import { cn } from "@/lib/utils";

interface CategoryPageProps {
  params: Promise<{ regionId: string; prefectureSlug: string; category: string }>;
}

export default async function JapanCategoryPage({ params }: CategoryPageProps) {
  const { regionId, prefectureSlug, category } = await params;
  const region = JAPAN_REGIONS.find((r) => r.id === regionId);
  const prefectureCn = fromPrefectureSlug(prefectureSlug);

  if (!region || !region.prefectures.includes(prefectureCn) || !isKnowledgeCategory(category)) {
    notFound();
  }

  const profile = getPrefectureProfile(prefectureCn);

  return (
    <MapPageShell>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <BackToMapHubLink className="mb-6 -ml-2" />
        <Link
          href={`/map/japan/${regionId}`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-2 gap-1.5 text-muted-foreground")}
        >
          <ArrowLeft className="h-4 w-4" />
          返回{region.name}
        </Link>
        <Link
          href={`/map/japan/${regionId}/${prefectureSlug}`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-6 gap-1.5 text-muted-foreground")}
        >
          <ArrowLeft className="h-4 w-4" />
          返回{prefectureCn}
        </Link>

        <MapCategoryDetailView
          category={category}
          entityName={prefectureCn}
          regionLabel={region.name}
          profile={profile}
        />
      </div>
    </MapPageShell>
  );
}
