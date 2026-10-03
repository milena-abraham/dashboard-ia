import React, { useRef, useEffect, useState } from 'react';
import { useSmoothScroll } from '@/app/providers/SmoothScrollProvider';
import { useMioStore } from '@/utils/useMioStore';
import { BubbleArrowButton } from '@/components/ui/BubbleArrowButton';
import { SectionPlate } from '@/components/ui/SectionPlate';
import { FlipText } from '@/components/ui/FlipText';
import { gsap } from '@/lib/gsap';
import { Cpu, Sliders, MessageSquare, FileSpreadsheet, ArrowRight } from 'lucide-react';

interface CapabilityTier {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  features: string[];
  forWho: string;
  metrics: { label: string; value: string };
  icon: typeof FileSpreadsheet;
}

const CAPABILITY_TIERS: CapabilityTier[] = [
  {
    id: 'ingesta',
    tag: 'MÓDULO 01 // HIGIENE',
    title: 'Ingesta de Datos & Detección de Anomalías',
    subtitle: 'Cargá tus archivos sin preparar y aislá desvíos críticos antes de tus cierres.',
    features: [
      'Algoritmo Isolation Forest para aislar outliers estadísticos sin configuración manual',
      'Normalización automática de fechas, formatos numéricos y monedas dispersas',
      'Imputación probabilística de celdas vacías y eliminación de duplicados',
      'Alertas tempranas de quiebres estructurales en series de demanda',
    ],
    forWho: 'Para equipos que pierden horas semanales cruzando y limpiando archivos.',
    metrics: { label: 'Ingesta autónoma', value: 'Sin preparar' },
    icon: FileSpreadsheet,
  },
  {
    id: 'automl',
    tag: 'MÓDULO 02 // AUTOML',
    title: 'Motor AutoML Competitivo para Series de Tiempo',
    subtitle: 'Competencia multimodelo entre Prophet, ARIMA y Boosting con selección matemática.',
    features: [
      'Entrenamiento paralelo de modelos estadísticos y Machine Learning en segundos',
      'Validación cruzada temporal estricta para evitar sobreajuste y datos sesgados',
      'Selección autónoma del modelo con menor error cuadrático medio (RMSE)',
      'Generación de bandas de incertidumbre al 80% y 95% para mitigación de riesgos',
    ],
    forWho: 'Para directores que necesitan proyecciones de demanda robustas sin contratar consultoras.',
    metrics: { label: 'Precisión predictiva', value: '0.984 R²' },
    icon: Cpu,
  },
  {
    id: 'explicabilidad',
    tag: 'MÓDULO 03 // EXPLICABILIDAD',
    title: 'Explicabilidad Causal & Escenarios What-If',
    subtitle: 'Comprensión exacta de qué variables mueven la aguja y simulación en vivo.',
    features: [
      'Descomposición de impacto por variable mediante valores SHAP transparentes',
      'Simulador interactivo en tiempo real para evaluar variaciones de precios o costos',
      'Aislamiento de estacionalidad oculta y tendencias de fondo en tus series',
      'Eliminación de correlaciones espurias para evitar decisiones apresuradas',
    ],
    forWho: 'Para gerencias de operaciones y finanzas que deben justificar cada cifra ante el directorio.',
    metrics: { label: 'Auditabilidad', value: '100% SHAP' },
    icon: Sliders,
  },
  {
    id: 'copiloto',
    tag: 'MÓDULO 04 // COPILOTO',
    title: 'Copiloto Ejecutivo en Lenguaje Natural',
    subtitle: 'Preguntale a tus planillas, descubrí insights y generá reportes en segundos.',
    features: [
      'Respuestas en lenguaje claro a preguntas complejas sobre tus tablas y tendencias',
      'Detección automática de patrones ocultos que no se ven a simple vista en Excel',
      'Exportación ejecutiva inmediata lista para comités de dirección',
      'Trazabilidad total: cada conclusión está respaldada por la matemática del modelo',
    ],
    forWho: 'Para líderes que necesitan respuestas rápidas sin esperar semanas por un informe de BI.',
    metrics: { label: 'Interacción', value: 'Zero Code' },
    icon: MessageSquare,
  },
];

export const PoderCorporativoDOM: React.FC = () => {
  const { scrollTo } = useSmoothScroll();
  const theme = useMioStore((s) => s.theme);
  const isDark = theme === 'dark';

  const sectionRef = useRef<HTMLElement>(null);
  const cardsGridRef = useRef<HTMLDivElement>(null);
  const [activeTierId, setActiveTierId] = useState<string>('ingesta');

  // Reliable Entrance: Cards are visible by default, animate smoothly on scroll
  useEffect(() => {
    if (!cardsGridRef.current || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // immediateRender: false guarantees cards are NOT set to opacity 0 on mount
      gsap.fromTo(
        cardsGridRef.current!.children,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: cardsGridRef.current,
            start: 'top bottom-=60px',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="capacidades"
      className="py-24 sm:py-36 w-full select-none relative z-10"
    >
      {/* Expansive Full Desktop Container */}
      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* Editorial Header (Left-Aligned, Full Margin) */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="mb-4">
            <SectionPlate
              index="02/06"
              label="CAPACIDADES DEL MOTOR MIO"
              tag="ARQUITECTURA"
            />
          </div>
          <h2
            className={`text-3xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.035em] leading-[1.05] ${
              isDark ? 'text-white' : 'text-zinc-950'
            }`}
          >
            <FlipText>Ciencia de datos automática.</FlipText>
            <br />
            <span className="text-[#7647eb] dark:text-[#a78bfa] inline-block">
              <FlipText delayOffset={0.25}>Sin consultoras ni código.</FlipText>
            </span>
          </h2>
          <p
            className={`mt-5 text-base sm:text-lg font-normal leading-relaxed ${
              isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}
          >
            Arquitectura de inferencia de punta a punta: desde la ingesta cruda de planillas hasta la simulación interactiva de escenarios y explicabilidad matemática causal.
          </p>
        </div>

        {/* 2x2 Desktop Grid — monolithic panel with hard shadow */}
        <div ref={cardsGridRef} className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-950 dark:bg-white/20 border-2 border-zinc-950 dark:border-white/20 shadow-[6px_6px_0px_#000] dark:shadow-[6px_6px_0px_#bdf559]">
          {CAPABILITY_TIERS.map((tier) => {
            const isActive = activeTierId === tier.id;
            const Icon = tier.icon;
            return (
              <article
                key={tier.id}
                onClick={() => setActiveTierId(tier.id)}
                className={`p-8 sm:p-10 border-l-[3px] rounded-none transition-all duration-150 flex flex-col justify-between cursor-pointer ${
                  isDark
                    ? isActive
                      ? 'bg-zinc-900/90 border-l-[#bdf559]'
                      : 'bg-[#0e0c19] border-l-transparent hover:bg-zinc-900/50 hover:border-l-[#bdf559]/40'
                    : isActive
                    ? 'bg-zinc-50 border-l-[#7647eb]'
                    : 'bg-white border-l-transparent hover:bg-zinc-50/80 hover:border-l-[#7647eb]/50'
                }`}
              >
                <div className="space-y-6">
                  {/* Card Header Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-none border border-zinc-950/20 dark:border-white/20 bg-[#7647eb]/10 text-[#7647eb] dark:text-[#bdf559] flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono font-bold tracking-wider text-[#7647eb] dark:text-[#bdf559]">
                        {tier.tag}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`text-[11px] block font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-600 font-medium'}`}>
                        {tier.metrics.label}
                      </span>
                      <span className={`text-sm font-bold font-mono ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                        {tier.metrics.value}
                      </span>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h3 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                      {tier.title}
                    </h3>
                    <p className={`mt-2 text-sm font-normal leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      {tier.subtitle}
                    </p>
                  </div>

                  {/* Feature Checklist with Monospace Indicators */}
                  <div className={`space-y-2.5 pt-4 border-t-2 ${isDark ? 'border-white/[0.08]' : 'border-zinc-200'}`}>
                    {tier.features.map((feat, i) => (
                      <div key={i} className={`flex items-start gap-2.5 text-xs sm:text-sm font-mono ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                        <span className="font-mono text-xs font-bold text-[#7647eb] dark:text-[#bdf559] select-none shrink-0 mt-0.5">
                          [+]
                        </span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer: Audience & Distinct Action */}
                <div className={`mt-8 pt-6 border-t-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isDark ? 'border-white/[0.08]' : 'border-zinc-200'}`}>
                  <p className={`text-xs font-mono max-w-xs leading-normal ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {tier.forWho}
                  </p>
                  <button
                    type="button"
                    onClick={() => scrollTo('#como-funciona')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-none text-xs font-mono font-bold tracking-wider border-2 transition-all cursor-pointer select-none active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                      isDark
                        ? 'border-white/20 text-[#bdf559] hover:border-[#bdf559] hover:bg-white/5'
                        : 'border-zinc-950 text-zinc-950 hover:bg-zinc-100 shadow-[2px_2px_0px_#000]'
                    }`}
                  >
                    <span>DIAGNÓSTICO</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default PoderCorporativoDOM;
