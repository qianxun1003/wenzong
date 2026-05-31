# 测试阶段不花钱怎么用？

## 方案一：免费测试模式（推荐，零 API 费用）

不调用 OpenAI / Gemini，只用 Supabase + 关键词检索。

编辑 `backend/.env`：

```env
LLM_PROVIDER=mock

# 下面可以留空，避免误触发付费 API
OPENAI_API_KEY=
GEMINI_API_KEY=
```

重启后端后，http://localhost:8000/health 应显示 `"provider": "mock"`。

- **录入考点**：可以正常保存到 Supabase  
- **学生提问**：返回讲义原文摘录 +「测试模式」提示（不是 AI 润色后的回答）  

适合：跑通界面、录入数据、检查流程。

---

## 方案二：Google Gemini 免费 API（更接近正式效果）

1. https://aistudio.google.com/apikey 申请 Key（一般无需绑卡）  
2. `.env` 设置：

```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=AIza...
OPENAI_API_KEY=
```

有免费额度，回答质量比 mock 模式好。

---

## 方案三：OpenAI

需充值，测试阶段可跳过。
