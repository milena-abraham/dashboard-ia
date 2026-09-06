'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { MioDevModel } from './MioDevModel';

function MioDevFallback() {
  return (
    <div className="w-full h-full min-h-[480px] flex items-center justify-center p-4">
      <div className="w-[320px] bg-[#ebe7de] border-4 border-[#111] shadow-[10px_10px_0px_#111] p-5 flex flex-col items-center">
        <div className="w-full bg-[#5e5c66] p-3 rounded mb-4">
          <div className="bg-[#8c976d] p-3 text-[#1c2214] font-mono border border-[#6c784e]">
            <div className="text-[10px] font-black mb-1">MIO-OS v2.6 // LIVE</div>
            <div className="text-xl font-black mb-2">+34.8% PREDICTION</div>
            <div className="h-10 w-full bg-[#6c784e]/30 flex items-end gap-1 p-1">
              {[30, 50, 40, 75, 65, 90, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-[#1c2214]" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
        <div className="w-full flex justify-between items-center px-2">
          <div className="w-10 h-10 bg-[#1a1820] flex items-center justify-center font-bold text-gray-500">
            +
          </div>
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-[#8c1f54]" />
            <div className="w-7 h-7 rounded-full bg-[#8c1f54]" />
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
    <div className="w-full h-[520px] sm:h-[580px] lg:h-[620px] relative select-none flex items-center justify-center overflow-hidden">
      <Suspense fallback={<MioDevFallback />}>
        <Canvas
          shadows
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          className="w-full h-full"
        >
          {/* Cámara frontal con inclinación natural y encuadre amplio */}
          <PerspectiveCamera makeDefault position={[0, 0.05, 9.4]} fov={38} />

          {/* Iluminación de estudio idéntica al render Pocketfolio */}
          <ambientLight intensity={1.4} />

          {/* Key light principal proveniente de la izquierda-arriba */}
          <directionalLight
            position={[-4, 8, 5]}
            intensity={2.1}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0001}
          />

          {/* Luz de relleno suave desde la derecha */}
          <directionalLight position={[4, 2, 4]} intensity={0.5} />

          {/* Relleno frontal neutro para resaltar los botones */}
          <directionalLight position={[0, -1, 5]} intensity={0.4} />

          {/* Modelo 3D MIO-Pocket */}
          <MioDevModel />

          {/* Sombra de contacto direccional suave que ancla la consola a la mesa */}
          <ContactShadows
            position={[0.12, -2.62, 0]}
            opacity={0.45}
            scale={10}
            blur={2.4}
            far={5}
            color="#2a2622"
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
