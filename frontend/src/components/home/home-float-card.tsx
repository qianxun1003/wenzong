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
      <div className="home-float-card__body">
        <div
          className={cn(
            "home-float-card__icon-wrap flex shrink-0 items-center justify-center rounded-2xl text-primary-foreground",
            accentClass
          )}
          aria-hidden
        >
          <Icon className="home-float-card__icon" strokeWidth={1.75} />
        </div>
        <div className="home-float-card__copy">
          <h2 className="home-float-card__title">{title}</h2>
          <p className="home-float-card__subtitle">{subtitle}</p>
        </div>
      </div>
    </Link>
  );
}
