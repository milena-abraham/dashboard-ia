'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { MioDevModel } from './MioDevModel';
import { Sparkles, Terminal, Cpu } from 'lucide-react';

// Fallback 2D Neo-brutalista en caso de que WebGL falle o esté cargando
function MioDevFallback() {
  return (
    <div className="w-full h-full min-h-[460px] flex items-center justify-center p-6">
      <div className="w-[320px] bg-[#794de6] border-4 border-[#111] shadow-[10px_10px_0px_#111] p-5 flex flex-col items-center">
        {/* Pantalla 2D */}
        <div className="w-full bg-[#0f0c18] border-2 border-[#111] p-4 text-white font-mono rounded mb-4">
          <div className="flex justify-between items-center text-[10px] text-mio-lime mb-2 border-b border-gray-800 pb-1">
            <span>MIO-DEV v2.6</span>
            <span className="animate-pulse">● LIVE</span>
          </div>
          <div className="text-xs text-gray-300 font-bold mb-1">AUTO-ML ENGINE</div>
          <div className="text-xl font-black text-mio-lime mb-2">+34.8% PREDICTION</div>
          <div className="h-12 w-full bg-gray-900 border border-gray-800 flex items-end gap-1 p-1">
            {[40, 60, 45, 80, 70, 95, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-mio-lime" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        {/* Controles 2D */}
        <div className="w-full flex justify-between items-center px-2">
          <div className="w-12 h-12 bg-[#1f1b29] border-2 border-[#111] flex items-center justify-center font-bold text-gray-500">
            +
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-mio-lime border-2 border-[#111] shadow-[2px_2px_0px_#111]" />
            <div className="w-8 h-8 rounded-full bg-[#2d273d] border-2 border-[#111] shadow-[2px_2px_0px_#111]" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Comprobar soporte de WebGL de forma segura
function isWebGLAvailable() {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export default function MioDevCanvas() {
  const [mounted, setMounted] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    setMounted(true);
    setHasWebGL(isWebGLAvailable());
  }, []);

  if (!mounted) {
    return <MioDevFallback />;
  }

  if (!hasWebGL) {
    return <MioDevFallback />;
  }

  return (
    <div className="w-full h-[520px] sm:h-[580px] lg:h-[640px] relative select-none">
      {/* Badge flotante neo-brutalista de control */}
      <div className="absolute top-2 left-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-[#111] shadow-[3px_3px_0px_#111] text-xs font-mono font-bold text-gray-900 pointer-events-none">
        <Cpu className="w-3.5 h-3.5 text-mio-violet" />
        <span>MIO-DEV 3D INTERACTIVO</span>
      </div>

      <div className="absolute bottom-2 right-4 z-10 hidden sm:flex items-center gap-2 px-3 py-1 bg-mio-lime border-2 border-[#111] shadow-[3px_3px_0px_#111] text-[11px] font-mono font-black text-gray-900 pointer-events-none">
        <Sparkles className="w-3.5 h-3.5" />
        <span>MOVER MOUSE / CLICK BOTONES</span>
      </div>

      <Suspense fallback={<MioDevFallback />}>
        <Canvas
          shadows
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <PerspectiveCamera makeDefault position={[0, 0, 7.6]} fov={42} />

          {/* Luces de estudio cinemáticas */}
          <ambientLight intensity={0.85} />
          
          {/* Key Light (Luz principal con sombras) */}
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.8}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-near={1}
            shadow-camera-far={20}
            shadow-camera-left={-4}
            shadow-camera-right={4}
            shadow-camera-top={4}
            shadow-camera-bottom={-4}
          />

          {/* Rim Light 1: Violeta MIO sobre los biseles */}
          <pointLight position={[-4, 2, -2]} intensity={2.5} color="#815ae1" />

          {/* Rim Light 2: Lima Eléctrico MIO sobre el lateral derecho */}
          <pointLight position={[4, -2, 2]} intensity={2.2} color="#bdf559" />

          {/* Luz de relleno frontal suave */}
          <directionalLight position={[0, 0, 4]} intensity={0.4} />

          {/* El Modelo 3D MIO-Dev */}
          <MioDevModel />

          {/* Sombra de contacto realista en el suelo */}
          <ContactShadows
            position={[0, -2.55, 0]}
            opacity={0.65}
            scale={8}
            blur={2.4}
            far={4}
          />

          {/* Controles sutiles opcionales para rotar suavemente */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2 + 0.15}
            minPolarAngle={Math.PI / 2 - 0.25}
            maxAzimuthAngle={Math.PI / 4}
            minAzimuthAngle={-Math.PI / 4}
            rotateSpeed={0.5}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
