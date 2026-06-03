from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_user
from app.schemas.db_management import DbUploadLogCreate, DbUploadLogPublic
from app.services.db_management import DbUploadService

router = APIRouter(prefix="/api/db-management", tags=["db-management"])


@router.post("/upload-logs", response_model=DbUploadLogPublic)
async def create_upload_log(
    payload: DbUploadLogCreate,
    actor: Annotated[dict, Depends(get_current_user)],
):
    """记录大纲/题库包上传（元数据）；文件实体可接 Supabase Storage。"""
    return DbUploadService.record_upload(payload, uploaded_by=str(actor["id"]))


@router.get("/upload-logs", response_model=list[DbUploadLogPublic])
async def list_upload_logs(
    _: Annotated[dict, Depends(get_current_user)],
    limit: int = Query(default=50, ge=1, le=200),
):
    return DbUploadService.list_logs(limit=limit)
