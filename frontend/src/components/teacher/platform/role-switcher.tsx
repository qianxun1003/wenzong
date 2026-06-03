"use client";

import { GraduationCap, Sparkles } from "lucide-react";
import { tobRoleSwitchActive } from "@/lib/teacher/styles";
import type { DemoViewRole } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";

const ROLES: {
  id: DemoViewRole;
  emoji: string;
  label: string;
  short: string;
}[] = [
  {
    id: "super_admin",
    emoji: "🌟",
    label: "超级管理员视角",
    short: "超级管理员",
  },
  {
    id: "org_teacher",
    emoji: "🎓",
    label: "机构/教师视角",
    short: "机构教师",
  },
];

interface RoleSwitcherProps {
  value: DemoViewRole;
  onChange: (role: DemoViewRole) => void;
}

export function RoleSwitcher({ value, onChange }: RoleSwitcherProps) {
  return (
    <div
      className="role-switcher inline-flex rounded-2xl border border-primary/15 bg-card/80 p-1 shadow-[var(--soft-glow-sm)] backdrop-blur-xl"
      role="tablist"
      aria-label="演示身份切换"
    >
      {ROLES.map((role) => {
        const active = value === role.id;
        const Icon = role.id === "super_admin" ? Sparkles : GraduationCap;
        return (
          <button
            key={role.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(role.id)}
            className={cn(
              "role-switcher__option relative flex items-center gap-2 rounded-xl px-3 py-2 text-left transition-all duration-300 sm:px-4 sm:py-2.5",
              active ? tobRoleSwitchActive : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <span className="text-base leading-none" aria-hidden>
              {role.emoji}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="hidden text-[11px] font-semibold leading-tight sm:block">
                {role.label}
              </span>
              <span className="flex items-center gap-1 text-xs font-medium sm:hidden">
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {role.short}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
