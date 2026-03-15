from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ErrorResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    code: str = Field(description="Application specific error code")
    message: str = Field(description="Human readable error message")
    details: Any | None = Field(default=None, description="Optional extra details")


class HealthResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: str = "ok"
    service: str
    environment: str
