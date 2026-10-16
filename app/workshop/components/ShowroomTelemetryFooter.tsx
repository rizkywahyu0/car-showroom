"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { InventoryItem } from "@/app/inventory/data/wheels";

interface ShowroomTelemetryFooterProps {
  equippedVelg: InventoryItem;
  equippedTyre: InventoryItem;
  onOpenTyreCatalog: () => void;
}

export default function ShowroomTelemetryFooter({
  equippedVelg,
  equippedTyre,
  onOpenTyreCatalog,
}: ShowroomTelemetryFooterProps) {
  return (
    <footer className="w-full bg-[#0a0c12]/95 border border-white/[0.08] rounded-xl p-3.5 sm:p-4 backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
      {/* Left: Current Part Indicator */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="w-2 h-8 rounded-full bg-[#9cbbf8] shadow-[0_0_10px_rgba(156,187,248,0.6)] shrink-0 hidden sm:block" />
        <div>
          <span className="text-[10px] text-neutral-400 block tracking-wider uppercase">
            CURRENT Velg & Tyre Setup
          </span>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm tracking-wide">
              {equippedVelg.name}
            </span>
            <span className="text-neutral-400 text-xs">
              • {equippedTyre.name} ({equippedTyre.specs.spec2Value || "265/35ZR18 97Y XL"})
            </span>
          </div>
        </div>
      </div>

      {/* Center: Dynamic Telemetry Grip Metrics (Matching screenshot) */}
      <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-10 w-full md:w-auto">
        {/* Dry Grip */}
        <div className="flex flex-col gap-1 min-w-[110px]">
          <div className="flex justify-between text-[10px]">
            <span className="text-neutral-400">DRY GRIP</span>
            <span className="text-white font-bold">9.5/10</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-[#9cbbf8] rounded-full shadow-[0_0_8px_rgba(156,187,248,0.5)]"
              style={{ width: "95%" }}
            />
          </div>
        </div>

        {/* Wet Grip */}
        <div className="flex flex-col gap-1 min-w-[110px]">
          <div className="flex justify-between text-[10px]">
            <span className="text-neutral-400">WET GRIP</span>
            <span className="text-white font-bold">8.0/10</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,229,255,0.5)]"
              style={{ width: "80%" }}
            />
          </div>
        </div>

        {/* Treadwear */}
        <div className="flex flex-col gap-1 min-w-[110px]">
          <div className="flex justify-between text-[10px]">
            <span className="text-neutral-400">TREADWEAR</span>
            <span className="text-emerald-400 font-bold">300 AA</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]"
              style={{ width: "65%" }}
            />
          </div>
        </div>
      </div>

      {/* Right Action Button */}
      <div className="w-full md:w-auto flex justify-end">
        <button
          onClick={onOpenTyreCatalog}
          className="w-full md:w-auto px-4 py-2.5 bg-[#141720] hover:bg-[#1d2230] text-neutral-200 hover:text-white rounded-lg border border-white/15 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md group"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#9cbbf8] group-hover:rotate-180 transition-transform duration-500" />
          <span>CHANGE TIRE</span>
        </button>
      </div>
    </footer>
  );
}
