from fastapi import Request, FastAPI
from fastapi.responses import JSONResponse
from core.logging import logger

class APIException(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code

def setup_exception_handlers(app: FastAPI):
    @app.exception_handler(APIException)
    async def api_exception_handler(request: Request, exc: APIException):
        logger.error(f"APIError at {request.url}: {exc.message}")
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.message, "success": False}
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.exception(f"Unhandled server error at {request.url}")
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error. Please try again later.", "success": False}
        )
