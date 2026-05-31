from typing import Annotated

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.document_parser import chunk_text, parse_file
from app.services.embeddings import embed_texts
from app.services.supabase_store import store_chunks

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.post("/upload")
async def upload_documents(
    files: Annotated[list[UploadFile], File(description="讲义文件，支持多选")],
):
    if not files:
        raise HTTPException(status_code=400, detail="请选择至少一个文件")

    results = []
    for file in files:
        try:
            content = await file.read()
            filename = file.filename or "unknown"
            text = parse_file(filename, content)
            if not text.strip():
                raise ValueError("未能从文件中提取到文字内容")

            chunks = chunk_text(text)
            embeddings = await embed_texts(chunks)
            count = await store_chunks(
                chunks,
                embeddings,
                metadata={"source": filename, "tag": filename},
            )
            results.append(
                {"filename": filename, "chunks": count, "status": "success"}
            )
        except RuntimeError as e:
            results.append(
                {
                    "filename": file.filename,
                    "chunks": 0,
                    "status": "error",
                    "message": str(e),
                }
            )
        except Exception as e:
            results.append(
                {
                    "filename": file.filename,
                    "chunks": 0,
                    "status": "error",
                    "message": str(e),
                }
            )
    return results
