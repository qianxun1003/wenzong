"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** 路由切换时滚回页面顶部（含底栏切到个人主页） */
export function ScrollToTopOnNavigate() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
