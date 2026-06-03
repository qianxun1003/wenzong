from fastapi import APIRouter, HTTPException

from app.core.exceptions import (
    AuthError,
    OrganizationExpiredException,
    OrganizationFrozenException,
    PlatformError,
)
from app.schemas.auth import AuthResponse, RegisterOrBindRequest
from app.services.auth import AuthService

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register-or-bind", response_model=AuthResponse)
async def register_or_bind(payload: RegisterOrBindRequest):
    try:
        return await AuthService.register_or_bind(payload)
    except AuthError as e:
        raise HTTPException(status_code=401, detail=e.message) from e
    except OrganizationExpiredException as e:
        raise HTTPException(status_code=402, detail=e.message) from e
    except OrganizationFrozenException as e:
        raise HTTPException(status_code=403, detail=e.message) from e
    except PlatformError as e:
        raise HTTPException(status_code=400, detail=e.message) from e
