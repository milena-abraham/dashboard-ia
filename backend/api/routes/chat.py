"""
routers/chat.py
Endpoint para interactuar con la API de Gemini (Chat con el dataset).
Soporta modificaciones de gráficos a través del campo `chart_override`.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import os
import json
import re
from enum import Enum

class SupportedChartType(str, Enum):
    bar = "bar"
    bar_horizontal = "bar_horizontal"
    doughnut = "doughnut"
    line_area = "line_area"

class ChartDataset(BaseModel):
    label: str
    data: List[float]

class ChartDataDef(BaseModel):
    type: SupportedChartType
    labels: List[str]
    datasets: List[ChartDataset]
    title: Optional[str] = None

class ChartOverrideDef(BaseModel):
    index: int
    chart_data: ChartDataDef

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    context: Dict[str, Any]
    charts: Optional[List[Dict[str, Any]]] = None  # Lista de gráficos actuales

@router.post("/chat")
async def chat_with_data(request: ChatRequest):
    if not GEMINI_AVAILABLE:
        raise HTTPException(status_code=500, detail="Librería google-generativeai no instalada.")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Falta GEMINI_API_KEY en las variables de entorno.")

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-3.6-flash")

        ctx = request.context
        
        # Resumen del contexto
        summary_ctx = {
            "filename": ctx.get("filename", "Dataset"),
            "target": ctx.get("target_col"),
            "kpis": ctx.get("kpis", {}),
            "profile": {
                "rows": ctx.get("profile", {}).get("n_rows"),
                "cols": ctx.get("profile", {}).get("n_cols"),
                "numeric": ctx.get("profile", {}).get("numeric_columns"),
                "categorical": ctx.get("profile", {}).get("categorical_columns"),
            }
        }
        
        if "anomalies" in ctx and "metrics" in ctx["anomalies"]:
            summary_ctx["anomalies"] = ctx["anomalies"]["metrics"]
            
        if "forecast" in ctx and "metrics" in ctx["forecast"]:
            summary_ctx["forecast"] = ctx["forecast"]["metrics"]
            
        if "feature_importance" in ctx and "metrics" in ctx["feature_importance"]:
            summary_ctx["features"] = ctx["feature_importance"]["metrics"]

        # Resumen de gráficos disponibles
        charts_info = ""
        if request.charts:
            charts_summary = [
                {"index": i, "title": c.get("title",""), "type": c.get("chart_data", {}).get("type", "?")}
                for i, c in enumerate(request.charts)
            ]
            charts_info = f"\nGRÁFICOS ACTUALES: {json.dumps(charts_summary, ensure_ascii=False)}"

        # Detectar si el usuario quiere modificar un gráfico
        chart_request_keywords = ["cambia", "modifica", "convierte", "transforma", "muestra", "chart", "gráfico", "grafico", "barras", "línea", "pie", "radar", "scatter"]
        is_chart_request = any(kw in request.message.lower() for kw in chart_request_keywords) and any(
            digit in request.message for digit in ["0","1","2","3","4","5","6","7","8","9","primero","segundo","tercero"]
        )

        chart_override_instruction = ""
        if is_chart_request and request.charts:
            chart_override_instruction = """
Si el usuario pide modificar un gráfico específico, responde en este formato JSON exacto al FINAL de tu respuesta (después de tu texto normal), encerrado entre <CHART_OVERRIDE> y </CHART_OVERRIDE>:
<CHART_OVERRIDE>
{"index": <número_de_gráfico>, "chart_data": {"type": "<bar|bar_horizontal|line_area|doughnut>", "labels": [...], "datasets": [{"label": "...", "data": [...]}], "title": "..."}}
</CHART_OVERRIDE>

Si no hay suficiente información para generar datos exactos del gráfico, no incluyas el bloque CHART_OVERRIDE.
"""

        prompt = f"""Eres el "Asistente de Datos MIO", un experto en análisis de datos integrado en un Dashboard de Inteligencia Artificial llamado MIO.
El usuario está analizando un dataset llamado '{summary_ctx["filename"]}' enfocado en '{summary_ctx["target"]}'.

RESUMEN DE LOS DATOS ANALIZADOS:
{json.dumps(summary_ctx, indent=2, ensure_ascii=False)}
{charts_info}

{chart_override_instruction}

El usuario te pregunta:
"{request.message}"

Responde de manera concisa, analítica, profesional pero amigable. Usa Markdown para formatear tu respuesta (negritas, listas, etc.).
No menciones el JSON interno. Basa tu respuesta en el contexto proporcionado.
Si el usuario pregunta algo que no está en el contexto, indícale que con los datos actuales no puedes asegurarlo.
"""
        response = model.generate_content(prompt)
        raw_text = response.text

        # Extraer chart_override si existe
        chart_override = None
        override_match = re.search(r'<CHART_OVERRIDE>(.*?)</CHART_OVERRIDE>', raw_text, re.DOTALL)
        if override_match:
            try:
                raw_json = json.loads(override_match.group(1).strip())
                validated_override = ChartOverrideDef(**raw_json)
                
                is_valid = True
                for ds in validated_override.chart_data.datasets:
                    if len(ds.data) != len(validated_override.chart_data.labels):
                        is_valid = False
                        break
                        
                if is_valid:
                    chart_override = raw_json
                else:
                    print("Invalid chart_override: labels length and data length mismatch.")
                raw_text = raw_text.replace(override_match.group(0), '').strip()
            except Exception as e:
                print(f"Invalid chart_override discarded: {e}")
                raw_text = raw_text.replace(override_match.group(0), '').strip()

        return {
            "response": raw_text,
            "chart_override": chart_override
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error comunicándose con Gemini: {str(e)}")
