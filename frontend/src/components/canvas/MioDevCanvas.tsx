'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { MioDevModel } from './MioDevModel';

// Fallback 2D Neo-brutalista si WebGL no está disponible
function MioDevFallback() {
  return (
    <div className="w-full h-full min-h-[480px] flex items-center justify-center p-4">
      <div className="w-[320px] bg-[#7745e6] border-4 border-[#111] shadow-[10px_10px_0px_#111] p-5 flex flex-col items-center rotate-[-3deg]">
        <div className="w-full bg-[#0d0a17] border-2 border-[#111] p-4 text-white font-mono rounded mb-4">
          <div className="flex justify-between items-center text-[10px] text-mio-lime mb-2 border-b border-gray-800 pb-1">
            <span>MIO-DEV v2.6</span>
            <span className="animate-pulse">● LIVE</span>
          </div>
          <div className="text-xs text-gray-300 font-bold mb-1">AUTO-ML ENGINE</div>
          <div className="text-xl font-black text-mio-lime mb-2">+34.8% PREDICTION</div>
          <div className="h-10 w-full bg-gray-900 border border-gray-800 flex items-end gap-1 p-1">
            {[40, 60, 45, 80, 70, 95, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-mio-lime" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        <div className="w-full flex justify-between items-center px-2">
          <div className="w-10 h-10 bg-[#1e1a28] border-2 border-[#111] flex items-center justify-center font-bold text-gray-400">
            +
          </div>
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-mio-lime border-2 border-[#111] shadow-[2px_2px_0px_#111]" />
            <div className="w-7 h-7 rounded-full bg-[#282236] border-2 border-[#111] shadow-[2px_2px_0px_#111]" />
          </div>
        </div>
      </div>
    </div>
  );
}

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
    <div className="w-full h-[580px] sm:h-[640px] md:h-[700px] relative select-none flex items-center justify-center overflow-visible">
      <Suspense fallback={<MioDevFallback />}>
        <Canvas
          shadows
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          className="w-full h-full"
        >
          {/* Cámara con distancia calculada para encuadrar la consola completa + cartucho + sombra de suelo sin cortes */}
          <PerspectiveCamera makeDefault position={[0, 0.25, 9.6]} fov={44} />

          {/* Iluminación de estudio limpia sobre el fondo blanco */}
          <ambientLight intensity={1.2} />
          
          {/* Key Light (Luz direccional con sombra) */}
          <directionalLight
            position={[5, 8, 6]}
            intensity={1.9}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-near={1}
            shadow-camera-far={25}
            shadow-camera-left={-5}
            shadow-camera-right={5}
            shadow-camera-top={5}
            shadow-camera-bottom={-5}
          />

          {/* Rim Light 1: Acento violeta MIO sobre los bordes superiores */}
          <pointLight position={[-5, 3, 3]} intensity={2.2} color="#815ae1" />

          {/* Rim Light 2: Acento lima MIO sobre el lateral derecho */}
          <pointLight position={[4, -1, 3]} intensity={1.8} color="#bdf559" />

          {/* Relleno frontal neutro */}
          <directionalLight position={[0, 1, 5]} intensity={0.5} />

          {/* El Modelo MIO-Dev apoyado en diagonal */}
          <MioDevModel />

          {/* Sombra de contacto directamente en la base inferior donde apoya la consola */}
          <ContactShadows
            position={[0, -2.42, 0]}
            opacity={0.55}
            scale={10}
            blur={2.0}
            far={4}
            color="#140e24"
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
