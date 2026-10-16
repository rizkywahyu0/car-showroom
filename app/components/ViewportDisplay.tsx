"use client";

import React from "react";

import Image from "next/image";

export interface CameraAngle {
  label: string;
  img: string;
  desc: string;
}

interface ViewportDisplayProps {
  activeCam: string;
  setActiveCam: (cam: string) => void;
  cameraAngles: Record<string, CameraAngle>;
  aeroLoad: number;
  temp: number;
}

export default function ViewportDisplay({
  activeCam,
  setActiveCam,
  cameraAngles,
  aeroLoad,
  temp,
}: ViewportDisplayProps) {
  const currentAngle = cameraAngles[activeCam] || cameraAngles["CAM_01_GARAGE_INT"];

  return (
    <div className="relative flex items-center justify-center w-full">
      {/* Outer HUD Corner Reticle Brackets */}
      {/* Top-Left Bracket */}
      <div className="absolute -top-2.5 -left-2.5 sm:-top-3 sm:-left-3 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-l-2 border-neutral-500/80 pointer-events-none z-20" />
      {/* Bottom-Right Bracket */}
      <div className="absolute -bottom-2.5 -right-2.5 sm:-bottom-3 sm:-right-3 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-r-2 border-neutral-500/80 pointer-events-none z-20" />

      {/* Viewport Frame Container */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[480px] xl:max-h-[540px] rounded-sm overflow-hidden bg-[#0a0c10] border border-white/[0.12] shadow-[0_20px_60px_rgba(0,0,0,0.85)] group">
        {/* Active Supercar Render Image */}
        <Image
          src={currentAngle.img}
          alt="Shift Tech Vehicle"
          fill
          unoptimized
          priority
          sizes="(max-width: 1200px) 100vw, 50vw"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02] filter contrast-[1.08] brightness-[0.94]"
        />

        {/* High-tech HUD Scanlines & Subtle Vignette */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.4) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.4) 3px)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/45 pointer-events-none" />

        {/* TOP-LEFT HUD OVERLAY */}
        <div className="absolute top-4 sm:top-5 left-4 sm:left-6 z-20 flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#9cbbf8] rounded-full animate-ping" />
            <span className="font-mono text-[11px] sm:text-xs font-bold text-white tracking-widest">
              {activeCam}
            </span>
          </div>
          <span className="font-mono text-[9px] sm:text-[10px] text-neutral-400 tracking-wider">
            SHIFTTECH • {currentAngle.desc}
          </span>
        </div>

        {/* TOP-RIGHT HUD OVERLAY */}
        <div className="absolute top-4 sm:top-5 right-4 sm:right-6 z-20 text-right hidden sm:block">
          <p className="font-mono text-[10px] text-white/90 font-bold tracking-widest">
            SHIFTTECH SIMULATOR
          </p>
          <p className="font-mono text-[9px] text-neutral-400 tracking-wider">
            PERFORMANCE DISP: ACTIVE AERO
          </p>
        </div>

        {/* CAMERA SWITCHER BUTTONS (Inside Viewport) */}
        <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-6 z-20 flex items-center gap-1.5">
          {Object.keys(cameraAngles).map((camKey, idx) => (
            <button
              key={camKey}
              onClick={() => setActiveCam(camKey)}
              className={`px-2 sm:px-2.5 py-1 rounded text-[10px] font-mono tracking-wider transition-all cursor-pointer border ${
                activeCam === camKey
                  ? "bg-[#9cbbf8] text-black font-bold border-[#9cbbf8] shadow-[0_0_8px_rgba(156,187,248,0.5)]"
                  : "bg-black/60 backdrop-blur-sm text-neutral-300 hover:text-white border-white/10 hover:border-white/30"
              }`}
            >
              CAM 0{idx + 1}
            </button>
          ))}
        </div>

        {/* BOTTOM-RIGHT TELEMETRY HUD BOX */}
        <div className="absolute bottom-4 sm:bottom-5 right-4 sm:right-6 z-20 bg-black/85 backdrop-blur-md border border-white/20 rounded px-3.5 sm:px-4 py-1.5 sm:py-2 flex items-center gap-4 sm:gap-6 shadow-xl">
          {/* Aero Load */}
          <div className="text-right">
            <p className="font-mono text-[9px] sm:text-[10px] text-neutral-400 tracking-widest uppercase">
              AERO LOAD
            </p>
            <p className="font-mono text-xs sm:text-base font-bold text-white tracking-tight">
              {aeroLoad}kg
            </p>
          </div>

          {/* Divider Line */}
          <div className="w-[1px] h-6 sm:h-7 bg-white/20" />

          {/* Temperature */}
          <div className="text-right">
            <p className="font-mono text-[9px] sm:text-[10px] text-neutral-400 tracking-widest uppercase">
              TEMP
            </p>
            <p className="font-mono text-xs sm:text-base font-bold text-white tracking-tight">
              {temp}°C
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
