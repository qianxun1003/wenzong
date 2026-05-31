"use client";

import { useCallback, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { uploadDocuments } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { UploadResult } from "@/lib/types";

const ACCEPTED = ".pdf,.doc,.docx,.md,.markdown";
const ACCEPTED_LABEL = "PDF · Word · Markdown";

interface FileUploadPanelProps {
  onUploaded?: () => void;
}

export function FileUploadPanel({ onUploaded }: FileUploadPanelProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const list = Array.from(incoming);
    const valid = list.filter((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase();
      return ["pdf", "doc", "docx", "md", "markdown"].includes(ext ?? "");
    });
    if (valid.length < list.length) {
      toast.error("部分文件格式不支持", {
        description: `仅支持 ${ACCEPTED_LABEL}`,
      });
    }
    setFiles((prev) => [...prev, ...valid]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleUpload = async () => {
    if (!files.length) return;
    setIsUploading(true);
    try {
      const res = await uploadDocuments(files);
      setResults(res);
      const failed = res.filter((r) => r.status === "error");
      const ok = res.filter((r) => r.status === "success");
      if (ok.length) {
        toast.success("上传成功", {
          description: `已入库 ${ok.reduce((n, r) => n + r.chunks, 0)} 个知识片段`,
        });
        onUploaded?.();
      }
      if (failed.length) {
        toast.error(`${failed.length} 个文件失败`, {
          description: failed[0].message ?? "请检查后端日志",
        });
      }
      setFiles([]);
    } catch (err) {
      toast.error("上传失败", {
        description: err instanceof Error ? err.message : "请检查后端服务",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Upload className="h-5 w-5 text-primary" />
          批量上传讲义
        </CardTitle>
        <CardDescription>
          支持 {ACCEPTED_LABEL}。上传后系统将自动切片并转化为向量存入 Supabase。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "relative flex min-h-[180px] flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border/80 bg-muted/30 hover:border-primary/40 hover:bg-muted/50"
          )}
        >
          <Upload className="mb-3 h-10 w-10 text-muted-foreground/60" />
          <p className="text-sm font-medium text-foreground">拖拽文件到此处</p>
          <p className="mt-1 text-xs text-muted-foreground">或</p>
          <label className="mt-3 cursor-pointer">
            <input
              type="file"
              multiple
              accept={ACCEPTED}
              className="sr-only"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
            <span className="inline-flex h-7 items-center justify-center rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 text-[0.8rem] font-medium transition-colors hover:bg-muted">
              选择文件
            </span>
          </label>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              待上传 ({files.length})
            </p>
            <ul className="space-y-1.5">
              {files.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate text-sm">{f.name}</span>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {(f.size / 1024).toFixed(0)} KB
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full gradient-academy"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  切片并向量化中...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  开始上传并入库
                </>
              )}
            </Button>
          </div>
        )}

        {results.length > 0 && (
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">最近上传</p>
            <ul className="space-y-1">
              {results.map((r) => (
                <li key={r.filename} className="flex justify-between gap-2 text-sm">
                  <span className="truncate">{r.filename}</span>
                  <span
                    className={cn(
                      "shrink-0 text-xs",
                      r.status === "error" ? "text-destructive" : "text-muted-foreground"
                    )}
                  >
                    {r.status === "error" ? r.message : `${r.chunks} 片段`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
