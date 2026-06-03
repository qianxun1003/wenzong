from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.db.client import get_supabase


def find_user_by_identity(provider: str, provider_id: str) -> dict | None:
    """
    通过 provider + provider_id 定位用户（OAuth / 手机 / 邮箱统一入口）。
    返回 users 行，并附带 _identity 字段供密码校验。
    """
    client = get_supabase()
    ident = (
        client.table("user_identities")
        .select("*, users(*)")
        .eq("provider", provider)
        .eq("provider_id", provider_id)
        .limit(1)
        .execute()
    )
    rows = ident.data or []
    if not rows:
        return None
    row = rows[0]
    user = row.get("users")
    if not user:
        return None
    user["_identity"] = {
        "id": row["id"],
        "provider": row["provider"],
        "provider_id": row["provider_id"],
        "password_hash": row.get("password_hash"),
    }
    return user


def find_user_by_id(user_id: str) -> dict | None:
    r = get_supabase().table("users").select("*").eq("id", user_id).limit(1).execute()
    rows = r.data or []
    return rows[0] if rows else None


def list_identities_for_user(user_id: str) -> list[dict]:
    r = (
        get_supabase()
        .table("user_identities")
        .select("provider, provider_id, verified_at")
        .eq("user_id", user_id)
        .execute()
    )
    return r.data or []


def insert_user(row: dict[str, Any]) -> dict:
    r = get_supabase().table("users").insert(row).execute()
    return (r.data or [row])[0]


def insert_identity(
    *,
    user_id: str,
    provider: str,
    provider_id: str,
    password_hash: str | None = None,
    metadata: dict | None = None,
) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    row = {
        "user_id": user_id,
        "provider": provider,
        "provider_id": provider_id,
        "password_hash": password_hash,
        "metadata": metadata or {},
        "verified_at": now,
    }
    r = get_supabase().table("user_identities").insert(row).execute()
    return (r.data or [row])[0]


def update_identity_password(identity_id: str, password_hash: str) -> None:
    get_supabase().table("user_identities").update(
        {"password_hash": password_hash}
    ).eq("id", identity_id).execute()
