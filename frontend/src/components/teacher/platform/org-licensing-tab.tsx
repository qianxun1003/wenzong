"use client";

import { useState } from "react";
import { Copy, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { createActivationCode } from "@/lib/teacher/api";
import { remainingOrgSlots } from "@/lib/teacher/mock-data";
import { tobBtnPrimary, tobCard, tobIconWrap } from "@/lib/teacher/styles";
import type { ActivationCodePublic, TeacherSession } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";

interface OrgLicensingTabProps {
  session: TeacherSession;
}

export function OrgLicensingTab({ session }: OrgLicensingTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [latestCode, setLatestCode] = useState<ActivationCodePublic | null>(null);
  const slotsUsed = session.slotsUsed;
  const slotsRemaining = remainingOrgSlots(session);
  const pct = (slotsUsed / session.slotsLimit) * 100;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const code = await createActivationCode(session);
      setLatestCode(code);
      setModalOpen(true);
    } catch (e) {
      toast.error("生成失败", {
        description: e instanceof Error ? e.message : "请检查后端与登录状态",
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = () => {
    if (!latestCode) return;
    void navigator.clipboard.writeText(latestCode.code);
    toast.success("激活码已复制");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className={tobCard}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">机构授权状态</CardTitle>
          </div>
          <CardDescription>ToB 订阅与席位熔断（投资人演示）</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              国内培训机构
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{session.orgName}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              对接日本机构：{session.targetOrgName} · 区域 CN → JP
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn(tobBtnPrimary, "border-0 hover:opacity-90")}>
              {session.status === "active" ? "Active · 运营中" : session.status}
            </Badge>
            {session.demoMode && (
              <Badge variant="outline" className="border-border text-muted-foreground">
                演示数据
              </Badge>
            )}
          </div>
          <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">学生席位</span>
              <span className="font-medium tabular-nums text-foreground">
                已用 {slotsUsed} / 最大 {session.slotsLimit} 席
              </span>
            </div>
            <Progress value={pct} />
            <p className="text-xs text-muted-foreground">
              剩余可用 <strong className="text-foreground">{slotsRemaining}</strong> 席 ·
              并发兑换由数据库行级锁保护
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className={cn(tobCard, "bg-gradient-to-br from-card/90 to-muted/40")}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">激活码生成器</CardTitle>
          </div>
          <CardDescription>生成后发放给新学员，自动绑定本机构 org_id</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
          <div className={cn("flex h-16 w-16 items-center justify-center rounded-2xl", tobIconWrap)}>
            <Sparkles className="h-8 w-8" />
          </div>
          <Button
            size="lg"
            className={cn("px-8 shadow-[var(--soft-glow-sm)]", tobBtnPrimary)}
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? "生成中…" : "生成新激活码"}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent onClose={() => setModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>新激活码已生成</DialogTitle>
            <DialogDescription>请复制并发送给学生，在注册时填写即可完成机构绑定</DialogDescription>
          </DialogHeader>
          {latestCode && (
            <div className="space-y-4">
              <div className="rounded-xl border border-dashed border-primary/30 bg-muted/40 px-4 py-6 text-center">
                <p className="font-mono text-2xl font-semibold tracking-widest text-foreground">
                  {latestCode.code}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  可用 {latestCode.max_uses} 次 · 已用 {latestCode.used_count}
                </p>
              </div>
              <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                当前机构剩余可用席位 <strong className="text-foreground">{slotsRemaining}</strong>{" "}
                席，单次生成数量不可超过额度上限。
              </p>
              <Button className={cn("w-full", tobBtnPrimary)} onClick={copyCode}>
                <Copy className="mr-2 h-4 w-4" />
                一键复制
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
