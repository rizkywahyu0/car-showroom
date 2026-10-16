"use client";

import React, { useState } from "react";
import { Rotate3d, Crosshair, Check } from "lucide-react";
import { InventoryItem } from "../data/wheels";
import WheelImage from "./WheelImage";
import Wheel3DCanvas from "./Wheel3DCanvas";

interface WheelDetailPanelProps {
  wheel: InventoryItem;
  isEquipped: boolean;
  onEquip: (item: InventoryItem) => void;
  onCompare: () => void;
}

export default function WheelDetailPanel({
  wheel,
  isEquipped,
  onEquip,
  onCompare,
}: WheelDetailPanelProps) {
  const [viewMode, setViewMode] = useState<"2D" | "3D">("2D");

  const categorySubHeader =
    wheel.type === "velg" || wheel.type === "tyres" || wheel.type === "brake"
      ? "CHASSIS FITMENT"
      : "AERODYNAMICS & BODY";

  return (
    <aside className="w-full lg:w-80 xl:w-96 max-h-[calc(100vh-7rem)] overflow-y-auto bg-[#0d0f14]/90 border border-white/[0.08] rounded-xl flex flex-col p-4 sm:p-6 shrink-0 shadow-2xl backdrop-blur-md">
      {/* Visualizer Display Area */}
      <div className="relative w-full rounded-xl bg-gradient-to-b from-[#141822] via-[#0f1118] to-[#0a0c10] border border-white/[0.08] p-4 flex flex-col items-center justify-center overflow-hidden min-h-[220px] sm:min-h-[260px] xl:min-h-[280px]">
        {/* Subtle background tech grid */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(156,187,248,0.2) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        {/* View mode toggle: 2D vs 3D */}
        {viewMode === "3D" ? (
          <Wheel3DCanvas wheel={wheel} />
        ) : (
          <div className="py-2">
            <WheelImage id={wheel.id} size="lg" />
          </div>
        )}

        {/* 3D / 2D Switch Button */}
        <button
          onClick={() => setViewMode((prev) => (prev === "2D" ? "3D" : "2D"))}
          title={viewMode === "2D" ? "Switch to 3D Realtime Mode" : "Switch to High-Res View"}
          className={`absolute bottom-3 right-3 p-2 rounded-lg backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-mono border ${
            viewMode === "3D"
              ? "bg-[#9cbbf8] text-black border-[#9cbbf8] font-bold shadow-[0_0_15px_rgba(156,187,248,0.4)]"
              : "bg-black/60 hover:bg-black/90 text-neutral-300 border-white/20 hover:text-white"
          }`}
        >
          <Rotate3d className="w-4 h-4" />
          <span className="text-[10px]">{viewMode === "3D" ? "3D ACTIVE" : "3D"}</span>
        </button>

        {/* Finish label top left */}
        <div className="absolute top-3 left-3 text-[10px] font-mono text-neutral-400 bg-black/40 px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm line-clamp-1 max-w-[200px]">
          {wheel.colorTheme.finish}
        </div>
      </div>

      {/* Main Info */}
      <div className="mt-5 space-y-3">
        <div>
          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
            {wheel.brand}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide font-sans mt-0.5">
            {wheel.name}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 leading-relaxed font-sans font-normal">
            {wheel.description}
          </p>
        </div>

        {/* Price Tag */}
        <div className="pt-2">
          <p className="text-xl sm:text-2xl font-black text-[#9cbbf8] font-mono tracking-tight">
            {wheel.price}
          </p>
        </div>
      </div>

      {/* Technical Specs Section */}
      <div className="mt-5 pt-4 border-t border-white/[0.08] space-y-2.5 font-mono text-xs">
        <h4 className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-3 flex items-center justify-between">
          <span>TECHNICAL SPECS</span>
          <span className="text-neutral-500 font-normal">{categorySubHeader}</span>
        </h4>

        <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
          <span className="text-neutral-400">{wheel.specs.spec1Label}</span>
          <span className="text-neutral-100 font-semibold">{wheel.specs.spec1Value}</span>
        </div>

        <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
          <span className="text-neutral-400">{wheel.specs.spec2Label}</span>
          <span className="text-neutral-100 font-semibold">{wheel.specs.spec2Value}</span>
        </div>

        <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
          <span className="text-neutral-400">{wheel.specs.spec3Label}</span>
          <span className="text-neutral-100 font-semibold">{wheel.specs.spec3Value}</span>
        </div>

        <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
          <span className="text-neutral-400">{wheel.specs.spec4Label}</span>
          <span className="text-neutral-100 font-semibold">{wheel.specs.spec4Value}</span>
        </div>
      </div>

      {/* Performance Metric Gauge */}
      <div className="mt-5 pt-4 border-t border-white/[0.08]">
        <div className="flex justify-between items-center text-xs font-mono mb-2">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
            {wheel.specs.performanceMetric.split(":")[0] || "PERFORMANCE GAIN"}
          </span>
          <span className="text-xs font-bold text-[#9cbbf8]">
            {wheel.specs.performanceMetric.split(":")[1]?.trim() || `+${wheel.specs.performancePercent}%`}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-[#7aa2f7] to-[#9cbbf8] shadow-[0_0_10px_rgba(156,187,248,0.5)] transition-all duration-500"
            style={{ width: `${Math.min(wheel.specs.performancePercent * 2.5, 100)}%` }}
          />
        </div>
      </div>

      {/* Action Buttons: EQUIP TO BUILD & COMPARE */}
      <div className="mt-6 pt-2 space-y-2">
        <button
          onClick={() => onEquip(wheel)}
          className={`w-full py-3 sm:py-3.5 px-4 rounded-lg font-mono font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-lg ${
            isEquipped
              ? "bg-emerald-500 hover:bg-emerald-600 text-black shadow-emerald-500/20"
              : "bg-[#9cbbf8] hover:bg-[#b4ceff] text-[#08090c] shadow-[#9cbbf8]/20 hover:shadow-[#9cbbf8]/40 translate-y-[-1px] active:translate-y-[0px]"
          }`}
        >
          {isEquipped ? (
            <>
              <Check className="w-4 h-4 text-black stroke-[3]" />
              <span>EQUIPPED TO BUILD</span>
            </>
          ) : (
            <>
              <Crosshair className="w-4 h-4 stroke-[2.5]" />
              <span>EQUIP TO BUILD</span>
            </>
          )}
        </button>

        {onCompare && (
          <button
            onClick={onCompare}
            className="w-full py-2 px-3 rounded-lg font-mono text-[11px] text-neutral-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors uppercase tracking-wider"
          >
            COMPARE WITH ALTERNATIVE
          </button>
        )}
      </div>
    </aside>
  );
}
