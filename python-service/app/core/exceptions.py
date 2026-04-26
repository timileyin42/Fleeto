from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class AppException(Exception):
    def __init__(self, detail: str, code: str, status_code: int) -> None:
        self.detail = detail
        self.code = code
        self.status_code = status_code
        super().__init__(detail)


async def app_exception_handler(_: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "code": exc.code},
    )


async def generic_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    _ = exc
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "code": "internal_error"},
    )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)
