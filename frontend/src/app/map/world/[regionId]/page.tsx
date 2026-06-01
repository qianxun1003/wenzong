import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BackToMapHubLink } from "@/components/map/back-to-map-hub-link";
import { MapPageShell } from "@/components/map/map-page-shell";
import { WorldRegionDetailView } from "@/components/map/world-region-detail-view";
import { buttonVariants } from "@/components/ui/button";
import { WORLD_REGIONS } from "@/lib/map-config";
import { cn } from "@/lib/utils";

interface WorldRegionPageProps {
  params: Promise<{ regionId: string }>;
}

export default async function WorldRegionPage({ params }: WorldRegionPageProps) {
  const { regionId } = await params;
  const region = WORLD_REGIONS.find((r) => r.id === regionId);

  if (!region) {
    notFound();
  }

  return (
    <MapPageShell className="h-[calc(100dvh-3.5rem)]">
      <div className="map-region-page mx-auto max-w-5xl px-4 pt-3 pb-3 sm:px-6">
        <div className="map-region-page-nav mb-2 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1">
          <BackToMapHubLink className="-ml-2" />
          <Link
            href="/map/world"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-8 gap-1 px-2 text-xs text-muted-foreground"
            )}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            世界地图
          </Link>
          <span className="text-xs font-medium text-foreground sm:text-sm">{region.name}</span>
        </div>

        <WorldRegionDetailView region={region} />
      </div>
    </MapPageShell>
  );
}
