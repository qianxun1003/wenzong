# 部署：Render（后端）+ Vercel（前端）

架构：**Vercel** 托管 Next.js · **Render** 托管 FastAPI · **Supabase** 保持云端数据库（无需再部署）。

部署顺序建议：**Supabase 已就绪 → Render 后端 → Vercel 前端**（前端需要后端公网 URL）。

---

## 一、前置条件

- [ ] 已在 Supabase 执行 `supabase/migrations/001_knowledge_chunks.sql`（见 [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)）
- [ ] 代码已推送到 GitHub（Render / Vercel 均从 Git 拉取）
- [ ] 本地 `backend/.env` 里 Supabase 与 LLM 配置已验证可用

---

## 二、Render 部署后端

### 方式 A：Dashboard 手动创建（推荐首次）

1. 登录 [Render](https://render.com) → **New** → **Web Service**
2. 连接 GitHub 仓库 **文综问答系统**
3. 填写：

| 项 | 值 |
|----|-----|
| **Name** | `wenzong-api`（任意） |
| **Root Directory** | `backend` |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | Free（测试）或 Starter（减少休眠） |

4. **Environment** 添加变量（与 `backend/.env.example` 对应，**不要**把 `.env` 提交到 Git）：

| Key | 说明 |
|-----|------|
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_SERVICE_KEY` | service_role key（仅后端，勿暴露到前端） |
| `LLM_PROVIDER` | `mock` / `gemini` / `openai` |
| `GEMINI_API_KEY` | 若用 Gemini |
| `OPENAI_API_KEY` | 若用 OpenAI |
| `CORS_ORIGINS` | 先填 `https://placeholder.vercel.app`，部署 Vercel 后再改成真实域名 |

5. 点击 **Create Web Service**，等待 Build 成功
6. 记下公网地址，例如：`https://wenzong-api.onrender.com`
7. 浏览器打开 `https://你的服务.onrender.com/health`，应返回 JSON，且 `supabase: true`

> **免费档注意**：约 15 分钟无请求会休眠，下次访问可能冷启动 30～60 秒。

### 方式 B：Blueprint（`render.yaml`）

仓库根目录已有 `render.yaml`。Render → **New** → **Blueprint** → 选仓库，按提示补全环境变量（密钥在 Dashboard 填，不要写进 yaml）。

---

## 三、Vercel 部署前端

1. 登录 [Vercel](https://vercel.com) → **Add New** → **Project**
2. 导入同一 GitHub 仓库
3. **Root Directory** 设为 `frontend`（必须，否则找不到 Next.js）
4. Framework Preset 应为 **Next.js**（自动检测）
5. **Environment Variables**：

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_API_URL` | `https://wenzong-api.onrender.com`（换成你的 Render 地址，**不要**末尾斜杠） |

6. **Deploy**
7. 部署完成后得到地址，例如：`https://文综问答系统.vercel.app`

---

## 四、回改 CORS（必做）

Vercel 域名确定后，回到 **Render** → 该 Web Service → **Environment**：

```env
CORS_ORIGINS=https://你的项目.vercel.app
```

若有多个（预览域 + 生产域），用英文逗号分隔：

```env
CORS_ORIGINS=https://xxx.vercel.app,https://xxx-git-main-用户名.vercel.app
```

保存后 Render 会自动重新部署。再在前端页面发一条聊天，确认无 CORS 报错。

---

## 五、验证清单

| 检查 | 地址 / 操作 |
|------|-------------|
| 后端健康 | `GET https://xxx.onrender.com/health` |
| 前端打开 | Vercel 给的 HTTPS 链接 |
| 学生提问 | 能收到回复（mock 或 Gemini） |
| 教师录入 | 后台录入考点后 Supabase 有数据 |
| 浏览器控制台 | Network 里 API 请求指向 Render，无 CORS 错误 |

---

## 六、环境变量对照

### Render（`backend`）

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
LLM_PROVIDER=gemini
GEMINI_API_KEY=...
CORS_ORIGINS=https://your-app.vercel.app
```

测试阶段可设 `LLM_PROVIDER=mock`，见 [`FREE_TESTING.md`](./FREE_TESTING.md)。

### Vercel（`frontend`）

```env
NEXT_PUBLIC_API_URL=https://your-api.onrender.com
```

---

## 七、常见问题

**前端仍请求 localhost:8000**  
→ Vercel 未设置 `NEXT_PUBLIC_API_URL`，或改完后未 **Redeploy**（Next 在构建时注入该变量）。

**CORS blocked**  
→ `CORS_ORIGINS` 必须与浏览器地址栏完全一致（`https`，无多余路径）。

**503 / Supabase 未配置**  
→ Render 环境变量名拼写、是否用了 **service_role** key。

**Render 很慢**  
→ 免费实例休眠；可升级实例或接受首次冷启动。

**预览部署（PR）调不通 API**  
→ 把该次 Vercel 预览 URL 临时加入 `CORS_ORIGINS`，或仅在生产域名测试。

---

## 八、后续可选

- 自定义域名：Vercel / Render 各自在 **Domains** 里绑定，并更新 `CORS_ORIGINS` 与 `NEXT_PUBLIC_API_URL`
- 教师鉴权上线前，避免把教师后台长期暴露在公网无密码状态
