"""
routers/chat.py
Endpoint para interactuar con la API de Gemini (Chat con el dataset).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
import os
import json

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    context: Dict[str, Any]

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

        # Preparar un resumen del contexto para no enviar demasiados tokens
        ctx = request.context
        
        # Filtramos el contexto para enviar solo lo necesario
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

        prompt = f"""
Eres el "Asistente de Datos", un experto en análisis de datos integrado en un Dashboard de Inteligencia Artificial.
El usuario está analizando un dataset llamado '{summary_ctx["filename"]}' enfocado en '{summary_ctx["target"]}'.

AQUÍ ESTÁ EL RESUMEN DE LOS DATOS ANALIZADOS:
{json.dumps(summary_ctx, indent=2, ensure_ascii=False)}

El usuario te pregunta:
"{request.message}"

Responde de manera concisa, analítica, profesional pero amigable. No menciones el JSON. Basa tu respuesta en el contexto proporcionado.
Si el usuario pregunta algo que no está en el contexto, indícale que con los datos actuales no puedes asegurarlo.
"""
        response = model.generate_content(prompt)
        return {"response": response.text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error comunicándose con Gemini: {str(e)}")
