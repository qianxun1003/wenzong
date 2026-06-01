"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const BOTTOM_NAV_ITEMS = [
  { href: "/", label: "首页", icon: Home, match: (p: string) => p === "/" },
  { href: "/me", label: "个人主页", icon: UserRound, match: (p: string) => p.startsWith("/me") },
] as const;

const HIDDEN_PREFIXES = ["/teacher"];

export function BottomNav() {
  const pathname = usePathname();

  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <nav className="bottom-nav" aria-label="主导航">
      <div className="bottom-nav__bar">
        <div className="bottom-nav__inner" role="tablist">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                role="tab"
                aria-selected={active}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn("bottom-nav__tab", active && "bottom-nav__tab--active")}
              >
                <span className="bottom-nav__tab-bg" aria-hidden />
                <span className="bottom-nav__tab-inner">
                  <Icon
                    className="bottom-nav__icon"
                    strokeWidth={active ? 2.25 : 1.65}
                    aria-hidden
                  />
                  <span className="bottom-nav__label">{item.label}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
