import re

with open('backend/routers/analysis.py', 'r') as f:
    text = f.read()

# Imports
text = text.replace('import json', 'import json\nimport asyncio\nimport hashlib\nfrom cachetools import TTLCache\n\nANALYSIS_CACHE = TTLCache(maxsize=50, ttl=3600)\n')

# Find the signature
sig = """@router.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    target_col: Optional[str] = Form(None),
):"""

wrapper = """@router.post("/analyze")
async def analyze(file: UploadFile = File(...), target_col: Optional[str] = Form(None)):
    contents = await file.read()
    filename = file.filename or "dataset"
    h = hashlib.sha256(contents).hexdigest()
    t = str(target_col).lower() if target_col else "none"
    cache_key = f"{h}_{t}"
    if cache_key in ANALYSIS_CACHE:
        return ANALYSIS_CACHE[cache_key]
    try:
        res = await asyncio.to_thread(_analyze_sync, contents, filename, target_col)
        ANALYSIS_CACHE[cache_key] = res
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def _analyze_sync(contents: bytes, filename: str, target_col: Optional[str]):"""

text = text.replace(sig, wrapper)

# Replace the file reads inside _analyze_sync
text = text.replace('contents = await file.read()', '# contents given as arg')
text = text.replace('filename = file.filename or "dataset"', '# filename given as arg')

with open('backend/routers/analysis.py', 'w') as f:
    f.write(text)
