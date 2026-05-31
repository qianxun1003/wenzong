import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackToMapHubLinkProps {
  className?: string;
}

export function BackToMapHubLink({ className }: BackToMapHubLinkProps) {
  return (
    <Link
      href="/map"
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "gap-1.5 text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4 shrink-0" />
      返回地图选择
    </Link>
  );
}
