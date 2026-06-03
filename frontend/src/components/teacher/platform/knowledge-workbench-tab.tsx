"use client";

import { useEffect, useState } from "react";
import { Database, FileArchive, FileUp, Lock, PenLine } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileUploadPanel } from "@/components/teacher/file-upload-panel";
import { DirectEntryPanel } from "@/components/teacher/direct-entry-panel";
import { KnowledgeListPanel } from "@/components/teacher/knowledge-list-panel";
import { fetchDbUploadLogs, recordDbUploadLog } from "@/lib/teacher/api";
import { tobBtnPrimary, tobCard, tobCardSoft } from "@/lib/teacher/styles";
import type { DbUploadLogPublic, TeacherSession } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";

interface KnowledgeWorkbenchTabProps {
  session: TeacherSession;
}

export function KnowledgeWorkbenchTab({ session }: KnowledgeWorkbenchTabProps) {
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [targetVersion, setTargetVersion] = useState("2026版文综大纲");
  const [uploadLogs, setUploadLogs] = useState<DbUploadLogPublic[]>([]);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    fetchDbUploadLogs(session).then(setUploadLogs);
  }, [session]);

  const bumpList = () => setListRefreshKey((v) => v + 1);

  const handleSyllabusAudit = async () => {
    if (!syllabusFile) {
      toast.error("请选择大纲包文件");
      return;
    }
    setRecording(true);
    try {
      const log = await recordDbUploadLog(session, {
        filename: syllabusFile.name,
        target_version: targetVersion,
        file_size_bytes: syllabusFile.size,
      });
      setUploadLogs((prev) => [log, ...prev]);
      toast.success("大纲包已登记审计", {
        description: `${syllabusFile.name} → ${targetVersion}`,
      });
      setSyllabusFile(null);
    } catch (e) {
      toast.error("登记失败", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setRecording(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <Database className="h-5 w-5 text-primary" />
        <div>
          <h3 className="font-semibold text-foreground">核心教研知识库</h3>
          <p className="text-xs text-muted-foreground">
            日常 RAG 向量化 · 官方大纲全局版本管控
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        {/* 左：日常讲义 */}
        <Card className={cn(tobCard, "h-full")}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-base text-foreground">日常讲义文件向量化</CardTitle>
            </div>
            <CardDescription>
              教师上传 Word / PDF / Markdown，自动切片入库供学生 RAG 检索
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="mb-3 inline-flex h-auto gap-1 bg-muted/40 p-1">
                <TabsTrigger
                  value="upload"
                  className="rounded-md px-2.5 py-1 text-xs data-[state=active]:bg-card"
                >
                  上传
                </TabsTrigger>
                <TabsTrigger
                  value="direct"
                  className="rounded-md px-2.5 py-1 text-xs data-[state=active]:bg-card"
                >
                  录入
                </TabsTrigger>
                <TabsTrigger
                  value="library"
                  className="rounded-md px-2.5 py-1 text-xs data-[state=active]:bg-card"
                >
                  列表
                </TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="mt-0">
                <FileUploadPanel onUploaded={bumpList} />
              </TabsContent>
              <TabsContent value="direct" className="mt-0">
                <DirectEntryPanel onSaved={bumpList} />
              </TabsContent>
              <TabsContent value="library" className="mt-0">
                <KnowledgeListPanel refreshKey={listRefreshKey} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* 右：官方大纲整包 */}
        <Card className={cn(tobCard, "h-full border-primary/15")}>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <FileArchive className="h-5 w-5 text-primary" />
              <CardTitle className="text-base text-foreground">
                官方 EJU 文综大纲库整包升级
              </CardTitle>
              <Badge variant="outline" className="gap-1 border-primary/20 text-[10px]">
                <Lock className="h-3 w-3" />
                管理员权限
              </Badge>
            </div>
            <CardDescription>
              全局知识点 ID 与题库版本一次性升级，系统级可控，与日常讲义隔离
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target-version">目标版本标识</Label>
              <Input
                id="target-version"
                value={targetVersion}
                onChange={(e) => setTargetVersion(e.target.value)}
                className="border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="syllabus-file">大纲包 (.zip / .sql / .json)</Label>
              <Input
                id="syllabus-file"
                type="file"
                accept=".zip,.sql,.json,.md"
                className="border-border"
                onChange={(e) => setSyllabusFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <Button className={tobBtnPrimary} disabled={recording} onClick={handleSyllabusAudit}>
              {recording ? "登记中…" : "提交大纲包审计记录"}
            </Button>

            <div className={cn("rounded-xl border border-border p-3", tobCardSoft)}>
              <p className="mb-2 text-xs font-medium text-foreground">上传审计日志</p>
              <ul className="space-y-1.5 text-sm">
                {uploadLogs.length === 0 ? (
                  <li className="text-muted-foreground">暂无记录</li>
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
    </div>
  );
}
