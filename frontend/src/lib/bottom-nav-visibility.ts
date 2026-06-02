/** 底栏仅保留在首页与个人主页；进入各功能模块后隐藏 */
export function shouldShowBottomNav(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname === "/me" || pathname.startsWith("/me/")) return true;
  return false;
}
