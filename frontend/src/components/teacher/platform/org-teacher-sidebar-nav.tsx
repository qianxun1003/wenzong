"use client";

import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { tobSidebarShell } from "@/lib/teacher/styles";
import type { OrgTeacherTab } from "@/lib/teacher/types";

type NavItem = {
  id: OrgTeacherTab;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

interface NavSection {
  title: string;
  items: readonly NavItem[];
}

interface OrgTeacherSidebarNavProps {
  active: OrgTeacherTab;
  orgWide: readonly NavItem[];
  classLevel: readonly NavItem[];
  toolbox: NavItem;
  onChange: (tab: OrgTeacherTab) => void;
}

function NavButton({
  id,
  label,
  icon: Icon,
  active,
  onChange,
  indent,
}: NavItem & {
  active: OrgTeacherTab;
  onChange: (tab: OrgTeacherTab) => void;
  indent?: boolean;
}) {
  const isActive = active === id;
  return (
    <li>
      <button
        type="button"
        onClick={() => onChange(id)}
        className={cn(
          "group relative flex w-full items-center gap-3 rounded-lg py-2.5 text-left text-[13px] leading-snug transition-colors duration-150",
          indent ? "pl-5 pr-3" : "px-3",
          isActive
            ? "bg-muted/70 font-medium text-foreground"
            : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
        )}
      >
        <span
          className={cn(
            "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full transition-opacity",
            isActive ? "bg-primary opacity-100" : "opacity-0"
          )}
          aria-hidden
        />
        <Icon
          className={cn(
            "h-[18px] w-[18px] shrink-0 transition-colors",
            isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground/80"
          )}
        />
        <span>{label}</span>
      </button>
    </li>
  );
}

function NavSectionBlock({
  section,
  active,
  onChange,
  indentSubItems,
}: {
  section: NavSection;
  active: OrgTeacherTab;
  onChange: (tab: OrgTeacherTab) => void;
  /** 除第一项外缩进，体现「大屏下的子功能」 */
  indentSubItems?: boolean;
}) {
  return (
    <div>
      <p className="mb-1.5 px-3 text-[10px] font-semibold tracking-wide text-muted-foreground/90">
        {section.title}
      </p>
      <ul className="space-y-0.5">
        {section.items.map((item, index) => (
          <NavButton
            key={item.id}
            {...item}
            active={active}
            onChange={onChange}
            indent={indentSubItems && index > 0}
          />
        ))}
      </ul>
    </div>
  );
}

export function OrgTeacherSidebarNav({
  active,
  orgWide,
  classLevel,
  toolbox,
  onChange,
}: OrgTeacherSidebarNavProps) {
  return (
    <nav className={cn(tobSidebarShell, "space-y-4 p-2")}>
      <NavSectionBlock
        section={{ title: "全塾", items: orgWide }}
        active={active}
        onChange={onChange}
        indentSubItems
      />

      <div className="border-t border-border/50 pt-3">
        <NavSectionBlock
          section={{ title: "班级", items: classLevel }}
          active={active}
          onChange={onChange}
        />
      </div>

      <div className="border-t border-border/50 pt-3">
        <p className="mb-1.5 px-3 text-[10px] font-medium tracking-wide text-muted-foreground/80">
          工具
        </p>
        <ul>
          <NavButton {...toolbox} active={active} onChange={onChange} />
        </ul>
      </div>
    </nav>
  );
}
