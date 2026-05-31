from supabase import create_client, Client

from app.config import settings


def get_supabase() -> Client:
    if not settings.supabase_url or not settings.supabase_service_key:
        raise RuntimeError("请配置 SUPABASE_URL 和 SUPABASE_SERVICE_KEY")
    return create_client(settings.supabase_url, settings.supabase_service_key)


async def store_chunks(
    chunks: list[str],
    embeddings: list[list[float]],
    metadata: dict,
) -> int:
    client = get_supabase()
    rows = [
        {
            "content": chunk,
            "embedding": emb,
            **metadata,
        }
        for chunk, emb in zip(chunks, embeddings)
    ]
    client.table("knowledge_chunks").insert(rows).execute()
    return len(rows)


async def search_similar(query_embedding: list[float], limit: int = 5) -> list[dict]:
    client = get_supabase()
    result = client.rpc(
        "match_documents",
        {"query_embedding": query_embedding, "match_count": limit},
    ).execute()
    return result.data or []


async def search_by_keywords(query: str, limit: int = 5) -> list[dict]:
    """测试模式：按关键词匹配，不消耗 Embedding API。"""
    client = get_supabase()
    q = query.strip()
    if not q:
        return []

    result = (
        client.table("knowledge_chunks")
        .select("id, content, tag, source")
        .or_(f"content.ilike.%{q}%,tag.ilike.%{q}%")
        .limit(limit)
        .execute()
    )
    rows = result.data or []

    if rows:
        return [{**r, "similarity": 1.0} for r in rows]

    # 拆词后再试（简单支持中文短句）
    for token in _tokens(q):
        if len(token) < 2:
            continue
        result = (
            client.table("knowledge_chunks")
            .select("id, content, tag, source")
            .or_(f"content.ilike.%{token}%,tag.ilike.%{token}%")
            .limit(limit)
            .execute()
        )
        if result.data:
            return [{**r, "similarity": 0.8} for r in result.data]

    return []


def _tokens(text: str) -> list[str]:
    import re

    parts = re.split(r"[\s，。、？！；：「」『』（）]+", text)
    return [p for p in parts if p]
