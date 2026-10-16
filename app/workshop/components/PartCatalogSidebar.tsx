"use client";

import React, { useState } from "react";
import { Check, Layers } from "lucide-react";
import { ALL_INVENTORY_ITEMS, InventoryItem } from "@/app/inventory/data/wheels";
import WheelImage from "@/app/inventory/components/WheelImage";

interface PartCatalogSidebarProps {
  activeCategory: string;
  equippedItem: InventoryItem;
  onEquipItem: (item: InventoryItem) => void;
}

export default function PartCatalogSidebar({
  activeCategory,
  equippedItem,
  onEquipItem,
}: PartCatalogSidebarProps) {
  const [activeCatalogTab, setActiveCatalogTab] = useState<"PERFORMANCE" | "LUXURY" | "OFF-ROAD">(
    "PERFORMANCE"
  );

  // Filter items matching active category
  const categoryItems = ALL_INVENTORY_ITEMS.filter((i) => i.type === activeCategory);

  const getCatalogTitle = () => {
    switch (activeCategory) {
      case "velg":
        return "WHEEL CATALOG";
      case "tyres":
        return "TYRE CATALOG";
      case "hood":
        return "HOOD & BONNET CATALOG";
      case "spoiler":
        return "AERO WING CATALOG";
      case "bodykit":
        return "WIDEBODY CATALOG";
      case "brake":
        return "BRAKE SYSTEM CATALOG";
      default:
        return "PARTS CATALOG";
    }
  };

  return (
    <aside className="w-full lg:w-72 xl:w-80 max-h-[calc(100vh-7rem)] overflow-y-auto bg-[#0d0f14]/90 border border-white/[0.08] rounded-xl flex flex-col p-4 shrink-0 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2 text-white">
          <Layers className="w-4 h-4 text-[#9cbbf8]" />
          <h2 className="text-sm xl:text-base font-black tracking-wider font-mono uppercase">
            {getCatalogTitle()}
          </h2>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center justify-between gap-1 mt-3 bg-[#141720] p-1 rounded-lg border border-white/[0.06] text-[11px] font-mono font-bold">
          {(["PERFORMANCE", "LUXURY", "OFF-ROAD"] as const).map((tab) => {
            const isActive = activeCatalogTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveCatalogTab(tab)}
                className={`flex-1 py-1.5 px-2 rounded-md transition-all text-center ${
                  isActive
                    ? "bg-[#253046] text-[#9cbbf8] shadow-[0_0_10px_rgba(156,187,248,0.2)] border border-[#9cbbf8]/30 font-bold"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Part Cards List */}
      <div className="mt-3 space-y-2.5 overflow-y-auto pr-1">
        {categoryItems.map((item) => {
          const isEquipped = equippedItem.id === item.id;

          return (
            <div
              key={item.id}
              onClick={() => onEquipItem(item)}
              className={`relative rounded-xl p-3 flex items-center gap-3.5 cursor-pointer transition-all duration-200 group border ${
                isEquipped
                  ? "bg-[#141926] border-[#9cbbf8] shadow-[0_0_18px_rgba(156,187,248,0.25)] ring-1 ring-[#9cbbf8]/40"
                  : "bg-[#10121a]/90 hover:bg-[#151924] border-white/[0.08] hover:border-white/20"
              }`}
            >
              {/* Checkmark badge if equipped */}
              {isEquipped && (
                <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#9cbbf8] text-black flex items-center justify-center shadow-[0_0_8px_rgba(156,187,248,0.8)]">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}

              {/* Thumbnail preview */}
              <div className="w-14 h-14 rounded-lg bg-[#090b10] border border-white/10 flex items-center justify-center shrink-0 p-1 group-hover:scale-105 transition-transform">
                <WheelImage id={item.id} size="sm" />
              </div>

              {/* Info Column */}
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="text-xs sm:text-sm font-bold text-white font-mono group-hover:text-[#9cbbf8] transition-colors truncate">
                  {item.name}
                </h3>
                
                <p className="text-[11px] text-neutral-400 font-mono mt-0.5 truncate">
                  {item.specs.spec1Value || item.size}
                </p>

                {/* Specs / Tags Pills */}
                <div className="flex items-center gap-1.5 mt-2 font-mono text-[9px]">
                  <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-neutral-300 font-semibold uppercase border border-white/[0.06]">
                    {item.material}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-neutral-400 border border-white/[0.06]">
                    {item.weight}
                  </span>
                  <span className="text-[#9cbbf8] font-bold ml-auto text-[10px]">
                    {item.price}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
