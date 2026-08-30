import re

with open('backend/routers/analysis.py', 'r') as f:
    text = f.read()

# Add imports
text = text.replace('import json', 'import json\nimport asyncio\nimport hashlib\nfrom cachetools import TTLCache\n\n# Caché global para ahorrar CPU (100 archivos, 1 hora)\nANALYSIS_CACHE = TTLCache(maxsize=100, ttl=3600)\n')

# Find the start of the analyze function
target_str = '''@router.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    target_col: Optional[str] = Form(None),
):
    try:'''

replacement = '''
def _process_data_sync(contents: bytes, filename: str, target_col: str):
    fname_lower = filename.lower()
'''
text = text.replace(target_str, replacement)

# We need to indent the rest of the function or just replace the whole thing.
