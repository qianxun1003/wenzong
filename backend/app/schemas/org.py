from datetime import datetime

from pydantic import BaseModel, Field

from app.core.enums import AiModelRoute, AppRegion, OrgStatus


class OrganizationCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    region: AppRegion = AppRegion.CN
    student_slots_limit: int = Field(default=50, ge=1, le=100_000)
    expire_at: datetime | None = None
    ai_model_route: AiModelRoute = AiModelRoute.DOMESTIC
    cross_border_migration_enabled: bool = False


class OrganizationUpdate(BaseModel):
    student_slots_limit: int | None = Field(default=None, ge=1, le=100_000)
    expire_at: datetime | None = None
    ai_model_route: AiModelRoute | None = None
    cross_border_migration_enabled: bool | None = None


class OrganizationPublic(BaseModel):
    id: str
    name: str
    region: str
    status: str
    expire_at: str | None = None
    student_slots_limit: int
    ai_model_route: str = AiModelRoute.DOMESTIC.value
    cross_border_migration_enabled: bool = False


class ClassCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    teacher_id: str | None = None


class ClassPublic(BaseModel):
    id: str
    org_id: str
    name: str
    teacher_id: str | None = None


class ActivationCodeCreate(BaseModel):
    code: str | None = Field(default=None, max_length=32)
    class_id: str | None = None
    max_uses: int = Field(default=100, ge=1)
    expires_at: datetime | None = None


class ActivationCodeBatchCreate(BaseModel):
    count: int = Field(default=10, ge=1, le=100)
    max_uses: int = Field(default=1, ge=1)


class ActivationCodeBatchPublic(BaseModel):
    org_id: str
    codes: list[str]


class ActivationCodePublic(BaseModel):
    id: str
    org_id: str
    code: str
    class_id: str | None = None
    max_uses: int
    used_count: int
    is_active: bool
