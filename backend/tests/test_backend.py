import io
import pytest
import pandas as pd
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_numeric_target_analysis():
    df_num = pd.DataFrame({
        'date': pd.date_range(start='1/1/2020', periods=50),
        'sales': range(50),
        'category': ['A', 'B', 'C', 'D', 'E'] * 10
    })
    csv_num = df_num.to_csv(index=False).encode('utf-8')
    files = {'file': ('num.csv', io.BytesIO(csv_num), 'text/csv')}
    data = {'target_col': 'sales'}
    response = client.post('/api/v1/analyze', files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res['filename'] == 'num.csv'
    assert 'profile' in res

def test_categorical_target_analysis():
    df_cat = pd.DataFrame({
        'date': pd.date_range(start='1/1/2020', periods=50),
        'sales': range(50),
        'category': ['A', 'A', 'B', 'C', 'C'] * 10
    })
    csv_cat = df_cat.to_csv(index=False).encode('utf-8')
    files = {'file': ('cat.csv', io.BytesIO(csv_cat), 'text/csv')}
    data = {'target_col': 'category'}
    response = client.post('/api/v1/analyze', files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res['filename'] == 'cat.csv'

def test_pdf_export():
    pdf_data = {
        "filename": "test.csv",
        "targetCol": "sales",
        "kpis": {"Total": "1000"},
        "narrative_text": "This is a test narrative.",
        "profile": {"nRows": 100, "nCols": 3, "qualityScore": 100, "qualityLabel": "Alta", "numericColumns": ["sales"], "dateColumns": ["date"], "categoricalColumns": ["category"], "suggestedTargets": ["sales"]},
        "anomaly_metrics": {},
        "forecast_metrics": {},
        "segmentation_metrics": {}
    }
    response = client.post('/api/v1/export/pdf', json=pdf_data)
    assert response.status_code == 200
    assert response.headers['content-type'] == 'application/pdf'

def test_pptx_export():
    pptx_data = {
        "filename": "test.csv",
        "targetCol": "sales",
        "kpis": {"Total": "1000"},
        "narrative_text": "This is a test narrative.",
        "profile": {"nRows": 100, "nCols": 3, "qualityScore": 100, "qualityLabel": "Alta", "numericColumns": ["sales"], "dateColumns": ["date"], "categoricalColumns": ["category"], "suggestedTargets": ["sales"]},
        "anomaly_metrics": {},
        "forecast_metrics": {},
        "segmentation_metrics": {}
    }
    response = client.post('/api/v1/export/pptx', json=pptx_data)
    assert response.status_code == 200
    assert 'application/vnd.openxmlformats-officedocument.presentationml.presentation' in response.headers['content-type']
