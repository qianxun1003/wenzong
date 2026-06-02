import type { Metadata } from "next";
import { Noto_Sans_SC } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AppMain } from "@/components/layout/app-main";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ScrollToTopOnNavigate } from "@/components/layout/scroll-to-top-on-navigate";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const notoSans = Noto_Sans_SC({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "文综学习平台",
  description: "EJU 文综一站式学习 · AI 智能导师 + 地图探索 + Quiz 练习",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${notoSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background font-sans">
        <SiteHeader />
        <ScrollToTopOnNavigate />
        <AppMain>{children}</AppMain>
        <BottomNav />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
