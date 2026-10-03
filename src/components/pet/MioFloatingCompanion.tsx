import React, { useState, useEffect, useRef } from 'react';
import { playMioDevSound } from '@/lib/sound';
import { X, RotateCw, ArrowRight, Minimize2, Maximize2, Terminal, Sliders, Sparkles } from 'lucide-react';
import { navigateWithDither } from '@/components/ui/DitherRouteCurtain';
import { useMioStore } from '@/utils/useMioStore';
import { MioPet2D, MioPetMood, MioPetMaterial } from './MioPet2D';

export type CompanionStyle = 'deck' | 'float' | 'ribbon';

interface PhraseData {
  title: string;
  tag: string;
  color: string;
  messages: string[];
}

const MOOD_DIALOGUES: Record<MioPetMood, PhraseData> = {
  reposo: {
    title: 'MIO // ESPÉCIMEN 01',
    tag: 'SYS.STANDBY',
    color: '#bdf559',
    messages: [
      'Sistemas de telemetría nominales. Hacé clic para alternar mis estados de inferencia.',
      'Cero desvíos en el pipeline. Listo para cargar planillas o modelar series de tiempo.',
      'Monitoreando memoria y CPU. Esperando nuevas directivas estadísticas.'
    ],
  },
  trabajando: {
    title: 'MIO // ENTRENAMIENTO',
    tag: 'AUTOML.FIT',
    color: '#60a5fa',
    messages: [
      'Procesando filas por segundo. Calibrando LightGBM, Prophet y XGBoost.',
      'Calculando valores SHAP y feature importances. Minimizando el RMSE global.',
      'Ajustando hiperparámetros por validación cruzada temporal de 5 pliegues.'
    ],
  },
  celebrando: {
    title: 'MIO // CONVERGENCIA',
    tag: 'R²: 0.984 ÓPTIMO',
    color: '#fbbf24',
    messages: [
      '¡Convergencia alcanzada! Modelo óptimo seleccionado sin sobreajuste.',
      'Precisión R² de 0.984 confirmada. Bandas de confianza P95 calibradas.',
      'Proyección ejecutiva generada con éxito. Lista para auditoría en el Workspace.'
    ],
  },
  anomalia: {
    title: 'MIO // ALERTA OUTLIER',
    tag: 'SPIKE > 3.5σ',
    color: '#f43f5e',
    messages: [
      'Desvío anómalo detectado en cuartil superior. Posible quiebre estructural.',
      'Isolation Forest aisló 42 registros atípicos fuera del intervalo nominal.',
      'Alerta de dispersión en serie temporal. Recomendada inspección en tabla ±σ.'
    ],
  },
  durmiendo: {
    title: 'MIO // STANDBY BAJO CONSUMO',
    tag: 'ENERGY.SAVER',
    color: '#a78bfa',
    messages: [
      'Modo reposo cuántico. Ahorrando ciclos de GPU para la próxima inferencia.',
      'Tablas indexadas en memoria. Haceme clic para reactivar los núcleos.',
      'En espera de nuevas planillas .xlsx o .csv para procesar.'
    ],
  },
};

const MOOD_SEQUENCE: MioPetMood[] = ['reposo', 'trabajando', 'celebrando', 'anomalia', 'durmiendo'];
const MATERIAL_SEQUENCE: MioPetMaterial[] = ['violet', 'titanium', 'blackChrome'];

export const MioFloatingCompanion: React.FC = () => {
  const storePetMood = useMioStore((s) => s.petMood);
  const setStorePetMood = useMioStore((s) => s.setPetMood);
  const theme = useMioStore((s) => s.theme);
  const isDark = theme === 'dark';

  const mood = storePetMood;
  const [material, setMaterial] = useState<MioPetMaterial>('violet');
  const [companionStyle, setCompanionStyle] = useState<CompanionStyle>('deck');
  const [messageIndex, setMessageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false); // Default collapsed into clean non-intrusive status pill!
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const prevMoodRef = useRef(storePetMood);

  // Hide companion while in the Hero section so MIO on stage is the single focus
  useEffect(() => {
    const handleScroll = () => {
      setScrolledPastHero(window.scrollY > 450);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reactive speech update when mood changes
  useEffect(() => {
    if (prevMoodRef.current !== storePetMood) {
      prevMoodRef.current = storePetMood;
      const nextPhraseIdx = Math.floor(Math.random() * (MOOD_DIALOGUES[storePetMood]?.messages.length || 1));
      setMessageIndex(nextPhraseIdx);
    }
  }, [storePetMood]);

  const cycleMood = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    playMioDevSound('buttonA');

    const currentIndex = MOOD_SEQUENCE.indexOf(mood);
    const nextMood = MOOD_SEQUENCE[(currentIndex + 1) % MOOD_SEQUENCE.length];
    const nextPhraseIdx = Math.floor(Math.random() * MOOD_DIALOGUES[nextMood].messages.length);

    setStorePetMood(nextMood);
    setMessageIndex(nextPhraseIdx);
  };

  const cycleMaterial = (e: React.MouseEvent) => {
    e.stopPropagation();
    playMioDevSound('toggle');
    const currentIndex = MATERIAL_SEQUENCE.indexOf(material);
    const nextMaterial = MATERIAL_SEQUENCE[(currentIndex + 1) % MATERIAL_SEQUENCE.length];
    setMaterial(nextMaterial);
  };

  const handleSelectMood = (m: MioPetMood, e: React.MouseEvent) => {
    e.stopPropagation();
    playMioDevSound('select');
    setStorePetMood(m);
    setMessageIndex(Math.floor(Math.random() * MOOD_DIALOGUES[m].messages.length));
  };

  const navigateToDashboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigateWithDither('/dashboard');
  };

  const currentDialogue = MOOD_DIALOGUES[mood] || MOOD_DIALOGUES['reposo'];
  const activeMessage = currentDialogue.messages[messageIndex % currentDialogue.messages.length];

  // Do not render floating companion in the hero to keep hero stage focused
  if (!scrolledPastHero) {
    return null;
  }

  // =========================================================================
  // POSIBILIDAD 3: "MINIMALIST TELEMETRY RIBBON" (Barra ultra compacta)
  // =========================================================================
  if (companionStyle === 'ribbon') {
    return (
      <aside aria-label="MIO Telemetry Ribbon" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <div className="flex items-center gap-2 bg-[#0e0c19] text-white border-2 border-white/20 p-2 pl-2.5 shadow-[4px_4px_0_#bdf559] select-none font-mono">
          {/* Mini CRT with 2D Pet avatar */}
          <div
            onClick={cycleMood}
            title="Alternar estado de MIO"
            className="w-8 h-8 bg-black border border-[#bdf559]/40 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden relative group"
          >
            <MioPet2D mood={mood} material={material} size={30} showShadow={false} animated />
            <div className="absolute inset-0 bg-[#bdf559]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Marquee message */}
          <div className="max-w-[220px] sm:max-w-[340px] truncate text-xs text-zinc-300">
            <span className="text-[#bdf559] font-bold mr-1">&gt;</span>
            <span className="font-semibold text-white">{mood.toUpperCase()}:</span> {activeMessage}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0 pl-1 border-l border-white/10">
            <button
              onClick={navigateToDashboard}
              className="px-2 py-1 bg-[#bdf559] text-black font-bold text-[10px] tracking-wider uppercase border border-black hover:bg-[#a6ec38] cursor-pointer"
            >
              WORKSPACE
            </button>

            {/* Switch Style button */}
            <button
              onClick={() => {
                playMioDevSound('tick');
                setCompanionStyle('deck');
              }}
              title="Cambiar formato del companion"
              className="p-1 hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer text-[10px]"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // =========================================================================
  // POSIBILIDAD 2: "PURE PIXEL-ART MASCOT FLOTANTE" (Sin sombras rotas)
  // =========================================================================
  if (companionStyle === 'float') {
    return (
      <aside aria-label="MIO Pixel Mascot" className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none pointer-events-none">
        {/* Dialogue Bubble */}
        {isExpanded && (
          <div className="mb-2 w-[320px] max-w-[calc(100vw-2.5rem)] pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="bg-[#fbfbfd] dark:bg-[#0e0c19] border-2 border-zinc-950 dark:border-white p-3.5 text-zinc-950 dark:text-white shadow-[5px_5px_0_#000] dark:shadow-[5px_5px_0_#bdf559] font-mono text-xs">
              <div className="flex items-center justify-between border-b-2 border-zinc-950/20 dark:border-white/20 pb-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2" style={{ backgroundColor: currentDialogue.color }} />
                  <span className="font-bold text-[10px] tracking-wider uppercase">{currentDialogue.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCompanionStyle('deck')} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 text-[9px] cursor-pointer" title="Modo Deck">
                    <Sliders className="w-3 h-3" />
                  </button>
                  <button onClick={() => setIsExpanded(false)} className="p-1 hover:bg-rose-500 hover:text-white cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="p-2 bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 leading-relaxed min-h-[38px]">
                <span className="text-[#7647eb] dark:text-[#bdf559] font-bold">&gt;&nbsp;</span>"{activeMessage}"
              </div>

              <div className="mt-2.5 flex items-center justify-between gap-1 pt-1.5 border-t border-black/10 dark:border-white/10">
                <button
                  onClick={cycleMood}
                  className="px-2.5 py-1 text-[10px] font-bold border-2 border-zinc-950 dark:border-white/30 bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 cursor-pointer shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#bdf559]"
                >
                  ROTAR ESTADO
                </button>
                <button
                  onClick={navigateToDashboard}
                  className="px-3 py-1 text-[10px] font-bold bg-[#bdf559] text-zinc-950 border-2 border-black hover:bg-[#a6ec38] cursor-pointer shadow-[2px_2px_0_#000]"
                >
                  WORKSPACE →
                </button>
              </div>

              {/* Stepped Pixel Tail */}
              <div className="absolute -bottom-2.5 right-10 flex flex-col items-center pointer-events-none">
                <div className="w-4 h-1 bg-zinc-950 dark:bg-white" />
                <div className="w-2.5 h-1 bg-zinc-950 dark:bg-white" />
                <div className="w-1 h-0.5 bg-zinc-950 dark:bg-white" />
              </div>
            </div>
          </div>
        )}

        {/* Mascot & Dither Pad */}
        <div className="pointer-events-auto flex flex-col items-center">
          <div
            onClick={() => {
              playMioDevSound('select');
              setIsExpanded(!isExpanded);
            }}
            title="¡Hacé clic para dialogar con MIO!"
            className="cursor-pointer select-none relative group"
          >
            {/* Pure SVG Vector Mascot — Crisp, ZERO artifacts, perfect resolution */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 animate-[bounce_4s_infinite_ease-in-out] flex items-center justify-center filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)]">
              <MioPet2D
                mood={mood}
                material={material}
                size={110}
                showShadow={false}
                animated
                isHovered={isHovered}
              />
            </div>

            {/* Halftone Dither Shadow Pad on the floor */}
            <div className="w-16 h-3 mx-auto mt-[-10px] opacity-60 flex items-center justify-center">
              <div className="w-full h-full rounded-none border border-black/40 dark:border-white/30 bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#bdf559_1px,transparent_1px)] [background-size:4px_4px]" />
            </div>
          </div>

          {/* Technical Pill */}
          <div
            onClick={() => {
              playMioDevSound('select');
              setIsExpanded(!isExpanded);
            }}
            className="mt-1 px-2.5 py-0.5 rounded-none bg-zinc-950 dark:bg-[#0e0c19] border-2 border-zinc-950 dark:border-white text-[9px] font-mono tracking-widest text-zinc-300 flex items-center gap-1.5 shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#bdf559] cursor-pointer"
          >
            <span className="w-1.5 h-1.5 animate-pulse" style={{ backgroundColor: currentDialogue.color }} />
            <span className="uppercase text-[9px] font-bold text-white">MIO // {mood}</span>
          </div>
        </div>
      </aside>
    );
  }

  // =========================================================================
  // POSIBILIDAD 1 (DEFAULT): "TEENAGE ENGINEERING CYBER-POCKET OPERATOR DOCK"
  // =========================================================================
  // Minimizado: No ocupa lugar en la pantalla, es un microswitch de precisión
  if (!isExpanded) {
    return (
      <aside aria-label="MIO Pocket Console" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <button
          onClick={() => {
            playMioDevSound('select');
            setIsExpanded(true);
          }}
          className="flex items-center gap-2.5 px-3 py-2 rounded-none bg-[#0e0c19] text-white border-2 border-zinc-950 dark:border-white shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#bdf559] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all font-mono text-xs group cursor-pointer"
        >
          {/* Mini Vector Face indicator */}
          <div className="w-5 h-5 bg-black border border-[#bdf559]/50 flex items-center justify-center shrink-0">
            <MioPet2D mood={mood} material={material} size={18} showShadow={false} />
          </div>
          <span className="w-1.5 h-1.5 rounded-none bg-[#bdf559] animate-pulse" />
          <span className="font-bold tracking-wider">[MIO // {mood.toUpperCase()}]</span>
          <span className="text-[10px] text-zinc-400 group-hover:text-[#bdf559]">▲ DESPLEGAR</span>
        </button>
      </aside>
    );
  }

  // Expandido: Una auténtica consola portátil de metrología
  return (
    <aside aria-label="MIO Pocket Console Deck" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 select-none animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="w-[330px] sm:w-[360px] max-w-[calc(100vw-2rem)] rounded-none bg-[#0e0c19] border-2 sm:border-3 border-zinc-950 dark:border-white text-white shadow-[6px_6px_0px_#000] dark:shadow-[6px_6px_0px_#bdf559] p-3 sm:p-4 font-mono">
        
        {/* TOP BAR: Metrology plate + Hardware controls */}
        <div className="flex items-center justify-between border-b-2 border-white/20 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 border border-black" style={{ backgroundColor: currentDialogue.color }} />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white">
              {currentDialogue.title}
            </h4>
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            {/* Style switcher dropdown or toggle */}
            <button
              onClick={() => {
                playMioDevSound('tick');
                setCompanionStyle('ribbon');
              }}
              title="Cambiar a Barra compacta"
              className="px-1.5 py-0.5 border border-white/20 hover:bg-white/10 text-zinc-300 hover:text-white cursor-pointer"
            >
              BARRA
            </button>
            <button
              onClick={() => {
                playMioDevSound('tick');
                setCompanionStyle('float');
              }}
              title="Cambiar a Mascota libre"
              className="px-1.5 py-0.5 border border-white/20 hover:bg-white/10 text-zinc-300 hover:text-white cursor-pointer"
            >
              LIBRE
            </button>
            <button
              onClick={cycleMaterial}
              title="Alternar acabado (Violeta / Titanio / Cromo)"
              className="p-1 border border-white/20 hover:bg-white/10 text-zinc-300 hover:text-white cursor-pointer"
            >
              <RotateCw className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsExpanded(false)}
              title="Minimizar a botón"
              className="p-1 border border-white/20 hover:bg-white/10 text-zinc-300 hover:text-white cursor-pointer"
            >
              <Minimize2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* MAIN BODY: CRT Screen with Vector Pet + Telemetry info */}
        <div className="grid grid-cols-12 gap-3 mb-3">
          
          {/* CRT Screen Chamber (Left: 5 cols) */}
          <div
            onClick={cycleMood}
            title="¡Hacé clic en la pantalla para rotar de estado!"
            className="col-span-5 bg-black border-2 border-white/20 p-2 flex flex-col items-center justify-center relative cursor-pointer group overflow-hidden"
          >
            {/* CRT Scanline effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,31,0)_50%,rgba(0,0,0,0.7)_50%)] bg-[length:100%_3px] pointer-events-none opacity-40" />
            <div className="relative z-10 w-full flex items-center justify-center py-1 group-hover:scale-105 transition-transform">
              <MioPet2D mood={mood} material={material} size={90} showShadow={false} animated isHovered={isHovered} />
            </div>
            <div className="relative z-10 mt-1 text-[8px] font-bold text-[#bdf559] tracking-widest uppercase">
              [ESTADO: {mood}]
            </div>
          </div>

          {/* Telemetry & Quote Console (Right: 7 cols) */}
          <div className="col-span-7 flex flex-col justify-between">
            <div className="bg-white/[0.04] border border-white/10 p-2 text-[11px] leading-relaxed text-zinc-200 min-h-[72px]">
              <span className="text-[#bdf559] font-bold">&gt;&nbsp;</span>
              "{activeMessage}"
            </div>

            {/* Quick metrics chip */}
            <div className="flex items-center justify-between text-[9px] text-zinc-400 mt-2 px-1">
              <span>LATENCIA: &lt;8.2ms</span>
              <span className="text-[#bdf559] font-bold">R²: 0.984</span>
            </div>
          </div>
        </div>

        {/* HARDWARE BUTTONS ROW */}
        <div className="pt-2 border-t-2 border-white/20 flex flex-col gap-2">
          {/* Mood Switches */}
          <div className="flex items-center justify-between gap-1 text-[9px]">
            <span className="text-zinc-500 font-bold uppercase tracking-wider">MODO:</span>
            <div className="flex items-center gap-1">
              {(['reposo', 'trabajando', 'celebrando', 'anomalia'] as MioPetMood[]).map((m) => (
                <button
                  key={m}
                  onClick={(e) => handleSelectMood(m, e)}
                  className={`px-1.5 py-0.5 rounded-none border transition-all cursor-pointer uppercase font-bold text-[9px] active:translate-x-[1px] active:translate-y-[1px] ${
                    mood === m
                      ? 'bg-[#bdf559] text-zinc-950 border-[#bdf559] shadow-[1px_1px_0px_#fff]'
                      : 'bg-white/5 border-white/20 text-zinc-400 hover:bg-white/10'
                  }`}
                >
                  {m === 'trabajando' ? 'IA' : m === 'celebrando' ? 'WIN' : m === 'anomalia' ? 'OUT' : 'IDL'}
                </button>
              ))}
            </div>
          </div>

          {/* Action Triggers */}
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={cycleMood}
              className="flex-1 py-1.5 px-2 rounded-none border-2 border-white/30 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold tracking-wider transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-center"
            >
              ROTAR ESTADO
            </button>
            <button
              onClick={navigateToDashboard}
              className="py-1.5 px-3 rounded-none border-2 border-white bg-[#bdf559] text-zinc-950 hover:bg-[#a6ec38] text-[10px] font-bold tracking-wider transition-all flex items-center gap-1 shadow-[2px_2px_0px_#fff] cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              <span>WORKSPACE</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>
    </aside>
  );
};

export default MioFloatingCompanion;
