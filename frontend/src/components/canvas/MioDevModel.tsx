'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';

// Modos de pantalla del MIO-Dev
const SCREEN_MODES = [
  {
    id: 'forecasting',
    title: 'AUTO-ML FORECAST',
    tag: 'ARIMA + PROPHET',
    metric: '+34.8%',
    sub: 'Proyección Q4',
    badge: 'CONFIANZA 99.2%',
    type: 'wave'
  },
  {
    id: 'clustering',
    title: 'K-MEANS CLUSTERING',
    tag: '3 SEGMENTOS',
    metric: '3,420',
    sub: 'Clientes VIP',
    badge: 'SILHOUETTE 0.84',
    type: 'bars'
  },
  {
    id: 'anomalies',
    title: 'ANOMALY DETECTOR',
    tag: 'ISOLATION FOREST',
    metric: '12',
    sub: 'Outliers detectados',
    badge: 'CRÍTICO: 0',
    type: 'scatter'
  }
];

export function MioDevModel() {
  const groupRef = useRef<THREE.Group>(null);
  const [activeModeIdx, setActiveModeIdx] = useState(0);
  const [btnPressed, setBtnPressed] = useState<string | null>(null);

  // Rotación base en diagonal (firme, sin flotar)
  // Ligero ángulo isométrico/perspectiva de hardware sobre escritorio
  const BASE_ROTATION = {
    x: 0.18,
    y: -0.38,
    z: 0.03
  };

  const mouseOffset = useRef({ x: 0, y: 0 });

  const currentMode = SCREEN_MODES[activeModeIdx];

  const handleNextMode = (e: any) => {
    e.stopPropagation();
    setActiveModeIdx((prev) => (prev + 1) % SCREEN_MODES.length);
    setBtnPressed('next');
    setTimeout(() => setBtnPressed(null), 180);
  };

  const handlePrevMode = (e: any) => {
    e.stopPropagation();
    setActiveModeIdx((prev) => (prev - 1 + SCREEN_MODES.length) % SCREEN_MODES.length);
    setBtnPressed('prev');
    setTimeout(() => setBtnPressed(null), 180);
  };

  useFrame((state) => {
    if (!groupRef.current) return;

    // Micro-reacción al mouse sutil (sin flotar ni perder la posición fija en la mesa)
    const pointerX = state.pointer.x; // -1 to 1
    const pointerY = state.pointer.y; // -1 to 1

    mouseOffset.current.x = THREE.MathUtils.lerp(mouseOffset.current.x, pointerX * 0.08, 0.05);
    mouseOffset.current.y = THREE.MathUtils.lerp(mouseOffset.current.y, -pointerY * 0.06, 0.05);

    // Mantenemos la consola firmemente apoyada en su eje Y, solo con micro-rotación en diagonal
    groupRef.current.rotation.y = BASE_ROTATION.y + mouseOffset.current.x;
    groupRef.current.rotation.x = BASE_ROTATION.x + mouseOffset.current.y;
    groupRef.current.rotation.z = BASE_ROTATION.z;
    groupRef.current.position.y = -0.35; // Apoyado fijo sobre el suelo
  });

  return (
    <group ref={groupRef} scale={[1.28, 1.28, 1.28]} position={[0, -0.35, 0]}>
      {/* ==================================================== */}
      {/* 1. CARTUCHO INSERTADO EN LA RANURA SUPERIOR */}
      {/* ==================================================== */}
      <group position={[0, 2.72, -0.1]} rotation={[-0.05, 0, 0]}>
        {/* Cuerpo del cartucho (Plástico translúcido mate insertado) */}
        <RoundedBox args={[1.5, 1.3, 0.28]} radius={0.06} smoothness={3} castShadow>
          <meshPhysicalMaterial
            color="#221b33"
            roughness={0.25}
            transmission={0.3}
            thickness={0.4}
          />
        </RoundedBox>

        {/* Agarre superior estriado */}
        <RoundedBox args={[1.1, 0.12, 0.3]} radius={0.03} smoothness={2} position={[0, 0.55, 0]}>
          <meshStandardMaterial color="#14101e" roughness={0.8} />
        </RoundedBox>

        {/* Etiqueta del cartucho que sobresale */}
        <mesh position={[0, 0.05, 0.145]}>
          <planeGeometry args={[1.2, 0.7]} />
          <meshStandardMaterial color="#bdf559" roughness={0.4} />
        </mesh>

        {/* Texto en la etiqueta del cartucho */}
        <Html
          transform
          position={[0, 0.05, 0.15]}
          distanceFactor={2.5}
          className="select-none pointer-events-none"
        >
          <div className="w-[140px] h-[80px] p-1.5 flex flex-col justify-between font-mono text-gray-950">
            <div className="flex justify-between items-center border-b border-black pb-0.5">
              <span className="text-[9px] font-black tracking-wider">MIO-DATA</span>
              <span className="text-[7px] font-bold bg-black text-white px-1">CSV</span>
            </div>
            <div className="bg-black text-mio-lime px-1 py-0.5 text-[8px] font-black text-center">
              VENTAS_2026.CSV
            </div>
            <div className="text-[7px] font-bold flex justify-between text-gray-800">
              <span>● READY</span>
              <span>2.4 MB</span>
            </div>
          </div>
        </Html>
      </group>

      {/* ==================================================== */}
      {/* 2. CUERPO PRINCIPAL DEL MIO-DEVICE (Neo-Brutalist Violet) */}
      {/* ==================================================== */}
      <RoundedBox
        args={[3.4, 5.0, 0.72]}
        radius={0.22}
        smoothness={4}
        castShadow
        receiveShadow
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color="#7745e6"
          roughness={0.22}
          metalness={0.08}
        />
      </RoundedBox>

      {/* Placa posterior estilo chasis industrial oscuro */}
      <RoundedBox
        args={[3.44, 5.04, 0.18]}
        radius={0.22}
        smoothness={4}
        position={[0, 0, -0.32]}
      >
        <meshStandardMaterial
          color="#161222"
          roughness={0.7}
        />
      </RoundedBox>

      {/* Ranura superior para el cartucho (Bevel negro) */}
      <RoundedBox
        args={[1.8, 0.2, 0.45]}
        radius={0.04}
        smoothness={2}
        position={[0, 2.45, -0.1]}
      >
        <meshStandardMaterial color="#100d1a" roughness={0.9} />
      </RoundedBox>

      {/* ==================================================== */}
      {/* 3. PANTALLA OLED INTEGRADA */}
      {/* ==================================================== */}
      {/* Marco / Bezel oscuro de la pantalla */}
      <RoundedBox
        args={[2.9, 2.3, 0.08]}
        radius={0.08}
        smoothness={4}
        position={[0, 1.05, 0.36]}
      >
        <meshStandardMaterial
          color="#0d0a17"
          roughness={0.12}
          metalness={0.5}
        />
      </RoundedBox>

      {/* Superficie interna de la pantalla */}
      <mesh position={[0, 1.05, 0.405]}>
        <planeGeometry args={[2.72, 2.12]} />
        <meshStandardMaterial
          color="#110e1d"
          roughness={0.05}
          metalness={0.2}
        />
      </mesh>

      {/* Contenido HTML interactivo proyectado sobre la pantalla 3D */}
      <Html
        transform
        occlude="blending"
        position={[0, 1.05, 0.412]}
        distanceFactor={2.7}
        className="select-none pointer-events-auto"
      >
        <div 
          style={{ width: '420px', height: '325px' }}
          className="bg-[#0b0914] text-white p-4 font-mono flex flex-col justify-between rounded-lg border-2 border-mio-lime/30 shadow-[inset_0_0_25px_rgba(189,245,89,0.18)] relative overflow-hidden"
        >
          {/* Scanline CRT overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'linear-gradient(rgba(18, 16, 31, 0) 50%, rgba(0, 0, 0, 0.75) 50%)',
              backgroundSize: '100% 4px'
            }}
          />

          {/* Header de la pantalla */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-mio-lime animate-pulse inline-block" />
              <span className="text-xs font-black tracking-wider text-mio-lime">MIO OS v2.6</span>
            </div>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300 font-bold tracking-wider">
              {currentMode.tag}
            </span>
          </div>

          {/* Gráfico central dinámico según el modo */}
          <div className="flex-1 flex flex-col justify-center py-2 relative z-10">
            <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wide mb-1">
              {currentMode.title}
            </div>

            {/* Visualizador de gráficos */}
            {currentMode.type === 'wave' && (
              <div className="h-24 w-full flex items-end justify-between gap-1 pt-4 px-1">
                {[20, 32, 28, 45, 42, 60, 55, 78, 72, 95, 90, 100].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-gradient-to-t from-mio-violet to-mio-lime rounded-t transition-all duration-500"
                      style={{ height: `${val * 0.75}px` }}
                    />
                  </div>
                ))}
              </div>
            )}

            {currentMode.type === 'bars' && (
              <div className="h-24 w-full flex items-end justify-around gap-4 px-4 pt-2">
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-[9px] text-mio-lime font-bold mb-1">62%</span>
                  <div className="w-full bg-mio-lime rounded-t h-16 transition-all duration-500" />
                  <span className="text-[8px] text-gray-400 mt-1">C1</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-[9px] text-white font-bold mb-1">26%</span>
                  <div className="w-full bg-mio-violet rounded-t h-10 transition-all duration-500" />
                  <span className="text-[8px] text-gray-400 mt-1">C2</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-[9px] text-gray-400 font-bold mb-1">12%</span>
                  <div className="w-full bg-gray-600 rounded-t h-6 transition-all duration-500" />
                  <span className="text-[8px] text-gray-400 mt-1">C3</span>
                </div>
              </div>
            )}

            {currentMode.type === 'scatter' && (
              <div className="h-24 w-full relative border border-dashed border-gray-800 rounded p-2 overflow-hidden">
                <div className="absolute top-2 left-6 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <div className="absolute top-2 left-6 w-2 h-2 rounded-full bg-red-400" />
                <div className="absolute bottom-3 right-8 w-2 h-2 rounded-full bg-red-400" />
                
                {[
                  [20, 40], [35, 55], [50, 45], [60, 70], [75, 60], [80, 80], [40, 30], [65, 50]
                ].map(([x, y], idx) => (
                  <div 
                    key={idx} 
                    className="absolute w-1.5 h-1.5 rounded-full bg-mio-lime"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer de la pantalla con métricas */}
          <div className="border-t border-gray-800 pt-2 flex items-center justify-between relative z-10">
            <div>
              <div className="text-[10px] text-gray-400">{currentMode.sub}</div>
              <div className="text-lg font-black text-mio-lime tracking-tight leading-none">
                {currentMode.metric}
              </div>
            </div>
            <div className="text-[9px] font-bold px-2 py-1 bg-mio-violet/30 text-mio-lime border border-mio-violet/50 rounded">
              {currentMode.badge}
            </div>
          </div>
        </div>
      </Html>

      {/* ==================================================== */}
      {/* 4. CONTROLES FÍSICOS TÁCTILES */}
      {/* ==================================================== */}

      {/* D-Pad (Cruceta direccional) */}
      <group position={[-0.85, -1.15, 0.38]}>
        <RoundedBox args={[0.32, 0.94, 0.16]} radius={0.05} smoothness={2} castShadow>
          <meshStandardMaterial color="#1e1a28" roughness={0.6} />
        </RoundedBox>
        <RoundedBox args={[0.94, 0.32, 0.16]} radius={0.05} smoothness={2} castShadow>
          <meshStandardMaterial color="#1e1a28" roughness={0.6} />
        </RoundedBox>
        <mesh position={[0, 0, 0.09]}>
          <cylinderGeometry args={[0.07, 0.07, 0.02, 16]} />
          <meshStandardMaterial color="#120f1b" roughness={0.9} />
        </mesh>
      </group>

      {/* Botón A (Electric Lime) - Clickeable */}
      <group 
        position={[0.95, -1.0, 0.38]}
        onClick={handleNextMode}
        className="cursor-pointer"
      >
        <mesh 
          rotation={[Math.PI / 2, 0, 0]} 
          position={[0, 0, btnPressed === 'next' ? 0.04 : 0.08]}
          castShadow
        >
          <cylinderGeometry args={[0.32, 0.32, 0.18, 32]} />
          <meshStandardMaterial 
            color="#bdf559" 
            roughness={0.28} 
            emissive="#bdf559" 
            emissiveIntensity={0.2} 
          />
        </mesh>
      </group>

      {/* Botón B (Dark Graphite) - Clickeable */}
      <group 
        position={[0.45, -1.35, 0.38]}
        onClick={handlePrevMode}
        className="cursor-pointer"
      >
        <mesh 
          rotation={[Math.PI / 2, 0, 0]} 
          position={[0, 0, btnPressed === 'prev' ? 0.04 : 0.08]}
          castShadow
        >
          <cylinderGeometry args={[0.32, 0.32, 0.18, 32]} />
          <meshStandardMaterial 
            color="#282236" 
            roughness={0.4} 
          />
        </mesh>
      </group>

      {/* Rejilla de altavoz / ventilación */}
      <group position={[0.7, -1.95, 0.36]} rotation={[0, 0, -0.45]}>
        {[-0.24, -0.08, 0.08, 0.24].map((offsetY, i) => (
          <RoundedBox key={i} args={[0.65, 0.05, 0.04]} radius={0.02} smoothness={2} position={[0, offsetY, 0]}>
            <meshStandardMaterial color="#14111f" roughness={0.9} />
          </RoundedBox>
        ))}
      </group>

      {/* Botones Start / Select */}
      <group position={[-0.3, -1.95, 0.36]} rotation={[0, 0, -0.45]}>
        <RoundedBox args={[0.38, 0.1, 0.08]} radius={0.04} smoothness={2} position={[-0.15, 0, 0]} castShadow>
          <meshStandardMaterial color="#1e1a28" roughness={0.5} />
        </RoundedBox>
        <RoundedBox args={[0.38, 0.1, 0.08]} radius={0.04} smoothness={2} position={[0.25, 0, 0]} castShadow>
          <meshStandardMaterial color="#1e1a28" roughness={0.5} />
        </RoundedBox>
      </group>
    </group>
  );
}
