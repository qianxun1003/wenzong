import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BackToMapHubLink } from "@/components/map/back-to-map-hub-link";
import { MapPageShell } from "@/components/map/map-page-shell";
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
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <BackToMapHubLink className="mb-6 -ml-2" />
        <Link
          href="/map/japan"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-4 gap-1.5 text-muted-foreground")}
        >
          <ArrowLeft className="h-4 w-4" />
          返回日本地图
        </Link>

        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{region.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{region.subtitle}</p>

        <div className="mt-8 map-feature-panel">
          <div className="map-feature-panel-body">
            <p className="text-sm text-muted-foreground">
              {region.name}详情页开发中。后续将展示都道府县列表与 EJU 考点内容。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {region.prefectures.map((pref) => (
                <span key={pref} className="mode-tag">
                  {pref}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MapPageShell>
  );
}
