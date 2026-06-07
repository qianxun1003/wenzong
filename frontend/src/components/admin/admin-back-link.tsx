import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminBackLinkProps {
  className?: string;
}

export function AdminBackLink({ className }: AdminBackLinkProps) {
  return (
    <Link
      href="/admin"
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "gap-1.5 text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4 shrink-0" />
      <span>返回管理后台</span>
    </Link>
  );
}
