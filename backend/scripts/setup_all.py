#!/usr/bin/env python3
"""
一键配置：写入 .env、尝试在 Supabase 执行建表 SQL、检查连接。
运行：cd backend && python scripts/setup_all.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.parse import quote_plus

BACKEND_ROOT = Path(__file__).resolve().parents[1]
ENV_PATH = BACKEND_ROOT / ".env"
MIGRATION = BACKEND_ROOT.parent / "supabase/migrations/001_knowledge_chunks.sql"


def prompt(label: str, optional: bool = False) -> str:
    """Cursor 终端里用普通 input，粘贴 service_role 更稳定。"""
    val = input(f"{label}: ").strip()
    if not val and not optional:
        print("不能为空。")
        sys.exit(1)
    return val


def extract_project_ref(url: str) -> str:
    m = re.search(r"https://([a-z0-9]+)\.supabase\.co", url)
    if not m:
        raise ValueError("Project URL 格式应为 https://xxxxx.supabase.co")
    return m.group(1)


def build_database_urls(project_ref: str, db_password: str, region: str) -> list[str]:
    pwd = quote_plus(db_password)
    return [
        # 东京等区域常用 pooler（Session 模式，端口 5432）
        f"postgresql://postgres.{project_ref}:{pwd}@aws-0-{region}.pooler.supabase.com:5432/postgres",
        # 事务池化（部分网络环境更通）
        f"postgresql://postgres.{project_ref}:{pwd}@aws-0-{region}.pooler.supabase.com:6543/postgres",
        # 旧版直连（若你网络能解析 db.xxx）
        f"postgresql://postgres:{pwd}@db.{project_ref}.supabase.co:5432/postgres",
    ]


def apply_migration(database_url: str) -> None:
    import psycopg2

    sql = MIGRATION.read_text(encoding="utf-8")
    statements: list[str] = []
    buf: list[str] = []
    for line in sql.splitlines():
        stripped = line.strip()
        if stripped.startswith("--"):
            continue
        buf.append(line)
        if stripped.endswith(";"):
            statements.append("\n".join(buf))
            buf = []

    print("\n正在连接数据库并执行建表 SQL …")
    conn = psycopg2.connect(database_url, connect_timeout=15)
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            for stmt in statements:
                stmt = stmt.strip()
                if stmt:
                    cur.execute(stmt)
            cur.execute(
                "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'knowledge_chunks');"
            )
            if not cur.fetchone()[0]:
                raise RuntimeError("表 knowledge_chunks 未创建成功")
        print("✓ 数据库表 knowledge_chunks 已就绪")
    finally:
        conn.close()


def try_apply_migration(project_ref: str, db_password: str, region: str) -> str | None:
    last_err: Exception | None = None
    for url in build_database_urls(project_ref, db_password, region):
        host = url.split("@")[1].split("/")[0]
        print(f"  尝试连接 {host} …")
        try:
            apply_migration(url)
            return url
        except Exception as e:
            last_err = e
            print(f"  ✗ 失败: {e}")
    if last_err:
        raise last_err
    return None


def write_env(values: dict[str, str]) -> None:
    lines = [
        f"SUPABASE_URL={values['SUPABASE_URL']}",
        f"SUPABASE_SERVICE_KEY={values['SUPABASE_SERVICE_KEY']}",
        f"DATABASE_URL={values.get('DATABASE_URL', '')}",
        "",
        f"OPENAI_API_KEY={values.get('OPENAI_API_KEY', '')}",
        f"OPENAI_BASE_URL={values.get('OPENAI_BASE_URL', 'https://api.openai.com/v1')}",
        f"EMBEDDING_MODEL={values.get('EMBEDDING_MODEL', 'text-embedding-3-small')}",
        f"CHAT_MODEL={values.get('CHAT_MODEL', 'gpt-4o-mini')}",
        "",
        "CORS_ORIGINS=http://localhost:3000",
        "",
    ]
    ENV_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(f"✓ 已写入 {ENV_PATH}")


def test_supabase_client(url: str, key: str) -> None:
    from supabase import create_client

    client = create_client(url, key)
    client.table("knowledge_chunks").select("id").limit(1).execute()
    print("✓ Supabase API 连接正常（表已存在）")


def main() -> None:
    print("=" * 50)
    print("文综导师 · 一键配置")
    print("=" * 50)
    print("\n提示：在 Cursor 终端里粘贴密钥时可能不显示字符，属正常。\n")

    supabase_url = prompt("1. Project URL（https://xxx.supabase.co）")
    service_key = prompt("2. service_role key（eyJ 开头那一整串）")
    db_password = prompt("3. Database Password（创建项目时设的）")

    region = input("4. 区域 [日本填 ap-northeast-1，直接回车]: ").strip()
    if not region:
        region = "ap-northeast-1"

    openai = input("5. OpenAI API Key（没有先回车跳过）: ").strip()

    ref = extract_project_ref(supabase_url)
    database_url: str | None = None

    print("\n--- 自动建表 ---")
    try:
        database_url = try_apply_migration(ref, db_password, region)
    except Exception as e:
        print(f"\n自动建表失败：{e}")
        print("\n请改用网页建表（只需做一次）：")
        print("  Supabase 左侧 → SQL Editor → New query")
        print(f"  粘贴文件内容后点 Run：\n  {MIGRATION}")
        manual = input("\n已在网页 SQL Editor 里 Run 成功了吗？[y/N]: ").strip().lower()
        if manual != "y":
            print("请先在网页执行 SQL，再重新运行本脚本。")
            sys.exit(1)
        print("好的，跳过自动建表，继续写入配置…")
        database_url = build_database_urls(ref, db_password, region)[0]

    write_env(
        {
            "SUPABASE_URL": supabase_url,
            "SUPABASE_SERVICE_KEY": service_key,
            "DATABASE_URL": database_url or "",
            "OPENAI_API_KEY": openai,
        }
    )

    try:
        test_supabase_client(supabase_url, service_key)
    except Exception as e:
        print(f"⚠ API 测试：{e}")
        print("  若刚在网页建表，刷新后重试；或检查 service_role 是否复制完整。")

    print("\n" + "=" * 50)
    print("配置完成！启动后端：")
    print("  cd backend && source .venv/bin/activate")
    print("  uvicorn app.main:app --reload --port 8000")
    print("\n浏览器打开 http://localhost:8000/health")
    if not openai:
        print("\n⚠ 未填 OpenAI Key，录入考点/问答需要后续在 .env 补上")
    print("=" * 50)


if __name__ == "__main__":
    main()
