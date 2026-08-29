from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import analysis, export
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Dashboard IA API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis.router, prefix="/api")
app.include_router(export.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "Dashboard IA API"}
