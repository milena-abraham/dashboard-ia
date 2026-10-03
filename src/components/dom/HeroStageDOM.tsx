import React, { useRef, useEffect, useState } from 'react';
import { useSmoothScroll } from '@/app/providers/SmoothScrollProvider';
import { useMioStore } from '@/utils/useMioStore';
import { BubbleArrowButton } from '@/components/ui/BubbleArrowButton';
import { MioDevCanvas } from '@/components/canvas/MioDevCanvas';
import { MioHeroStage } from '@/components/canvas/MioHeroStage';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { SectionPlate } from '@/components/ui/SectionPlate';
import { FlipText } from '@/components/ui/FlipText';
import { gsap } from '@/lib/gsap';
import { playMioDevSound } from '@/lib/sound';

export const HeroStageDOM: React.FC = () => {
  const { scrollTo } = useSmoothScroll();
  const theme = useMioStore((s) => s.theme);
  const isDark = theme === 'dark';
  const [climateYear, setClimateYear] = useState(1979);

  const sectionRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const deviceColRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // GSAP ScrollTrigger Entrance & Decoupled 5-Layer Parallax
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Entrance animation with staggered reveal
      const tlEntrance = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (badgeRef.current) {
        tlEntrance.from(badgeRef.current, { y: 20, opacity: 0, duration: 0.7 }, 0.1);
      }
      if (subtitleRef.current) {
        tlEntrance.from(subtitleRef.current, { y: 25, opacity: 0, duration: 0.8 }, 0.35);
      }
      if (actionsRef.current) {
        tlEntrance.from(actionsRef.current, { y: 20, opacity: 0, duration: 0.8 }, 0.45);
      }
      if (deviceColRef.current) {
        tlEntrance.from(deviceColRef.current, { x: 70, opacity: 0, duration: 1.2 }, 0.3);
      }

      // 2. Decoupled 5-Layer Parallax on Scroll (Apple & Emil Compliance)
      const tlParallax = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      });

      // Layer 1: Eyebrow badge (speed: 0.4x)
      if (badgeRef.current) {
        tlParallax.to(badgeRef.current, { y: 50, opacity: 0.7, ease: 'none' }, 0);
      }
      // Layer 3: Monumental Headline & Subtitle (speed: 0.7x)
      if (headlineRef.current) {
        tlParallax.to(headlineRef.current, { y: 75, ease: 'none' }, 0);
      }
      if (subtitleRef.current) {
        tlParallax.to(subtitleRef.current, { y: 60, ease: 'none' }, 0);
      }
      if (actionsRef.current) {
        tlParallax.to(actionsRef.current, { y: 50, ease: 'none' }, 0);
      }
      // Layer 4: Track Record Bar (speed: 0.85x)
      if (statsRef.current) {
        tlParallax.to(statsRef.current, { y: 45, ease: 'none' }, 0);
      }
      // Layer 5: MIO-DEV Hardware (speed: 1.15x smooth vertical elevation)
      if (deviceColRef.current) {
        tlParallax.to(
          deviceColRef.current,
          {
            y: -45,
            ease: 'none',
          },
          0
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative pt-6 sm:pt-10 lg:pt-12 pb-14 sm:pb-20 w-full select-none overflow-x-hidden flex flex-col justify-center"
    >
      {/* Full Desktop Container */}
      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center">
          
          {/* LEFT COLUMN: Monumental Left-Aligned Typography (7 cols on Laptop, 6 on Ultra-Wide) */}
          <div className="lg:col-span-7 xl:col-span-6 flex flex-col items-start text-left space-y-6 z-10">
            {/* Layer 1: Section Metrology Plate (01/06) */}
            <div ref={badgeRef}>
              <SectionPlate
                index="01/06"
                label="OPERACIONES DE DATOS & AUTOML"
                tag="STAGE 3D ESPÉCIMEN 01"
              />
            </div>

            {/* Layer 3: Monumental Headline — Climate Crisis kinetic variable axis (1979-2050) */}
            <h1
              ref={headlineRef}
              onMouseEnter={() => setClimateYear(2035)}
              onMouseLeave={() => setClimateYear(1979)}
              className={`font-climate text-3xl sm:text-5xl lg:text-[2.65rem] xl:text-[3.25rem] 2xl:text-[3.75rem] leading-[1.18] sm:leading-[1.16] transition-colors cursor-default select-none ${
                isDark ? 'text-white' : 'text-zinc-950'
              }`}
              style={{
                fontVariationSettings: `'YEAR' ${climateYear}`,
                transition: 'font-variation-settings 0.55s cubic-bezier(0.23, 1, 0.32, 1)',
              }}
              title="Tipografía cinética: Climate Crisis Variable Axis (1979–2050)"
            >
              <FlipText delayOffset={0}>Convertí planillas en</FlipText>{' '}
              <span className="text-[#7647eb] dark:text-[#bdf559] inline-block">
                <FlipText delayOffset={0.16}>decisiones.</FlipText>
              </span>
            </h1>

            {/* Subtitle Grounded strictly in Real MIO Scope */}
            <p
              ref={subtitleRef}
              className={`text-base sm:text-lg md:text-xl max-w-xl font-normal leading-relaxed transition-colors ${
                isDark ? 'text-zinc-400' : 'text-zinc-600'
              }`}
            >
              Cargá tus archivos sin preparar. MIO aísla anomalías estadísticas con Isolation Forest y calibra modelos predictivos en menos de 60 segundos.
            </p>

            {/* Action Row */}
            <div ref={actionsRef} className="pt-2 flex flex-wrap items-center gap-4">
              <BubbleArrowButton
                size="lg"
                variant="primary"
                onClick={() => {
                  playMioDevSound('select');
                  try { localStorage.removeItem('mio_active_analysis'); } catch {}
                  window.history.pushState({}, '', '/dashboard?new=1');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
              >
                Cargar Planilla y Diagnosticar
              </BubbleArrowButton>

              <button
                type="button"
                onClick={() => scrollTo('#como-funciona')}
                className={`px-6 py-3 rounded-none text-xs font-mono font-bold tracking-wider transition-all duration-100 ease-out active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border-2 cursor-pointer ${
                  isDark
                    ? 'text-zinc-200 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border-white/20 shadow-[2px_2px_0px_#ffffff]'
                    : 'text-zinc-950 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200 border-zinc-950 shadow-[2px_2px_0px_#000]'
                }`}
              >
                VER METODOLOGÍA [01–03]
              </button>

            </div>
          </div>

          {/* RIGHT COLUMN: The Real MIO-DEV 01 Hardware Precision Station + MIO Espécimen 01 3D companion */}
          <div
            ref={deviceColRef}
            className="lg:col-span-5 xl:col-span-6 relative flex items-center justify-center lg:justify-end overflow-visible"
          >
            <div className="w-full max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl relative z-10 flex justify-center lg:justify-end">
              <MioDevCanvas />
            </div>

            {/* MIO Espécimen 01 — live 3D companion standing on a dither pad alongside the console.
                Clickable: triggers celebration and shockwave */}
            <MioHeroStage
              className="absolute z-20 pointer-events-auto cursor-pointer -left-4 -bottom-6 sm:-left-6 sm:-bottom-8 lg:-left-24 xl:-left-28 lg:-bottom-8 w-[200px] h-[200px] sm:w-[260px] sm:h-[260px] lg:w-[300px] lg:h-[300px] xl:w-[340px] xl:h-[340px]"
            />
          </div>
        </div>

        {/* BOTTOM PROOF & TRACK RECORD BAR: Monolithic Swiss Grid per BRANDING.md §2.1 */}
        <div ref={statsRef} className="mt-14 sm:mt-20 w-full border-2 border-zinc-950 dark:border-white/20 bg-zinc-950/20 dark:bg-white/10 shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#bdf559]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px text-left">
            <div className="space-y-1 bg-[#fbfbfd] dark:bg-[#090812] p-5 sm:p-6">
              <div className={`text-3xl sm:text-4xl font-bold tracking-tight font-mono ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                &lt; <AnimatedCounter value={60} suffix="s" />
              </div>
              <p className={`text-xs sm:text-sm font-mono leading-snug ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                De planilla cruda a pronósticos ejecutivos y bandas P95.
              </p>
            </div>

            <div className="space-y-1 bg-[#fbfbfd] dark:bg-[#090812] p-5 sm:p-6">
              <div className="text-3xl sm:text-4xl font-bold tracking-tight font-mono text-[#7647eb] dark:text-[#bdf559]">
                <AnimatedCounter value={0.984} decimals={3} suffix=" R²" />
              </div>
              <p className={`text-xs sm:text-sm font-mono leading-snug ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Benchmark medido en series con estacionalidad compleja.
              </p>
            </div>

            <div className="space-y-1 bg-[#fbfbfd] dark:bg-[#090812] p-5 sm:p-6">
              <div className={`text-3xl sm:text-4xl font-bold tracking-tight font-mono ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                100% SHAP
              </div>
              <p className={`text-xs sm:text-sm font-mono leading-snug ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Auditabilidad causal de cada variable sin cajas negras.
              </p>
            </div>

            <div className="space-y-1 bg-[#fbfbfd] dark:bg-[#090812] p-5 sm:p-6">
              <div className={`text-3xl sm:text-4xl font-bold tracking-tight font-mono ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                Zero Code
              </div>
              <p className={`text-xs sm:text-sm font-mono leading-snug ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Consultas en lenguaje natural con copiloto Gemini integrado.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroStageDOM;
