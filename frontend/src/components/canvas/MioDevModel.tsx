'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';

// Modos de pantalla OLED MIO originales que le gustaron al usuario
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

  // Pose acostada sobre la mesa (exactamente como en la foto de Pocketfolio):
  // Apoyada sobre el plano XZ, levantada apenas ~18° hacia la cámara para lectura perfecta,
  // y con un suave giro casual de ~4° en Z.
  const BASE_ROTATION = {
    x: -0.22,  // Inclinación hacia la cámara (como apoyada en soporte suave de escritorio)
    y: 0.04,   // Casi frontal
    z: -0.05   // Giro casual idéntico a la referencia
  };

  const mouseOffset = useRef({ x: 0, y: 0 });
  const currentMode = SCREEN_MODES[activeModeIdx];

  const handleNextMode = (e?: any) => {
    e?.stopPropagation?.();
    setActiveModeIdx((prev) => (prev + 1) % SCREEN_MODES.length);
    setBtnPressed('a');
    setTimeout(() => setBtnPressed(null), 180);
  };

  const handlePrevMode = (e?: any) => {
    e?.stopPropagation?.();
    setActiveModeIdx((prev) => (prev - 1 + SCREEN_MODES.length) % SCREEN_MODES.length);
    setBtnPressed('b');
    setTimeout(() => setBtnPressed(null), 180);
  };

  useFrame((state) => {
    if (!groupRef.current) return;

    // Micro-parallax imperceptible con amortiguación
    const pointerX = state.pointer.x;
    const pointerY = state.pointer.y;

    mouseOffset.current.x = THREE.MathUtils.lerp(mouseOffset.current.x, pointerX * 0.02, 0.04);
    mouseOffset.current.y = THREE.MathUtils.lerp(mouseOffset.current.y, -pointerY * 0.015, 0.04);

    groupRef.current.rotation.y = BASE_ROTATION.y + mouseOffset.current.x;
    groupRef.current.rotation.x = BASE_ROTATION.x + mouseOffset.current.y;
    groupRef.current.rotation.z = BASE_ROTATION.z;
    // Firmemente anclada al suelo
    groupRef.current.position.set(0, -0.05, 0);
  });

  return (
    <group ref={groupRef} scale={[0.96, 0.96, 0.96]} position={[0, -0.05, 0]}>
      {/* ==================================================== */}
      {/* 1. INTERRUPTOR SUPERIOR DE HARDWARE (OFF <-> ON) */}
      {/* ==================================================== */}
      <group position={[-0.85, 2.58, -0.05]}>
        <RoundedBox args={[0.34, 0.14, 0.16]} radius={0.03} smoothness={2} castShadow>
          <meshStandardMaterial color="#2d273d" roughness={0.7} />
        </RoundedBox>
      </group>

      {/* ==================================================== */}
      {/* 2. CHASIS MIO VIOLET (#7c4ee6) NEO-BRUTALIST */}
      {/* ==================================================== */}
      <RoundedBox
        args={[3.45, 5.2, 0.68]}
        radius={0.24}
        smoothness={4}
        castShadow
        receiveShadow
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color="#7647eb" // Violeta oficial de MIO
          roughness={0.25}
          metalness={0.08}
        />
      </RoundedBox>

      {/* Ranura decorativa horizontal superior de ensamble */}
      <mesh position={[0, 2.32, 0.345]}>
        <planeGeometry args={[3.2, 0.02]} />
        <meshStandardMaterial color="#5e35c7" roughness={0.6} />
      </mesh>

      {/* ==================================================== */}
      {/* 3. MARCO / BEZEL DE PANTALLA OBSIDIANA CON STRIPES */}
      {/* ==================================================== */}
      <group position={[0, 0.85, 0.345]}>
        <RoundedBox args={[3.0, 2.45, 0.05]} radius={0.12} smoothness={3}>
          <meshStandardMaterial
            color="#0e0b17" // Obsidiana oscuro
            roughness={0.2}
            metalness={0.3}
          />
        </RoundedBox>

        {/* Franja de acento MIO Lima (#bdf559) sobre el bezel */}
        <mesh position={[0, 1.05, 0.028]}>
          <planeGeometry args={[2.55, 0.025]} />
          <meshStandardMaterial color="#bdf559" emissive="#bdf559" emissiveIntensity={0.3} />
        </mesh>

        {/* LED de Batería (Verde Lima encendido) */}
        <mesh position={[-1.22, 0.15, 0.035]}>
          <circleGeometry args={[0.045, 16]} />
          <meshStandardMaterial color="#bdf559" emissive="#bdf559" emissiveIntensity={0.9} />
        </mesh>

        {/* ==================================================== */}
        {/* 4. PANTALLA OLED CYBERPUNK MIO ORIGINAL */}
        {/* ==================================================== */}
        <mesh position={[0.06, -0.05, 0.026]}>
          <planeGeometry args={[2.24, 1.84]} />
          <meshStandardMaterial
            color="#0b0914"
            roughness={0.1}
            metalness={0.2}
          />
        </mesh>

        {/* Contenido HTML interactivo MIO (el original que le gustó al usuario) */}
        <Html
          transform
          position={[0.06, -0.05, 0.032]}
          distanceFactor={2.7}
          className="select-none pointer-events-auto"
        >
          <div
            style={{ width: '340px', height: '280px' }}
            className="bg-[#0b0914] text-white p-3 font-mono flex flex-col justify-between rounded shadow-2xl relative overflow-hidden border border-mio-lime/30"
          >
            {/* Scanline CRT overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-25"
              style={{
                backgroundImage: 'linear-gradient(rgba(18, 16, 31, 0) 50%, rgba(0, 0, 0, 0.75) 50%)',
                backgroundSize: '100% 4px'
              }}
            />

            {/* Header de la pantalla */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-1.5 relative z-10">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-mio-lime animate-pulse inline-block" />
                <span className="text-[10px] font-black tracking-wider text-mio-lime">MIO OS v2.6</span>
              </div>
              <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300 font-bold tracking-wider">
                {currentMode.tag}
              </span>
            </div>

            {/* Gráficos dinámicos interactivos con gradiente MIO */}
            <div className="flex-1 flex flex-col justify-center py-1 relative z-10">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">
                {currentMode.title}
              </div>

              {currentMode.type === 'wave' && (
                <div className="h-24 w-full flex items-end justify-between gap-1.5 px-1 pt-2">
                  {[22, 35, 28, 48, 44, 65, 58, 82, 75, 96, 92, 100].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-mio-violet to-mio-lime rounded-t transition-all duration-300"
                        style={{ height: `${val * 0.72}px` }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {currentMode.type === 'bars' && (
                <div className="h-24 w-full flex items-end justify-around gap-4 px-3 pt-2">
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-[9px] text-mio-lime font-bold mb-1">62%</span>
                    <div className="w-full bg-mio-lime rounded-t h-16 transition-all duration-500" />
                    <span className="text-[8px] text-gray-400 mt-1">SEG-1</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-[9px] text-white font-bold mb-1">26%</span>
                    <div className="w-full bg-mio-violet rounded-t h-10 transition-all duration-500" />
                    <span className="text-[8px] text-gray-400 mt-1">SEG-2</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-[9px] text-gray-400 font-bold mb-1">12%</span>
                    <div className="w-full bg-gray-700 rounded-t h-6 transition-all duration-500" />
                    <span className="text-[8px] text-gray-400 mt-1">SEG-3</span>
                  </div>
                </div>
              )}

              {currentMode.type === 'scatter' && (
                <div className="h-24 w-full relative border border-dashed border-gray-800 rounded p-1.5 overflow-hidden">
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

            {/* Footer con métricas ejecutivas */}
            <div className="border-t border-gray-800 pt-1.5 flex items-center justify-between relative z-10">
              <div>
                <div className="text-[9px] text-gray-400">{currentMode.sub}</div>
                <div className="text-base font-black text-mio-lime tracking-tight leading-none">
                  {currentMode.metric}
                </div>
              </div>
              <div className="text-[8px] font-bold px-1.5 py-0.5 bg-mio-violet/40 text-mio-lime border border-mio-violet/60 rounded">
                {currentMode.badge}
              </div>
            </div>
          </div>
        </Html>
      </group>

      {/* ==================================================== */}
      {/* 5. CONTROLES: D-PAD EN NEGRO MATE */}
      {/* ==================================================== */}
      <group position={[-0.88, -1.35, 0.355]}>
        <RoundedBox args={[0.34, 0.98, 0.16]} radius={0.04} smoothness={2} castShadow>
          <meshStandardMaterial color="#1a1726" roughness={0.6} />
        </RoundedBox>
        <RoundedBox args={[0.98, 0.34, 0.16]} radius={0.04} smoothness={2} castShadow>
          <meshStandardMaterial color="#1a1726" roughness={0.6} />
        </RoundedBox>
        {/* Hendidura central */}
        <mesh position={[0, 0, 0.088]}>
          <cylinderGeometry args={[0.085, 0.085, 0.02, 24]} />
          <meshStandardMaterial color="#110e1a" roughness={0.9} />
        </mesh>
      </group>

      {/* ==================================================== */}
      {/* 6. BOTONES DE ACCIÓN: BOTÓN A EN LIMA (#bdf559) Y B EN OSCURO */}
      {/* ==================================================== */}
      {/* Botón B (Dark Graphite con borde MIO) */}
      <group
        position={[0.55, -1.45, 0.355]}
        onClick={handlePrevMode}
      >
        <mesh
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0, btnPressed === 'b' ? 0.03 : 0.08]}
          castShadow
        >
          <cylinderGeometry args={[0.31, 0.31, 0.16, 32]} />
          <meshStandardMaterial
            color="#221b33"
            roughness={0.35}
          />
        </mesh>
      </group>

      {/* Botón A (MIO LIME #bdf559 ELÉCTRICO) */}
      <group
        position={[1.08, -1.18, 0.355]}
        onClick={handleNextMode}
      >
        <mesh
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0, btnPressed === 'a' ? 0.03 : 0.08]}
          castShadow
        >
          <cylinderGeometry args={[0.31, 0.31, 0.16, 32]} />
          <meshStandardMaterial
            color="#bdf559"
            emissive="#bdf559"
            emissiveIntensity={0.25}
            roughness={0.25}
          />
        </mesh>
      </group>

      {/* ==================================================== */}
      {/* 7. BOTONES SELECT Y START */}
      {/* ==================================================== */}
      <group position={[-0.15, -2.05, 0.355]} rotation={[0, 0, -0.45]}>
        <group position={[-0.22, 0, 0]}>
          <RoundedBox args={[0.38, 0.11, 0.07]} radius={0.04} smoothness={2} castShadow>
            <meshStandardMaterial color="#221b33" roughness={0.7} />
          </RoundedBox>
        </group>
        <group position={[0.26, 0, 0]}>
          <RoundedBox args={[0.38, 0.11, 0.07]} radius={0.04} smoothness={2} castShadow>
            <meshStandardMaterial color="#221b33" roughness={0.7} />
          </RoundedBox>
        </group>
      </group>

      {/* ==================================================== */}
      {/* 8. REJILLA DEL ALTAVOZ (6 RANURAS) */}
      {/* ==================================================== */}
      <group position={[0.82, -2.05, 0.35]} rotation={[0, 0, -0.45]}>
        {[-0.32, -0.19, -0.06, 0.07, 0.2, 0.33].map((offsetY, i) => (
          <RoundedBox
            key={i}
            args={[0.62, 0.05, 0.03]}
            radius={0.02}
            smoothness={2}
            position={[0, offsetY, 0]}
          >
            <meshStandardMaterial color="#161224" roughness={0.9} />
          </RoundedBox>
        ))}
      </group>
    </group>
  );
}
