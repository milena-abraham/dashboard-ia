from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Optional
import os
import shutil
from pathlib import Path
import time
from core.logging import logger

from services.analysis_pipeline import _analyze_sync
from schemas.responses import AnalysisResponseSchema

router = APIRouter()
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/analyze", response_model=AnalysisResponseSchema)
async def analyze(
    file: Optional[UploadFile] = File(None), 
    file_url: Optional[str] = Form(None),
    filename_override: Optional[str] = Form(None),
    target_col: Optional[str] = Form(None)
):
    t_start = time.time()
    
    if not file and not file_url:
        raise HTTPException(status_code=400, detail="Debe enviar 'file' o 'file_url'.")

    file_path = ""
    filename = ""
    if file:
        filename = file.filename or "uploaded_data.csv"
        file_path = str(UPLOAD_DIR / filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    elif file_url:
        raise HTTPException(status_code=400, detail="file_url method not fully implemented in local stub")
        
    if filename_override:
        filename = filename_override

    logger.info(f"== Iniciando Análisis de {filename} ==")
    
    return _analyze_sync(file_path, filename, target_col)
