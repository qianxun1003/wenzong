from __future__ import annotations

from typing import Any

from app.db.client import get_supabase


def get_organization(org_id: str) -> dict | None:
    r = get_supabase().table("organizations").select("*").eq("id", org_id).limit(1).execute()
    rows = r.data or []
    return rows[0] if rows else None


def insert_organization(row: dict[str, Any]) -> dict:
    r = get_supabase().table("organizations").insert(row).execute()
    return (r.data or [row])[0]


def list_organizations() -> list[dict]:
    r = (
        get_supabase()
        .table("organizations")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )
    return r.data or []


def update_organization(org_id: str, patch: dict[str, Any]) -> dict | None:
    if not patch:
        return get_organization(org_id)
    r = (
        get_supabase()
        .table("organizations")
        .update(patch)
        .eq("id", org_id)
        .execute()
    )
    rows = r.data or []
    return rows[0] if rows else None


def count_active_students(org_id: str) -> int:
    """调用 DB 函数，保证席位统计与迁移校验一致。"""
    r = get_supabase().rpc("count_org_students", {"p_org_id": org_id}).execute()
    if r.data is None:
        return 0
    if isinstance(r.data, int):
        return r.data
    return int(r.data)
