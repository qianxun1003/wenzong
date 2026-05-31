# Supabase + 后端 + 前后端联调指南

按顺序完成以下步骤，即可跑通 **录入 → 检索 → 回答** 完整链路。

---

## 一、创建 Supabase 项目

1. 打开 [https://supabase.com](https://supabase.com) 并登录  
2. 点击 **New project**，填写名称（如 `wenzong-tutor`）  
3. 设置数据库密码，选择离你较近的区域（如 Singapore）  
4. 等待项目创建完成（约 1～2 分钟）

---

## 二、执行数据库 SQL

1. 左侧菜单进入 **SQL Editor** → **New query**  
2. 打开本项目文件：`supabase/migrations/001_knowledge_chunks.sql`  
3. **全选复制** SQL 内容，粘贴到编辑器  
4. 点击 **Run**  
5. 左侧 **Table Editor** 中应能看到 `knowledge_chunks` 表

> 若报错 `extension "vector" is not available`：在 Dashboard → **Database** → **Extensions** 中搜索 `vector` 并启用后重试。

---

## 三、获取 API 密钥

1. 左侧 **Project Settings**（齿轮）→ **API**  
2. 记下：
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key（secret）→ `SUPABASE_SERVICE_KEY`  
     ⚠️ 仅用于后端，不要写进前端代码

---

## 四、配置 OpenAI（或兼容 API）

本系统使用 Embedding + Chat，需支持 OpenAI 格式接口。

| 变量 | 说明 | 示例 |
|------|------|------|
| `OPENAI_API_KEY` | API 密钥 | `sk-...` |
| `OPENAI_BASE_URL` | 接口地址（可选） | `https://api.openai.com/v1` |
| `EMBEDDING_MODEL` | 向量模型 | `text-embedding-3-small` |
| `CHAT_MODEL` | 对话模型 | `gpt-4o-mini` |

使用国内中转时，将 `OPENAI_BASE_URL` 改为对应地址即可。

---

## 五、配置后端 `.env`

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

编辑 `backend/.env`：

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOi...

OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
EMBEDDING_MODEL=text-embedding-3-small
CHAT_MODEL=gpt-4o-mini

CORS_ORIGINS=http://localhost:3000
```

启动后端：

```bash
uvicorn app.main:app --reload --port 8000
```

浏览器打开 http://localhost:8000/health ，应看到：

```json
{
  "status": "ok",
  "supabase": true,
  "openai": true
}
```

若为 `false`，说明对应环境变量未填好。

---

## 六、配置前端

```bash
cd frontend
cp .env.local.example .env.local
```

确认 `frontend/.env.local`：

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

启动前端（若未启动）：

```bash
npm run dev
```

---

## 七、联调测试（推荐顺序）

### 1. 教师录入考点

1. 打开 http://localhost:3000/teacher  
2. 切到 **直接录入**  
3. 示例：

   - **标签**：`日本史 · 高度经济成长期`  
   - **内容**：`日本高度经济成长期一般指1955年至1973年前后。这一时期日本经济高速增长，GDP年均增长率较高，重化工业发展迅速。`

4. 点击 **保存考点** → 应提示成功  
5. 在 Supabase **Table Editor** → `knowledge_chunks` 中应出现新行

### 2. 学生提问（已录入内容）

1. 打开 http://localhost:3000/student  
2. 提问：`日本高度经济成长期时间`  
3. 应能根据讲义内容回答

### 3. 学生提问（未录入内容）

提问：`量子力学基础`（若未录入）  
应回复类似：**老师尚未录入相关知识点…**

### 4. 上传讲义（可选）

在教师后台 **文件上传** 中上传 `.md` / `.pdf` / `.docx` 测试。

---

## 常见问题

| 现象 | 处理 |
|------|------|
| 前端黄条「后端未连接」 | 确认 `uvicorn` 在 8000 端口运行 |
| `请配置 SUPABASE_URL` | 检查 `backend/.env` 是否保存、是否重启后端 |
| Embedding 报错 | 检查 API Key、余额、`EMBEDDING_MODEL` 名称 |
| `match_documents` 不存在 | 重新执行 SQL 迁移文件 |
| 录入成功但回答不准 | 多写几条相关考点；问题尽量具体 |
| CORS 错误 | 确认 `CORS_ORIGINS` 含 `http://localhost:3000` |

---

## 当前架构一览

```
教师后台 ──POST /api/knowledge──┐
         ──POST /api/documents/upload──┤
                                        ▼
                              FastAPI + OpenAI Embedding
                                        ▼
                              Supabase (knowledge_chunks)
                                        ▲
学生端 ──POST /api/chat── RAG 检索 + LLM 回答 ──┘
```

完成以上步骤后，系统即可正式使用。对话历史暂存于浏览器 localStorage，后续可再接入 Supabase 持久化。
