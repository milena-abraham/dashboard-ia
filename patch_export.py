import re

with open('backend/routers/export.py', 'r') as f:
    text = f.read()

text = text.replace('from reports.pdf_generator import generate_pdf_report', 'from reports.pdf_generator import generate_pdf_report\nfrom reports.pptx_generator import generate_pptx_report')

new_endpoint = """
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
"""

text = text + new_endpoint

with open('backend/routers/export.py', 'w') as f:
    f.write(text)
