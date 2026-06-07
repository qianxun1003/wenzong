"use client";

import Link from "next/link";
import { Building2, Megaphone } from "lucide-react";
import { MapPageShell } from "@/components/map/map-page-shell";
import { cn } from "@/lib/utils";
import { tobCard } from "@/lib/teacher/styles";

const ADMIN_ENTRIES = [
  {
    href: "/admin/platform",
    title: "教室管理者后台",
    subtitle: "平台管控、机构授权、学情分析与班级教务",
    description: "Super Admin 与机构教师的全套运营控制台",
    icon: Building2,
    accent: "from-primary/90 to-primary/70",
  },
  {
    href: "/admin/materials",
    title: "对外讲解时资料",
    subtitle: "商谈时刻参考",
    description: "含技术基础设施成本预估等可编辑表格",
    icon: Megaphone,
    accent: "from-chart-2 to-chart-3",
  },
] as const;

export function AdminHubLayout() {
  return (
    <MapPageShell scrollable ambientVariant="teacher" className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-8 text-center sm:mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Admin Console
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            管理后台
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
            选择要进入的管理模块。平台运营与讲解资料分开展示，便于日常切换。
          </p>
        </header>

        <div className="grid flex-1 gap-5 sm:grid-cols-2 sm:gap-6">
          {ADMIN_ENTRIES.map(({ href, title, subtitle, description, icon: Icon, accent }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex min-h-[220px] flex-col rounded-2xl border border-border p-6 shadow-[var(--soft-glow-sm)] transition-all duration-200",
                tobCard,
                "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--soft-glow-md)]"
              )}
            >
              <div
                className={cn(
                  "mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-primary-foreground shadow-[var(--soft-glow-sm)]",
                  accent
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex flex-1 flex-col">
                <h2 className="text-lg font-semibold text-foreground group-hover:text-primary">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
                <p className="mt-auto pt-4 text-xs text-muted-foreground/80">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </MapPageShell>
  );
}
