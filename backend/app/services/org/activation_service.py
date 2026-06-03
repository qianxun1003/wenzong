"""
机构激活码兑换 · 席位熔断

安全分层：
1. 应用层：调用 PostgreSQL redeem_activation_code()（SECURITY DEFINER）；
2. 数据库层：FOR UPDATE 锁定 organizations + 激活码行，防止超卖席位；
3. 机构状态机：status 必须为 active，且 expire_at 未过期，否则映射为领域异常。

注意：后端使用 service_role 时 RLS 不生效，租户隔离仍依赖 tenant.py；
直连 Supabase 的客户端则同时受 RLS 保护。
"""

from __future__ import annotations

from app.core.exceptions import (
    OrganizationExpiredException,
    OrganizationFrozenException,
    PlatformError,
)
from app.db.client import get_supabase
from app.db.repositories import users as user_repo

# DB 函数抛出的异常标签（与 003_platform_core.sql 中 RAISE 一致）
_DB_ORG_EXPIRED = "ORGANIZATION_EXPIRED"
_DB_ORG_FROZEN = "ORGANIZATION_FROZEN"
_DB_SLOTS_FULL = "ORG_SLOTS_FULL"
_DB_INVALID_CODE = "INVALID_ACTIVATION_CODE"
_DB_ACTIVATION_EXPIRED = "ACTIVATION_EXPIRED"
_DB_ACTIVATION_EXHAUSTED = "ACTIVATION_EXHAUSTED"


class ActivationService:
    @staticmethod
    async def redeem_for_user(*, code: str, user: dict) -> dict:
        user_id = str(user["id"])
        client = get_supabase()

        try:
            result = client.rpc(
                "redeem_activation_code",
                {"p_code": code.strip(), "p_user_id": user_id},
            ).execute()
        except Exception as exc:
            ActivationService._map_db_exception(exc)

        if result.data is None:
            raise PlatformError("激活失败，请稍后重试", code="activation_failed")

        refreshed = user_repo.find_user_by_id(user_id)
        if not refreshed:
            raise PlatformError("用户不存在", code="user_not_found")
        return refreshed

    @staticmethod
    def _map_db_exception(exc: Exception) -> None:
        """将 Postgres RAISE 消息映射为类型化业务异常。"""
        msg = str(exc).upper()

        if _DB_ORG_EXPIRED in msg:
            raise OrganizationExpiredException(
                "机构订阅已过期，无法绑定新学生。请联系机构续费。"
            )
        if _DB_ORG_FROZEN in msg:
            raise OrganizationFrozenException(
                "机构已被冻结，暂时无法使用激活码。"
            )
        if _DB_SLOTS_FULL in msg:
            raise PlatformError(
                "机构学生席位已满，请联系老师扩容。",
                code="org_slots_full",
            )
        if _DB_INVALID_CODE in msg:
            raise PlatformError("激活码无效或已停用", code="invalid_activation_code")
        if _DB_ACTIVATION_EXPIRED in msg:
            raise PlatformError("激活码已过期", code="activation_expired")
        if _DB_ACTIVATION_EXHAUSTED in msg:
            raise PlatformError("激活码已达使用上限", code="activation_exhausted")

        raise PlatformError(f"激活失败：{exc}", code="activation_error")
