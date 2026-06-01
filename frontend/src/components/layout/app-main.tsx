"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const BOTTOM_NAV_HIDDEN = ["/teacher"];

export function AppMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showBottomNav = !BOTTOM_NAV_HIDDEN.some((p) => pathname.startsWith(p));

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
