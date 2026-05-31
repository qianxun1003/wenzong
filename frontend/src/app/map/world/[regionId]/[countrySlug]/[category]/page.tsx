import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BackToMapHubLink } from "@/components/map/back-to-map-hub-link";
import { MapCategoryDetailView } from "@/components/map/map-category-detail-view";
import { MapPageShell } from "@/components/map/map-page-shell";
import {
  fromCountrySlug,
  getCountryProfile,
  isKnowledgeCategory,
} from "@/lib/map-content-data";
import { buttonVariants } from "@/components/ui/button";
import { WORLD_REGIONS } from "@/lib/map-config";
import { cn } from "@/lib/utils";

interface CategoryPageProps {
  params: Promise<{ regionId: string; countrySlug: string; category: string }>;
}

export default async function WorldCategoryPage({ params }: CategoryPageProps) {
  const { regionId, countrySlug, category } = await params;
  const region = WORLD_REGIONS.find((r) => r.id === regionId);
  const countryName = fromCountrySlug(countrySlug);

  if (!region || !region.countries.includes(countryName) || !isKnowledgeCategory(category)) {
    notFound();
  }

  const profile = getCountryProfile(countryName);

  return (
    <MapPageShell>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <BackToMapHubLink className="mb-6 -ml-2" />
        <Link
          href={`/map/world/${regionId}`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-2 gap-1.5 text-muted-foreground")}
        >
          <ArrowLeft className="h-4 w-4" />
          返回{region.name}
        </Link>
        <Link
          href={`/map/world/${regionId}/${countrySlug}`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-6 gap-1.5 text-muted-foreground")}
        >
          <ArrowLeft className="h-4 w-4" />
          返回{countryName}
        </Link>

        <MapCategoryDetailView
          category={category}
          entityName={countryName}
          regionLabel={region.name}
          profile={profile}
        />
      </div>
    </MapPageShell>
  );
}
