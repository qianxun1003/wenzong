# 使用 Google Gemini 配置指南

本系统支持 **Gemini** 做向量嵌入 + 回答生成，在日本使用很方便，**无需 OpenAI**。

## 1. 获取 API Key

1. 打开 https://aistudio.google.com/apikey  
2. 登录 Google 账号  
3. 点击 **Create API key**  
4. 复制以 `AIza` 开头的密钥  

## 2. 编辑 `backend/.env`

在文件末尾添加或修改为：

```env
LLM_PROVIDER=gemini

GEMINI_API_KEY=AIza你的密钥
GEMINI_CHAT_MODEL=gemini-2.0-flash
GEMINI_EMBEDDING_MODEL=models/gemini-embedding-001
EMBEDDING_DIMENSIONS=1536
```

`OPENAI_API_KEY` 可以留空。

## 3. 安装依赖并重启后端

```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
# 先 Ctrl+C 停掉旧的后端，再：
uvicorn app.main:app --reload --port 8000
```

## 4. 检查

打开 http://localhost:8000/health ，应看到：

```json
{
  "llm": true,
  "provider": "gemini",
  "gemini": true
}
```

刷新教师后台，黄条应显示可以录入考点。

## 说明

- 向量维度使用 **1536**，与 Supabase 表 `knowledge_chunks` 一致。  
- 免费额度有限，大量上传讲义时注意 Google AI 配额。  
