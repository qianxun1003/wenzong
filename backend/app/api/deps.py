"""FastAPI 依赖：从 Bearer Token 解析当前用户。"""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_access_token
from app.db.client import get_supabase

_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> dict:
    if not creds or creds.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="需要登录")
    payload = decode_access_token(creds.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="无效令牌")

    client = get_supabase()
    result = client.table("users").select("*").eq("id", user_id).limit(1).execute()
    rows = result.data or []
    if not rows or rows[0].get("status") != "active":
        raise HTTPException(status_code=401, detail="用户不存在或已停用")
    return rows[0]
