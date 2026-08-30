import re

with open('backend/routers/analysis.py', 'r') as f:
    content = f.read()

# Add asyncio and hashlib imports
content = content.replace('import json', 'import json\nimport asyncio\nimport hashlib\nfrom cachetools import TTLCache')

# We need to install cachetools or just use a simple dict
content = content.replace('from cachetools import TTLCache', 'from cachetools import TTLCache\n\n# Caché en memoria para evitar reprocesar el mismo CSV (TTL de 1 hora, max 100 archivos)\nANALYSIS_CACHE = TTLCache(maxsize=100, ttl=3600)\n')

# Now wrap the inner logic of `analyze` into a def `_process_data_sync`
analyze_pattern = re.compile(r'(@router\.post\("/analyze"\)\s+async def analyze\([\s\S]*?):\n    try:\n        contents = await file\.read\(\)\n        filename = file\.filename or "dataset"\n        fname_lower = filename\.lower\(\)\n\n([\s\S]*)', re.MULTILINE)
match = analyze_pattern.search(content)

if match:
    header = match.group(1)
    body = match.group(2)
    
    # Extract the body inside the try/except
    # The body ends with the return statement. Wait, let's just do a manual replacement.
    pass

