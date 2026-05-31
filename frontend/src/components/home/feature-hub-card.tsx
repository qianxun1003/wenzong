import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureHubCardProps {
  href: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  accentClass?: string;
  highlights: string[];
}

export function FeatureHubCard({
  href,
  title,
  subtitle,
  description,
  icon: Icon,
  accentClass = "gradient-academy",
  highlights,
}: FeatureHubCardProps) {
  return (
    <Link
      href={href}
      className="soft-card group block p-6 transition-all hover:-translate-y-1 hover:border-primary/20 hover:shadow-[var(--soft-glow)] sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-primary-foreground shadow-md",
            accentClass
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <ArrowRight className="mt-1 h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </div>

      <p className="mt-6 text-xs font-medium tracking-wide text-muted-foreground">{subtitle}</p>
      <h2 className="mt-1 text-2xl font-semibold text-foreground">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>

      <ul className="mt-5 space-y-2">
        {highlights.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2 text-xs text-muted-foreground before:h-1 before:w-1 before:shrink-0 before:rounded-full before:bg-primary/60"
          >
            {item}
          </li>
        ))}
      </ul>
    </Link>
  );
}
