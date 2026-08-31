"""
core/data_profiler.py
Análisis exploratorio automático del dataset subido.
Detecta tipos de columnas, valores nulos, estadísticas y sugiere columnas objetivo.
"""

from __future__ import annotations

import pandas as pd
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Tuple


# ─────────────────────────────────────────────────────────────
# Tipos de columna inferidos
# ─────────────────────────────────────────────────────────────
COLUMN_TYPE_NUMERIC     = "numérica"
COLUMN_TYPE_DATE        = "fecha"
COLUMN_TYPE_CATEGORICAL = "categórica"
COLUMN_TYPE_TEXT        = "texto"
COLUMN_TYPE_ID          = "identificador"


@dataclass
class ColumnProfile:
    name: str
    dtype: str
    inferred_type: str
    n_unique: int
    null_count: int
    null_pct: float
    sample_values: List
    stats: Dict = field(default_factory=dict)   # solo para numéricas


@dataclass
class DataProfile:
    n_rows: int
    n_cols: int
    columns: List[ColumnProfile]
    quality_score: int          # 0-100
    quality_label: str          # "Alta", "Media", "Baja"
    suggested_targets: List[str]
    date_columns: List[str]
    numeric_columns: List[str]
    categorical_columns: List[str]
    duplicate_rows: int


# ─────────────────────────────────────────────────────────────
# Detección de tipo
# ─────────────────────────────────────────────────────────────

def _infer_column_type(series: pd.Series) -> str:
    """Infiere el tipo semántico de una columna."""
    name_lower = series.name.lower()

    # Identificadores: columnas con nombres típicos de ID
    id_keywords = ["id", "cod", "código", "code", "key", "uuid", "numero", "número"]
    if any(kw in name_lower for kw in id_keywords) and series.nunique() == len(series):
        return COLUMN_TYPE_ID

    # Fechas
    if pd.api.types.is_datetime64_any_dtype(series):
        return COLUMN_TYPE_DATE

    # Intentar parsear como fecha si es object
    if series.dtype == object:
        sample = series.dropna().head(20)
        try:
            try:
                parsed = pd.to_datetime(sample, errors="coerce", format="mixed")
            except ValueError:
                parsed = pd.to_datetime(sample, errors="coerce")
            if parsed.notna().sum() / max(len(sample), 1) > 0.8:
                return COLUMN_TYPE_DATE
        except Exception:
            pass

    # Numéricas
    if pd.api.types.is_numeric_dtype(series):
        # Si tiene muy pocos únicos puede ser categórica numérica
        if series.nunique() <= 10 and series.nunique() < len(series) * 0.05:
            return COLUMN_TYPE_CATEGORICAL
        return COLUMN_TYPE_NUMERIC

    # Categóricas vs Texto libre
    n_unique = series.nunique()
    n_rows   = len(series.dropna())
    if n_unique == 0:
        return COLUMN_TYPE_TEXT
    ratio = n_unique / n_rows
    if ratio < 0.4 or n_unique <= 30:
        return COLUMN_TYPE_CATEGORICAL
    return COLUMN_TYPE_TEXT


# ─────────────────────────────────────────────────────────────
# Perfil de columna individual
# ─────────────────────────────────────────────────────────────

def _profile_column(series: pd.Series) -> ColumnProfile:
    inferred = _infer_column_type(series)
    null_count = int(series.isna().sum())
    null_pct   = round(null_count / max(len(series), 1) * 100, 1)
    sample_vals = series.dropna().unique()[:5].tolist()

    stats: Dict = {}
    if inferred == COLUMN_TYPE_NUMERIC:
        desc = series.describe()
        stats = {
            "min":    round(float(desc["min"]), 2),
            "max":    round(float(desc["max"]), 2),
            "mean":   round(float(desc["mean"]), 2),
            "median": round(float(series.median()), 2),
            "std":    round(float(desc["std"]), 2),
        }

    return ColumnProfile(
        name=series.name,
        dtype=str(series.dtype),
        inferred_type=inferred,
        n_unique=int(series.nunique()),
        null_count=null_count,
        null_pct=null_pct,
        sample_values=sample_vals,
        stats=stats,
    )


# ─────────────────────────────────────────────────────────────
# Score de calidad
# ─────────────────────────────────────────────────────────────

def _compute_quality_score(df: pd.DataFrame, cols: List[ColumnProfile]) -> Tuple[int, str]:
    """Calcula un puntaje de calidad del dataset de 0 a 100."""
    penalties = 0

    # Penalizar por nulos
    avg_null_pct = np.mean([c.null_pct for c in cols])
    penalties += min(avg_null_pct * 1.5, 30)

    # Penalizar por duplicados
    dup_pct = len(df[df.duplicated()]) / max(len(df), 1) * 100
    penalties += min(dup_pct * 2, 20)

    # Penalizar si hay pocas columnas numéricas (menos útil para ML)
    num_numerics = sum(1 for c in cols if c.inferred_type == COLUMN_TYPE_NUMERIC)
    if num_numerics == 0:
        penalties += 20
    elif num_numerics == 1:
        penalties += 10

    # Penalizar si el dataset es muy pequeño
    if len(df) < 50:
        penalties += 20
    elif len(df) < 100:
        penalties += 10

    score = max(0, min(100, round(100 - penalties)))

    if score >= 80:
        label = "Alta"
    elif score >= 55:
        label = "Media"
    else:
        label = "Baja"

    return score, label


# ─────────────────────────────────────────────────────────────
# Sugerencia de columnas objetivo
# ─────────────────────────────────────────────────────────────

def _suggest_targets(cols: List[ColumnProfile]) -> List[str]:
    """Sugiere columnas objetivo determinísticamente usando scoring (keywords + estadísticos)."""
    target_keywords = [
        "venta", "ingreso", "revenue", "monto", "total", "precio",
        "margen", "ganancia", "beneficio", "cantidad", "units",
        "churn", "baja", "cancelacion", "score", "valor",
    ]
    
    scored_cols = []
    
    for col in cols:
        if col.inferred_type != COLUMN_TYPE_NUMERIC:
            continue
            
        score = 0
        name_lower = col.name.lower()
        
        # Priority 1: Keywords (+100 points)
        if any(kw in name_lower for kw in target_keywords):
            score += 100
            
        # Priority 2: High cardinality/variance (proxy using unique values vs missing)
        # We give a slight boost based on unique values so it's deterministic and prefers continuous variables
        unique_ratio = col.n_unique / max(1, (col.n_unique + col.null_count))
        score += unique_ratio
        
        # Priority 3: Alphabetical fallback for absolute determinism if everything is equal
        # Handled by sorting tuple
        scored_cols.append((score, col.name))
        
    # Sort by score descending, then by name ascending (for ties)
    scored_cols.sort(key=lambda x: (-x[0], x[1]))

    return [c[1] for c in scored_cols][:5]


# ─────────────────────────────────────────────────────────────
# API pública
# ─────────────────────────────────────────────────────────────

def profile_dataframe(df: pd.DataFrame) -> DataProfile:
    """
    Genera un perfil completo del DataFrame.

    Args:
        df: DataFrame a analizar.

    Returns:
        DataProfile con toda la información del dataset.
    """
    cols = [_profile_column(df[col]) for col in df.columns]

    date_cols        = [c.name for c in cols if c.inferred_type == COLUMN_TYPE_DATE]
    numeric_cols     = [c.name for c in cols if c.inferred_type == COLUMN_TYPE_NUMERIC]
    categorical_cols = [c.name for c in cols if c.inferred_type == COLUMN_TYPE_CATEGORICAL]
    dup_rows         = int(df.duplicated().sum())

    quality_score, quality_label = _compute_quality_score(df, cols)
    suggested_targets = _suggest_targets(cols)

    return DataProfile(
        n_rows=len(df),
        n_cols=len(df.columns),
        columns=cols,
        quality_score=quality_score,
        quality_label=quality_label,
        suggested_targets=suggested_targets,
        date_columns=date_cols,
        numeric_columns=numeric_cols,
        categorical_columns=categorical_cols,
        duplicate_rows=dup_rows,
    )
