from app.db.client import get_supabase

__all__ = ["get_supabase", "embed_inputs_for_chunks", "store_chunks", "search_similar"]


def embed_inputs_for_chunks(chunks: list[str], metadata: dict) -> list[str]:
    """向量化时带上 tag，避免正文过短导致语义检索失配。"""
    tag = (metadata.get("tag") or "").strip()
    if not tag:
        return chunks
    return [f"{tag}\n{chunk}" for chunk in chunks]


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

    # 拆词后再试（支持中文自然问句，如「罗斯福新政的五法一政一制度是什么」）
    for token in sorted(_tokens(q), key=len, reverse=True):
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

    parts = re.split(r"[\s，。、？！？；：「」『』（）?!]+", text)
    tokens: list[str] = []
    seen: set[str] = set()

    def add(fragment: str) -> None:
        fragment = fragment.strip()
        if len(fragment) >= 2 and fragment not in seen:
            seen.add(fragment)
            tokens.append(fragment)

    for part in parts:
        if not part:
            continue
        add(part)
        # 长中文问句没有标点时，用 3～6 字滑动窗口拆出可命中 tag 的片段
        if len(part) > 4:
            for size in (6, 5, 4, 3):
                if len(part) >= size:
                    for i in range(len(part) - size + 1):
                        add(part[i : i + size])
                    break

    return tokens


async def list_knowledge_chunks(
    query: str | None = None,
    limit: int = 200,
) -> tuple[list[dict], int]:
    client = get_supabase()
    q = client.table("knowledge_chunks").select(
        "id, content, tag, source, created_at", count="exact"
    )
    if query and query.strip():
        term = query.strip()
        q = q.or_(f"content.ilike.%{term}%,tag.ilike.%{term}%,source.ilike.%{term}%")
    result = q.order("created_at", desc=True).limit(limit).execute()
    rows = result.data or []
    total = result.count if result.count is not None else len(rows)
    return rows, total


def group_knowledge_chunks(rows: list[dict]) -> list[dict]:
    """按 tag + source 聚合，便于教师后台浏览。"""
    groups: dict[tuple[str, str], dict] = {}

    for row in rows:
        tag = (row.get("tag") or "未分类").strip()
        source = (row.get("source") or "unknown").strip()
        key = (tag, source)
        content = str(row.get("content") or "").strip()
        created_at = row.get("created_at")

        if key not in groups:
            groups[key] = {
                "tag": tag,
                "source": source,
                "chunk_count": 0,
                "preview": content,
                "created_at": created_at,
                "chunks": [],
            }

        group = groups[key]
        group["chunk_count"] += 1
        group["chunks"].append(
            {
                "id": str(row.get("id")),
                "content": content,
                "created_at": created_at,
            }
        )
        if created_at and (
            not group["created_at"] or str(created_at) > str(group["created_at"])
        ):
            group["created_at"] = created_at

    ordered = sorted(
        groups.values(),
        key=lambda g: str(g.get("created_at") or ""),
        reverse=True,
    )
    for group in ordered:
        if len(group["preview"]) > 160:
            group["preview"] = group["preview"][:160] + "…"
    return ordered
