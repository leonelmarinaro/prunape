from dataclasses import dataclass
from functools import lru_cache

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from backend.config import settings


@dataclass
class ClerkUser:
    user_id: str
    email: str


_bearer = HTTPBearer(auto_error=False)


@lru_cache(maxsize=1)
def _fetch_jwks(jwks_url: str) -> dict:
    resp = httpx.get(jwks_url, timeout=10)
    resp.raise_for_status()
    return resp.json()


def current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> ClerkUser:
    # Dev mode: no JWKS URL configured — allow all requests
    if not settings.CLERK_JWKS_URL:
        if credentials is None:
            return ClerkUser(user_id="dev", email="dev@local")
        try:
            payload = jwt.get_unverified_claims(credentials.credentials)
            return ClerkUser(
                user_id=payload.get("sub", "dev"),
                email=payload.get("email", "dev@local"),
            )
        except JWTError:
            return ClerkUser(user_id="dev", email="dev@local")

    # Prod mode: verify JWT against Clerk JWKS
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autorizado",
        )

    try:
        jwks = _fetch_jwks(settings.CLERK_JWKS_URL)
        unverified_header = jwt.get_unverified_header(credentials.credentials)
        kid = unverified_header.get("kid")
        key = next(
            (k for k in jwks.get("keys", []) if k.get("kid") == kid),
            None,
        )
        if key is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No autorizado",
            )
        payload = jwt.decode(
            credentials.credentials,
            key,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autorizado",
        )

    email = payload.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: token sin email",
        )

    return ClerkUser(user_id=payload.get("sub", ""), email=email)
