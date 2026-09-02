from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any
from insights.narrator import generate_narrative

router = APIRouter()

@router.post("/narrative")
async def get_narrative(data: Dict[str, Any] = Body(...)):
    try:
        # Extraemos los datos necesarios del JSON que manda el frontend
        profile = data.get("profile", {})
        kpis = data.get("kpis", {})
        anomalies = data.get("anomalies", {}).get("metrics", {})
        forecast = data.get("forecast", {}).get("metrics", {})
        segmentation = data.get("segmentation", {}).get("metrics", {})
        features = data.get("feature_importance", {}).get("metrics", {})
        target_col = data.get("target_col", "")
        filename = data.get("filename", "dataset")

        # Mock object for profile since narrator.py expects object attributes
        class ProfileMock:
            def __init__(self, d):
                self.n_rows = d.get("n_rows", 0)
                self.n_cols = d.get("n_cols", 0)

        narrative_res = generate_narrative(
            df=None, # The narrator doesn't actually use df directly in the prompt
            profile=ProfileMock(profile),
            target_col=target_col,
            kpis=kpis,
            anomaly_metrics=anomalies,
            forecast_metrics=forecast,
            segmentation_metrics=segmentation,
            feature_metrics=features,
            filename=filename,
        )
        return narrative_res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
