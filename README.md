# 文综 AI 智能导师系统

基于 **Next.js + Tailwind + Shadcn UI** 前端与 **FastAPI + Supabase** 后端的文综专属 RAG 答疑系统。

## 项目结构

```
文综问答系统/
├── frontend/          # Next.js 学生端 & 教师后台 UI
├── backend/           # FastAPI RAG API
├── supabase/          # 数据库迁移 SQL
└── README.md
```

## 功能概览

| 模块 | 说明 |
|------|------|
| 学生端 | 左侧历史记录 + 右侧对话，移动端 Sheet 侧栏 |
| 教师后台 | 批量上传 Word/PDF/Markdown · 直接录入考点 |
| RAG | Supabase 向量检索 → 严格 Prompt 约束大模型回答 |

## 完整配置（Supabase + 联调）

**请按 [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md) 逐步操作**，包含数据库 SQL、密钥配置与联调测试。

## 生产部署（Render）

前后端均部署在 [Render](https://render.com)，数据库继续用 Supabase。  
逐步说明见 **[`docs/DEPLOY_RENDER.md`](docs/DEPLOY_RENDER.md)**（仓库根目录 [`render.yaml`](render.yaml) 可 Blueprint 一键创建两个服务）。

若前端改用 Vercel，见 [`docs/DEPLOY_RENDER_VERCEL.md`](docs/DEPLOY_RENDER_VERCEL.md)。

## 快速启动

### 1. 前端

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

访问 http://localhost:3000

### 2. 后端

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # 填入 Supabase 与 OpenAI 密钥
uvicorn app.main:app --reload --port 8000
```

### 3. Supabase

在 Supabase SQL Editor 中执行 `supabase/migrations/001_knowledge_chunks.sql`。

## 设计说明

- **主色调**：学院蓝（primary）+ 书卷白（background/parchment）
- **字体**：Noto Sans SC + Noto Serif SC，简约日系学院风
- **响应式**：PC 固定侧栏；手机端 Sheet 抽屉历史记录

## 核心 Prompt 约束

大模型仅可根据老师讲义回答；无相关内容时必须回复：

> 老师尚未录入相关知识点，请向老师反馈或稍后再试。

详见 `backend/app/prompts.py`。

## 当前进度

- [x] 前端 UI（学生端 / 教师后台）
- [x] 前后端 API 联调（真实请求，非 mock）
- [x] 对话历史（浏览器 localStorage）
- [ ] 配置 Supabase 与 OpenAI（见 `docs/SUPABASE_SETUP.md`）
- [ ] 会话云端持久化
- [ ] 教师登录鉴权
