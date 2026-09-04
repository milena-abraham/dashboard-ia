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
    existing_filename: Optional[str] = Form(None),
    target_col: Optional[str] = Form(None)
):
    t_start = time.time()
    
    file_path = ""
    filename = ""
    if file:
        filename = file.filename or "uploaded_data.csv"
        file_path = str(UPLOAD_DIR / filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    elif existing_filename:
        # Check standard upload directory first
        target_path = UPLOAD_DIR / existing_filename
        if not target_path.exists():
            # Check parent directory uploads or root (convenience for development)
            parent_uploads = Path("..") / "uploads" / existing_filename
            root_file = Path("..") / existing_filename
            if parent_uploads.exists():
                target_path = parent_uploads
            elif root_file.exists():
                target_path = root_file
            else:
                raise HTTPException(status_code=404, detail=f"Archivo '{existing_filename}' no encontrado en el servidor.")
        filename = existing_filename
        file_path = str(target_path)
    elif file_url:
        raise HTTPException(status_code=400, detail="file_url method not fully implemented in local stub")
    else:
        raise HTTPException(status_code=400, detail="Debe enviar 'file', 'existing_filename' o 'file_url'.")
        
    if filename_override:
        filename = filename_override

    logger.info(f"== Iniciando Análisis de {filename} ==")
    
    return _analyze_sync(file_path, filename, target_col)
