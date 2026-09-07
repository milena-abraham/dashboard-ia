from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import analysis, export, chat, narrative
from core.config import get_settings
from core.exceptions import setup_exception_handlers
from core.logging import logger

settings = get_settings()

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# Set up global exception handlers
setup_exception_handlers(app)

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
