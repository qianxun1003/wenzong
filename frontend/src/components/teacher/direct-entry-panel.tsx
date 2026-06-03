"use client";

import { useState } from "react";
import { Loader2, PenLine, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createKnowledgeEntry } from "@/lib/api";
import {
  EJU_KNOWLEDGE_BODY_HINT,
  EJU_KNOWLEDGE_TAG_EXAMPLE,
} from "@/lib/eju-syllabus";

interface DirectEntryPanelProps {
  onSaved?: () => void;
}

export function DirectEntryPanel({ onSaved }: DirectEntryPanelProps) {
  const [tag, setTag] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!tag.trim() || !content.trim()) {
      toast.error("请填写标签和核心内容");
      return;
    }
    setIsSaving(true);
    try {
      await createKnowledgeEntry({ tag: tag.trim(), content: content.trim() });
      toast.success("考点已保存", {
        description: `「${tag}」已向量化并存入 Supabase`,
      });
      onSaved?.();
      setTag("");
      setContent("");
    } catch (err) {
      toast.error("保存失败", {
        description: err instanceof Error ? err.message : "请检查后端服务",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <PenLine className="h-5 w-5 text-primary" />
          直接录入考点
        </CardTitle>
        <CardDescription>
          无需上传文件，直接输入标签与核心内容，系统将同样转化为向量存入 Supabase。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="tag">标签 / 主题</Label>
          <Input
            id="tag"
            placeholder={`例如：${EJU_KNOWLEDGE_TAG_EXAMPLE}`}
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="bg-background"
          />
          <p className="text-[11px] text-muted-foreground">
            用于检索分类，建议包含学科与知识点名称
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">核心内容</Label>
          <Textarea
            id="content"
            placeholder={EJU_KNOWLEDGE_BODY_HINT}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px] resize-y bg-background text-sm leading-relaxed"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving || !tag.trim() || !content.trim()}
          className="w-full gradient-academy sm:w-auto"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存并向量化...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              保存考点
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
