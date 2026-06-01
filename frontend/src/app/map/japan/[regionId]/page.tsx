import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BackToMapHubLink } from "@/components/map/back-to-map-hub-link";
import { MapPageShell } from "@/components/map/map-page-shell";
import { JapanRegionDetailView } from "@/components/map/japan-region-detail-view";
import { buttonVariants } from "@/components/ui/button";
import { JAPAN_REGIONS } from "@/lib/map-config";
import { cn } from "@/lib/utils";

interface JapanRegionPageProps {
  params: Promise<{ regionId: string }>;
}

export default async function JapanRegionPage({ params }: JapanRegionPageProps) {
  const { regionId } = await params;
  const region = JAPAN_REGIONS.find((r) => r.id === regionId);

  if (!region) {
    notFound();
  }

  return (
    <MapPageShell>
      <div className="map-hub-content mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <BackToMapHubLink className="mb-4 -ml-2" />
        <Link
          href="/map/japan"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-3 gap-1.5 text-muted-foreground")}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回日本地图
        </Link>

        <h1 className="map-page-title__heading">{region.name}</h1>
        <p className="map-page-title__lead mt-1">{region.subtitle}</p>

        <div className="mt-6">
          <JapanRegionDetailView region={region} />
        </div>
      </div>
    </MapPageShell>
  );
}
