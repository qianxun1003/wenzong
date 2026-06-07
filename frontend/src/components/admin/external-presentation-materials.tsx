import { Megaphone } from "lucide-react";
import { AdminBackLink } from "@/components/admin/admin-back-link";
import { InfrastructureCostTable } from "@/components/admin/infrastructure-cost-table";

export function ExternalPresentationMaterials() {
  return (
    <div className="mx-auto flex w-full max-w-[min(100%,96rem)] flex-col">
      <div className="mb-3 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2">
        <AdminBackLink className="-ml-2" />
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Megaphone className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              对外讲解时资料
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              商谈时刻参考 · 编辑完成后请点击「保存表格」
            </p>
          </div>
        </div>
      </div>

      <InfrastructureCostTable />
    </div>
  );
}
