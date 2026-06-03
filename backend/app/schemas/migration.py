from pydantic import BaseModel, Field

from app.core.enums import MigrationStatus


class CrossBorderMigrationRequest(BaseModel):
    student_id: str
    source_org_id: str
    target_org_id: str
    target_class_id: str | None = None


class MigrationLogPublic(BaseModel):
    id: str
    user_id: str
    source_org_id: str
    target_org_id: str
    status: MigrationStatus
    error_message: str | None = None
    created_at: str | None = None
    completed_at: str | None = None


class CrossBorderMigrationResponse(BaseModel):
    migration: MigrationLogPublic
    student_org_id: str
    message: str
