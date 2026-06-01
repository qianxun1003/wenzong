"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { scrollIntoContainer } from "@/lib/scroll-into-container";
import { cn } from "@/lib/utils";

export interface MapSidebarItem {
  id: string;
  label: string;
  subtitle?: string;
  group?: string;
  keywords?: string[];
}

interface MapRegionSidebarProps {
  items: MapSidebarItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  compact?: boolean;
}

function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

function itemMatchesQuery(item: MapSidebarItem, query: string) {
  const haystack = [item.label, item.subtitle, item.group, ...(item.keywords ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function MapRegionSidebar({
  items,
  selectedId,
  onSelect,
  searchPlaceholder = "搜索区域…",
  emptyMessage = "未找到匹配的区域",
  className,
  compact = false,
}: MapRegionSidebarProps) {
  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const normalizedQuery = normalizeQuery(query);

  const filteredItems = useMemo(() => {
    if (!normalizedQuery) return items;
    return items.filter((item) => itemMatchesQuery(item, normalizedQuery));
  }, [items, normalizedQuery]);

  const groupedItems = useMemo(() => {
    const hasGroups = filteredItems.some((item) => item.group);
    if (!hasGroups) return [{ group: null as string | null, items: filteredItems }];

    const groups = new Map<string, MapSidebarItem[]>();
    for (const item of filteredItems) {
      const key = item.group ?? "其他";
      const list = groups.get(key) ?? [];
      list.push(item);
      groups.set(key, list);
    }
    return Array.from(groups.entries()).map(([group, groupItems]) => ({
      group,
      items: groupItems,
    }));
  }, [filteredItems]);

  const updateScrollFades = useCallback(() => {
    const el = listRef.current;
    if (!el) {
      setCanScrollUp(false);
      setCanScrollDown(false);
      return;
    }
    const { scrollTop, scrollHeight, clientHeight } = el;
    const overflows = scrollHeight > clientHeight + 4;
    setCanScrollUp(overflows && scrollTop > 6);
    setCanScrollDown(overflows && scrollTop + clientHeight < scrollHeight - 6);
  }, []);

  useEffect(() => {
    updateScrollFades();
    const el = listRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => updateScrollFades());
    observer.observe(el);
    return () => observer.disconnect();
  }, [filteredItems, compact, updateScrollFades]);

  useEffect(() => {
    const listEl = listRef.current;
    if (!selectedId || !listEl) return;
    const active = listEl.querySelector<HTMLElement>(
      `[data-sidebar-id="${CSS.escape(selectedId)}"]`
    );
    if (active) scrollIntoContainer(listEl, active);
  }, [selectedId, filteredItems]);

  return (
    <aside
      className={cn(
        "map-region-sidebar flex h-full min-h-0 flex-col border-r border-border/50 bg-background/55",
        className
      )}
    >
      <div
        className={cn("shrink-0 border-b border-border/50", compact ? "p-2" : "p-3 sm:p-4")}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className={cn("bg-background/80 pl-8 text-sm", compact ? "h-8" : "h-9")}
            aria-label={searchPlaceholder}
          />
        </div>
      </div>

      <div
        className={cn(
          "map-region-sidebar-list-wrap relative flex min-h-0 flex-1 flex-col",
          canScrollUp && "map-region-sidebar-list-wrap--fade-top",
          canScrollDown && "map-region-sidebar-list-wrap--fade-bottom"
        )}
      >
        <div
          ref={listRef}
          onScroll={updateScrollFades}
          className={cn(
            "map-region-sidebar-list map-region-sidebar-list--scrollable min-h-0 flex-1 p-2 sm:p-3",
            compact && "map-region-sidebar-list--compact"
          )}
        >
          {filteredItems.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs leading-relaxed text-muted-foreground">
              {items.length === 0 ? emptyMessage : "未找到匹配的区域"}
            </p>
          ) : (
            <div className="space-y-4">
              {groupedItems.map(({ group, items: groupItems }) => (
                <div key={group ?? "flat"}>
                  {group && (
                    <p className="map-region-sidebar-group-label mb-1.5 px-2">{group}</p>
                  )}
                  <ul className="map-region-sidebar-items flex flex-col gap-2">
                    {groupItems.map((item) => {
                      const active = selectedId === item.id;
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            data-sidebar-id={item.id}
                            onClick={() => onSelect(item.id)}
                            className={cn(
                              "map-region-sidebar-item w-full text-left",
                              active && "map-region-sidebar-item-active"
                            )}
                          >
                            <span className="block text-sm font-medium leading-snug">
                              {item.label}
                            </span>
                            {item.subtitle && !compact && (
                              <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                                {item.subtitle}
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
