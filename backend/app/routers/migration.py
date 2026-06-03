from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user
from app.core.exceptions import MigrationError, TenantIsolationError
from app.core.tenant import assert_same_org
from app.schemas.migration import CrossBorderMigrationRequest, CrossBorderMigrationResponse
from app.services.migration import MigrationService

router = APIRouter(prefix="/api/migration", tags=["migration"])


@router.post("/cross-border", response_model=CrossBorderMigrationResponse)
async def initiate_cross_border_migration(
    payload: CrossBorderMigrationRequest,
    actor: Annotated[dict, Depends(get_current_user)],
):
    """
    国内机构 → 日本私塾 学情交接。
    仅源/目标机构管理员或 super_admin 可发起。
    """
    role = actor.get("role")
    org_id = actor.get("org_id")
    if role not in ("org_admin", "super_admin", "teacher"):
        raise HTTPException(status_code=403, detail="无权发起迁移")
    if role != "super_admin":
        try:
            assert_same_org(org_id, payload.source_org_id, actor_role=role)
        except TenantIsolationError as e:
            raise HTTPException(status_code=403, detail=e.message) from e

    try:
        return await MigrationService.initiate_cross_border_migration(
            student_id=payload.student_id,
            source_org_id=payload.source_org_id,
            target_org_id=payload.target_org_id,
            target_class_id=payload.target_class_id,
            initiated_by=str(actor["id"]),
        )
    except MigrationError as e:
        raise HTTPException(status_code=400, detail=e.message) from e
