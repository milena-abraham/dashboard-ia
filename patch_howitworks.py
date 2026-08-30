import re

with open('frontend/src/app/page.tsx', 'r') as f:
    text = f.read()

how_it_works_old = re.search(r'function HowItWorks\(\) \{.*?(?=function AboutUs\(\) \{)', text, re.DOTALL)
if not how_it_works_old:
    print("Not found")
    exit(1)

how_it_works_new = """function HowItWorks() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const section1Opacity = useTransform(scrollYProgress, [0, 0.25, 0.35], [1, 1, 0]);
  const section2Opacity = useTransform(scrollYProgress, [0.3, 0.4, 0.6, 0.7], [0, 1, 1, 0]);
  const section3Opacity = useTransform(scrollYProgress, [0.65, 0.75, 1], [0, 1, 1]);
  
  const section1Scale = useTransform(scrollYProgress, [0, 0.35], [1, 0.8]);
  const section2Scale = useTransform(scrollYProgress, [0.3, 0.4, 0.6, 0.7], [0.8, 1, 1, 0.8]);
  const section3Scale = useTransform(scrollYProgress, [0.65, 0.75, 1], [0.8, 1, 1]);

  return (
    <section ref={targetRef} className="relative bg-[#fafafc] border-y-4 border-[#111]" style={{ height: '300vh' }}>
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        
        <div className="text-center absolute top-10 md:top-20 left-0 right-0 z-10">
          <h2 className="text-4xl md:text-6xl font-black text-gray-950 tracking-tighter mb-4 px-4">
            Cómo Funciona MIO
          </h2>
        </div>

        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center mt-20">
          
          {/* Left Text */}
          <div className="relative h-48 md:h-96 w-full flex items-center">
            <motion.div style={{ opacity: section1Opacity, willChange: 'opacity' }} className="absolute inset-0 flex flex-col justify-center pointer-events-none">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 border-4 border-[#111] shadow-[4px_4px_0px_#111] flex items-center justify-center mb-4 md:mb-6">
                <FileSpreadsheet className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-gray-950 tracking-tighter mb-2 md:mb-4">1. Subí tu CSV</h2>
              <p className="text-lg md:text-xl text-gray-600 font-medium">Soltá tu archivo crudo. No importa qué tan sucio esté, MIO se encarga de limpiar nulos y duplicados al instante.</p>
            </motion.div>
            
            <motion.div style={{ opacity: section2Opacity, willChange: 'opacity' }} className="absolute inset-0 flex flex-col justify-center pointer-events-none">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-mio-lime border-4 border-[#111] shadow-[4px_4px_0px_#111] flex items-center justify-center mb-4 md:mb-6">
                <BrainCircuit className="w-6 h-6 md:w-8 md:h-8 text-gray-900" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-gray-950 tracking-tighter mb-2 md:mb-4">2. Magia Neuronal</h2>
              <p className="text-lg md:text-xl text-gray-600 font-medium">Modelos matemáticos escanean tus datos buscando anomalías ocultas y proyectando el futuro sin que toques un botón.</p>
            </motion.div>

            <motion.div style={{ opacity: section3Opacity, willChange: 'opacity' }} className="absolute inset-0 flex flex-col justify-center pointer-events-none">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-mio-violet border-4 border-[#111] shadow-[4px_4px_0px_#111] flex items-center justify-center mb-4 md:mb-6">
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-gray-950 tracking-tighter mb-2 md:mb-4">3. Decisión Rápida</h2>
              <p className="text-lg md:text-xl text-gray-600 font-medium">Llevate un reporte ejecutivo narrado por IA y listo para exportar a PDF para tu próxima reunión estratégica.</p>
            </motion.div>
          </div>

          {/* Right Visualizer */}
          <div className="relative h-64 md:h-[30rem] w-full flex items-center justify-center">
             <div className="w-full h-full max-w-sm md:max-w-md bg-white border-4 border-[#111] shadow-[8px_8px_0px_#111] md:shadow-[16px_16px_0px_#111] overflow-hidden relative flex items-center justify-center pointer-events-none">
                
                <motion.div style={{ opacity: section1Opacity, scale: section1Scale }} className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blue-50/20">
                   <div className="w-3/4 h-8 md:h-10 bg-white border-2 border-[#111] animate-pulse"></div>
                   <div className="w-2/3 h-8 md:h-10 bg-white border-2 border-[#111] animate-pulse" style={{ animationDelay: '200ms' }}></div>
                   <div className="w-3/4 h-8 md:h-10 bg-white border-2 border-[#111] animate-pulse" style={{ animationDelay: '400ms' }}></div>
                </motion.div>

                <motion.div style={{ opacity: section2Opacity, scale: section2Scale }} className="absolute inset-0 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-mio-lime/20">
                   <div className="relative w-32 h-32 md:w-48 md:h-48 bg-white border-4 border-[#111] rounded-full flex items-center justify-center shadow-[4px_4px_0px_#111]">
                     <BrainCircuit className="w-16 h-16 md:w-24 md:h-24 text-gray-900 animate-pulse" />
                   </div>
                </motion.div>

                <motion.div style={{ opacity: section3Opacity, scale: section3Scale }} className="absolute inset-0 flex flex-col justify-end gap-2 p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-purple-50/50">
                   <div className="w-full h-1/3 bg-mio-violet border-2 border-[#111] shadow-[4px_4px_0px_#111]"></div>
                   <div className="w-full h-1/2 bg-mio-lime border-2 border-[#111] shadow-[4px_4px_0px_#111]"></div>
                </motion.div>

             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
"""

text = text.replace(how_it_works_old.group(0), how_it_works_new)

with open('frontend/src/app/page.tsx', 'w') as f:
    f.write(text)
