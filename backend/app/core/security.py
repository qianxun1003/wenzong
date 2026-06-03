"""密码哈希与 JWT 签发（服务间/前后端会话骨架）。"""

from __future__ import annotations

import secrets
import uuid
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str | None) -> bool:
    if not hashed:
        return False
    return pwd_context.verify(plain, hashed)


def new_union_id() -> str:
    """跨端统一业务标识（可与微信 unionId 对齐或独立生成）。"""
    return f"u_{uuid.uuid4().hex}"


def create_access_token(
    user_id: str,
    *,
    role: str,
    region: str,
    org_id: str | None = None,
    expires_minutes: int | None = None,
) -> str:
    ttl = expires_minutes if expires_minutes is not None else settings.jwt_expire_minutes
    now = datetime.now(timezone.utc)
    # app_metadata 供 Supabase RLS（auth.jwt() -> app_metadata）读取
    app_meta = {
        "role": role,
        "region": region,
        "org_id": org_id,
    }
    payload = {
        "sub": user_id,
        "role": role,
        "region": region,
        "org_id": org_id,
        "app_metadata": app_meta,
        "user_metadata": app_meta,
        "iat": now,
        "exp": now + timedelta(minutes=ttl),
        "jti": secrets.token_hex(8),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
    except JWTError as exc:
        from app.core.exceptions import AuthError

        raise AuthError("无效或已过期的登录凭证") from exc
