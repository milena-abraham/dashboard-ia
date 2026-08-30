import re

with open('frontend/src/lib/api.ts', 'r') as f:
    text = f.read()

new_func = """
export async function exportPPTX(data: any): Promise<Blob> {
  const response = await fetch(`${API_URL}/api/export/pptx`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Error al exportar PPTX: HTTP ${response.status}`);
  }

  return await response.blob();
}
"""

text = text + new_func

with open('frontend/src/lib/api.ts', 'w') as f:
    f.write(text)
