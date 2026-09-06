'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { MioDevModel } from './MioDevModel';

// Fallback 2D Neo-brutalista en caso de que WebGL falle o esté cargando
function MioDevFallback() {
  return (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center p-4">
      <div className="w-[340px] bg-[#7745e6] border-4 border-[#111] shadow-[12px_12px_0px_#111] p-5 flex flex-col items-center rotate-[-3deg]">
        <div className="w-full bg-[#0d0a17] border-2 border-[#111] p-4 text-white font-mono rounded mb-4">
          <div className="flex justify-between items-center text-[10px] text-mio-lime mb-2 border-b border-gray-800 pb-1">
            <span>MIO-DEV v2.6</span>
            <span className="animate-pulse">● LIVE</span>
          </div>
          <div className="text-xs text-gray-300 font-bold mb-1">AUTO-ML ENGINE</div>
          <div className="text-2xl font-black text-mio-lime mb-2">+34.8% PREDICTION</div>
          <div className="h-12 w-full bg-gray-900 border border-gray-800 flex items-end gap-1 p-1">
            {[40, 60, 45, 80, 70, 95, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-mio-lime" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        <div className="w-full flex justify-between items-center px-2">
          <div className="w-12 h-12 bg-[#1e1a28] border-2 border-[#111] flex items-center justify-center font-bold text-gray-400">
            +
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-mio-lime border-2 border-[#111] shadow-[2px_2px_0px_#111]" />
            <div className="w-8 h-8 rounded-full bg-[#282236] border-2 border-[#111] shadow-[2px_2px_0px_#111]" />
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
    <div className="w-full h-[580px] sm:h-[680px] lg:h-[760px] relative select-none flex items-center justify-center">
      <Suspense fallback={<MioDevFallback />}>
        <Canvas
          shadows
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          className="w-full h-full"
        >
          {/* Cámara acercada para que el dispositivo se vea imponente y grande */}
          <PerspectiveCamera makeDefault position={[0, 0.15, 6.2]} fov={40} />

          {/* Iluminación de estudio limpia sobre fondo blanco */}
          <ambientLight intensity={1.1} />
          
          {/* Key Light (Luz direccional suave que proyecta el relieve) */}
          <directionalLight
            position={[4, 7, 5]}
            intensity={1.9}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-near={1}
            shadow-camera-far={20}
            shadow-camera-left={-4}
            shadow-camera-right={4}
            shadow-camera-top={4}
            shadow-camera-bottom={-4}
          />

          {/* Luz de acento sutil violeta MIO en bordes */}
          <pointLight position={[-4, 2, 2]} intensity={2.0} color="#815ae1" />

          {/* Luz de acento lima MIO en bordes derechos */}
          <pointLight position={[3, -1, 3]} intensity={1.6} color="#bdf559" />

          {/* Relleno frontal neutro */}
          <directionalLight position={[0, 1, 4]} intensity={0.45} />

          {/* El Modelo MIO-Dev apoyado en diagonal */}
          <MioDevModel />

          {/* Sombra de contacto suave y realista para dar relieve sobre el fondo blanco */}
          <ContactShadows
            position={[0, -3.15, 0]}
            opacity={0.45}
            scale={9}
            blur={2.2}
            far={4}
            color="#140f24"
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
