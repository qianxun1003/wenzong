from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.document_parser import chunk_text
from app.services.embeddings import embed_texts
from app.services.supabase_store import store_chunks

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])


class KnowledgeCreate(BaseModel):
    tag: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1, max_length=50000)


class KnowledgeResponse(BaseModel):
    id: str
    tag: str
    content: str
    chunks: int


@router.post("", response_model=KnowledgeResponse)
async def create_knowledge(entry: KnowledgeCreate):
    try:
        chunks = chunk_text(entry.content.strip(), chunk_size=600, overlap=80)
        if not chunks:
            chunks = [entry.content.strip()]
        embeddings = await embed_texts(chunks)
        count = await store_chunks(
            chunks,
            embeddings,
            metadata={"tag": entry.tag.strip(), "source": "direct_entry"},
        )
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
