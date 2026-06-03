from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user
from app.core.exceptions import PlatformError, TenantIsolationError
from app.schemas.org import (
    ActivationCodeBatchCreate,
    ActivationCodeBatchPublic,
    ActivationCodeCreate,
    ActivationCodePublic,
    ClassCreate,
    ClassPublic,
    OrganizationCreate,
    OrganizationPublic,
    OrganizationUpdate,
)
from app.services.org import OrgService

router = APIRouter(prefix="/api/org", tags=["org"])


@router.post("/organizations", response_model=OrganizationPublic)
async def create_organization(
    payload: OrganizationCreate,
    _: Annotated[dict, Depends(get_current_user)],
):
    """平台超管创建租户（骨架：后续可加 super_admin 校验）。"""
    return OrgService.create_organization(payload)


@router.get("/organizations", response_model=list[OrganizationPublic])
async def list_organizations(
    _: Annotated[dict, Depends(get_current_user)],
):
    return OrgService.list_organizations()


@router.patch("/organizations/{org_id}", response_model=OrganizationPublic)
async def update_organization(
    org_id: str,
    payload: OrganizationUpdate,
    _: Annotated[dict, Depends(get_current_user)],
):
    try:
        return OrgService.update_organization(org_id, payload)
    except PlatformError as e:
        raise HTTPException(status_code=404, detail=e.message) from e


@router.post("/{org_id}/classes", response_model=ClassPublic)
async def create_class(
    org_id: str,
    payload: ClassCreate,
    actor: Annotated[dict, Depends(get_current_user)],
):
    try:
        return OrgService.create_class(org_id, payload, actor)
    except TenantIsolationError as e:
        raise HTTPException(status_code=403, detail=e.message) from e


@router.get("/{org_id}/classes", response_model=list[ClassPublic])
async def list_classes(
    org_id: str,
    actor: Annotated[dict, Depends(get_current_user)],
):
    try:
        return OrgService.list_classes(org_id, actor)
    except TenantIsolationError as e:
        raise HTTPException(status_code=403, detail=e.message) from e


@router.post("/{org_id}/activation-codes", response_model=ActivationCodePublic)
async def create_activation_code(
    org_id: str,
    payload: ActivationCodeCreate,
    actor: Annotated[dict, Depends(get_current_user)],
):
    try:
        return OrgService.create_activation_code(org_id, payload, actor)
    except TenantIsolationError as e:
        raise HTTPException(status_code=403, detail=e.message) from e


@router.post("/{org_id}/activation-codes/batch", response_model=ActivationCodeBatchPublic)
async def create_activation_codes_batch(
    org_id: str,
    payload: ActivationCodeBatchCreate,
    actor: Annotated[dict, Depends(get_current_user)],
):
    try:
        return OrgService.create_activation_codes_batch(org_id, payload, actor)
    except TenantIsolationError as e:
        raise HTTPException(status_code=403, detail=e.message) from e
