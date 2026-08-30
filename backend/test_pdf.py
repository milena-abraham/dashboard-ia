from reports.pdf_generator import generate_pdf_report
res = generate_pdf_report("test.csv", "sales", {"Total": "1000"}, "This is a report.", {"n_rows": 100, "n_cols": 5})
print(res[:20] if res else "None")
