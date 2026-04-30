"""
JWT auth for FastAPI. Validates Bearer tokens signed by the Next.js proxy.
"""
import os
from typing import Optional

import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

load_dotenv()

ALGORITHM = "HS256"
security = HTTPBearer(auto_error=False)


def get_jwt_secret() -> str:
    return os.environ.get("JWT_SECRET") or os.environ.get("NEXTAUTH_SECRET", "")


def get_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> str:
    secret = get_jwt_secret()
    if not secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="JWT_SECRET or NEXTAUTH_SECRET must be configured",
        )

    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(
            credentials.credentials,
            secret,
            algorithms=[ALGORITHM],
        )
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user_id",
            )
        return str(user_id)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Auth error: {error}"
        )


def get_user_id_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[str]:
    secret = get_jwt_secret()
    if not credentials or not credentials.credentials or not secret:
        return None
    try:
        payload = jwt.decode(
            credentials.credentials,
            secret,
            algorithms=[ALGORITHM],
        )
        return str(payload.get("user_id") or "")
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None
