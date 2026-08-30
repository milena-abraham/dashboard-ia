import requests
import io
import pandas as pd

# Create dummy CSVs
df_num = pd.DataFrame({
    'date': pd.date_range(start='1/1/2020', periods=100),
    'sales': range(100),
    'category': ['A', 'B', 'C', 'D'] * 25
})
csv_num = df_num.to_csv(index=False)

df_cat = pd.DataFrame({
    'date': pd.date_range(start='1/1/2020', periods=100),
    'sales': range(100),
    'category': ['A', 'A', 'B', 'C'] * 25
})
csv_cat = df_cat.to_csv(index=False)

url = "http://localhost:10000/api/analyze"

print("Test 1: Numeric target")
files = {'file': ('num.csv', io.BytesIO(csv_num.encode('utf-8')), 'text/csv')}
data = {'target_col': 'sales'}
r1 = requests.post(url, files=files, data=data)
print(f"Status: {r1.status_code}")
if r1.status_code != 200:
    print(r1.text)
else:
    print("Test 1 Passed.")

print("\nTest 2: Categorical target")
files = {'file': ('cat.csv', io.BytesIO(csv_cat.encode('utf-8')), 'text/csv')}
data = {'target_col': 'category'}
r2 = requests.post(url, files=files, data=data)
print(f"Status: {r2.status_code}")
if r2.status_code != 200:
    print(r2.text)
else:
    print("Test 2 Passed.")

print("\nTest 3: PDF Export")
pdf_url = "http://localhost:10000/api/export/pdf"
pdf_data = {
    "filename": "test.csv",
    "target_col": "sales",
    "kpis": {"Total": "1000"},
    "narrative_text": "This is a test narrative.",
    "profile": {"n_rows": 100, "n_cols": 3, "quality_score": 100, "quality_label": "Alta"},
    "anomaly_metrics": {},
    "forecast_metrics": {},
    "segmentation_metrics": {}
}
r3 = requests.post(pdf_url, json=pdf_data)
print(f"Status: {r3.status_code}")
if r3.status_code != 200:
    print(r3.text)
else:
    print("Test 3 Passed.")

