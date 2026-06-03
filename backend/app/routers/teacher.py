from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.deps import get_current_user
from app.core.exceptions import PlatformError, TenantIsolationError
from app.schemas.teacher import TeacherDashboardResponse
from app.services.teacher import TeacherDashboardService

router = APIRouter(prefix="/api/teacher", tags=["teacher"])


@router.get("/dashboard/analytics", response_model=TeacherDashboardResponse)
async def get_student_analytics(
    org_id: str = Query(..., description="当前机构 ID，必须与登录用户 org 一致"),
    class_id: str | None = Query(default=None),
    actor: Annotated[dict, Depends(get_current_user)] = None,
):
    """
    ToB 学情看板：学习进度、错题 Top5、薄弱知识点。
    teacher_id 取自 JWT 对应用户。
    """
    try:
        return await TeacherDashboardService.get_student_analytics(
            teacher_id=str(actor["id"]),
            org_id=org_id,
            class_id=class_id,
        )
    except TenantIsolationError as e:
        raise HTTPException(status_code=403, detail=e.message) from e
    except PlatformError as e:
        raise HTTPException(status_code=400, detail=e.message) from e
