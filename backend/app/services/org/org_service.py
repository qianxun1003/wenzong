"""机构与班级 CRUD（所有写操作携带 org_id）。"""

from __future__ import annotations

import secrets

from app.core.enums import OrgStatus, UserRole
from app.core.exceptions import PlatformError, TenantIsolationError
from app.core.tenant import assert_same_org, tenant_filter
from app.db.client import get_supabase
from app.db.repositories import organizations as org_repo
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


class OrgService:
    @staticmethod
    def _to_org_public(row: dict) -> OrganizationPublic:
        return OrganizationPublic(
            id=str(row["id"]),
            name=row["name"],
            region=row["region"],
            status=row["status"],
            expire_at=row.get("expire_at"),
            student_slots_limit=row["student_slots_limit"],
            ai_model_route=row.get("ai_model_route", "domestic"),
            cross_border_migration_enabled=bool(row.get("cross_border_migration_enabled", False)),
        )

    @staticmethod
    def create_organization(payload: OrganizationCreate) -> OrganizationPublic:
        row = org_repo.insert_organization(
            {
                "name": payload.name.strip(),
                "region": payload.region.value,
                "status": OrgStatus.ACTIVE.value,
                "student_slots_limit": payload.student_slots_limit,
                "expire_at": payload.expire_at.isoformat() if payload.expire_at else None,
                "ai_model_route": payload.ai_model_route.value,
                "cross_border_migration_enabled": payload.cross_border_migration_enabled,
            }
        )
        return OrgService._to_org_public(row)

    @staticmethod
    def list_organizations() -> list[OrganizationPublic]:
        return [OrgService._to_org_public(r) for r in org_repo.list_organizations()]

    @staticmethod
    def update_organization(org_id: str, payload: OrganizationUpdate) -> OrganizationPublic:
        patch: dict = {}
        if payload.student_slots_limit is not None:
            patch["student_slots_limit"] = payload.student_slots_limit
        if payload.expire_at is not None:
            patch["expire_at"] = payload.expire_at.isoformat()
        if payload.ai_model_route is not None:
            patch["ai_model_route"] = payload.ai_model_route.value
        if payload.cross_border_migration_enabled is not None:
            patch["cross_border_migration_enabled"] = payload.cross_border_migration_enabled
        row = org_repo.update_organization(org_id, patch)
        if not row:
            raise PlatformError("机构不存在", code="org_not_found")
        return OrgService._to_org_public(row)

    @staticmethod
    def create_class(org_id: str, payload: ClassCreate, actor: dict) -> ClassPublic:
        assert_same_org(actor.get("org_id"), org_id, actor_role=actor["role"])
        if actor["role"] not in (
            UserRole.TEACHER.value,
            UserRole.ORG_ADMIN.value,
            UserRole.SUPER_ADMIN.value,
        ):
            raise TenantIsolationError("仅教师或机构管理员可创建班级")

        row = {
            "org_id": org_id,
            "name": payload.name.strip(),
            "teacher_id": payload.teacher_id or actor["id"],
        }
        r = get_supabase().table("classes").insert(row).execute()
        data = (r.data or [row])[0]
        return ClassPublic(
            id=str(data["id"]),
            org_id=str(data["org_id"]),
            name=data["name"],
            teacher_id=data.get("teacher_id"),
        )

    @staticmethod
    def create_activation_code(
        org_id: str,
        payload: ActivationCodeCreate,
        actor: dict,
    ) -> ActivationCodePublic:
        assert_same_org(actor.get("org_id"), org_id, actor_role=actor["role"])
        code = (payload.code or secrets.token_urlsafe(8)).upper()
        row = {
            "org_id": org_id,
            "code": code,
            "class_id": payload.class_id,
            "max_uses": payload.max_uses,
            "expires_at": payload.expires_at.isoformat() if payload.expires_at else None,
            "created_by": actor["id"],
        }
        r = get_supabase().table("activation_codes").insert(row).execute()
        data = (r.data or [row])[0]
        return ActivationCodePublic(
            id=str(data["id"]),
            org_id=str(data["org_id"]),
            code=data["code"],
            class_id=data.get("class_id"),
            max_uses=data["max_uses"],
            used_count=data.get("used_count", 0),
            is_active=data.get("is_active", True),
        )

    @staticmethod
    def create_activation_codes_batch(
        org_id: str,
        payload: ActivationCodeBatchCreate,
        actor: dict,
    ) -> ActivationCodeBatchPublic:
        assert_same_org(actor.get("org_id"), org_id, actor_role=actor["role"])
        codes: list[str] = []
        for _ in range(payload.count):
            created = OrgService.create_activation_code(
                org_id,
                ActivationCodeCreate(max_uses=payload.max_uses),
                actor,
            )
            codes.append(created.code)
        return ActivationCodeBatchPublic(org_id=org_id, codes=codes)

    @staticmethod
    def list_classes(org_id: str, actor: dict) -> list[ClassPublic]:
        assert_same_org(actor.get("org_id"), org_id, actor_role=actor["role"])
        r = (
            get_supabase()
            .table("classes")
            .select("*")
            .match(tenant_filter(org_id))
            .order("created_at", desc=True)
            .execute()
        )
        return [
            ClassPublic(
                id=str(c["id"]),
                org_id=str(c["org_id"]),
                name=c["name"],
                teacher_id=c.get("teacher_id"),
            )
            for c in (r.data or [])
        ]
