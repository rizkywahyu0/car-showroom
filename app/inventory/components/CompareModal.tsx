"use client";

import React, { useState } from "react";
import { X, ArrowRightLeft } from "lucide-react";
import { ALL_INVENTORY_ITEMS, InventoryItem } from "../data/wheels";
import WheelImage from "./WheelImage";

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWheel: InventoryItem;
  onSelectWheel: (item: InventoryItem) => void;
}

export default function CompareModal({
  isOpen,
  onClose,
  currentWheel,
  onSelectWheel,
}: CompareModalProps) {
  const categoryItems = ALL_INVENTORY_ITEMS.filter((i) => i.type === currentWheel.type);
  const [selectedAltId, setSelectedAltId] = useState<string | null>(null);

  const defaultAlt =
    categoryItems.find((w) => w.id !== currentWheel.id) || categoryItems[0] || currentWheel;
  const compareItem =
    (selectedAltId && categoryItems.find((w) => w.id === selectedAltId && w.id !== currentWheel.id)) ||
    defaultAlt;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0c0e14] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#9cbbf8]/10 text-[#9cbbf8] border border-[#9cbbf8]/20">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white font-mono uppercase tracking-wider">
                COMPARE {currentWheel.type.toUpperCase()} SETUPS
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                TELEMETRY BENCHMARK & HARDWARE FITMENT COMPARISON
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Item 1 (Active) */}
          <div className="p-5 rounded-xl bg-[#12151e] border border-[#9cbbf8]/50 shadow-[0_0_20px_rgba(156,187,248,0.15)] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#9cbbf8]/20 text-[#9cbbf8] font-bold">
                  PRIMARY SETUP
                </span>
                <span className="text-xs font-mono text-neutral-400">{currentWheel.brand}</span>
              </div>

              <div className="flex justify-center my-3">
                <WheelImage id={currentWheel.id} size="md" />
              </div>

              <h3 className="text-base font-bold text-white font-mono text-center">
                {currentWheel.name}
              </h3>
              <p className="text-sm font-bold text-[#9cbbf8] font-mono text-center mt-1">
                {currentWheel.price}
              </p>
            </div>

            {/* Spec Table */}
            <div className="mt-6 space-y-2 border-t border-white/10 pt-4 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-neutral-400">Weight</span>
                <span className="text-white font-bold">{currentWheel.weight}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-neutral-400">Material</span>
                <span className="text-white font-bold">{currentWheel.material}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-neutral-400">{currentWheel.specs.spec1Label}</span>
                <span className="text-white font-bold">{currentWheel.specs.spec1Value}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-neutral-400">{currentWheel.specs.spec2Label}</span>
                <span className="text-white font-bold">{currentWheel.specs.spec2Value}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-neutral-400">{currentWheel.specs.spec3Label}</span>
                <span className="text-white font-bold">{currentWheel.specs.spec3Value}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-400">
                  {currentWheel.specs.performanceMetric.split(":")[0]}
                </span>
                <span className="text-emerald-400 font-bold">
                  {currentWheel.specs.performanceMetric.split(":")[1] || `+${currentWheel.specs.performancePercent}%`}
                </span>
              </div>
            </div>
          </div>

          {/* Item 2 (Selectable Benchmark) */}
          <div className="p-5 rounded-xl bg-[#10121a] border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-neutral-300 font-bold">
                  BENCHMARK
                </span>
                {/* Selector */}
                <select
                  aria-label="Select comparison item"
                  value={compareItem.id}
                  onChange={(e) => {
                    const found = categoryItems.find((w) => w.id === e.target.value);
                    if (found) setSelectedAltId(found.id);
                  }}
                  className="appearance-none bg-[#181c26] text-white text-xs font-mono px-3 py-1 rounded border border-white/20 outline-none cursor-pointer"
                >
                  {categoryItems.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center my-3">
                <WheelImage id={compareItem.id} size="md" />
              </div>

              <h3 className="text-base font-bold text-white font-mono text-center">
                {compareItem.name}
              </h3>
              <p className="text-sm font-bold text-[#9cbbf8] font-mono text-center mt-1">
                {compareItem.price}
              </p>
            </div>

            {/* Spec Table */}
            <div className="mt-6 space-y-2 border-t border-white/10 pt-4 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-neutral-400">Weight</span>
                <span className="text-white font-bold">{compareItem.weight}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-neutral-400">Material</span>
                <span className="text-white font-bold">{compareItem.material}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-neutral-400">{compareItem.specs.spec1Label}</span>
                <span className="text-white font-bold">{compareItem.specs.spec1Value}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-neutral-400">{compareItem.specs.spec2Label}</span>
                <span className="text-white font-bold">{compareItem.specs.spec2Value}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-neutral-400">{compareItem.specs.spec3Label}</span>
                <span className="text-white font-bold">{compareItem.specs.spec3Value}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-400">
                  {compareItem.specs.performanceMetric.split(":")[0]}
                </span>
                <span className="text-emerald-400 font-bold">
                  {compareItem.specs.performanceMetric.split(":")[1] || `+${compareItem.specs.performancePercent}%`}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onSelectWheel(compareItem);
                onClose();
              }}
              className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded font-mono text-xs font-bold transition-colors"
            >
              SWITCH TO THIS {currentWheel.type.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
