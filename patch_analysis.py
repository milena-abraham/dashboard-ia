import re

with open('backend/routers/analysis.py', 'r') as f:
    lines = f.readlines()

out = []
in_analyze = False
for i, line in enumerate(lines):
    if line.startswith('import json'):
        out.append(line)
        out.append('import asyncio\n')
        out.append('import hashlib\n')
        out.append('from cachetools import TTLCache\n')
        out.append('\n')
        out.append('# Cache global para ML (max 50, 1 hr)\n')
        out.append('ANALYSIS_CACHE = TTLCache(maxsize=50, ttl=3600)\n')
        continue
        
    if line.startswith('@router.post("/analyze")'):
        in_analyze = True
        
        # Append the new async wrapper
        wrapper = """
def _process_data_sync(contents: bytes, filename: str, target_col: str):
    fname_lower = filename.lower()
"""
        out.append(wrapper)
        continue
        
    if in_analyze:
        if line.startswith('async def analyze('):
            continue
        if 'file: UploadFile =' in line or 'target_col: Optional' in line or '):' == line.strip():
            continue
            
        if line.strip() == 'try:':
            continue
            
        if line.strip() == 'contents = await file.read()':
            continue
        if line.strip() == 'filename = file.filename or "dataset"':
            continue
        if line.strip() == 'fname_lower = filename.lower()':
            continue
            
        if line.startswith('    except HTTPException:'):
            out.append('    if True:\n')
            out.append('        pass\n')
            continue
        if line.startswith('        raise'):
            continue
        if line.startswith('    except Exception as ex:'):
            continue
        if line.startswith('        raise HTTPException'):
            continue
            
        # De-indent by 4 spaces because we removed try:
        if line.startswith('    '):
            out.append(line[4:])
        else:
            out.append(line)
    else:
        out.append(line)

# Add the router at the end
out.append("""
@router.post("/analyze")
async def analyze(file: UploadFile = File(...), target_col: Optional[str] = Form(None)):
    contents = await file.read()
    filename = file.filename or "dataset"
    
    # Hash for cache
    file_hash = hashlib.sha256(contents).hexdigest()
    t_col = str(target_col).strip().lower() if target_col else "none"
    cache_key = f"{file_hash}_{t_col}"
    
    if cache_key in ANALYSIS_CACHE:
        print(f"--> Cache hit para {filename} ({t_col})")
        return ANALYSIS_CACHE[cache_key]
        
    try:
        # Correr en un hilo separado para NO BLOQUEAR a otros usuarios!
        res = await asyncio.to_thread(_process_data_sync, contents, filename, target_col)
        ANALYSIS_CACHE[cache_key] = res
        return res
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))
""")

with open('backend/routers/analysis.py', 'w') as f:
    f.writelines(out)
