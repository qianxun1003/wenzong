"use client";

import { useMemo, useState } from "react";
import { Copy, KeyRound, Wrench } from "lucide-react";
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
import { useDemoPlatform, type DispatchedActivationCode } from "@/lib/teacher/demo-platform-context";
import { tobBtnPrimary, tobCard, tobTableHover } from "@/lib/teacher/styles";
import type { ActivationCodePublic, TeacherSession } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";
import { GlossaryText } from "./glossary-text";

interface MyOrgSlotsTabProps {
  session: TeacherSession;
}

/** 本塾授权与席位工具箱 · 纯后台工具，不参与日常教学动线 */
export function MyOrgSlotsTab({ session }: MyOrgSlotsTabProps) {
  const { getOrgSlots, getCodesForOrg, dispatchedCodes } = useDemoPlatform();
  const [modalOpen, setModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [latestCode, setLatestCode] = useState<ActivationCodePublic | null>(null);

  const live = getOrgSlots(session.orgId);
  const slotsUsed = live.used;
  const slotsLimit = live.limit;
  const slotsRemaining = Math.max(0, slotsLimit - slotsUsed);
  const pct = slotsLimit > 0 ? (slotsUsed / slotsLimit) * 100 : 0;

  const platformCodes = useMemo(
    () => getCodesForOrg(session.orgName),
    [getCodesForOrg, session.orgName, dispatchedCodes]
  );

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

  const copyPlatformCode = (code: string) => {
    void navigator.clipboard.writeText(code);
    toast.success("已复制，可线下分发给学生激活");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <Wrench className="h-5 w-5 text-primary" />
          本塾席位与激活码工具箱
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          席位水位与激活码分发 · 需要给学生发码时来这里复制即可
        </p>
      </div>

      <Card className={tobCard}>
        <CardHeader>
          <CardTitle className="text-foreground">席位水位</CardTitle>
          <CardDescription>
            {session.orgName} · <GlossaryText text="席位上限" />由平台超级管理员分配
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground">学生席位占用</span>
            <span className="font-medium tabular-nums text-foreground">
              已用 {slotsUsed} / 剩余 {slotsRemaining} 席
            </span>
          </div>
          <Progress value={pct} className="h-3" />
          <div className="flex flex-wrap gap-2">
            <Badge className={cn(tobBtnPrimary, "border-0 hover:opacity-90")}>
              {session.status === "active" ? "Active · 运营中" : session.status}
            </Badge>
            <Badge variant="outline" className="border-border text-muted-foreground">
              上限 {slotsLimit} 席
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className={tobCard}>
        <CardHeader>
          <CardTitle className="text-foreground">激活码分发</CardTitle>
          <CardDescription>
            复制并线下分发给新生 · 与平台端下发的<GlossaryText text="激活码" />一致
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className={cn("w-full gap-2 sm:w-auto", tobBtnPrimary)}
            onClick={handleGenerate}
            disabled={generating}
          >
            <KeyRound className="h-4 w-4" />
            {generating ? "生成中…" : "为本塾新生成激活码"}
          </Button>

          {platformCodes.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                    <th className="px-4 py-2 font-medium">激活码</th>
                    <th className="px-4 py-2 font-medium">下发时间</th>
                    <th className="px-4 py-2 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {platformCodes.map((item: DispatchedActivationCode) => (
                    <tr
                      key={item.id}
                      className={cn("border-b border-border/60 transition-colors", tobTableHover)}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">
                        {item.code}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString("zh-CN")}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => copyPlatformCode(item.code)}
                        >
                          <Copy className="mr-1 h-3 w-3" />
                          复制
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent onClose={() => setModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>新激活码已生成</DialogTitle>
            <DialogDescription>请复制并发送给本塾新生</DialogDescription>
          </DialogHeader>
          {latestCode && (
            <div className="space-y-4">
              <div className="rounded-xl border border-dashed border-primary/30 bg-muted/40 px-4 py-6 text-center">
                <p className="font-mono text-2xl font-semibold tracking-widest text-foreground">
                  {latestCode.code}
                </p>
              </div>
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
