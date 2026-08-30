import re

with open('frontend/src/app/page.tsx', 'r') as f:
    content = f.read()

# Replace HowItWorks component entirely
target = re.search(r'function HowItWorks\(\) \{.*?(?=function BentoGrid\(\) \{)', content, re.DOTALL)
if not target:
    print("Could not find HowItWorks")
    exit(1)

new_how_it_works = """function HowItWorks() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const section1Opacity = useTransform(scrollYProgress, [0, 0.2, 0.3], [1, 1, 0]);
  const section2Opacity = useTransform(scrollYProgress, [0.25, 0.4, 0.6, 0.7], [0, 1, 1, 0]);
  const section3Opacity = useTransform(scrollYProgress, [0.65, 0.8, 1], [0, 1, 1]);

  return (
    <section ref={targetRef} className="relative bg-[#fafafc] border-t-4 border-[#111]" style={{ height: '300vh' }}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Left Text */}
          <div className="relative h-64 md:h-96 flex items-center">
            <motion.div style={{ opacity: section1Opacity, willChange: 'opacity' }} className="absolute inset-0 flex flex-col justify-center">
              <div className="w-16 h-16 bg-blue-100 border-4 border-[#111] shadow-[4px_4px_0px_#111] flex items-center justify-center mb-6">
                <FileSpreadsheet className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-950 tracking-tighter mb-4">1. Subí tu CSV</h2>
              <p className="text-xl text-gray-600 font-medium">Soltá tu archivo crudo. No importa qué tan sucio esté, MIO se encarga de limpiar nulos y duplicados por vos al instante.</p>
            </motion.div>
            
            <motion.div style={{ opacity: section2Opacity, willChange: 'opacity' }} className="absolute inset-0 flex flex-col justify-center">
              <div className="w-16 h-16 bg-mio-lime border-4 border-[#111] shadow-[4px_4px_0px_#111] flex items-center justify-center mb-6">
                <BrainCircuit className="w-8 h-8 text-gray-900" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-950 tracking-tighter mb-4">2. Magia Neuronal</h2>
              <p className="text-xl text-gray-600 font-medium">Prophet, Isolation Forest y K-Means escanean tus datos buscando anomalías ocultas y proyectando el futuro sin que toques un botón.</p>
            </motion.div>

            <motion.div style={{ opacity: section3Opacity, willChange: 'opacity' }} className="absolute inset-0 flex flex-col justify-center">
              <div className="w-16 h-16 bg-mio-violet border-4 border-[#111] shadow-[4px_4px_0px_#111] flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-950 tracking-tighter mb-4">3. Informe Listo</h2>
              <p className="text-xl text-gray-600 font-medium">Llevate un reporte ejecutivo narrado por IA y listo para exportar a PDF para tu próxima junta de directorio.</p>
            </motion.div>
          </div>

          {/* Right Visualizer */}
          <div className="hidden md:flex relative h-96 items-center justify-center">
             <div className="w-full aspect-square max-w-md bg-white border-4 border-[#111] shadow-[16px_16px_0px_#111] overflow-hidden relative flex items-center justify-center">
                
                <motion.div style={{ opacity: section1Opacity, scale: section1Opacity }} className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-blue-50/50">
                   <div className="w-3/4 h-8 bg-gray-200 border-2 border-[#111] animate-pulse"></div>
                   <div className="w-2/3 h-8 bg-gray-200 border-2 border-[#111] animate-pulse delay-75"></div>
                   <div className="w-3/4 h-8 bg-gray-200 border-2 border-[#111] animate-pulse delay-150"></div>
                </motion.div>

                <motion.div style={{ opacity: section2Opacity }} className="absolute inset-0 flex items-center justify-center bg-green-50/50">
                   <div className="relative w-48 h-48 border-4 border-[#111] rounded-full flex items-center justify-center">
                     <BrainCircuit className="w-20 h-20 text-mio-lime animate-spin-slow" />
                   </div>
                </motion.div>

                <motion.div style={{ opacity: section3Opacity, scale: section3Opacity }} className="absolute inset-0 flex flex-col justify-end gap-2 p-6 bg-purple-50/50">
                   <div className="w-full h-1/2 bg-mio-violet border-2 border-[#111]"></div>
                   <div className="w-full h-3/4 bg-mio-lime border-2 border-[#111]"></div>
                </motion.div>

             </div>
          </div>

        </div>
      </div>
    </section>
  );
}

"""

content = content.replace(target.group(0), new_how_it_works)

with open('frontend/src/app/page.tsx', 'w') as f:
    f.write(content)
