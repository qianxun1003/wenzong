"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, ClipboardList, Globe2 } from "lucide-react";
import { HomeFloatCard } from "@/components/home/home-float-card";

const HOME_ENTRIES = [
  {
    href: "/student",
    title: "AI 文综导师",
    subtitle: "用逻辑问清楚，少靠死记",
    icon: BookOpen,
    accentClass: "gradient-academy",
  },
  {
    href: "/map",
    title: "地图探索",
    subtitle: "把日本与考点放进一张图",
    icon: Globe2,
    accentClass: "bg-gradient-to-br from-chart-2 to-chart-3",
  },
  {
    href: "/quiz",
    title: "习题练习",
    subtitle: "薄弱处练到能通关",
    icon: ClipboardList,
    accentClass: "bg-gradient-to-br from-chart-1 to-chart-4",
  },
] as const;

const SCROLL_EDGE = 6;

/** 首页功能入口：视口展示 3 张，超出可横滑；两侧为滑动提示箭头 */
export function HomeEntryCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const updateScrollHints = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const overflow = el.scrollWidth > el.clientWidth + SCROLL_EDGE;
    setHasOverflow(overflow);
    setCanScrollPrev(el.scrollLeft > SCROLL_EDGE);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - SCROLL_EDGE);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    updateScrollHints();
    el.addEventListener("scroll", updateScrollHints, { passive: true });
    const ro = new ResizeObserver(updateScrollHints);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollHints);
      ro.disconnect();
    };
  }, [updateScrollHints]);

  const scrollByPage = useCallback((direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth, behavior: "smooth" });
  }, []);

  return (
    <div className="home-entry-hub__carousel-shell">
      <button
        type="button"
        className="home-entry-hub__carousel-nav home-entry-hub__carousel-nav--prev"
        aria-label="向左滑动"
        disabled={!canScrollPrev}
        onClick={() => scrollByPage(-1)}
      >
        <ChevronLeft className="home-entry-hub__carousel-nav-icon" aria-hidden />
      </button>

      <div
        ref={scrollerRef}
        className="home-entry-hub__carousel"
        data-overflow={hasOverflow ? "true" : "false"}
        role="region"
        aria-label="功能入口，可左右滑动浏览"
      >
        <div className="home-entry-hub__carousel-track">
          {HOME_ENTRIES.map((entry) => (
            <HomeFloatCard key={entry.href} {...entry} />
          ))}
        </div>
      </div>

      <button
        type="button"
        className="home-entry-hub__carousel-nav home-entry-hub__carousel-nav--next"
        aria-label="向右滑动"
        disabled={!canScrollNext}
        onClick={() => scrollByPage(1)}
      >
        <ChevronRight className="home-entry-hub__carousel-nav-icon" aria-hidden />
      </button>
    </div>
  );
}
