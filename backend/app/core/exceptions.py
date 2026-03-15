from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.schemas.common import ErrorResponse


class AppException(Exception):
    def __init__(
        self,
        *,
        code: str,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: dict | list | str | None = None,
    ) -> None:
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)


async def app_exception_handler(_: Request, exc: AppException) -> JSONResponse:
    payload = ErrorResponse(code=exc.code, message=exc.message, details=exc.details)
    return JSONResponse(status_code=exc.status_code, content=payload.model_dump())


async def http_exception_handler(_: Request, exc: StarletteHTTPException) -> JSONResponse:
    payload = ErrorResponse(
        code="http_error",
        message=str(exc.detail),
        details={"status_code": exc.status_code},
    )
    return JSONResponse(status_code=exc.status_code, content=payload.model_dump())


async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    payload = ErrorResponse(
        code="validation_error",
        message="Request validation failed",
        details=exc.errors(),
    )
    return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content=payload.model_dump())


async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    payload = ErrorResponse(
        code="internal_server_error",
        message="An unexpected error occurred",
        details=str(exc),
    )
    return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=payload.model_dump())
