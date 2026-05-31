import { BookOpen, Globe2 } from "lucide-react";
import { FeatureHubCard } from "@/components/home/feature-hub-card";

export default function HomePage() {
  return (
    <div className="home-shell flex items-center">
      <section className="home-feature-grid mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <FeatureHubCard
            href="/student"
            title="文综 AI 导师"
            subtitle="RAG 智能答疑"
            description="基于老师讲义检索作答，支持基础、EJU、深度、图表四种模式。"
            icon={BookOpen}
            accentClass="gradient-academy"
            highlights={[
              "严格基于讲义，拒绝幻觉",
              "四种模式，覆盖不同场景",
              "学生提问 · 教师管理知识库",
            ]}
          />
          <FeatureHubCard
            href="/map"
            title="地图探索"
            subtitle="地理 · 区域 · 都道府县"
            description="以地图串联历史、政治、经济、地理与国际关系，系统化备考。"
            icon={Globe2}
            accentClass="bg-gradient-to-br from-chart-2 to-chart-3"
            highlights={[
              "八大区域 + 国家画像",
              "五层地图：地理 / 政治 / 经济 / 历史 / 综合",
              "47 都道府县 + 拼图记忆",
            ]}
          />
        </div>
      </section>
    </div>
  );
}
