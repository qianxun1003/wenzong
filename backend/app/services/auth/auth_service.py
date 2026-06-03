"""
统一账户：registerOrBind

设计要点（OAuth 解耦）：
- users 表仅存 id / role / region / org_id / status；
- 一切登录凭证落在 user_identities(provider, provider_id, password_hash?)；
- 路由规则：先用 provider+provider_id 查身份，再挂载到 user_id；
- 国内手机、微信 OpenID、海外邮箱/Google/Apple 均走同一套绑定逻辑。
"""

from __future__ import annotations

from app.core.enums import AppRegion, IdentityProvider, UserRole, UserStatus
from app.core.exceptions import AuthError
from app.core.security import create_access_token, hash_password, verify_password
from app.db.client import get_supabase
from app.db.repositories import users as user_repo
from app.schemas.auth import AuthResponse, RegisterOrBindRequest, UserPublic
from app.services.org.activation_service import ActivationService


class AuthService:
    @staticmethod
    async def register_or_bind(payload: RegisterOrBindRequest) -> AuthResponse:
        provider, provider_id = AuthService._resolve_provider_pair(payload)
        if not provider_id:
            raise AuthError("请提供有效的登录凭证（手机号或邮箱）")

        identity_user = user_repo.find_user_by_identity(provider, provider_id)
        is_new = identity_user is None

        if is_new:
            user = AuthService._register_new_user(payload, provider, provider_id)
        else:
            user = AuthService._login_existing_user(payload, identity_user)

        if payload.activation_code:
            user = await ActivationService.redeem_for_user(
                code=payload.activation_code.strip(),
                user=user,
            )

        identities = user_repo.list_identities_for_user(str(user["id"]))
        token = create_access_token(
            str(user["id"]),
            role=user["role"],
            region=user["region"],
            org_id=user.get("org_id"),
        )
        return AuthResponse(
            user=AuthService._to_public(user, identities),
            access_token=token,
        )

    @staticmethod
    def _resolve_provider_pair(payload: RegisterOrBindRequest) -> tuple[str, str]:
        # OAuth：微信 OpenID / Google sub / Apple sub 等
        if payload.oauth_provider and payload.oauth_provider_id:
            provider = payload.oauth_provider.strip().lower()
            allowed = {p.value for p in IdentityProvider}
            if provider not in allowed:
                raise AuthError(f"不支持的登录渠道：{provider}")
            return provider, payload.oauth_provider_id.strip()
        if payload.phone:
            return IdentityProvider.PHONE.value, payload.phone.strip()
        if payload.email:
            return IdentityProvider.EMAIL.value, str(payload.email).lower().strip()
        return "", ""

    @staticmethod
    def _register_new_user(
        payload: RegisterOrBindRequest,
        provider: str,
        provider_id: str,
    ) -> dict:
        if provider in (IdentityProvider.EMAIL.value, IdentityProvider.PHONE.value):
            if not payload.password:
                raise AuthError("新用户注册需要设置密码")

        user = user_repo.insert_user(
            {
                "role": UserRole.STUDENT.value,
                "region": payload.region.value,
                "status": UserStatus.ACTIVE.value,
            }
        )
        uid = str(user["id"])
        password_hash = (
            hash_password(payload.password) if payload.password else None
        )
        user_repo.insert_identity(
            user_id=uid,
            provider=provider,
            provider_id=provider_id,
            password_hash=password_hash,
            metadata={"display_name": payload.display_name}
            if payload.display_name
            else {},
        )
        AuthService._ensure_student_profile(uid, org_id=None)
        return user_repo.find_user_by_id(uid) or user

    @staticmethod
    def _login_existing_user(payload: RegisterOrBindRequest, user: dict) -> dict:
        if user.get("status") != UserStatus.ACTIVE.value:
            raise AuthError("账号已停用")

        identity = user.get("_identity") or {}
        provider = identity.get("provider")

        if provider in (IdentityProvider.EMAIL.value, IdentityProvider.PHONE.value):
            if not payload.password:
                raise AuthError("登录需要密码")
            if not verify_password(payload.password, identity.get("password_hash")):
                raise AuthError("凭证或密码错误")
        elif payload.password:
            # 第三方 OAuth 会话不应要求密码；若传入则忽略
            pass

        return user

    @staticmethod
    def _to_public(user: dict, identities: list[dict]) -> UserPublic:
        phone = None
        email = None
        for ident in identities:
            if ident["provider"] == IdentityProvider.PHONE.value:
                phone = ident["provider_id"]
            if ident["provider"] == IdentityProvider.EMAIL.value:
                email = ident["provider_id"]
        return UserPublic(
            id=str(user["id"]),
            phone=phone,
            email=email,
            role=user["role"],
            region=user["region"],
            org_id=user.get("org_id"),
            status=user.get("status", UserStatus.ACTIVE.value),
        )

    @staticmethod
    def _ensure_student_profile(user_id: str, org_id: str | None) -> None:
        client = get_supabase()
        existing = (
            client.table("student_profiles")
            .select("user_id")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        if existing.data:
            return
        client.table("student_profiles").insert(
            {
                "user_id": user_id,
                "org_id": org_id,
                "error_matrix": {},
                "ability_snapshot": {},
            }
        ).execute()
