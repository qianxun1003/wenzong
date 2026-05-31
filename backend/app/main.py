from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers import chat, documents, knowledge

app = FastAPI(
    title="文综 AI 智能导师 API",
    description="RAG 检索 + 大模型问答 · 教师知识库管理",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(documents.router)
app.include_router(knowledge.router)


@app.exception_handler(RuntimeError)
async def runtime_error_handler(_: Request, exc: RuntimeError):
    return JSONResponse(status_code=503, content={"detail": str(exc)})


@app.get("/health")
async def health():
    provider = settings.resolved_provider
    llm = settings.llm_ready
    return {
        "status": "ok",
        "supabase": bool(settings.supabase_url and settings.supabase_service_key),
        "llm": llm,
        "provider": provider or None,
        "mock": provider == "mock",
        "openai": llm and provider == "openai",
        "gemini": llm and provider == "gemini",
    }
