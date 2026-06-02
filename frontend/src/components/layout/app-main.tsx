"use client";

import { usePathname } from "next/navigation";
import { shouldShowBottomNav } from "@/lib/bottom-nav-visibility";
import { cn } from "@/lib/utils";

export function AppMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showBottomNav = shouldShowBottomNav(pathname);

  return (
    <main
      className={cn(
        "flex min-h-0 flex-1 flex-col",
        showBottomNav && "app-main--with-bottom-nav"
      )}
    >
      {children}
    </main>
  );
}
