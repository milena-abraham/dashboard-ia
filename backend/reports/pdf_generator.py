"""
reports/pdf_generator.py
Generación de reportes PDF ejecutivos desde el backend FastAPI.
"""

from __future__ import annotations
import os
import io
from datetime import datetime
from typing import Optional, List, Dict, Any

try:
    from fpdf import FPDF
    FPDF_AVAILABLE = True
except ImportError:
    FPDF_AVAILABLE = False


class DashboardPDF(FPDF):
    def __init__(self, title: str = "Informe Ejecutivo"):
        super().__init__()
        self.report_title = title
        self.set_margins(15, 15, 15)

    def header(self):
        self.set_fill_color(102, 126, 234)
        self.rect(0, 0, 210, 25, "F")
        self.set_text_color(255, 255, 255)
        self.set_font("Helvetica", "B", 14)
        self.set_y(8)
        self.cell(0, 10, "Dashboard IA - Analitica & Machine Learning", align="C")
        self.set_text_color(0, 0, 0)
        self.ln(20)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"Generado el {datetime.now().strftime('%d/%m/%Y %H:%M')} | Plataforma Dashboard IA", align="C")

    def section_title(self, title: str):
        self.set_font("Helvetica", "B", 12)
        self.set_fill_color(240, 244, 255)
        self.set_text_color(102, 126, 234)
        self.cell(0, 9, f"  {title}", border=0, ln=1, fill=True)
        self.set_text_color(0, 0, 0)
        self.ln(2)

    def body_text(self, text: str, font_size: int = 10):
        self.set_font("Helvetica", "", font_size)
        self.set_text_color(50, 50, 50)
        
        # Mapa de caracteres UTF-8 comunes a Latin-1 equivalentes
        replacements = {
            '“': '"', '”': '"', "‘": "'", "’": "'",
            '—': '-', '–': '-', '…': '...',
            '€': 'EUR', '£': 'GBP', '¥': 'JPY',
            '✅': '[OK]', '❌': '[X]', '🚀': '->', '📈': '(+)', '📉': '(-)'
        }
        clean_text = text.replace("**", "").replace("##", "").replace("#", "")
        for k, v in replacements.items():
            clean_text = clean_text.replace(k, v)
        
        clean_text = clean_text.encode("latin-1", errors="replace").decode("latin-1")
        self.multi_cell(0, 6, clean_text)
        self.ln(2)


def generate_pdf_report(
    filename: str,
    target_col: str,
    kpis: dict,
    narrative_text: str,
    profile: dict,
    anomaly_metrics: dict = {},
    forecast_metrics: dict = {},
    segmentation_metrics: dict = {},
) -> Optional[bytes]:
    if not FPDF_AVAILABLE:
        return None

    try:
        pdf = DashboardPDF(title=f"Analisis: {filename}")
        pdf.add_page()

        pdf.set_font("Helvetica", "B", 16)
        pdf.set_text_color(26, 32, 44)
        safe_filename = filename.encode("latin-1", errors="replace").decode("latin-1")
        pdf.cell(0, 10, f"Informe Ejecutivo: {safe_filename}", ln=1, align="C")
        
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(100, 100, 100)
        n_rows = profile.get("n_rows", "N/A")
        n_cols = profile.get("n_cols", "N/A")
        pdf.cell(0, 6, f"Metrica Analizada: {target_col} | Registros: {n_rows} | Columnas: {n_cols}", ln=1, align="C")
        pdf.ln(6)

        pdf.section_title("Indicadores Principales")
        kpi_str = " | ".join([f"{k}: {v}" for k, v in kpis.items()])
        pdf.body_text(kpi_str)

        pdf.section_title("Evaluacion de Calidad")
        pdf.body_text(f"Puntaje de Salud de Datos: {profile.get('quality_score', 100)}/100 ({profile.get('quality_label', 'Alta')})")

        pdf.section_title("Analisis Ejecutivo")
        pdf.body_text(narrative_text)

        if anomaly_metrics and "n_anomalias" in anomaly_metrics:
            pdf.section_title("Deteccion de Anomalias")
            pdf.body_text(f"Se detectaron {anomaly_metrics['n_anomalias']} registros con desvios ({anomaly_metrics.get('pct_anomalias', 0)}%).")

        if forecast_metrics and "tendencia_pct" in forecast_metrics:
            pdf.section_title("Proyecciones")
            pdf.body_text(f"Tendencia esperada: {forecast_metrics['tendencia_pct']}% en {forecast_metrics.get('periodos', 60)} dias.")

        return bytes(pdf.output())
    except Exception as e:
        print(f"Error generando PDF: {e}")
        return None
