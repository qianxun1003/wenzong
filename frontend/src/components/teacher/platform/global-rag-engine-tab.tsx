"use client";

import { useEffect, useState } from "react";
import { Database, FileArchive, Lock, Rocket } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchDbUploadLogs, recordDbUploadLog } from "@/lib/teacher/api";
import { tobBtnPrimary, tobCard, tobCardSoft } from "@/lib/teacher/styles";
import type { DbUploadLogPublic, TeacherSession } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";

interface GlobalRagEngineTabProps {
  session: TeacherSession;
}

export function GlobalRagEngineTab({ session }: GlobalRagEngineTabProps) {
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [targetVersion, setTargetVersion] = useState("2026版文综大纲");
  const [uploadLogs, setUploadLogs] = useState<DbUploadLogPublic[]>([]);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    fetchDbUploadLogs(session).then(setUploadLogs);
  }, [session]);

  const handleDeploy = async () => {
    if (!syllabusFile) {
      toast.error("请选择官方大纲包");
      return;
    }
    setRecording(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      const log = await recordDbUploadLog(session, {
        filename: syllabusFile.name,
        target_version: targetVersion,
        file_size_bytes: syllabusFile.size,
      });
      setUploadLogs((prev) => [log, ...prev]);
      toast.success("全球知识地图已触发升级", {
        description: `${targetVersion} · 所有租户 RAG 索引将异步重建`,
        duration: 6000,
      });
      setSyllabusFile(null);
    } catch (e) {
      toast.error("升级登记失败", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setRecording(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <Database className="h-5 w-5 text-primary" />
        <div>
          <h3 className="font-semibold text-foreground">EJU 官方大纲整库升级</h3>
          <p className="text-xs text-muted-foreground">
            Global RAG Engine · 仅超级管理员 · 一键更新全球知识地图
          </p>
        </div>
      </div>

      <Card className={cn(tobCard, "border-primary/15")}>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <FileArchive className="h-5 w-5 text-primary" />
            <CardTitle className="text-base text-foreground">官方大纲包部署</CardTitle>
            <Badge variant="outline" className="gap-1 border-primary/20 text-[10px]">
              <Lock className="h-3 w-3" />
              Super Admin Only
            </Badge>
          </div>
          <CardDescription>
            上传 2026 / 2027 版 EJU 文综官方大纲 (.zip / .sql / .json)，全局知识点 ID
            与向量索引一次性升级，各机构日常讲义数据隔离不受影响
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="global-version">目标版本标识</Label>
            <Input
              id="global-version"
              value={targetVersion}
              onChange={(e) => setTargetVersion(e.target.value)}
              placeholder="2027版文综大纲"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="global-syllabus">官方大纲包</Label>
            <Input
              id="global-syllabus"
              type="file"
              accept=".zip,.sql,.json,.md"
              onChange={(e) => setSyllabusFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <Button
            size="lg"
            className={cn("w-full gap-2 sm:w-auto", tobBtnPrimary)}
            disabled={recording}
            onClick={handleDeploy}
          >
            <Rocket className="h-4 w-4" />
            {recording ? "全球部署中…" : "一键升级全球知识地图"}
          </Button>

          <div className={cn("rounded-xl border border-border p-4", tobCardSoft)}>
            <p className="mb-2 text-xs font-medium text-foreground">全球部署审计日志</p>
            <ul className="space-y-1.5 text-sm">
              {uploadLogs.length === 0 ? (
                <li className="text-muted-foreground">暂无部署记录</li>
              ) : (
                uploadLogs.map((log) => (
                  <li
                    key={log.id}
                    className="flex justify-between rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs"
                  >
                    <span className="font-medium text-foreground">{log.filename}</span>
                    <span className="text-muted-foreground">{log.target_version}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
