'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';

// Modos de pantalla del MIO-Pocket (estilo LCD retro Dot-Matrix)
const SCREEN_MODES = [
  {
    id: 'forecasting',
    title: 'AUTO-ML FORECAST',
    sub: 'Q4 REVENUE PROJECTION',
    stat: '+34.8%',
    note: 'PROPHET MODEL // 99.2%',
    type: 'bars'
  },
  {
    id: 'clustering',
    title: 'K-MEANS CLUSTERS',
    sub: 'CUSTOMER SEGMENTATION',
    stat: '3 GROUPS',
    note: 'SILHOUETTE SCORE 0.84',
    type: 'clusters'
  },
  {
    id: 'anomalies',
    title: 'ANOMALY DETECTOR',
    sub: 'ISOLATION FOREST',
    stat: '12 OUTLIERS',
    note: 'RISK LEVEL: MINIMAL',
    type: 'matrix'
  }
];

export function MioDevModel() {
  const groupRef = useRef<THREE.Group>(null);
  const [activeModeIdx, setActiveModeIdx] = useState(0);
  const [btnPressed, setBtnPressed] = useState<string | null>(null);

  // Pose sutil idéntica a la referencia:
  // Apoyado en la mesa, inclinado apenas hacia atrás (~7°) y girado muy sutilmente (~-5°)
  const BASE_ROTATION = {
    x: 0.14,
    y: -0.08,
    z: 0.015
  };

  const mouseOffset = useRef({ x: 0, y: 0 });
  const currentMode = SCREEN_MODES[activeModeIdx];

  const handleNextMode = (e: any) => {
    e?.stopPropagation();
    setActiveModeIdx((prev) => (prev + 1) % SCREEN_MODES.length);
    setBtnPressed('a');
    setTimeout(() => setBtnPressed(null), 180);
  };

  const handlePrevMode = (e: any) => {
    e?.stopPropagation();
    setActiveModeIdx((prev) => (prev - 1 + SCREEN_MODES.length) % SCREEN_MODES.length);
    setBtnPressed('b');
    setTimeout(() => setBtnPressed(null), 180);
  };

  useFrame((state) => {
    if (!groupRef.current) return;

    // Micro-parallax del cursor sutilísimo para dar vida al PBR sin despegarlo de la mesa
    const pointerX = state.pointer.x;
    const pointerY = state.pointer.y;

    mouseOffset.current.x = THREE.MathUtils.lerp(mouseOffset.current.x, pointerX * 0.03, 0.04);
    mouseOffset.current.y = THREE.MathUtils.lerp(mouseOffset.current.y, -pointerY * 0.02, 0.04);

    groupRef.current.rotation.y = BASE_ROTATION.y + mouseOffset.current.x;
    groupRef.current.rotation.x = BASE_ROTATION.x + mouseOffset.current.y;
    groupRef.current.rotation.z = BASE_ROTATION.z;
    groupRef.current.position.set(0, -0.15, 0); // Firme en la mesa
  });

  return (
    <group ref={groupRef} scale={[0.95, 0.95, 0.95]} position={[0, -0.15, 0]}>
      {/* ==================================================== */}
      {/* 1. INTERRUPTOR SUPERIOR DE ENCENDIDO (OFF <-> ON) */}
      {/* ==================================================== */}
      <group position={[-0.85, 2.58, -0.05]}>
        <RoundedBox args={[0.32, 0.14, 0.16]} radius={0.03} smoothness={2} castShadow>
          <meshStandardMaterial color="#55535c" roughness={0.7} />
        </RoundedBox>
        {/* Estriado del switch */}
        {[-0.08, 0, 0.08].map((x, i) => (
          <mesh key={i} position={[x, 0.07, 0]}>
            <boxGeometry args={[0.025, 0.03, 0.14]} />
            <meshStandardMaterial color="#2d2b33" roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* ==================================================== */}
      {/* 2. CHASIS RETRO CLASSIC (Off-White / DMG Grey PBR) */}
      {/* ==================================================== */}
      <RoundedBox
        args={[3.45, 5.2, 0.7]}
        radius={0.25}
        smoothness={4}
        castShadow
        receiveShadow
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color="#ebe7de"
          roughness={0.42}
          metalness={0.04}
        />
      </RoundedBox>

      {/* Ranura decorativa horizontal superior (Panel line clásica) */}
      <mesh position={[0, 2.32, 0.355]}>
        <planeGeometry args={[3.2, 0.02]} />
        <meshStandardMaterial color="#c8c4ba" roughness={0.8} />
      </mesh>

      {/* Texto serigrafiado superior del switch */}
      <Html
        transform
        position={[-0.85, 2.42, 0.355]}
        distanceFactor={2.7}
        className="select-none pointer-events-none"
      >
        <div className="text-[7px] font-mono font-bold text-gray-500 tracking-wider flex items-center gap-1">
          <span>OFF</span>
          <span>◄►</span>
          <span>ON</span>
        </div>
      </Html>

      {/* ==================================================== */}
      {/* 3. MARCO / BEZEL DE PANTALLA OSCURO */}
      {/* ==================================================== */}
      <group position={[0, 0.85, 0.355]}>
        {/* Bezel Gris Pizarra Clásico con esquinas redondeadas */}
        <RoundedBox args={[3.0, 2.45, 0.05]} radius={0.12} smoothness={3}>
          <meshStandardMaterial
            color="#5e5c66"
            roughness={0.35}
            metalness={0.08}
          />
        </RoundedBox>

        {/* Línea decorativa superior en el bezel (Magenta + Violeta MIO) */}
        <mesh position={[0, 1.06, 0.028]}>
          <planeGeometry args={[2.55, 0.025]} />
          <meshStandardMaterial color="#815ae1" />
        </mesh>
        <mesh position={[0, 1.02, 0.028]}>
          <planeGeometry args={[2.55, 0.015]} />
          <meshStandardMaterial color="#bdf559" />
        </mesh>

        {/* Texto serigrafiado sobre el bezel: "DOT MATRIX DATA ENGINE" */}
        <Html
          transform
          position={[0, 1.04, 0.03]}
          distanceFactor={2.7}
          className="select-none pointer-events-none"
        >
          <div className="text-[6.5px] font-mono font-black text-gray-300 tracking-widest uppercase bg-[#5e5c66] px-2">
            DOT MATRIX DATA ENGINE
          </div>
        </Html>

        {/* LED de Batería / AI Indicator (Rojo clásico encendido) */}
        <mesh position={[-1.22, 0.15, 0.028]}>
          <circleGeometry args={[0.045, 16]} />
          <meshBasicMaterial color="#ff3333" />
        </mesh>
        <Html
          transform
          position={[-1.22, 0.04, 0.03]}
          distanceFactor={2.7}
          className="select-none pointer-events-none"
        >
          <div className="text-[5.5px] font-mono font-bold text-gray-400 tracking-tighter text-center">
            BATTERY
          </div>
        </Html>

        {/* ==================================================== */}
        {/* 4. PANTALLA LCD DOT-MATRIX RETRO OLIVA / VERDE */}
        {/* ==================================================== */}
        <mesh position={[0.08, -0.05, 0.026]}>
          <planeGeometry args={[2.2, 1.82]} />
          <meshStandardMaterial
            color="#8c976d"
            roughness={0.25}
            metalness={0.05}
          />
        </mesh>

        {/* Contenido HTML interactivo dentro de la pantalla LCD */}
        <Html
          transform
          occlude="blending"
          position={[0.08, -0.05, 0.032]}
          distanceFactor={2.7}
          className="select-none pointer-events-auto"
        >
          <div
            style={{ width: '340px', height: '280px' }}
            className="bg-[#8c976d] text-[#1c2214] p-3 font-mono flex flex-col justify-between rounded shadow-inner relative overflow-hidden border border-[#768257]"
          >
            {/* Matriz de píxeles / Grid retro */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: 'radial-gradient(#1c2214 1px, transparent 1px)',
                backgroundSize: '4px 4px'
              }}
            />

            {/* Header LCD */}
            <div className="flex items-center justify-between border-b border-[#6c784e] pb-1 relative z-10">
              <span className="text-[10px] font-black tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#1c2214] inline-block" />
                MIO-OS v2.6
              </span>
              <span className="text-[9px] font-bold tracking-wider">
                {currentMode.title}
              </span>
            </div>

            {/* Gráfico central estilo Game Boy */}
            <div className="flex-1 flex flex-col justify-center py-2 relative z-10">
              {currentMode.type === 'bars' && (
                <div className="h-24 w-full flex items-end justify-between gap-1.5 px-2 pt-2">
                  {[25, 38, 30, 52, 48, 68, 62, 85, 78, 100].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-[#1c2214] transition-all duration-300"
                        style={{ height: `${val * 0.72}px` }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {currentMode.type === 'clusters' && (
                <div className="h-24 w-full flex items-end justify-around gap-4 px-4 pt-2">
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-[9px] font-black mb-1">58%</span>
                    <div className="w-full bg-[#1c2214] h-16" />
                    <span className="text-[8px] font-bold mt-1">SEG-A</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-[9px] font-black mb-1">29%</span>
                    <div className="w-full bg-[#2c3720] h-10" />
                    <span className="text-[8px] font-bold mt-1">SEG-B</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-[9px] font-black mb-1">13%</span>
                    <div className="w-full bg-[#465436] h-6" />
                    <span className="text-[8px] font-bold mt-1">SEG-C</span>
                  </div>
                </div>
              )}

              {currentMode.type === 'matrix' && (
                <div className="h-24 w-full flex flex-col justify-center gap-2 px-2">
                  <div className="flex justify-between items-center text-[10px] font-bold border-b border-[#6c784e] pb-1">
                    <span>ANOMALÍAS:</span>
                    <span className="font-black bg-[#1c2214] text-[#8c976d] px-1">0 CRÍTICAS</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5 pt-1">
                    {Array.from({ length: 18 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-3 rounded-none ${i === 4 || i === 11 ? 'bg-transparent border border-[#1c2214]' : 'bg-[#1c2214]'}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer LCD con métricas */}
            <div className="border-t border-[#6c784e] pt-1 flex items-center justify-between relative z-10 text-[9px] font-bold">
              <div>
                <div className="text-[7.5px] uppercase text-[#3b4629]">{currentMode.sub}</div>
                <div className="text-base font-black leading-none tracking-tight">
                  {currentMode.stat}
                </div>
              </div>
              <div className="text-[8px] bg-[#1c2214] text-[#8c976d] px-1.5 py-0.5 font-bold">
                {currentMode.note}
              </div>
            </div>
          </div>
        </Html>
      </group>

      {/* ==================================================== */}
      {/* 5. LOGOTIPO SERIGRAFIADO: "mio POCKET DATA SYSTEM" */}
      {/* ==================================================== */}
      <Html
        transform
        position={[-0.45, -0.65, 0.355]}
        distanceFactor={2.7}
        className="select-none pointer-events-none"
      >
        <div className="flex items-baseline gap-1.5 text-[#1b1924]">
          <span className="text-xl font-black italic tracking-tighter">mio</span>
          <span className="text-[7.5px] font-mono font-bold tracking-widest text-gray-600 uppercase">
            DATA ANALYTICS SYSTEM™
          </span>
        </div>
      </Html>

      {/* ==================================================== */}
      {/* 6. D-PAD (CRUCETA NEGRA EXACTA CON DISCO CENTRAL) */}
      {/* ==================================================== */}
      <group position={[-0.88, -1.35, 0.36]}>
        {/* Barra vertical del D-Pad */}
        <RoundedBox args={[0.34, 0.98, 0.16]} radius={0.04} smoothness={2} castShadow>
          <meshStandardMaterial color="#1a1820" roughness={0.65} />
        </RoundedBox>
        {/* Barra horizontal del D-Pad */}
        <RoundedBox args={[0.98, 0.34, 0.16]} radius={0.04} smoothness={2} castShadow>
          <meshStandardMaterial color="#1a1820" roughness={0.65} />
        </RoundedBox>
        {/* Hendidura circular central clásica de Nintendo */}
        <mesh position={[0, 0, 0.088]}>
          <cylinderGeometry args={[0.085, 0.085, 0.02, 24]} />
          <meshStandardMaterial color="#100f14" roughness={0.9} />
        </mesh>
        {/* Pequeños triángulos direccionales en relieve */}
        {[-0.38, 0.38].map((offset, i) => (
          <mesh key={`v-${i}`} position={[0, offset, 0.085]} rotation={[0, 0, i === 0 ? 0 : Math.PI]}>
            <coneGeometry args={[0.04, 0.04, 3]} />
            <meshStandardMaterial color="#2d2b33" />
          </mesh>
        ))}
        {[-0.38, 0.38].map((offset, i) => (
          <mesh key={`h-${i}`} position={[offset, 0, 0.085]} rotation={[0, 0, i === 0 ? Math.PI / 2 : -Math.PI / 2]}>
            <coneGeometry args={[0.04, 0.04, 3]} />
            <meshStandardMaterial color="#2d2b33" />
          </mesh>
        ))}
      </group>

      {/* ==================================================== */}
      {/* 7. BOTONES DE ACCIÓN B / A (MAGENTA / VIOLETA Y LIMA) */}
      {/* ==================================================== */}
      {/* Botón B (MIO Violet / Magenta clásico) */}
      <group
        position={[0.52, -1.45, 0.36]}
        onClick={handlePrevMode}
        className="cursor-pointer"
      >
        <mesh
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0, btnPressed === 'b' ? 0.04 : 0.08]}
          castShadow
        >
          <cylinderGeometry args={[0.3, 0.3, 0.16, 32]} />
          <meshStandardMaterial
            color="#8c1f54" // Magenta clásico Game Boy / MIO Violet
            roughness={0.28}
          />
        </mesh>
        <Html
          transform
          position={[0.15, -0.28, 0.09]}
          distanceFactor={2.7}
          className="select-none pointer-events-none"
        >
          <div className="text-[9px] font-mono font-black text-gray-700">B</div>
        </Html>
      </group>

      {/* Botón A (Magenta Clásico) */}
      <group
        position={[1.05, -1.18, 0.36]}
        onClick={handleNextMode}
        className="cursor-pointer"
      >
        <mesh
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0, btnPressed === 'a' ? 0.04 : 0.08]}
          castShadow
        >
          <cylinderGeometry args={[0.3, 0.3, 0.16, 32]} />
          <meshStandardMaterial
            color="#8c1f54"
            roughness={0.28}
          />
        </mesh>
        <Html
          transform
          position={[0.15, -0.28, 0.09]}
          distanceFactor={2.7}
          className="select-none pointer-events-none"
        >
          <div className="text-[9px] font-mono font-black text-gray-700">A</div>
        </Html>
      </group>

      {/* ==================================================== */}
      {/* 8. BOTONES SELECT Y START (PILLS DE GOMA INCLINADAS) */}
      {/* ==================================================== */}
      <group position={[-0.15, -2.05, 0.36]} rotation={[0, 0, -0.45]}>
        {/* SELECT */}
        <group position={[-0.22, 0, 0]}>
          <RoundedBox args={[0.38, 0.11, 0.07]} radius={0.04} smoothness={2} castShadow>
            <meshStandardMaterial color="#6a6773" roughness={0.65} />
          </RoundedBox>
          <Html
            transform
            position={[0, -0.16, 0.04]}
            distanceFactor={2.7}
            className="select-none pointer-events-none"
          >
            <div className="text-[5.5px] font-mono font-black text-gray-500 tracking-wider">
              SELECT
            </div>
          </Html>
        </group>

        {/* START */}
        <group position={[0.26, 0, 0]}>
          <RoundedBox args={[0.38, 0.11, 0.07]} radius={0.04} smoothness={2} castShadow>
            <meshStandardMaterial color="#6a6773" roughness={0.65} />
          </RoundedBox>
          <Html
            transform
            position={[0, -0.16, 0.04]}
            distanceFactor={2.7}
            className="select-none pointer-events-none"
          >
            <div className="text-[5.5px] font-mono font-black text-gray-500 tracking-wider">
              START
            </div>
          </Html>
        </group>
      </group>

      {/* ==================================================== */}
      {/* 9. REJILLA DEL ALTAVOZ (6 RANURAS DIAGONALES REALES) */}
      {/* ==================================================== */}
      <group position={[0.82, -2.05, 0.355]} rotation={[0, 0, -0.45]}>
        {[-0.32, -0.19, -0.06, 0.07, 0.2, 0.33].map((offsetY, i) => (
          <RoundedBox
            key={i}
            args={[0.62, 0.05, 0.03]}
            radius={0.02}
            smoothness={2}
            position={[0, offsetY, 0]}
          >
            <meshStandardMaterial color="#2d2a33" roughness={0.9} />
          </RoundedBox>
        ))}
      </group>

      {/* Modelo / Código de serie impreso abajo a la izquierda */}
      <Html
        transform
        position={[-1.15, -2.35, 0.355]}
        distanceFactor={2.7}
        className="select-none pointer-events-none"
      >
        <div className="text-[5.5px] font-mono font-bold text-gray-400">
          MD-2026
        </div>
      </Html>
    </group>
  );
}
