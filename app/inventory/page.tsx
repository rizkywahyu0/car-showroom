"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    ArrowRightLeft,
    SlidersHorizontal,
    ChevronRight,
    ShoppingBag,
    Activity,
    HelpCircle,
} from "lucide-react";
import { message, Modal } from "antd";
import {
    ALL_INVENTORY_ITEMS,
    CATEGORY_CONFIG,
    InventoryItem,
} from "./data/wheels";
import VehicleSidebar from "./components/VehicleSidebar";
import WheelCard from "./components/WheelCard";
import WheelDetailPanel from "./components/WheelDetailPanel";
import CompareModal from "./components/CompareModal";

export default function InventoryPage() {
    const [activeCategory, setActiveCategory] = useState<string>("velg");
    const [selectedFilter, setSelectedFilter] = useState<string>("FORGED");
    const [selectedSize, setSelectedSize] = useState<string>("ALL");
    const [selectedItem, setSelectedItem] = useState<InventoryItem>(ALL_INVENTORY_ITEMS[0]);
    const [equippedItemIds, setEquippedItemIds] = useState<Record<string, string>>({
        velg: "enkei-rpf1",
        tyres: "toyo-proxes-r888r",
        hood: "varis-carbon-bonnet",
        spoiler: "voltex-type-7",
        bodykit: "pandem-v2-widebody",
        brake: "brembo-gtr-billet",
    });
    const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);

    // Modals for support, diagnostics, checkout
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
    const [isDiagnosticsModalOpen, setIsDiagnosticsModalOpen] = useState<boolean>(false);
    const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);

    // Active Category Meta
    const catConfig = CATEGORY_CONFIG[activeCategory] || CATEGORY_CONFIG.velg;

    // Whenever activeCategory changes, sync default filter & selected item
    const handleCategoryChange = (catId: string) => {
        setActiveCategory(catId);
        const newConfig = CATEGORY_CONFIG[catId] || CATEGORY_CONFIG.velg;
        setSelectedFilter(newConfig.defaultFilter);
        setSelectedSize("ALL");

        // Select first item of new category
        const firstItem = ALL_INVENTORY_ITEMS.find((item) => item.type === catId);
        if (firstItem) {
            setSelectedItem(firstItem);
        }
    };

    // Filter items based on activeCategory, filter tab, size, and search
    const currentCategoryItems = ALL_INVENTORY_ITEMS.filter(
        (item) => item.type === activeCategory
    );

    const filteredItems = currentCategoryItems.filter((item) => {
        const matchFilter = selectedFilter === "ALL" || item.category === selectedFilter;
        const matchSize = selectedSize === "ALL" || item.size.includes(selectedSize);
        return matchFilter && matchSize;
    });

    const handleEquip = (item: InventoryItem) => {
        setEquippedItemIds((prev) => ({
            ...prev,
            [item.type]: item.id,
        }));
        message.success({
            content: `${item.name} successfully installed to ${catConfig.breadcrumbCurrent} slot!`,
            style: { marginTop: "5vh" },
        });
    };

    const isCurrentItemEquipped = equippedItemIds[selectedItem.type] === selectedItem.id;

    return (
        <div className="min-h-screen bg-[#08090c] text-neutral-200 font-sans relative selection:bg-[#9cbbf8] selection:text-black flex flex-col justify-between">
            {/* Blueprint Grid Background */}
            <div
                className="fixed inset-0 pointer-events-none opacity-30 z-0"
                style={{
                    backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
          `,
                    backgroundSize: "32px 32px",
                }}
            />

            {/* Subtle Ambient Radial Lighting */}
            <div className="fixed top-20 left-1/4 w-[28rem] h-[28rem] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none z-0" />
            <div className="fixed bottom-20 right-1/4 w-[32rem] h-[32rem] bg-indigo-950/10 rounded-full blur-[180px] pointer-events-none z-0" />

            {/* MAIN CONTAINER */}
            <main className="relative z-10 max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 flex flex-col lg:flex-row gap-4 xl:gap-6 items-start">
                {/* 1. LEFT SIDEBAR: VEHICLE CONFIG (STICKY) */}
                <div className="sticky top-20 lg:top-24 shrink-0 self-start z-20 w-full lg:w-auto">
                    <VehicleSidebar
                        activeCategory={activeCategory}
                        onSelectCategory={handleCategoryChange}
                        onCheckout={() => setIsCheckoutModalOpen(true)}
                        onOpenDiagnostics={() => setIsDiagnosticsModalOpen(true)}
                        onOpenSupport={() => setIsSupportModalOpen(true)}
                    />
                </div>

                {/* 2. CENTER SECTION: CONFIGURATOR & ITEMS GRID */}
                <section className="flex-1 flex flex-col min-w-0">
                    {/* Top Bar: Breadcrumb + Main Title + Compare Button */}
                    <div className="mb-4">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 mb-1.5">
                            <Link href="/workshop" className="hover:text-white transition-colors">
                                Workshop
                            </Link>
                            <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
                            <span className="text-neutral-400">{catConfig.breadcrumbParent}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
                            <span className="text-[#9cbbf8] font-bold">{catConfig.breadcrumbCurrent}</span>
                        </div>

                        {/* Title & Compare Action */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h1 className="text-xl sm:text-2xl xl:text-3xl font-black text-white font-mono uppercase tracking-wider">
                                {catConfig.title}
                            </h1>

                            <button
                                onClick={() => setIsCompareOpen(true)}
                                className="px-3.5 py-1.5 bg-[#12151e] hover:bg-[#1c2230] text-neutral-200 hover:text-white rounded-lg border border-white/15 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all group self-start sm:self-auto shadow-md"
                            >
                                <ArrowRightLeft className="w-3.5 h-3.5 text-[#9cbbf8] group-hover:scale-110 transition-transform" />
                                <span>COMPARE SETUPS</span>
                            </button>
                        </div>
                    </div>

                    {/* Filter Pill Row & Size Dropdown */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-[#0d0f14]/80 border border-white/[0.08] rounded-xl mb-4 backdrop-blur-sm">
                        {/* Category-Specific Filter Pills */}
                        <div className="flex items-center gap-1 bg-[#141720] p-1 rounded-lg border border-white/[0.06] overflow-x-auto max-w-full">
                            {catConfig.filterOptions.map((opt) => {
                                const isActive = selectedFilter === opt;
                                return (
                                    <button
                                        key={opt}
                                        onClick={() => setSelectedFilter(opt)}
                                        className={`px-3 sm:px-4 py-1.5 rounded-md text-xs font-mono font-bold tracking-wider transition-all whitespace-nowrap ${isActive
                                            ? "bg-[#253046] text-[#9cbbf8] shadow-[0_0_12px_rgba(156,187,248,0.2)] border border-[#9cbbf8]/30"
                                            : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Size / Compound / Spec Dropdown & Sliders Icon */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-[#141720] border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono text-neutral-300">
                                <span className="text-neutral-500 font-bold">{catConfig.sizeLabel}</span>
                                <select
                                    aria-label={`Filter ${catConfig.breadcrumbCurrent} size`}
                                    value={selectedSize}
                                    onChange={(e) => setSelectedSize(e.target.value)}
                                    className="appearance-none bg-transparent text-white outline-none cursor-pointer font-bold border-none text-center"
                                >
                                    {catConfig.sizes.map((sz) => (
                                        <option key={sz} value={sz} className="bg-[#141720] text-white">
                                            {sz}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                title="Filter options"
                                className="p-2 bg-[#141720] hover:bg-[#1e2330] border border-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Grid Cards (2 rows x 3 cols on laptop/desktop) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 xl:gap-4 flex-1 content-start">
                        {filteredItems.length > 0 ? (
                            filteredItems.map((item) => (
                                <WheelCard
                                    key={item.id}
                                    wheel={item}
                                    isSelected={selectedItem.id === item.id}
                                    isEquipped={equippedItemIds[item.type] === item.id}
                                    onSelect={(i) => setSelectedItem(i)}
                                    onEquip={handleEquip}
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                                <p className="font-mono text-sm text-neutral-400">
                                    No items found for filter &quot;{selectedFilter}&quot;.
                                </p>
                                <button
                                    onClick={() => {
                                        setSelectedFilter(catConfig.defaultFilter);
                                        setSelectedSize("ALL");
                                    }}
                                    className="mt-3 px-4 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-mono rounded text-white"
                                >
                                    RESET FILTERS
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* 3. RIGHT SIDEBAR: SELECTED ITEM INSPECTOR / 3D PREVIEW (STICKY) */}
                <div className="sticky top-20 lg:top-24 shrink-0 self-start z-20 w-full lg:w-auto">
                    <WheelDetailPanel
                        wheel={selectedItem}
                        isEquipped={isCurrentItemEquipped}
                        onEquip={handleEquip}
                        onCompare={() => setIsCompareOpen(true)}
                    />
                </div>
            </main>

            {/* Compare Modal */}
            <CompareModal
                isOpen={isCompareOpen}
                onClose={() => setIsCompareOpen(false)}
                currentWheel={selectedItem}
                onSelectWheel={(w) => setSelectedItem(w)}
            />

            {/* Checkout Modal */}
            <Modal
                open={isCheckoutModalOpen}
                onCancel={() => setIsCheckoutModalOpen(false)}
                footer={null}
                centered
            >
                <div className="p-4 sm:p-6 bg-[#0c0e14] text-neutral-200 rounded-xl font-mono border border-white/10 -m-6">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
                        <ShoppingBag className="w-5 h-5 text-[#9cbbf8]" />
                        <div>
                            <h3 className="text-base font-black text-white uppercase">
                                SHIFT_TECH HARDWARE CHECKOUT
                            </h3>
                            <p className="text-[11px] text-neutral-400">Order Summary & Chassis Installation</p>
                        </div>
                    </div>

                    <div className="space-y-3 text-xs mb-6">
                        <div className="flex justify-between py-2 border-b border-white/[0.05]">
                            <span className="text-neutral-400">Selected Item</span>
                            <span className="text-white font-bold">{selectedItem.name}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/[0.05]">
                            <span className="text-neutral-400">Specification</span>
                            <span className="text-white font-bold">{selectedItem.material}{" • "}{selectedItem.specs.spec1Value}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/[0.05]">
                            <span className="text-neutral-400">Unit Price</span>
                            <span className="text-[#9cbbf8] font-bold text-sm">{selectedItem.price}</span>
                        </div>
                        <div className="flex justify-between py-2 text-neutral-300">
                            <span>Dyno Balancing & Laser Calibration</span>
                            <span className="text-emerald-400 font-bold">INCLUDED</span>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setIsCheckoutModalOpen(false);
                            message.success({
                                content: `Order for ${selectedItem.name} successfully transmitted to workshop!`,
                                style: { marginTop: "5vh" },
                            });
                        }}
                        className="w-full py-3 bg-[#9cbbf8] hover:bg-[#b4ceff] text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(156,187,248,0.3)]"
                    >
                        CONFIRM ORDER & TRANSMIT TO WORKSHOP
                    </button>
                </div>
            </Modal>

            {/* Diagnostics Modal */}
            <Modal
                open={isDiagnosticsModalOpen}
                onCancel={() => setIsDiagnosticsModalOpen(false)}
                footer={null}
                centered
            >
                <div className="p-4 sm:p-6 bg-[#0c0e14] text-neutral-200 rounded-xl font-mono border border-white/10 -m-6">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        <div>
                            <h3 className="text-base font-black text-white uppercase">
                                CHASSIS TELEMETRY DIAGNOSTICS
                            </h3>
                            <p className="text-[11px] text-neutral-400">Real-time Unsprung Mass & Sensor Telemetry</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
                        <div className="p-3 bg-white/[0.03] rounded border border-white/10">
                            <span className="text-neutral-400 text-[10px] block">CORNER ROTATIONAL INERTIA</span>
                            <span className="text-[#9cbbf8] font-bold text-base mt-1 block">-18.4% OPTIMAL</span>
                        </div>
                        <div className="p-3 bg-white/[0.03] rounded border border-white/10">
                            <span className="text-neutral-400 text-[10px] block">CAMBER ANGLE</span>
                            <span className="text-emerald-400 font-bold text-base mt-1 block">-2.4° TRACK</span>
                        </div>
                        <div className="p-3 bg-white/[0.03] rounded border border-white/10">
                            <span className="text-neutral-400 text-[10px] block">HUB TEMPERATURE</span>
                            <span className="text-white font-bold text-base mt-1 block">42.8 °C NORMAL</span>
                        </div>
                        <div className="p-3 bg-white/[0.03] rounded border border-white/10">
                            <span className="text-neutral-400 text-[10px] block">VIBRATION HARMONIC</span>
                            <span className="text-emerald-400 font-bold text-base mt-1 block">0.02 G STABLE</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsDiagnosticsModalOpen(false)}
                        className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
                    >
                        CLOSE DIAGNOSTICS
                    </button>
                </div>
            </Modal>

            {/* Support Modal */}
            <Modal
                open={isSupportModalOpen}
                onCancel={() => setIsSupportModalOpen(false)}
                footer={null}
                centered
            >
                <div className="p-4 sm:p-6 bg-[#0c0e14] text-neutral-200 rounded-xl font-mono border border-white/10 -m-6">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
                        <HelpCircle className="w-5 h-5 text-cyan-400" />
                        <div>
                            <h3 className="text-base font-black text-white uppercase">
                                SHIFT_TECH WORKSHOP SUPPORT
                            </h3>
                            <p className="text-[11px] text-neutral-400">Engineering Consultation & Fitment Guide</p>
                        </div>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                        Butuh konsultasi teknis terkait pemilihan ban, aerodinamika kap mesin, GT wing, bodykit, atau sistem pengereman? Tim teknisi telemetry kami siap membantu 24/7.
                    </p>

                    <div className="space-y-2 text-xs mb-6">
                        <div className="p-2.5 bg-white/[0.03] rounded border border-white/10 flex justify-between">
                            <span className="text-neutral-400">Hotline Bengkel</span>
                            <span className="text-white font-bold">+62 812-SHIFT-MOD</span>
                        </div>
                        <div className="p-2.5 bg-white/[0.03] rounded border border-white/10 flex justify-between">
                            <span className="text-neutral-400">Telemetri Desk</span>
                            <span className="text-white font-bold">support@shift-tech.id</span>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setIsSupportModalOpen(false);
                            message.info("Support ticket created. Engineer will contact you shortly.");
                        }}
                        className="w-full py-2.5 bg-[#9cbbf8] hover:bg-[#b4ceff] text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
                    >
                        OPEN TICKET SUPPORT
                    </button>
                </div>
            </Modal>

            {/* FOOTER SYSTEM STATUS */}
            <footer className="relative z-10 border-t border-white/[0.06] bg-[#08090c]/80 py-2.5 px-6 text-center shrink-0">
                <div className="max-w-[1720px] mx-auto flex items-center justify-between text-[11px] font-mono text-neutral-500">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>INVENTORY VAULT: SYNCHRONIZED</span>
                    </div>
                    <div className="hidden sm:block">
                        <span>SHIFT_TECH MODULAR HARDWARE VAULT // ACTIVE MODULE: {activeCategory.toUpperCase()}</span>
                    </div>
                    <div>
                        <span>LATENCY: 6ms • THREE.JS 3D ENGINE READY</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
