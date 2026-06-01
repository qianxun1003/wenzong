# 部署：前后端均在 Render

架构：**Render** 托管 FastAPI 后端 + Next.js 前端 · **Supabase** 继续作为数据库（无需在 Render 再建库）。

仓库根目录的 [`render.yaml`](../render.yaml) 已定义两个 Web Service，并自动互相关联：

| 服务名 | 目录 | 说明 |
|--------|------|------|
| `wenzong-api` | `backend/` | FastAPI，健康检查 `/health` |
| `wenzong-web` | `frontend/` | Next.js 生产模式 `npm run build` + `npm start` |

- 前端的 `NEXT_PUBLIC_API_URL` ← 后端公网地址（构建时注入）
- 后端的 `CORS_ORIGINS` ← 前端公网地址

---

## 一、前置条件

- [ ] 已在 Supabase 执行 [`supabase/migrations/001_knowledge_chunks.sql`](../supabase/migrations/001_knowledge_chunks.sql)（见 [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)）
- [ ] 代码已推送到 GitHub：[qianxun1003/wenzong](https://github.com/qianxun1003/wenzong)
- [ ] 本地 `backend/.env` 中 Supabase、LLM 已验证可用
- [ ] 准备好 **Supabase URL / service_role key**、**Gemini 或 OpenAI API Key**（勿提交到 Git）

> 免费实例约 15 分钟无访问会休眠，冷启动可能需 30～60 秒。

---

## 二、方式 A：Blueprint 一键部署（推荐）

1. 打开 [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
2. 连接 GitHub，选择仓库 **`qianxun1003/wenzong`**
3. Render 会读取根目录 `render.yaml`，预览将创建 `wenzong-api` 与 `wenzong-web`
4. 在创建向导中，为标记为 **需手动填写** 的变量填入值（与本地 `backend/.env` 一致）：

| 变量 | 说明 |
|------|------|
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_SERVICE_KEY` | **service_role** key（仅后端，勿放到前端） |
| `GEMINI_API_KEY` | 使用 Gemini 时必填 |
| `OPENAI_API_KEY` | 使用 OpenAI 时必填（二选一即可） |

5. 点击 **Apply** / 创建，等待两个服务 **Build** 与 **Deploy** 均成功
6. 首次部署后若 CORS 仍报错，在 Dashboard 对 **`wenzong-api`** 点 **Manual Deploy** 再部署一次（确保 `CORS_ORIGINS` 已指向前端 URL）

### 验证

| 检查 | 操作 |
|------|------|
| 后端 | 浏览器打开 `https://wenzong-api.onrender.com/health`（以实际域名为准），应 `status: ok`，`supabase: true` |
| 前端 | 打开 `https://wenzong-web.onrender.com`（以实际域名为准） |
| 联调 | 学生页发一条消息，控制台 Network 请求应指向后端域名，无 CORS 错误 |

---

## 三、方式 B：手动创建两个 Web Service

适合不用 Blueprint、或已有其中一个服务的情况。

### 1. 后端 `wenzong-api`

**New** → **Web Service** → 选仓库，配置：

| 项 | 值 |
|----|-----|
| **Root Directory** | `backend` |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Health Check Path** | `/health` |

**Environment**（示例）：

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
LLM_PROVIDER=gemini
GEMINI_API_KEY=你的密钥
CORS_ORIGINS=https://wenzong-web.onrender.com
```

`CORS_ORIGINS` 须与浏览器地址栏 **完全一致**（`https`，无路径、无末尾斜杠）。前端部署完成后再填真实前端 URL。

### 2. 前端 `wenzong-web`

**New** → **Web Service** → 同一仓库：

| 项 | 值 |
|----|-----|
| **Root Directory** | `frontend` |
| **Runtime** | Node |
| **Build Command** | `npm ci && npm run build` |
| **Start Command** | `npm run start` |

**Environment**：

```env
NODE_VERSION=22.12.0
NEXT_PUBLIC_API_URL=https://wenzong-api.onrender.com
```

`NEXT_PUBLIC_API_URL` 在 **构建时** 写入前端；修改后必须 **Clear build cache & deploy** 或重新部署。

### 3. 回改 CORS

前端域名确定后，回到后端 **Environment**，把 `CORS_ORIGINS` 设为前端 HTTPS 地址，保存触发自动重新部署。

---

## 四、环境变量对照

### 后端（`wenzong-api`）

| Key | 必填 | 说明 |
|-----|------|------|
| `SUPABASE_URL` | 是 | |
| `SUPABASE_SERVICE_KEY` | 是 | service_role |
| `LLM_PROVIDER` | 建议 | `gemini` / `openai` / `mock`（测试可无 key） |
| `GEMINI_API_KEY` | Gemini 时 | |
| `OPENAI_API_KEY` | OpenAI 时 | |
| `CORS_ORIGINS` | 是 | 前端 `https://xxx.onrender.com` |
| `RAG_SIMILARITY_THRESHOLD` | 否 | 默认 `0.45` |

测试阶段可设 `LLM_PROVIDER=mock`，见 [`FREE_TESTING.md`](./FREE_TESTING.md)。

### 前端（`wenzong-web`）

| Key | 必填 | 说明 |
|-----|------|------|
| `NEXT_PUBLIC_API_URL` | 是 | 后端 URL，**不要**末尾 `/` |
| `NODE_VERSION` | 建议 | `22.12.0`（与 `render.yaml` 一致） |

---

## 五、常见问题

**前端仍请求 `localhost:8000`**  
→ 未设置 `NEXT_PUBLIC_API_URL`，或改完后未重新 **build** 部署。

**CORS blocked**  
→ `CORS_ORIGINS` 与浏览器地址不一致；多域名用英文逗号分隔。

**503 / Supabase 未配置**  
→ 检查 `SUPABASE_*` 拼写与 service_role key。

**Blueprint 创建后聊天不通**  
→ 对 `wenzong-api` 手动再部署一次；确认 `CORS_ORIGINS` 为前端 `RENDER_EXTERNAL_URL`。

**本地有未推送的修改**  
→ Render 只部署 GitHub 上的代码；`git push` 后再在 Render 触发部署。

**自定义域名**  
→ 各服务 **Settings → Custom Domains** 绑定后，更新 `CORS_ORIGINS` 与 `NEXT_PUBLIC_API_URL` 并重新部署前端。

---

## 六、与 Vercel 方案的区别

若只想后端在 Render、前端在 Vercel，见 [`DEPLOY_RENDER_VERCEL.md`](./DEPLOY_RENDER_VERCEL.md)。  
本仓库默认 **前后端都在 Render** 时，以本文与根目录 `render.yaml` 为准。
