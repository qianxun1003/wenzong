from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.services.document_parser import chunk_text
from app.services.embeddings import embed_texts
from app.services.supabase_store import (
    embed_inputs_for_chunks,
    group_knowledge_chunks,
    list_knowledge_chunks,
    store_chunks,
)

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])


class KnowledgeCreate(BaseModel):
    tag: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1, max_length=50000)


class KnowledgeChunkItem(BaseModel):
    id: str
    content: str
    created_at: str | None = None


class KnowledgeGroupItem(BaseModel):
    tag: str
    source: str
    chunk_count: int
    preview: str
    created_at: str | None = None
    chunks: list[KnowledgeChunkItem]


class KnowledgeListResponse(BaseModel):
    groups: list[KnowledgeGroupItem]
    total_chunks: int
    total_groups: int


class KnowledgeResponse(BaseModel):
    id: str
    tag: str
    content: str
    chunks: int


@router.get("", response_model=KnowledgeListResponse)
async def list_knowledge(
    q: str | None = Query(default=None, max_length=200),
    limit: int = Query(default=200, ge=1, le=500),
):
    try:
        rows, total = await list_knowledge_chunks(query=q, limit=limit)
        groups = group_knowledge_chunks(rows)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"读取失败：{e}") from e

    return KnowledgeListResponse(
        groups=[KnowledgeGroupItem(**group) for group in groups],
        total_chunks=total,
        total_groups=len(groups),
    )


@router.post("", response_model=KnowledgeResponse)
async def create_knowledge(entry: KnowledgeCreate):
    try:
        tag = entry.tag.strip()
        content = entry.content.strip()
        chunks = chunk_text(content, chunk_size=600, overlap=80)
        if not chunks:
            chunks = [content]
        metadata = {"tag": tag, "source": "direct_entry"}
        embeddings = await embed_texts(embed_inputs_for_chunks(chunks, metadata))
        count = await store_chunks(chunks, embeddings, metadata=metadata)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"保存失败：{e}") from e

    return KnowledgeResponse(
        id="created",
        tag=entry.tag.strip(),
        content=entry.content.strip(),
        chunks=count,
    )
