# 网页建表（脚本连不上数据库时用）

你的报错 `could not translate host name "db.xxx.supabase.co"` 表示：**本机无法解析旧版数据库地址**，改用网页建表即可。

## 步骤（约 2 分钟）

1. 打开 https://supabase.com/dashboard → 进入你的项目  
2. 左侧点 **SQL Editor**  
3. 点 **New query**  
4. 用 Cursor 打开项目里的文件：  
   `supabase/migrations/001_knowledge_chunks.sql`  
5. **全选复制** → 粘贴到 Supabase 编辑框  
6. 点右下角 **Run**  
7. 看到 **Success**  
8. 左侧 **Table Editor** → 能看到表 **`knowledge_chunks`** 即成功  

## 然后回到终端

```bash
cd /Users/jessiecat/Documents/projects/文综问答系统/backend
bash scripts/run_setup.sh
```

当问「已在网页 SQL Editor 里 Run 成功了吗？」输入 **`y`** 回车。
