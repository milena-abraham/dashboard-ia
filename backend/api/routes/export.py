"""
routers/export.py
Endpoint para exportación de reportes PDF ejecutivos.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from typing import Any, Dict, Optional
from schemas.responses import BaseSchema

from reports.pdf_generator import generate_pdf_report
from reports.pptx_generator import generate_pptx_report

router = APIRouter()


class ExportPDFRequest(BaseSchema):
    filename: str
    target_col: str
    kpis: Dict[str, Any]
    narrative_text: str
    profile: Dict[str, Any]
    anomaly_metrics: Optional[Dict[str, Any]] = {}
    forecast_metrics: Optional[Dict[str, Any]] = {}
    segmentation_metrics: Optional[Dict[str, Any]] = {}


@router.post("/export/pdf")
def export_pdf(req: ExportPDFRequest):
    pdf_bytes = generate_pdf_report(
        filename=req.filename,
        target_col=req.target_col,
        kpis=req.kpis,
        narrative_text=req.narrative_text,
        profile=req.profile,
        anomaly_metrics=req.anomaly_metrics or {},
        forecast_metrics=req.forecast_metrics or {},
        segmentation_metrics=req.segmentation_metrics or {},
    )

    if not pdf_bytes:
        raise HTTPException(status_code=500, detail="No se pudo generar el documento PDF.")

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=informe_{req.filename}.pdf"}
    )

@router.post("/export/pptx")
def export_pptx(req: ExportPDFRequest):
    pptx_bytes = generate_pptx_report(
        filename=req.filename,
        target_col=req.target_col,
        kpis=req.kpis,
        narrative_text=req.narrative_text,
        profile=req.profile,
        anomaly_metrics=req.anomaly_metrics or {},
        forecast_metrics=req.forecast_metrics or {},
        segmentation_metrics=req.segmentation_metrics or {},
    )

    if not pptx_bytes:
        raise HTTPException(status_code=500, detail="No se pudo generar el documento PPTX.")

    return Response(
        content=pptx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={"Content-Disposition": f"attachment; filename=presentacion_{req.filename}.pptx"}
    )
