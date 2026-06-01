import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface HomeFloatCardProps {
  href: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accentClass?: string;
}

export function HomeFloatCard({
  href,
  title,
  subtitle,
  icon: Icon,
  accentClass = "gradient-academy",
}: HomeFloatCardProps) {
  return (
    <Link href={href} className="map-float-card home-float-card" aria-label={`进入${title}`}>
      <span className="map-float-card__glow" aria-hidden />
      <div
        className={cn(
          "home-float-card__icon-wrap flex h-14 w-14 items-center justify-center rounded-2xl text-primary-foreground shadow-md sm:h-[3.75rem] sm:w-[3.75rem]",
          accentClass
        )}
        aria-hidden
      >
        <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.75} />
      </div>
      <h2 className="map-float-card__title">{title}</h2>
      <p className="map-float-card__subtitle">{subtitle}</p>
    </Link>
  );
}
