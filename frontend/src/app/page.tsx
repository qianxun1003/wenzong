import { BookOpen, Globe2 } from "lucide-react";
import { FeatureHubCard } from "@/components/home/feature-hub-card";

export default function HomePage() {
  return (
    <div className="home-shell flex items-center">
      <section className="home-feature-grid mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <FeatureHubCard
            href="/student"
            title="文综 AI 智能导师"
            subtitle="RAG 智能答疑"
            description="基于老师讲义的知识库检索与精准作答。支持基础、EJU、深度、图表四种模式，随时提问、即时解答。"
            icon={BookOpen}
            accentClass="gradient-academy"
            highlights={[
              "严格基于老师讲义，拒绝幻觉回答",
              "四种作答模式，覆盖不同学习场景",
              "学生端提问 + 教师后台知识管理",
            ]}
          />
          <FeatureHubCard
            href="/map"
            title="地图探索学习"
            subtitle="地理 · 区域 · 都道府县"
            description="以地图为入口，将历史、政治、经济、地理与国际关系组织到国家、区域和日本都道府县中，系统化备考。"
            icon={Globe2}
            accentClass="bg-gradient-to-br from-chart-2 to-chart-3"
            highlights={[
              "世界八大区域板块 + 国家画像详情页",
              "五种地图图层：地理 / 政治 / 经济 / 历史 / 综合",
              "日本 47 都道府县学习 + 拼图记忆模式",
            ]}
          />
        </div>
      </section>
    </div>
  );
}
