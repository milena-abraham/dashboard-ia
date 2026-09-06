'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Html, Float } from '@react-three/drei';
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
  const cartridgeRef = useRef<THREE.Group>(null);
  const [activeModeIdx, setActiveModeIdx] = useState(0);
  const [btnPressed, setBtnPressed] = useState<string | null>(null);

  // Mouse tilt tracking con lerp suave
  const mouseTarget = useRef({ x: 0, y: 0 });

  const currentMode = SCREEN_MODES[activeModeIdx];

  const handleNextMode = () => {
    setActiveModeIdx((prev) => (prev + 1) % SCREEN_MODES.length);
    setBtnPressed('next');
    setTimeout(() => setBtnPressed(null), 200);
  };

  const handlePrevMode = () => {
    setActiveModeIdx((prev) => (prev - 1 + SCREEN_MODES.length) % SCREEN_MODES.length);
    setBtnPressed('prev');
    setTimeout(() => setBtnPressed(null), 200);
  };

  useFrame((state) => {
    if (!groupRef.current) return;

    // Normalizar posición del mouse
    const pointerX = state.pointer.x; // -1 to 1
    const pointerY = state.pointer.y; // -1 to 1

    mouseTarget.current.x = THREE.MathUtils.lerp(mouseTarget.current.x, pointerX * 0.35, 0.05);
    mouseTarget.current.y = THREE.MathUtils.lerp(mouseTarget.current.y, -pointerY * 0.25, 0.05);

    // Aplicar rotación combinada con una suave respiración
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y = mouseTarget.current.x + Math.sin(time * 0.8) * 0.03;
    groupRef.current.rotation.x = mouseTarget.current.y + Math.cos(time * 0.6) * 0.02;
    groupRef.current.position.y = Math.sin(time * 1.2) * 0.06;

    // Cartucho flotando de forma independiente
    if (cartridgeRef.current) {
      cartridgeRef.current.position.y = 1.35 + Math.sin(time * 2 + 1) * 0.08;
      cartridgeRef.current.rotation.y = Math.sin(time * 1.5) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.1, 0]}>
      {/* ==================================================== */}
      {/* 1. CUERPO PRINCIPAL DEL MIO-DEVICE (Neo-Brutalist Violet) */}
      {/* ==================================================== */}
      <RoundedBox
        args={[3.4, 5.0, 0.7]}
        radius={0.22}
        smoothness={4}
        castShadow
        receiveShadow
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color="#794de6"
          roughness={0.25}
          metalness={0.1}
        />
      </RoundedBox>

      {/* Bisel / Borde posterior contrastante estilo Hardware */}
      <RoundedBox
        args={[3.44, 5.04, 0.15]}
        radius={0.22}
        smoothness={4}
        position={[0, 0, -0.32]}
      >
        <meshStandardMaterial
          color="#181424"
          roughness={0.8}
        />
      </RoundedBox>

      {/* ==================================================== */}
      {/* 2. PANTALLA OLED RETRO-MODERNA */}
      {/* ==================================================== */}
      {/* Marco / Bezel oscuro de la pantalla */}
      <RoundedBox
        args={[2.9, 2.3, 0.08]}
        radius={0.08}
        smoothness={4}
        position={[0, 1.05, 0.35]}
      >
        <meshStandardMaterial
          color="#0f0c18"
          roughness={0.15}
          metalness={0.4}
        />
      </RoundedBox>

      {/* Superficie interna de la pantalla (Cristal LCD) */}
      <mesh position={[0, 1.05, 0.395]}>
        <planeGeometry args={[2.72, 2.12]} />
        <meshStandardMaterial
          color="#12101f"
          roughness={0.05}
          metalness={0.2}
        />
      </mesh>

      {/* Contenido HTML interactivo proyectado sobre la pantalla 3D */}
      <Html
        transform
        occlude="blending"
        position={[0, 1.05, 0.402]}
        distanceFactor={2.7}
        className="select-none pointer-events-auto"
      >
        <div 
          style={{ width: '420px', height: '325px' }}
          className="bg-[#0b0914] text-white p-4 font-mono flex flex-col justify-between rounded-lg border-2 border-mio-lime/30 shadow-[inset_0_0_20px_rgba(189,245,89,0.15)] relative overflow-hidden"
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
                
                {/* Puntos normales */}
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
      {/* 3. CONTROLES FÍSICOS (D-PAD & ACTION BUTTONS) */}
      {/* ==================================================== */}

      {/* D-Pad (Cruceta direccional en negro mate) */}
      <group position={[-0.85, -1.15, 0.38]}>
        {/* Barra vertical del D-Pad */}
        <RoundedBox args={[0.3, 0.9, 0.16]} radius={0.05} smoothness={2} castShadow>
          <meshStandardMaterial color="#1f1b29" roughness={0.6} />
        </RoundedBox>
        {/* Barra horizontal del D-Pad */}
        <RoundedBox args={[0.9, 0.3, 0.16]} radius={0.05} smoothness={2} castShadow>
          <meshStandardMaterial color="#1f1b29" roughness={0.6} />
        </RoundedBox>
        {/* Centro del D-Pad con hendidura */}
        <mesh position={[0, 0, 0.09]}>
          <cylinderGeometry args={[0.07, 0.07, 0.02, 16]} />
          <meshStandardMaterial color="#14111d" roughness={0.9} />
        </mesh>
      </group>

      {/* Botones de Acción (Estilo Game Boy / Neo-Brutalist) */}
      {/* Botón A (Electric Lime) - Cambia al siguiente modo */}
      <group 
        position={[0.95, -1.0, 0.38]}
        onClick={handleNextMode}
      >
        <mesh 
          rotation={[Math.PI / 2, 0, 0]} 
          position={[0, 0, btnPressed === 'next' ? 0.04 : 0.08]}
          castShadow
        >
          <cylinderGeometry args={[0.3, 0.3, 0.18, 32]} />
          <meshStandardMaterial 
            color="#bdf559" 
            roughness={0.3} 
            emissive="#bdf559" 
            emissiveIntensity={0.15} 
          />
        </mesh>
      </group>

      {/* Botón B (Dark Graphite) - Cambia al modo anterior */}
      <group 
        position={[0.45, -1.35, 0.38]}
        onClick={handlePrevMode}
      >
        <mesh 
          rotation={[Math.PI / 2, 0, 0]} 
          position={[0, 0, btnPressed === 'prev' ? 0.04 : 0.08]}
          castShadow
        >
          <cylinderGeometry args={[0.3, 0.3, 0.18, 32]} />
          <meshStandardMaterial 
            color="#2d273d" 
            roughness={0.4} 
          />
        </mesh>
      </group>

      {/* Speaker Grille (Ranuras de ventilación/altavoz en la base) */}
      <group position={[0.65, -1.95, 0.36]} rotation={[0, 0, -0.45]}>
        {[-0.24, -0.08, 0.08, 0.24].map((offsetY, i) => (
          <RoundedBox key={i} args={[0.65, 0.05, 0.04]} radius={0.02} smoothness={2} position={[0, offsetY, 0]}>
            <meshStandardMaterial color="#151220" roughness={0.9} />
          </RoundedBox>
        ))}
      </group>

      {/* Pequeños botones metálicos Start / Select (Pills) */}
      <group position={[-0.3, -1.95, 0.36]} rotation={[0, 0, -0.45]}>
        <RoundedBox args={[0.38, 0.1, 0.08]} radius={0.04} smoothness={2} position={[-0.15, 0, 0]} castShadow>
          <meshStandardMaterial color="#1f1b29" roughness={0.5} />
        </RoundedBox>
        <RoundedBox args={[0.38, 0.1, 0.08]} radius={0.04} smoothness={2} position={[0.25, 0, 0]} castShadow>
          <meshStandardMaterial color="#1f1b29" roughness={0.5} />
        </RoundedBox>
      </group>

      {/* ==================================================== */}
      {/* 4. CARTUCHO LEVITANTE 3D (VENTAS.CSV) */}
      {/* ==================================================== */}
      <group ref={cartridgeRef} position={[2.1, 1.3, -0.1]} rotation={[0.1, -0.3, 0.15]}>
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
          {/* Cuerpo del cartucho (Polímero translúcido oscuro) */}
          <RoundedBox args={[1.2, 1.5, 0.28]} radius={0.06} smoothness={3} castShadow>
            <meshPhysicalMaterial
              color="#231e33"
              roughness={0.2}
              transmission={0.4}
              thickness={0.5}
            />
          </RoundedBox>

          {/* Muesca del agarre superior del cartucho */}
          <RoundedBox args={[0.9, 0.12, 0.3]} radius={0.03} smoothness={2} position={[0, 0.65, 0]}>
            <meshStandardMaterial color="#14111d" roughness={0.8} />
          </RoundedBox>

          {/* Etiqueta frontal del cartucho (Neo-Brutalist Lime) */}
          <mesh position={[0, -0.05, 0.145]}>
            <planeGeometry args={[0.95, 1.0]} />
            <meshStandardMaterial color="#bdf559" roughness={0.4} />
          </mesh>

          {/* Texto en la etiqueta del cartucho */}
          <Html
            transform
            position={[0, -0.05, 0.15]}
            distanceFactor={2.5}
            className="select-none pointer-events-none"
          >
            <div className="w-[120px] h-[130px] p-2 flex flex-col justify-between font-mono text-gray-950">
              <div className="border-b-2 border-[#111] pb-1">
                <div className="text-[10px] font-black leading-tight tracking-tighter">DATASET</div>
                <div className="text-[8px] font-bold text-gray-700">MIO-CARTRIDGE</div>
              </div>
              <div className="bg-black text-mio-lime px-1 py-0.5 text-[8px] font-black tracking-widest text-center border border-black">
                VENTAS.CSV
              </div>
              <div className="text-[7px] font-bold text-gray-800 flex justify-between">
                <span>2.4 MB</span>
                <span>CLEAN</span>
              </div>
            </div>
          </Html>
        </Float>
      </group>
    </group>
  );
}
