import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackToHomeLinkProps {
  className?: string;
  showLabel?: boolean;
}

export function BackToHomeLink({ className, showLabel = true }: BackToHomeLinkProps) {
  return (
    <Link
      href="/"
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "gap-1.5 text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4 shrink-0" />
      {showLabel ? <span>返回主界面</span> : <span className="sr-only">返回主界面</span>}
    </Link>
  );
}
