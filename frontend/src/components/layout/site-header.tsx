"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, LayoutDashboard, Menu } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { BackToHomeLink } from "@/components/layout/back-to-home-link";
import { shouldShowBottomNav } from "@/lib/bottom-nav-visibility";
import { cn } from "@/lib/utils";

/** 顶栏：仅保留管理后台入口；学习功能从首页进入，个人主页在底栏 */
const navItems = [
  { href: "/admin", label: "管理后台", icon: LayoutDashboard },
];

function isAdminNavActive(pathname: string) {
  return pathname.startsWith("/admin") || pathname.startsWith("/teacher");
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (href: string) => {
    setMenuOpen(false);
    window.setTimeout(() => router.push(href), 0);
  };

  const showBackToHome = !shouldShowBottomNav(pathname);

  return (
    <header className="site-header-bar">
      <div className="flex h-14 w-full items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          {showBackToHome && <BackToHomeLink className="-ml-2 shrink-0" />}
          <Link href="/" className="flex min-w-0 items-center gap-2.5 group">
          <div className="flex h-8 items-center justify-center rounded-full bg-accent px-3 shadow-[var(--soft-glow-sm)]">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-foreground">文综学习平台</span>
            <span className="hidden text-[10px] text-muted-foreground sm:block">
              EJU Humanities
            </span>
          </div>
        </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? isAdminNavActive(pathname) : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 border-b-2 pb-0.5 text-sm transition-colors",
                  active
                    ? "border-primary font-medium text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted md:hidden"
            aria-label="打开菜单"
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <nav className="mt-8 flex flex-col gap-2">
              {navItems.map(({ href, label, icon: Icon }) => (
                <button
                  key={href}
                  type="button"
                  onClick={() => goTo(href)}
                  className={cn(
                    buttonVariants({
                      variant: isAdminNavActive(pathname) ? "secondary" : "ghost",
                    }),
                    "w-full justify-start gap-2"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
