"""与 PostgreSQL 枚举保持一致的领域枚举。"""

from enum import StrEnum


class AppRegion(StrEnum):
    CN = "CN"
    JP = "JP"


class AiModelRoute(StrEnum):
    DOMESTIC = "domestic"
    GLOBAL_HYBRID = "global_hybrid"


class UserRole(StrEnum):
    STUDENT = "student"
    ORG_STUDENT = "org_student"
    TEACHER = "teacher"
    ORG_ADMIN = "org_admin"
    SUPER_ADMIN = "super_admin"


class UserStatus(StrEnum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DELETED = "deleted"


class OrgStatus(StrEnum):
    ACTIVE = "active"
    EXPIRED = "expired"
    FROZEN = "frozen"


class MigrationStatus(StrEnum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class IdentityProvider(StrEnum):
    PHONE = "phone"
    EMAIL = "email"
    WECHAT = "wechat"
    GOOGLE = "google"
    APPLE = "apple"


STANDARD_ID_KEYS = (
    "knowledge_point_id",
    "question_id",
    "error_tag_id",
)
