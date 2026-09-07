'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { MioDevModel } from './MioDevModel';

function MioDevFallback() {
  return (
    <div className="w-full h-full min-h-[460px] flex items-center justify-center p-4">
      <div className="w-[320px] bg-[#7647eb] border-4 border-[#111] shadow-[10px_10px_0px_#111] p-5 flex flex-col items-center">
        <div className="w-full bg-[#0b0914] p-3 rounded mb-4 border border-mio-lime/30">
          <div className="text-[10px] text-mio-lime font-mono font-black mb-1">MIO-OS v2.6 // LIVE</div>
          <div className="text-xl font-black text-white mb-2">+34.8% PREDICTION</div>
          <div className="h-10 w-full bg-gray-900 flex items-end gap-1 p-1">
            {[30, 50, 40, 75, 65, 90, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-mio-lime" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="w-full flex justify-between items-center px-2">
          <div className="w-10 h-10 bg-[#1a1726] flex items-center justify-center font-bold text-gray-500">
            +
          </div>
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-[#bdf559]" />
            <div className="w-7 h-7 rounded-full bg-[#221b33]" />
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

  if (!mounted) return <MioDevFallback />;
  if (!hasWebGL) return <MioDevFallback />;

  return (
    <div className="w-[340px] sm:w-[420px] lg:w-[460px] xl:w-[500px] h-[640px] sm:h-[720px] lg:h-[800px] relative select-none flex items-center justify-center overflow-visible">
      <Suspense fallback={<MioDevFallback />}>
        <Canvas
          shadows
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          className="w-full h-full"
        >
          {/* Cámara calibrada con margen de seguridad para no recortar bordes */}
          <PerspectiveCamera makeDefault position={[0, 0, 9.5]} fov={38} />

          {/* Iluminación de estudio */}
          <ambientLight intensity={1.3} />

          {/* Luz principal superior-izquierda que proyecta la sombra natural hacia abajo-derecha */}
          <directionalLight
            position={[-4, 7, 6]}
            intensity={2.2}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />

          {/* Rim light suave violeta MIO */}
          <pointLight position={[4, 2, 3]} intensity={1.4} color="#815ae1" />

          {/* Rim light acento lima MIO */}
          <pointLight position={[-3, -2, 3]} intensity={1.1} color="#bdf559" />

          {/* El Modelo 3D MIO-Dev */}
          <MioDevModel />

          {/* Sombra de contacto directamente en la superficie trasera (proyectada sobre la mesa detrás de la consola) */}
          <ContactShadows
            rotation={[Math.PI / 2, 0, 0]}
            position={[0.18, -0.22, -0.38]}
            opacity={0.48}
            scale={7.5}
            blur={2.2}
            far={2}
            color="#140e24"
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
