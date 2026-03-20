from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from pydantic import BaseModel

from app.core.config import get_settings


class TokenPayload(BaseModel):
    candidate_id: str
    email: str
    exp: datetime | None = None
    iat: datetime | None = None
    type: str = "access"  # access or refresh


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class TokenManager:
    def __init__(self):
        self.settings = get_settings()

    def create_tokens(self, candidate_id: str, email: str) -> TokenResponse:
        """Create access and refresh tokens for candidate."""
        access_token = self._create_token(
            data={"candidate_id": candidate_id, "email": email, "type": "access"},
            expires_delta=timedelta(hours=self.settings.jwt_access_token_expire_hours),
        )

        refresh_token = self._create_token(
            data={"candidate_id": candidate_id, "email": email, "type": "refresh"},
            expires_delta=timedelta(days=self.settings.jwt_refresh_token_expire_days),
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=int(self.settings.jwt_access_token_expire_hours * 3600),
        )

    def _create_token(self, data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
        """Create JWT token."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(hours=1)

        to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})

        encoded_jwt = jwt.encode(
            to_encode,
            self.settings.jwt_secret_key,
            algorithm=self.settings.jwt_algorithm,
        )
        return encoded_jwt

    def verify_token(self, token: str) -> TokenPayload | None:
        """Verify and decode JWT token."""
        try:
            payload = jwt.decode(
                token,
                self.settings.jwt_secret_key,
                algorithms=[self.settings.jwt_algorithm],
            )
            candidate_id: str = payload.get("candidate_id")
            email: str = payload.get("email")
            token_type: str = payload.get("type", "access")

            if not candidate_id or not email:
                return None

            return TokenPayload(
                candidate_id=candidate_id,
                email=email,
                exp=datetime.fromtimestamp(payload.get("exp"), tz=timezone.utc),
                iat=datetime.fromtimestamp(payload.get("iat"), tz=timezone.utc),
                type=token_type,
            )
        except (jwt.InvalidTokenError, jwt.ExpiredSignatureError, KeyError):
            return None

    def refresh_access_token(self, refresh_token: str) -> TokenResponse | None:
        """Generate new access token from refresh token."""
        payload = self.verify_token(refresh_token)
        if not payload or payload.type != "refresh":
            return None

        return self.create_tokens(payload.candidate_id, payload.email)


def get_token_manager() -> TokenManager:
    """Get token manager instance."""
    return TokenManager()
