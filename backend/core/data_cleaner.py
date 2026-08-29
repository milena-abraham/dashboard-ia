"""
core/data_cleaner.py
Pipeline de limpieza automática e inteligente de datos.
Maneja nulos, duplicados, tipos incorrectos, outliers y valores anómalos.
"""

from __future__ import annotations

import re
import pandas as pd
import numpy as np
from dataclasses import dataclass, field
from typing import List, Tuple

from core.data_profiler import (
    profile_dataframe,
    COLUMN_TYPE_NUMERIC,
    COLUMN_TYPE_DATE,
    COLUMN_TYPE_CATEGORICAL,
    COLUMN_TYPE_TEXT,
    COLUMN_TYPE_ID,
)


@dataclass
class CleaningReport:
    """Reporte de todo lo que fue corregido durante la limpieza."""
    original_rows: int
    final_rows: int
    duplicates_removed: int
    columns_fixed: List[str] = field(default_factory=list)
    nulls_imputed: dict = field(default_factory=dict)      # columna -> cantidad
    dates_parsed: List[str] = field(default_factory=list)
    currency_cleaned: List[str] = field(default_factory=list)
    outliers_flagged: dict = field(default_factory=dict)   # columna -> cantidad
    actions: List[str] = field(default_factory=list)       # log legible de acciones


# ─────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────

_CURRENCY_RE = re.compile(r"[\$\€\£\¥,\s]")
_PCT_RE      = re.compile(r"%")


def _clean_currency_column(series: pd.Series) -> pd.Series:
    """Convierte columnas de dinero tipo '$1.200,50' o '1200.50' a float."""
    s = series.astype(str)
    # Detectar si usa punto como separador de miles y coma como decimal
    if s.str.contains(r"\d\.\d{3}").any() and s.str.contains(r",\d{2}$").any():
        s = s.str.replace(".", "", regex=False).str.replace(",", ".", regex=False)
    # Quitar símbolos de moneda y espacios
    s = _CURRENCY_RE.sub("", s)
    s = _PCT_RE.sub("", s)
    return pd.to_numeric(s, errors="coerce")


def _detect_currency_like(series: pd.Series) -> bool:
    """Detecta si una columna object es en realidad un número con formato de moneda."""
    if series.dtype != object:
        return False
    sample = series.dropna().head(30).astype(str)
    has_symbol = sample.str.contains(r"[\$\€\£\¥]").any()
    has_comma_dot = sample.str.match(r"^[\$\€]?\s*[\d\.,\$]+$").mean() > 0.7
    return has_symbol or has_comma_dot


def _impute_nulls(series: pd.Series, inferred_type: str) -> Tuple[pd.Series, int]:
    """Imputa valores nulos de forma inteligente según el tipo."""
    null_count = int(series.isna().sum())
    if null_count == 0:
        return series, 0

    if inferred_type == COLUMN_TYPE_NUMERIC:
        # Usar mediana (más robusta a outliers que la media)
        fill_val = series.median()
        return series.fillna(fill_val), null_count

    elif inferred_type == COLUMN_TYPE_DATE:
        # Forward fill (relleno con la última fecha válida)
        return series.ffill().bfill(), null_count

    elif inferred_type == COLUMN_TYPE_CATEGORICAL:
        # Moda (valor más frecuente)
        mode_val = series.mode()
        if len(mode_val) > 0:
            return series.fillna(mode_val[0]), null_count
        return series.fillna("Desconocido"), null_count

    else:
        return series.fillna(""), null_count


def _flag_outliers(series: pd.Series) -> pd.Series:
    """
    Retorna máscara booleana de outliers usando IQR.
    No los elimina, solo los marca.
    """
    Q1 = series.quantile(0.25)
    Q3 = series.quantile(0.75)
    IQR = Q3 - Q1
    lower = Q1 - 3 * IQR
    upper = Q3 + 3 * IQR
    return (series < lower) | (series > upper)


# ─────────────────────────────────────────────────────────────
# Pipeline principal
# ─────────────────────────────────────────────────────────────

def clean_dataframe(df: pd.DataFrame) -> Tuple[pd.DataFrame, CleaningReport]:
    """
    Ejecuta el pipeline completo de limpieza sobre un DataFrame.

    Args:
        df: DataFrame raw cargado desde el archivo del usuario.

    Returns:
        Tupla (df_clean, report) con el DataFrame limpio y el reporte de acciones.
    """
    report = CleaningReport(
        original_rows=len(df),
        final_rows=len(df),
        duplicates_removed=0,
    )

    df = df.copy()

    # 1. Normalizar nombres de columnas (strip, lowercase no, solo strip)
    df.columns = [str(c).strip() for c in df.columns]

    # 2. Eliminar filas completamente vacías
    before = len(df)
    df = df.dropna(how="all")
    if len(df) < before:
        report.actions.append(f"Se eliminaron {before - len(df)} filas completamente vacías.")

    # 3. Eliminar columnas completamente vacías
    empty_cols = [c for c in df.columns if df[c].isna().all()]
    if empty_cols:
        df = df.drop(columns=empty_cols)
        report.actions.append(f"Se eliminaron {len(empty_cols)} columna(s) completamente vacías: {empty_cols}.")

    # 4. Eliminar duplicados exactos
    dup_count = int(df.duplicated().sum())
    if dup_count > 0:
        df = df.drop_duplicates()
        report.duplicates_removed = dup_count
        report.actions.append(f"Se eliminaron {dup_count} filas duplicadas.")

    # 5. Perfilar el dataset limpio parcialmente para saber tipos
    profile = profile_dataframe(df)
    type_map = {col.name: col.inferred_type for col in profile.columns}

    # 6. Limpiar columnas de moneda / porcentaje
    for col in df.columns:
        if _detect_currency_like(df[col]):
            df[col] = _clean_currency_column(df[col])
            type_map[col] = COLUMN_TYPE_NUMERIC
            report.currency_cleaned.append(col)
            report.actions.append(f"Columna '{col}': convertida de texto con formato monetario a número.")

    # 7. Parsear columnas de fecha detectadas como texto
    for col in df.columns:
        if type_map.get(col) == COLUMN_TYPE_DATE and df[col].dtype == object:
            try:
                # Use cache=True to speed up parsing of repeated dates, drop infer_datetime_format as it's deprecated
                df[col] = pd.to_datetime(df[col], errors="coerce", format="mixed")
                report.dates_parsed.append(col)
                report.actions.append(f"Columna '{col}': parseada como fecha/hora.")
            except ValueError:
                # If format='mixed' is not supported (pandas < 2.0), fallback
                df[col] = pd.to_datetime(df[col], errors="coerce")
                report.dates_parsed.append(col)
                report.actions.append(f"Columna '{col}': parseada como fecha/hora.")
            except Exception:
                pass

    # 8. Convertir numéricas detectadas que siguen como object
    for col in df.columns:
        if type_map.get(col) == COLUMN_TYPE_NUMERIC and df[col].dtype == object:
            converted = pd.to_numeric(df[col], errors="coerce")
            if converted.notna().sum() / max(len(converted), 1) > 0.7:
                df[col] = converted
                report.columns_fixed.append(col)
                report.actions.append(f"Columna '{col}': convertida a numérico.")

    # 9. Imputar valores nulos
    for col in df.columns:
        itype = type_map.get(col, COLUMN_TYPE_TEXT)
        df[col], n_imputed = _impute_nulls(df[col], itype)
        if n_imputed > 0:
            report.nulls_imputed[col] = n_imputed
            strategy = {
                COLUMN_TYPE_NUMERIC:     "mediana",
                COLUMN_TYPE_DATE:        "forward-fill",
                COLUMN_TYPE_CATEGORICAL: "moda",
            }.get(itype, "cadena vacía")
            report.actions.append(
                f"Columna '{col}': {n_imputed} nulos imputados con {strategy}."
            )

    # 10. Detectar y anotar outliers en columnas numéricas (sin eliminar)
    for col in df.columns:
        if type_map.get(col) == COLUMN_TYPE_NUMERIC:
            try:
                mask = _flag_outliers(df[col].dropna())
                n_out = int(mask.sum())
                if n_out > 0:
                    report.outliers_flagged[col] = n_out
            except Exception:
                pass

    report.final_rows = len(df)

    if not report.actions:
        report.actions.append("✅ El dataset ya estaba en buen estado. No se realizaron cambios significativos.")

    return df, report
