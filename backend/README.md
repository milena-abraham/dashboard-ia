---
title: Dashboard IA API
emoji: 🚀
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# Dashboard IA - Backend API (FastAPI)

API de alto rendimiento con FastAPI, Scikit-Learn, LightGBM y Prophet para analítica inteligente de datos.

## Endpoints Principales
- `GET /health` / `GET /api/health`: Chequeo de estado
- `POST /api/analyze`: Análisis integral de datasets tabulares (CSV, Excel)
- `POST /api/narrative`: Generación de narrativa ejecutiva con IA Gemini
- `POST /api/chat`: Asistente analítico interactivo con IA
- `POST /api/export/pdf`: Generación de informe en PDF ejecutivo
- `POST /api/export/pptx`: Generación de presentación en diapositivas PowerPoint
