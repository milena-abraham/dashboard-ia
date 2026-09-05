from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from api.routes import analysis, export, chat, narrative
from core.config import get_settings
from core.exceptions import setup_exception_handlers
from core.logging import logger

settings = get_settings()

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# Set up global exception handlers
setup_exception_handlers(app)

@app.middleware("http")
async def add_cors_headers_middleware(request: Request, call_next):
    if request.method == "OPTIONS":
        response = Response(status_code=200)
    else:
        response = await call_next(request)
        
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Primary API V1 endpoints
app.include_router(analysis.router, prefix=settings.API_V1_STR)
app.include_router(export.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(narrative.router, prefix=settings.API_V1_STR)

# Legacy aliases without /v1 prefix for full compatibility
app.include_router(analysis.router, prefix="/api")
app.include_router(export.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(narrative.router, prefix="/api")

@app.get("/api/health")
@app.get(f"{settings.API_V1_STR}/health")
@app.get("/health")
def health():
    return {"status": "ok", "service": settings.PROJECT_NAME}
