from typing import Literal

from pydantic import BaseModel, ConfigDict


class LoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    username: str
    password: str


class LoginResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    authenticated: bool
    role: Literal["hr", "candidate"]
    message: str
