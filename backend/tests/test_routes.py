import io
import pytest
import pandas as pd
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_analyze_numeric():
    df = pd.DataFrame({
        "fecha": pd.date_range("2024-01-01", periods=30),
        "ventas": [100 + i * 2 for i in range(30)],
        "categoria": ["A", "B", "C"] * 10
    })
    csv_bytes = df.to_csv(index=False).encode("utf-8")
    files = {"file": ("test_sales.csv", io.BytesIO(csv_bytes), "text/csv")}
    data = {"target_col": "ventas"}
    
    response = client.post("/api/v1/analyze", files=files, data=data)
    assert response.status_code == 200
    body = response.json()
    assert body["filename"] == "test_sales.csv"
    assert "profile" in body
    assert "kpis" in body
    assert "charts" in body
