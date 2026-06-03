from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.core.exceptions import (
    AuthError,
    MigrationError,
    OrganizationExpiredException,
    OrganizationFrozenException,
    PlatformError,
    TenantIsolationError,
)
from app.routers import (
    auth,
    chat,
    db_management,
    documents,
    knowledge,
    migration,
    org,
    teacher,
)

app = FastAPI(
    title="文综 AI 智能导师 API",
    description="RAG 检索 + 统一账户 + ToB 多租户教学平台",
    version="0.2.0",
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
app.include_router(auth.router)
app.include_router(org.router)
app.include_router(teacher.router)
app.include_router(migration.router)
app.include_router(db_management.router)


@app.exception_handler(PlatformError)
async def platform_error_handler(_: Request, exc: PlatformError):
    status = 403 if isinstance(exc, TenantIsolationError) else 400
    if isinstance(exc, AuthError):
        status = 401
    if isinstance(exc, MigrationError):
        status = 400
    if isinstance(exc, OrganizationExpiredException):
        status = 402
    if isinstance(exc, OrganizationFrozenException):
        status = 403
    return JSONResponse(
        status_code=status,
        content={"detail": exc.message, "code": exc.code},
    )


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
