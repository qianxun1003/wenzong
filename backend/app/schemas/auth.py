from pydantic import BaseModel, EmailStr, Field

from app.core.enums import AppRegion


class RegisterOrBindRequest(BaseModel):
    phone: str | None = Field(default=None, max_length=20)
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=6, max_length=128)
    region: AppRegion = AppRegion.CN
    display_name: str | None = Field(default=None, max_length=100)
    activation_code: str | None = Field(default=None, max_length=64)
    # 预留：provider=wechat|google|apple 时传 provider_id，与 OAuth 回调对齐
    oauth_provider: str | None = Field(default=None, max_length=32)
    oauth_provider_id: str | None = Field(default=None, max_length=256)


class UserPublic(BaseModel):
    id: str
    phone: str | None = None
    email: str | None = None
    role: str
    region: str
    org_id: str | None = None
    status: str = "active"


class AuthResponse(BaseModel):
    user: UserPublic
    access_token: str
    token_type: str = "bearer"
