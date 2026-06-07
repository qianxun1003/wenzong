import { MapPageShell } from "@/components/map/map-page-shell";
import { ExternalPresentationMaterials } from "@/components/admin/external-presentation-materials";

export default function AdminMaterialsPage() {
  return (
    <MapPageShell scrollable ambientVariant="teacher" className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-[min(100%,96rem)] px-3 py-4 sm:px-5 sm:py-5">
        <ExternalPresentationMaterials />
      </div>
    </MapPageShell>
  );
}
