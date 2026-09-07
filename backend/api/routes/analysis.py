import asyncio
import re
import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool

from core.config import get_settings
from core.logging import logger
from schemas.responses import AnalysisResponseSchema
from services.analysis_pipeline import _analyze_sync

router = APIRouter()
settings = get_settings()
UPLOAD_DIR = Path("uploads").resolve()
UPLOAD_DIR.mkdir(exist_ok=True)
ALLOWED_SUFFIXES = {".csv", ".json", ".xlsx", ".xls"}
UPLOAD_ID_RE = re.compile(r"^[a-f0-9]{32}(?:\.csv|\.json|\.xlsx|\.xls)$")
analysis_semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_ANALYSES)
CHUNK_SIZE = 1024 * 1024


def _validate_original_filename(value: str) -> Path:
    candidate = Path(value)
    if not value or candidate.name != value or candidate.suffix.lower() not in ALLOWED_SUFFIXES:
        raise HTTPException(status_code=400, detail="Nombre o formato de archivo no permitido.")
    return candidate


async def _save_upload(file: UploadFile) -> tuple[str, str]:
    """Persist an upload under an opaque ID, never under user-controlled input."""
    original = _validate_original_filename(file.filename or "")
    upload_id = f"{uuid.uuid4().hex}{original.suffix.lower()}"
    destination = UPLOAD_DIR / upload_id
    bytes_written = 0

    try:
        with destination.open("xb") as buffer:
            while chunk := await file.read(CHUNK_SIZE):
                bytes_written += len(chunk)
                if bytes_written > settings.MAX_UPLOAD_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail=f"El archivo supera el máximo de {settings.MAX_UPLOAD_BYTES // (1024 * 1024)} MB.",
                    )
                buffer.write(chunk)
    except Exception:
        destination.unlink(missing_ok=True)
        raise
    finally:
        await file.close()

    return upload_id, original.name


def _resolve_upload(upload_id: str) -> Path:
    if not UPLOAD_ID_RE.fullmatch(upload_id):
        raise HTTPException(status_code=400, detail="Identificador de carga inválido.")
    path = UPLOAD_DIR / upload_id
    if not path.is_file():
        raise HTTPException(status_code=404, detail="El archivo ya no está disponible en el servidor.")
    return path

@router.post("/analyze", response_model=AnalysisResponseSchema)
async def analyze(
    file: Optional[UploadFile] = File(None),
    upload_id: Optional[str] = Form(None),
    display_name: Optional[str] = Form(None),
    target_col: Optional[str] = Form(None),
):
    if file and upload_id:
        raise HTTPException(status_code=400, detail="Enviá un archivo o un upload_id, no ambos.")

    if file:
        upload_id, filename = await _save_upload(file)
        file_path = _resolve_upload(upload_id)
    elif upload_id:
        file_path = _resolve_upload(upload_id)
        filename = _validate_original_filename(display_name or upload_id).name
    else:
        raise HTTPException(status_code=400, detail="Debe enviar 'file' o 'upload_id'.")

    logger.info("== Iniciando análisis de %s ==", filename)
    async with analysis_semaphore:
        result = await run_in_threadpool(_analyze_sync, str(file_path), filename, target_col)
    result["upload_id"] = upload_id
    return result
