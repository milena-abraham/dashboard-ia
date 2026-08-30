import re

with open('frontend/src/app/dashboard/page.tsx', 'r') as f:
    text = f.read()

# Imports
text = text.replace("import { analyzeFile, exportPDF } from '@/lib/api';", "import { analyzeFile, exportPDF, exportPPTX } from '@/lib/api';")
text = text.replace("import { Download,", "import { Download, Presentation,")

# State
text = text.replace("const [downloadingPdf, setDownloadingPdf] = useState(false);", "const [downloadingPdf, setDownloadingPdf] = useState(false);\n  const [downloadingPptx, setDownloadingPptx] = useState(false);")

# Function
pptx_func = """
  const handleDownloadPptx = async () => {
    if (!result) return;
    setDownloadingPptx(true);
    try {
      const blob = await exportPPTX({
        filename: result.filename,
        target_col: result.target_col,
        kpis: result.kpis,
        narrative_text: result.narrative.text,
        profile: result.profile,
        anomaly_metrics: result.anomalies?.metrics || {},
        forecast_metrics: result.forecast?.metrics || {},
        segmentation_metrics: result.segmentation?.metrics || {},
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presentacion_${result.filename}.pptx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PPTX descargado exitosamente');
    } catch (err) {
      console.error(err);
      toast.error('Error al generar el PPTX.');
    } finally {
      setDownloadingPptx(false);
    }
  };
"""

text = text.replace("const handleReset =", pptx_func + "\n  const handleReset =")

# Button
btn_code = """
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-none bg-mio-violet hover:bg-mio-violet/90 text-white text-xs font-semibold shadow-[4px_4px_0px_#111] transition-all disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadingPdf ? 'Generando PDF...' : 'Exportar PDF'}</span>
                </button>
"""

new_btn_code = """
                <button
                  onClick={handleDownloadPptx}
                  disabled={downloadingPptx}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-none bg-mio-lime hover:bg-mio-lime/90 text-gray-900 text-xs font-semibold shadow-[4px_4px_0px_#111] transition-all disabled:opacity-50"
                >
                  <Presentation className="w-4 h-4" />
                  <span>{downloadingPptx ? 'Generando PPTX...' : 'Exportar PPTX'}</span>
                </button>
""" + btn_code

text = text.replace(btn_code, new_btn_code)

with open('frontend/src/app/dashboard/page.tsx', 'w') as f:
    f.write(text)
