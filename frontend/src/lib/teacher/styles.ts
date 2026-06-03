/** 教师后台 · 低调 primary 强调色 + 冷→暖环境背景 */

export const tobHeaderGlass =
  "border-border bg-card/70 shadow-[var(--soft-glow-sm)] backdrop-blur-xl";

export const tobRoleSwitchActive = "bg-primary text-primary-foreground shadow-md";

export const tobCard =
  "border-border bg-card/80 shadow-[var(--soft-glow-sm)] backdrop-blur-sm";

export const tobCardSoft = "border-border bg-muted/40 backdrop-blur-sm";

export const tobIconWrap = "bg-muted text-primary";

/** 侧栏主入口 · 浮于侧栏底卡之上 */
export const tobNavActive =
  "bg-primary text-primary-foreground shadow-[0_1px_2px_oklch(0_0_0/0.06),0_6px_16px_-4px_oklch(0_0_0/0.14)]";

export const tobNavIdle =
  "border border-border/75 bg-background text-foreground/90 shadow-[0_1px_2px_oklch(0_0_0/0.04),0_4px_12px_-6px_oklch(0_0_0/0.08)] hover:border-border hover:bg-background hover:shadow-[0_2px_4px_oklch(0_0_0/0.05),0_8px_20px_-6px_oklch(0_0_0/0.1)]";

/** 侧栏容器 · 与页面幕布分层（中性阴影，无彩色光晕） */
export const tobSidebarShell =
  "rounded-lg border border-border/80 bg-card p-1.5 shadow-[0_8px_28px_-6px_oklch(0_0_0/0.1)]";

/** 侧栏子入口 · 扁平层级，靠左线与底色区分，不用独立浮卡阴影 */
export const tobSidebarSubGroup = "ml-1 flex flex-col gap-0.5 border-l border-border/55 py-0.5 pl-2";

export const tobSidebarSubBtnBase =
  "flex w-full items-center rounded-md border-l-2 py-1.5 pl-2 pr-2 text-left text-[13px] transition-colors duration-150";

export const tobSidebarSubBtnActive =
  "border-l-primary bg-muted/55 font-medium text-foreground";

export const tobSidebarSubBtnIdle =
  "border-l-transparent text-muted-foreground hover:border-l-border/70 hover:bg-muted/40 hover:text-foreground";

export const tobBtnPrimary = "bg-primary text-primary-foreground hover:bg-primary/90";

export const tobSpinner = "border-primary border-t-transparent";

export const tobTableHover = "hover:bg-muted/50";

export const tobBadgeAccent =
  "border-primary/20 bg-primary/5 text-primary";

export const tobProgressFill = "bg-primary/70";

/** 班级切换药丸 · 选中/未选中 */
export const tobClassPillBase =
  "rounded-lg border px-3.5 py-2 text-left text-sm font-medium transition-all duration-200";

export const tobClassPillActive =
  "border-primary bg-primary text-primary-foreground shadow-md";

export const tobClassPillIdle =
  "border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/5";

/** 机构开户 · 三层：幕布 → 面板 → 控件 */
export const tobLicensingPanel =
  "border border-border bg-card shadow-[var(--soft-glow-sm)] backdrop-blur-sm";

export const tobLicensingInset =
  "rounded-xl border border-border/80 bg-muted/25 p-5 shadow-[inset_0_1px_2px_oklch(0_0_0/0.04)]";

export const tobLicensingField =
  "h-10 rounded-lg border border-border bg-background px-3.5 shadow-[0_1px_2px_oklch(0_0_0/0.05)] focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20";

export const tobLicensingSelect =
  "h-10 w-full rounded-lg border border-border bg-background px-3.5 text-sm shadow-[0_1px_2px_oklch(0_0_0/0.05)] outline-none transition-[box-shadow,border-color] focus:border-primary/50 focus:ring-2 focus:ring-primary/20 disabled:opacity-50";

export const tobLicensingLabel = "text-[13px] font-medium text-muted-foreground";

export const tobLicensingBtn =
  "h-11 bg-primary text-primary-foreground shadow-[0_2px_6px_oklch(0.35_0.02_260/0.22)] hover:bg-primary/90 active:shadow-[0_1px_3px_oklch(0.35_0.02_260/0.18)]";

export const tobLicensingBtnSecondary =
  "h-10 border border-border bg-background text-foreground shadow-[0_1px_2px_oklch(0_0_0/0.05)] hover:bg-muted/40";

export const tobLicensingSurface =
  "rounded-lg border border-dashed border-border/80 bg-background/80 p-4 shadow-[inset_0_1px_3px_oklch(0_0_0/0.04)]";

export const tobLicensingCodeBox =
  "rounded-lg border border-border bg-background p-3 shadow-[inset_0_1px_2px_oklch(0_0_0/0.05)]";
