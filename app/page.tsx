"use client";

import React, { useState, useEffect } from "react";
import HeroHeadline from "./components/HeroHeadline";
import ViewportDisplay, { CameraAngle } from "./components/ViewportDisplay";

const CAMERA_ANGLES: Record<string, CameraAngle> = {
  CAM_01_GARAGE_INT: {
    label: "GARAGE INT",
    img: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=85",
    desc: "TEST BAY 04 • PRIMARY CHASSIS VIEW",
  },
  CAM_02_WIND_TUNNEL: {
    label: "AERO TUNNEL",
    img: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1600&q=85",
    desc: "WIND TUNNEL 02 • DOWNFORCE OPTIMIZATION",
  },
  CAM_03_REAR_AERO: {
    label: "REAR DIFFUSER",
    img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85",
    desc: "CARBON MATRIX • DUAL VORTEX EXHAUST",
  },
};

export default function ShiftTechLandingPage() {
  const [activeCam, setActiveCam] = useState<string>("CAM_01_GARAGE_INT");
  const [aeroLoad, setAeroLoad] = useState<number>(142);
  const [temp, setTemp] = useState<number>(24);
  const [isConfiguring, setIsConfiguring] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>("Stealth Obsidian");
  const [spoilerAngle, setSpoilerAngle] = useState<number>(12);

  // Micro telemetry fluctuation for live realism
  useEffect(() => {
    const interval = setInterval(() => {
      setAeroLoad(140 + Math.floor(Math.random() * 6));
      setTemp(24 + Number((Math.random() * 0.4 - 0.2).toFixed(1)));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleNextGalleryCam = () => {
    const camKeys = Object.keys(CAMERA_ANGLES);
    const currentIndex = camKeys.indexOf(activeCam);
    const nextIndex = (currentIndex + 1) % camKeys.length;
    setActiveCam(camKeys[nextIndex]);
  };

  return (
    <div className="min-h-screen bg-[#08090c] text-neutral-200 font-sans relative overflow-x-hidden selection:bg-[#9cbbf8] selection:text-black flex flex-col justify-between">
      {/* High-tech Blueprint Grid Background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Ambient Lighting Accents */}
      <div className="fixed top-1/3 left-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-cyan-900/10 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* 2. MAIN VIEWPORT / CONTENT SECTION (OPTIMIZED FOR LAPTOPS) */}
      <main className="relative z-10 max-w-[1536px] w-full mx-auto px-4 sm:px-8 xl:px-12 py-6 sm:py-10 xl:py-16 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center w-full">
          {/* Left Hero & Headline */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start">
            <HeroHeadline
              isConfiguring={isConfiguring}
              setIsConfiguring={setIsConfiguring}
              onGalleryNext={handleNextGalleryCam}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              spoilerAngle={spoilerAngle}
              setSpoilerAngle={setSpoilerAngle}
              setAeroLoad={setAeroLoad}
            />
          </div>

          {/* Right Supercar Viewport HUD */}
          <div className="lg:col-span-7 flex justify-center">
            <ViewportDisplay
              activeCam={activeCam}
              setActiveCam={setActiveCam}
              cameraAngles={CAMERA_ANGLES}
              aeroLoad={aeroLoad}
              temp={temp}
            />
          </div>
        </div>
      </main>

      {/* FOOTER SYSTEM STATUS INDICATOR */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-[#08090c]/80 py-2.5 px-6 text-center shrink-0">
        <div className="max-w-[1536px] mx-auto flex items-center justify-between text-[11px] font-mono text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>CORE TELEMETRY SERVER: ONLINE</span>
          </div>
          <div className="hidden sm:block">
            <span>SHIFT_TECH AUTOMOTIVE ENGINE MOD // LATENCY: 8ms</span>
          </div>
          <div>
            <span>FPS: 60 • RENDER ENGINE: V1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}