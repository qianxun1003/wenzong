"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { tobLicensingBtn, tobLicensingLabel } from "@/lib/teacher/styles";
import { cn } from "@/lib/utils";

export function LicensingField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className={tobLicensingLabel}>{label}</Label>
      {children}
    </div>
  );
}

export function LicensingToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-background px-3.5 py-2.5 shadow-[0_1px_2px_oklch(0_0_0/0.04)]">
      <span className="text-[13px] text-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border border-border/60 transition-colors duration-200",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-[18px] w-[18px] rounded-full border border-border/40 bg-white shadow-sm transition-transform duration-200",
            checked && "translate-x-5"
          )}
        />
      </button>
    </div>
  );
}

export function LicensingPrimaryButton({
  children,
  disabled,
  onClick,
  className,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      className={cn("rounded-lg font-medium", tobLicensingBtn, className)}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
