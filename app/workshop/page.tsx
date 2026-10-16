"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { message, Modal } from "antd";
import {
  BookmarkCheck,
  ShoppingBag,
  ChevronDown,
  FolderOpen,
} from "lucide-react";
import {
  ALL_INVENTORY_ITEMS,
  InventoryItem,
} from "@/app/inventory/data/wheels";
import WorkshopSidebar from "./components/WorkshopSidebar";
import PartCatalogSidebar from "./components/PartCatalogSidebar";
import ShowroomTelemetryFooter from "./components/ShowroomTelemetryFooter";
import Showroom3DCanvas, {
  CAR_MODELS,
  PAINT_COLORS,
  PaintOption,
} from "./components/Showroom3DCanvas";
import ModelImportModal from "./components/ModelImportModal";
import { useAuth } from "@/app/context/AuthContext";

export interface WorkshopSavedConfig {
  id: string;
  name: string;
  notes?: string | null;
  carModelId?: string;
  carName?: string;
  paintColorHex?: string;
  paintColorName?: string;
  paintFinish?: string;
  equippedVelg?: unknown;
  equippedTyre?: unknown;
  equippedHood?: unknown;
  equippedSpoiler?: unknown;
  equippedBodykit?: unknown;
  equippedBrake?: unknown;
  createdAt?: string;
}

// Helper to safely parse and resolve equipped items
function resolveInventoryItem(
  data: unknown,
  type: "velg" | "tyres" | "hood" | "spoiler" | "bodykit" | "brake"
): InventoryItem {
  if (!data) return ALL_INVENTORY_ITEMS.find((i) => i.type === type) || ALL_INVENTORY_ITEMS[0];
  let parsed: Record<string, unknown> | null = null;
  if (typeof data === "string") {
    try {
      parsed = JSON.parse(data);
    } catch {
      parsed = null;
    }
  } else if (typeof data === "object" && data !== null) {
    parsed = data as Record<string, unknown>;
  }
  if (parsed?.id && typeof parsed.id === "string") {
    const found = ALL_INVENTORY_ITEMS.find((i) => i.id === parsed.id);
    if (found) return found;
  }
  if (parsed?.name && typeof parsed.name === "string") {
    const found = ALL_INVENTORY_ITEMS.find(
      (i) => i.name.toLowerCase() === (parsed.name as string).toLowerCase()
    );
    if (found) return found;
  }
  if (parsed && typeof parsed.priceNumber === "number") {
    return parsed as unknown as InventoryItem;
  }
  return ALL_INVENTORY_ITEMS.find((i) => i.type === type) || ALL_INVENTORY_ITEMS[0];
}

function WorkshopContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [activeCategory, setActiveCategory] = useState<string>("velg");

  // Equipped Parts Map
  const [equippedParts, setEquippedParts] = useState<{
    velg: InventoryItem;
    tyres: InventoryItem;
    hood: InventoryItem;
    spoiler: InventoryItem;
    bodykit: InventoryItem;
    brake: InventoryItem;
  }>({
    velg: ALL_INVENTORY_ITEMS.find((i) => i.id === "volk-te37") || ALL_INVENTORY_ITEMS[1],
    tyres: ALL_INVENTORY_ITEMS.find((i) => i.id === "toyo-proxes-r888r") || ALL_INVENTORY_ITEMS[8],
    hood: ALL_INVENTORY_ITEMS.find((i) => i.id === "varis-carbon-bonnet") || ALL_INVENTORY_ITEMS[14],
    spoiler: ALL_INVENTORY_ITEMS.find((i) => i.id === "voltex-type-7") || ALL_INVENTORY_ITEMS[20],
    bodykit: ALL_INVENTORY_ITEMS.find((i) => i.id === "pandem-v2-widebody") || ALL_INVENTORY_ITEMS[26],
    brake: ALL_INVENTORY_ITEMS.find((i) => i.id === "brembo-gtr-billet") || ALL_INVENTORY_ITEMS[32],
  });

  // Selected 3D Car Model Preset
  const [selectedCarModelId, setSelectedCarModelId] = useState<
    "porsche-gt3rs" | "bmw-m3-g81" | "toyota-supra-a91"
  >("porsche-gt3rs");

  // Paint Color State (Synced with Showroom3DCanvas)
  const [paintColor, setPaintColor] = useState<PaintOption>(PAINT_COLORS[0]);

  // Loaded Preset Info
  const [loadedConfigName, setLoadedConfigName] = useState<string | null>(null);
  const [userSavedConfigs, setUserSavedConfigs] = useState<WorkshopSavedConfig[]>([]);
  const [isPresetsDropdownOpen, setIsPresetsDropdownOpen] = useState(false);

  // Custom User Uploaded Model
  const [customModelFile, setCustomModelFile] = useState<{
    file: File;
    type: "glb" | "gltf" | "fbx";
    scale: number;
  } | null>(null);

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [buildName, setBuildName] = useState("");
  const [buildNotes, setBuildNotes] = useState("");
  const [isSavingBuild, setIsSavingBuild] = useState(false);

  // Load user's saved configs for quick preset switcher
  const fetchUserSavedConfigs = async () => {
    try {
      const res = await fetch("/api/configs");
      if (res.ok) {
        const data = await res.json();
        setUserSavedConfigs(data.configs || []);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (user) {
      void fetchUserSavedConfigs();
    }
  }, [user]);

  // Apply a configuration object to the workshop state
  const applyConfiguration = (cfg: WorkshopSavedConfig | null) => {
    if (!cfg) return;

    // 1. Car Model
    if (
      cfg.carModelId &&
      ["porsche-gt3rs", "bmw-m3-g81", "toyota-supra-a91"].includes(cfg.carModelId)
    ) {
      setSelectedCarModelId(
        cfg.carModelId as "porsche-gt3rs" | "bmw-m3-g81" | "toyota-supra-a91"
      );
      setCustomModelFile(null);
    }

    // 2. Paint Color
    if (cfg.paintColorHex) {
      setPaintColor({
        name: cfg.paintColorName || "Loaded Paint",
        hex: cfg.paintColorHex,
        finish:
          (cfg.paintFinish as "Gloss" | "Matte" | "Metallic" | "Carbon") || "Gloss",
      });
    }

    // 3. Equipped Modular Parts
    setEquippedParts({
      velg: resolveInventoryItem(cfg.equippedVelg, "velg"),
      tyres: resolveInventoryItem(cfg.equippedTyre, "tyres"),
      hood: resolveInventoryItem(cfg.equippedHood, "hood"),
      spoiler: resolveInventoryItem(cfg.equippedSpoiler, "spoiler"),
      bodykit: resolveInventoryItem(cfg.equippedBodykit, "bodykit"),
      brake: resolveInventoryItem(cfg.equippedBrake, "brake"),
    });

    setLoadedConfigName(cfg.name);
    message.success({
      content: `Konfigurasi 3D "${cfg.name}" berhasil dimuat ke Workshop Studio!`,
      style: { marginTop: "5vh" },
    });
  };

  // Check URL search parameters (configId, model, color, finish)
  useEffect(() => {
    const configId = searchParams.get("configId");
    const model = searchParams.get("model");
    const color = searchParams.get("color");
    const finish = searchParams.get("finish");

    if (configId) {
      // Fetch full configuration from API
      fetch(`/api/configs/${configId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.config) {
            applyConfiguration(data.config);
          } else {
            message.warning("Konfigurasi tersimpan tidak ditemukan.");
          }
        })
        .catch((err) => {
          console.error("Error loading config by ID:", err);
        });
    } else {
      // Check query params fallback
      if (
        model &&
        ["porsche-gt3rs", "bmw-m3-g81", "toyota-supra-a91"].includes(model)
      ) {
        setSelectedCarModelId(
          model as "porsche-gt3rs" | "bmw-m3-g81" | "toyota-supra-a91"
        );
      }
      if (color) {
        setPaintColor((prev) => ({
          ...prev,
          name: "Studio Color",
          hex: decodeURIComponent(color),
          finish:
            (finish as "Gloss" | "Matte" | "Metallic" | "Carbon") || prev.finish,
        }));
      }
    }
  }, [searchParams]);

  // Calculate dynamic modification budget
  const totalModCost =
    equippedParts.velg.priceNumber +
    equippedParts.tyres.priceNumber +
    equippedParts.hood.priceNumber +
    equippedParts.spoiler.priceNumber +
    equippedParts.bodykit.priceNumber +
    equippedParts.brake.priceNumber;

  const handleEquipItem = (item: InventoryItem) => {
    setEquippedParts((prev) => ({
      ...prev,
      [item.type]: item,
    }));
    message.success({
      content: `${item.name} terpasang ke mobil 3D!`,
      style: { marginTop: "5vh" },
    });
  };

  const handleResetToStock = () => {
    setCustomModelFile(null);
    setLoadedConfigName(null);
    setEquippedParts({
      velg: ALL_INVENTORY_ITEMS[0],
      tyres: ALL_INVENTORY_ITEMS[8],
      hood: ALL_INVENTORY_ITEMS[14],
      spoiler: ALL_INVENTORY_ITEMS[20],
      bodykit: ALL_INVENTORY_ITEMS[26],
      brake: ALL_INVENTORY_ITEMS[32],
    });
    setPaintColor(PAINT_COLORS[0]);
    message.info("Konfigurasi mobil di-reset ke pengaturan standar pabrik.");
  };

  const handleOpenSaveModal = () => {
    if (!user) {
      message.warning({
        content: "Silakan login terlebih dahulu untuk menyimpan 3D build ke Cloud Garage Anda!",
        duration: 4,
      });
      return;
    }
    const currentCar = CAR_MODELS.find((c) => c.id === selectedCarModelId) || CAR_MODELS[0];
    setBuildName(loadedConfigName || `${currentCar.name} Custom Spec`);
    setBuildNotes("");
    setIsSaveModalOpen(true);
  };

  const executeSaveToCloud = async () => {
    if (!buildName.trim()) {
      message.warning("Beri nama untuk build mobil Anda.");
      return;
    }

    const currentCar = CAR_MODELS.find((c) => c.id === selectedCarModelId) || CAR_MODELS[0];
    setIsSavingBuild(true);

    try {
      const res = await fetch("/api/configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: buildName.trim(),
          carModelId: selectedCarModelId,
          carName: currentCar.name,
          paintColorName: paintColor.name,
          paintColorHex: paintColor.hex,
          paintFinish: paintColor.finish,
          equippedVelg: equippedParts.velg,
          equippedTyre: equippedParts.tyres,
          equippedSpoiler: equippedParts.spoiler,
          equippedHood: equippedParts.hood,
          equippedBodykit: equippedParts.bodykit,
          equippedBrake: equippedParts.brake,
          notes: buildNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        message.success({
          content: `3D Build "${buildName}" berhasil disimpan ke Cloud Garage!`,
          duration: 3,
        });
        setLoadedConfigName(buildName.trim());
        setIsSaveModalOpen(false);
        fetchUserSavedConfigs();
      } else {
        message.error(data.error || "Gagal menyimpan build.");
      }
    } catch {
      message.error("Gagal terhubung ke cloud garage.");
    } finally {
      setIsSavingBuild(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090c] text-neutral-200 font-sans relative selection:bg-[#9cbbf8] selection:text-black flex flex-col justify-between">
      {/* Background Tech Blueprint Grid */}
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

      {/* Ambient Lighting Accents */}
      <div className="fixed top-20 left-1/4 w-[28rem] h-[28rem] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-20 right-1/4 w-[32rem] h-[32rem] bg-indigo-950/10 rounded-full blur-[180px] pointer-events-none z-0" />

      {/* SUB-HEADER / BUDGET BAR & PRESET LOADER */}
      <div className="relative z-20 border-b border-white/[0.06] bg-[#0c0e14]/90 px-4 sm:px-8 py-2.5 backdrop-blur-sm">
        <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-4 font-mono text-xs flex-wrap">
          {/* Left Sub-title & Loaded Config Badge */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-bold tracking-wide">3D TUNING STUDIO // REALTIME STAGE</span>

            {loadedConfigName && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#9cbbf8]/20 text-[#9cbbf8] border border-[#9cbbf8]/40 animate-fadeIn">
                <BookmarkCheck className="w-3 h-3 text-[#9cbbf8]" />
                ACTIVE PRESET: {loadedConfigName}
              </span>
            )}
          </div>

          {/* Center/Right: Modification Budget & Quick Presets & Save Build Button */}
          <div className="flex items-center gap-3 sm:gap-4 ml-auto flex-wrap">
            {/* Quick Saved Presets Dropdown */}
            {user && userSavedConfigs.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsPresetsDropdownOpen(!isPresetsDropdownOpen)}
                  className="px-3 py-1.5 bg-[#141722] hover:bg-[#1a2030] text-neutral-200 hover:text-white rounded border border-white/10 flex items-center gap-1.5 font-bold text-xs transition-colors cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-[#9cbbf8]" />
                  <span>SAVED BUILDS ({userSavedConfigs.length})</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isPresetsDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isPresetsDropdownOpen && (
                  <div
                    onMouseLeave={() => setIsPresetsDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-72 bg-[#0d0f15] border border-white/15 rounded-xl p-2 shadow-2xl backdrop-blur-xl space-y-1 text-xs z-50 font-mono"
                  >
                    <div className="px-3 py-2 border-b border-white/[0.08] mb-1 flex items-center justify-between">
                      <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">
                        CHOOSE PRESET TO LOAD:
                      </span>
                      <Link
                        href="/dashboard"
                        onClick={() => setIsPresetsDropdownOpen(false)}
                        className="text-[10px] text-[#9cbbf8] hover:underline font-sans"
                      >
                        Manage All →
                      </Link>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                      {userSavedConfigs.map((cfg) => {
                        const isCurrent = loadedConfigName === cfg.name;
                        return (
                          <button
                            key={cfg.id}
                            type="button"
                            onClick={() => {
                              applyConfiguration(cfg);
                              setIsPresetsDropdownOpen(false);
                            }}
                            className={`w-full text-left p-2 rounded-lg flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                              isCurrent
                                ? "bg-[#9cbbf8]/20 border border-[#9cbbf8]/40 text-white font-bold"
                                : "hover:bg-white/[0.06] text-neutral-300"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-xs truncate font-bold text-white">{cfg.name}</p>
                              <p className="text-[10px] text-neutral-400 truncate">
                                {cfg.carName} • {cfg.paintColorName}
                              </p>
                            </div>
                            <div
                              className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0"
                              style={{ backgroundColor: cfg.paintColorHex }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Budget Display */}
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 uppercase block leading-none">
                MODIFICATION BUDGET
              </span>
              <span className="text-[#9cbbf8] font-bold text-sm">
                Rp {totalModCost.toLocaleString("id-ID")}
              </span>
            </div>

            {/* Save Build Button */}
            <button
              onClick={handleOpenSaveModal}
              className="px-3.5 py-1.5 bg-[#9cbbf8] hover:bg-[#b4ceff] text-[#08090c] font-black text-xs uppercase tracking-wider rounded transition-all shadow-[0_0_12px_rgba(156,187,248,0.25)] hover:shadow-[0_0_18px_rgba(156,187,248,0.45)] flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <BookmarkCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>SAVE BUILD</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN 3D SHOWROOM LAYOUT */}
      <main className="relative z-10 max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-4 xl:gap-6 items-start flex-1">
          {/* 1. LEFT STICKY SIDEBAR: VEHICLE CONFIG */}
          <div className="sticky top-20 lg:top-24 shrink-0 self-start z-20 w-full lg:w-auto">
            <WorkshopSidebar
              activeCategory={activeCategory}
              onSelectCategory={(cat) => setActiveCategory(cat)}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onCheckout={() => setIsCheckoutModalOpen(true)}
              onResetModifications={handleResetToStock}
            />
          </div>

          {/* 2. CENTER SECTION: 3D VIEWPORT SHOWROOM */}
          <section className="flex-1 flex flex-col min-w-0 w-full">
            <Showroom3DCanvas
              equippedVelg={equippedParts.velg}
              equippedTyre={equippedParts.tyres}
              equippedSpoiler={equippedParts.spoiler}
              equippedHood={equippedParts.hood}
              equippedBodykit={equippedParts.bodykit}
              equippedBrake={equippedParts.brake}
              customModelFile={customModelFile}
              selectedCarModelId={selectedCarModelId}
              onSelectCarModel={(id) => {
                setSelectedCarModelId(id);
                setCustomModelFile(null);
                message.info(`Memuat model 3D ${id.toUpperCase()} ke showroom.`);
              }}
              currentPaintColor={paintColor}
              onPaintColorChange={(col) => setPaintColor(col)}
            />
          </section>

          {/* 3. RIGHT STICKY SIDEBAR: PART CATALOG */}
          <div className="sticky top-20 lg:top-24 shrink-0 self-start z-20 w-full lg:w-auto">
            <PartCatalogSidebar
              activeCategory={activeCategory}
              equippedItem={
                equippedParts[activeCategory as keyof typeof equippedParts] || equippedParts.velg
              }
              onEquipItem={handleEquipItem}
            />
          </div>
        </div>

        {/* 4. BOTTOM TELEMETRY FOOTER BAR */}
        <ShowroomTelemetryFooter
          equippedVelg={equippedParts.velg}
          equippedTyre={equippedParts.tyres}
          onOpenTyreCatalog={() => setActiveCategory("tyres")}
        />
      </main>

      {/* Custom 3D Model Import Modal (.glb, .gltf, .fbx) */}
      <ModelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onLoadCustomModel={(file, type, scale) => {
          setCustomModelFile({ file, type, scale });
        }}
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
                COMPLETE 3D VEHICLE BUILD CHECKOUT
              </h3>
              <p className="text-[11px] text-neutral-400">Total Accessories & Workshop Fitting</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs mb-6 max-h-60 overflow-y-auto pr-1">
            <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
              <span className="text-neutral-400">Velg</span>
              <span className="text-white font-bold">{equippedParts.velg.name} ({equippedParts.velg.price})</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
              <span className="text-neutral-400">Tyres</span>
              <span className="text-white font-bold">{equippedParts.tyres.name} ({equippedParts.tyres.price})</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
              <span className="text-neutral-400">Hood</span>
              <span className="text-white font-bold">{equippedParts.hood.name} ({equippedParts.hood.price})</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
              <span className="text-neutral-400">Spoiler</span>
              <span className="text-white font-bold">{equippedParts.spoiler.name} ({equippedParts.spoiler.price})</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
              <span className="text-neutral-400">Bodykit</span>
              <span className="text-white font-bold">{equippedParts.bodykit.name} ({equippedParts.bodykit.price})</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
              <span className="text-neutral-400">Brake System</span>
              <span className="text-white font-bold">{equippedParts.brake.name} ({equippedParts.brake.price})</span>
            </div>
            <div className="flex justify-between py-2 text-neutral-300 font-bold text-sm pt-2">
              <span>Total Modification Cost</span>
              <span className="text-[#9cbbf8]">Rp {totalModCost.toLocaleString("id-ID")}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsCheckoutModalOpen(false);
              message.success({
                content: "All accessories ordered & sent to telemetry installation bay!",
                style: { marginTop: "5vh" },
              });
            }}
            className="w-full py-3 bg-[#9cbbf8] hover:bg-[#b4ceff] text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(156,187,248,0.3)] cursor-pointer"
          >
            ORDER FULL BUILD TO WORKSHOP
          </button>
        </div>
      </Modal>

      {/* Save 3D Car Build Modal */}
      <Modal
        open={isSaveModalOpen}
        onCancel={() => setIsSaveModalOpen(false)}
        footer={null}
        centered
      >
        <div className="p-4 sm:p-6 bg-[#0c0e14] text-neutral-200 rounded-xl font-mono border border-white/10 -m-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-3">
            <BookmarkCheck className="w-5 h-5 text-[#9cbbf8]" />
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                SAVE BUILD TO CLOUD GARAGE
              </h3>
              <p className="text-[11px] text-neutral-400">
                Simpan konfigurasi 3D ke profil driver Anda untuk diakses kapan saja.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] text-neutral-400 uppercase mb-1">
                Build Name / Label
              </label>
              <input
                type="text"
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
                placeholder="Contoh: Porsche GT3 RS Midnight Track Spec"
                className="w-full bg-[#141722] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#9cbbf8] text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 uppercase mb-1">
                Tuning Notes / Catatan Modifikasi (Opsional)
              </label>
              <textarea
                rows={3}
                value={buildNotes}
                onChange={(e) => setBuildNotes(e.target.value)}
                placeholder="Catatan camber, ban sirkuit, part custom..."
                className="w-full bg-[#141722] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#9cbbf8] text-xs font-sans"
              />
            </div>

            <div className="bg-[#141722]/80 border border-white/5 rounded-lg p-2.5 text-[11px] text-neutral-400 space-y-1">
              <div className="flex justify-between">
                <span>Model Mobil:</span>
                <span className="text-white font-bold">{CAR_MODELS.find((c) => c.id === selectedCarModelId)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Equipped Velg:</span>
                <span className="text-[#9cbbf8]">{equippedParts.velg.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Body Paint Color:</span>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-full border border-white/40"
                    style={{ backgroundColor: paintColor.hex }}
                  />
                  <span className="text-white">{paintColor.name} ({paintColor.finish})</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              href="/dashboard"
              className="text-[11px] text-[#9cbbf8] hover:underline"
              onClick={() => setIsSaveModalOpen(false)}
            >
              Buka My Dashboard →
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={executeSaveToCloud}
                disabled={isSavingBuild}
                className="px-4 py-2 bg-[#9cbbf8] hover:bg-[#b4ceff] text-[#08090c] font-black rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                {isSavingBuild ? "Menyimpan..." : "Simpan Build"}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* System Footer Status */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-[#08090c]/80 py-2.5 px-6 text-center shrink-0">
        <div className="max-w-[1720px] mx-auto flex items-center justify-between text-[11px] font-mono text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>3D SHOWROOM RENDERER: ACTIVE (WEBGL 2.0)</span>
          </div>
          <div className="hidden sm:block">
            <span>SHIFT_TECH PRECISION VEHICLE MODIFICATOR // GLB & FBX COMPLIANT</span>
          </div>
          <div>
            <span>FPS: 60 • THREE.JS SHADER ENGINE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function ShowroomWorkshopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08090c] flex flex-col items-center justify-center font-mono text-xs text-neutral-400">
          <div className="w-8 h-8 border-2 border-[#9cbbf8] border-t-transparent rounded-full animate-spin mb-3" />
          <span>LOADING 3D TUNING STUDIO...</span>
        </div>
      }
    >
      <WorkshopContent />
    </Suspense>
  );
}
