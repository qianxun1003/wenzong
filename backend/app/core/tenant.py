"""
多租户隔离守卫（Tenant Isolation）

设计原则：
- 所有 ToB 读写在进入 Repository/Service 前必须带上 org_id；
- teacher / org_admin 只能操作自己所属 org_id 下的数据；
- super_admin 可跨租户（运维），但普通 API 默认仍要求显式 org_id 参数以便审计。
"""

from __future__ import annotations

from typing import Any

from app.core.enums import UserRole
from app.core.exceptions import TenantIsolationError


def assert_same_org(actor_org_id: str | None, target_org_id: str, *, actor_role: str) -> None:
    """
    强制校验：目标资源的 org_id 必须与当前操作者一致。
    super_admin 豁免（用于平台级运维接口）。
    """
    if actor_role == UserRole.SUPER_ADMIN.value:
        return
    if not actor_org_id or actor_org_id != target_org_id:
        raise TenantIsolationError(
            f"机构隔离校验失败：操作者 org={actor_org_id}，目标 org={target_org_id}"
        )


def tenant_filter(org_id: str, extra: dict[str, Any] | None = None) -> dict[str, Any]:
    """
    构造 Supabase/PostgREST 查询过滤条件。
    任何班级、花名册、学情查询都必须 spread 此 dict，杜绝漏加 org_id。
    """
    filters = {"org_id": org_id}
    if extra:
        filters.update(extra)
    return filters


def assert_teacher_in_org(teacher: dict, org_id: str) -> None:
    """教师/管理员必须属于该机构且角色合法。"""
    role = teacher.get("role")
    if role not in (UserRole.TEACHER.value, UserRole.ORG_ADMIN.value, UserRole.SUPER_ADMIN.value):
        raise TenantIsolationError("当前账号不是教师或机构管理员")
    assert_same_org(teacher.get("org_id"), org_id, actor_role=role)
