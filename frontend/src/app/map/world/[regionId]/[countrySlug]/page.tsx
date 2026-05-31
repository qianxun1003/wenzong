import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BackToMapHubLink } from "@/components/map/back-to-map-hub-link";
import { MapPageShell } from "@/components/map/map-page-shell";
import { WorldRegionDetailView } from "@/components/map/world-region-detail-view";
import { fromCountrySlug } from "@/lib/map-content-data";
import { buttonVariants } from "@/components/ui/button";
import { WORLD_REGIONS } from "@/lib/map-config";
import { cn } from "@/lib/utils";

interface CountryPageProps {
  params: Promise<{ regionId: string; countrySlug: string }>;
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { regionId, countrySlug } = await params;
  const region = WORLD_REGIONS.find((r) => r.id === regionId);
  const countryName = fromCountrySlug(countrySlug);

  if (!region || !region.countries.includes(countryName)) {
    notFound();
  }

  return (
    <MapPageShell>
      <div className="map-region-page mx-auto max-w-5xl px-4 py-3 sm:px-6">
        <div className="mb-2 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1">
          <BackToMapHubLink className="-ml-2" />
          <Link
            href={`/map/world/${regionId}`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-8 gap-1 px-2 text-xs text-muted-foreground"
            )}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {region.name}
          </Link>
          <span className="text-sm font-medium text-foreground">{countryName}</span>
        </div>

        <WorldRegionDetailView region={region} initialCountryName={countryName} />
      </div>
    </MapPageShell>
  );
}
