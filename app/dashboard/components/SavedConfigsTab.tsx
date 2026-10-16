"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Car,
  Layers,
  ExternalLink,
  Trash2,
  Edit3,
  Calendar,
  Palette,
  Disc,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { message } from "antd";

interface SavedConfig {
  id: string;
  userId: string;
  name: string;
  carModelId: string;
  carName: string;
  paintColorName: string;
  paintColorHex: string;
  paintFinish: string;
  equippedVelg: string | null;
  equippedTyre: string | null;
  equippedSpoiler: string | null;
  equippedHood: string | null;
  equippedBodykit: string | null;
  equippedBrake: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    image: string | null;
  };
}

interface SavedConfigsTabProps {
  isSuperUser: boolean;
  currentUserSubscriptionTier?: string;
}

export default function SavedConfigsTab({
  isSuperUser,
  currentUserSubscriptionTier = "FREE",
}: SavedConfigsTabProps) {
  const [configs, setConfigs] = useState<SavedConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [carFilter, setCarFilter] = useState("ALL");
  const [viewScope, setViewScope] = useState<"ALL" | "MINE">(isSuperUser ? "ALL" : "MINE");

  // Edit Name/Notes Modal
  const [editingConfig, setEditingConfig] = useState<SavedConfig | null>(null);
  const [editName, setEditName] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);


  const fetchConfigs = React.useCallback(async () => {
    setLoading(true);
    try {
      const url =
        isSuperUser && viewScope === "ALL"
          ? "/api/configs?all=true"
          : "/api/configs";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setConfigs(data.configs || []);
      } else {
        const err = await res.json();
        message.error(err.error || "Gagal memuat konfigurasi 3D.");
      }
    } catch {
      message.error("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }, [isSuperUser, viewScope]);

  useEffect(() => {
    void fetchConfigs();
  }, [fetchConfigs]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus build 3D "${name}" dari garasi cloud?`)) return;
    try {
      const res = await fetch(`/api/configs/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        message.success(data.message || "Konfigurasi berhasil dihapus.");
        setConfigs((prev) => prev.filter((c) => c.id !== id));
      } else {
        message.error(data.error || "Gagal menghapus.");
      }
    } catch {
      message.error("Terjadi kesalahan.");
    }
  };

  const handleUpdate = async () => {
    if (!editingConfig) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/configs/${editingConfig.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          notes: editNotes,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        message.success("Build berhasil diperbarui!");
        setEditingConfig(null);
        fetchConfigs();
      } else {
        message.error(data.error || "Gagal memperbarui.");
      }
    } catch {
      message.error("Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const parseItemName = (jsonStr: string | null) => {
    if (!jsonStr) return "Stock Standard";
    try {
      const parsed = JSON.parse(jsonStr);
      return parsed?.name || "Stock Standard";
    } catch {
      return jsonStr;
    }
  };

  // Filtered
  const filteredConfigs = configs.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.carName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.user && c.user.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCar = carFilter === "ALL" || c.carModelId === carFilter;
    return matchSearch && matchCar;
  });

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Header & Garage Capacity */}
      <div className="bg-[#0e1017] border border-white/10 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              {isSuperUser && viewScope === "ALL"
                ? "MASTER 3D CLOUD GARAGE // ALL USERS"
                : "MY PERSONAL 3D CAR GARAGE & CLOUD BUILDS"}
            </h2>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1 font-sans">
            Semua konfigurasi cat body, rims modular (Enkei RPF1), spoiler, dan aero tuning yang tersimpan di cloud database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Super User View Scope Switcher */}
          {isSuperUser && (
            <div className="flex items-center bg-[#141722] border border-white/10 rounded-lg p-1 text-[11px]">
              <button
                onClick={() => setViewScope("ALL")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  viewScope === "ALL"
                    ? "bg-[#9cbbf8] text-[#08090c] font-bold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                ALL USERS ({configs.length})
              </button>
              <button
                onClick={() => setViewScope("MINE")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  viewScope === "MINE"
                    ? "bg-[#9cbbf8] text-[#08090c] font-bold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                MY BUILDS
              </button>
            </div>
          )}

          {/* New 3D Build Shortcut */}
          <Link
            href="/workshop"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#9cbbf8] to-[#60a5fa] hover:from-[#b5ceff] hover:to-[#93c5fd] text-[#08090c] font-black uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(156,187,248,0.3)] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ BUILD NEW 3D CAR</span>
          </Link>
        </div>
      </div>

      {/* Capacity Warning for Free Tier */}
      {!isSuperUser && currentUserSubscriptionTier === "FREE" && (
        <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-3 flex items-center justify-between text-[11px] text-blue-300">
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/20 px-2 py-0.5 rounded font-bold">FREE TIER</span>
            <span>Kapasitas penyimpanan garasi: {configs.length} / 5 slot build terpakai.</span>
          </div>
          <Link href="/dashboard" className="text-white underline hover:text-[#9cbbf8] font-bold">
            Upgrade ke PRO untuk Slot Tanpa Batas →
          </Link>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#0e1017] border border-white/10 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari build atau model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141722] border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-white placeholder-neutral-500 focus:outline-none focus:border-[#9cbbf8] text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5 bg-[#141722] border border-white/10 rounded-lg px-2.5 py-1">
            <span className="text-neutral-400 text-[10px]">Model:</span>
            <select
              value={carFilter}
              onChange={(e) => setCarFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none text-xs cursor-pointer"
            >
              <option value="ALL" className="bg-[#141722] text-white">ALL MODELS</option>
              <option value="porsche-gt3rs" className="bg-[#141722] text-white">Porsche 911 GT3 RS</option>
              <option value="bmw-m3-g81" className="bg-[#141722] text-white">BMW M4 Competition</option>
              <option value="toyota-supra-a91" className="bg-[#141722] text-white">Toyota GR86 Gazoo</option>
            </select>
          </div>

          <button
            onClick={fetchConfigs}
            disabled={loading}
            className="p-1.5 bg-[#141722] hover:bg-[#1e2333] border border-white/10 rounded-lg text-neutral-300"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#9cbbf8]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Grid of Saved 3D Car Builds */}
      {loading ? (
        <div className="py-20 text-center text-neutral-400 bg-[#0e1017] border border-white/10 rounded-xl">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#9cbbf8] mb-3" />
          <p className="uppercase tracking-widest text-xs">LOADING 3D GARAGE CONFIGURATIONS...</p>
        </div>
      ) : filteredConfigs.length === 0 ? (
        <div className="py-16 text-center text-neutral-400 bg-[#0e1017] border border-white/10 rounded-xl p-8">
          <Car className="w-12 h-12 mx-auto text-neutral-600 mb-3" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
            BELUM ADA 3D CAR BUILD TERSIMPAN
          </h3>
          <p className="text-xs text-neutral-400 font-sans max-w-md mx-auto mb-5">
            Buka 3D Tuning Studio, pilih warna cat, pasang velg Enkei RPF1 dan part modifikasi favoritmu, lalu simpan langsung ke Cloud Garage!
          </p>
          <Link
            href="/workshop"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9cbbf8] hover:bg-[#b4ceff] text-[#08090c] font-black uppercase tracking-wider text-xs rounded-lg transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            BUAT BUILD PERTAMA
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConfigs.map((cfg) => {
            const velgName = parseItemName(cfg.equippedVelg);
            const spoilerName = parseItemName(cfg.equippedSpoiler);
            const hoodName = parseItemName(cfg.equippedHood);

            return (
              <div
                key={cfg.id}
                className="bg-[#0e1017] hover:bg-[#121520] border border-white/10 hover:border-[#9cbbf8]/40 rounded-xl p-4 transition-all flex flex-col justify-between group shadow-lg"
              >
                <div>
                  {/* Card Header: Car Model badge & User avatar if super view */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-bold text-[#9cbbf8] uppercase tracking-wider bg-blue-950/50 border border-blue-500/30 px-2 py-0.5 rounded">
                        {cfg.carName}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1 group-hover:text-[#9cbbf8] transition-colors truncate max-w-[200px]">
                        {cfg.name}
                      </h3>
                    </div>

                    {/* Paint swatch preview */}
                    <div className="flex items-center gap-1.5 bg-[#141722] border border-white/10 px-2 py-1 rounded-md">
                      <div
                        className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
                        style={{ backgroundColor: cfg.paintColorHex }}
                      />
                      <span className="text-[10px] text-neutral-300">{cfg.paintFinish}</span>
                    </div>
                  </div>

                  {/* Driver Owner Badge if viewing all in Super User */}
                  {cfg.user && isSuperUser && viewScope === "ALL" && (
                    <div className="flex items-center gap-2 py-1.5 px-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg mb-3">
                      <div className="w-5 h-5 rounded-full bg-[#1b2233] text-[#9cbbf8] flex items-center justify-center text-[9px] font-bold">
                        {cfg.user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[11px] text-neutral-300 truncate">
                        Driver: <strong className="text-white">{cfg.user.name}</strong>
                      </span>
                    </div>
                  )}

                  {/* Equipped Modular Parts Specs Summary */}
                  <div className="space-y-1.5 bg-[#141722]/60 rounded-lg p-2.5 border border-white/[0.04] mb-3 text-[11px]">
                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="flex items-center gap-1.5">
                        <Disc className="w-3 h-3 text-[#9cbbf8]" />
                        Velg / Wheels:
                      </span>
                      <span className="text-neutral-200 font-bold truncate max-w-[130px]">
                        {velgName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-cyan-400" />
                        Aero Wing / Spoiler:
                      </span>
                      <span className="text-neutral-200 truncate max-w-[130px]">
                        {spoilerName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="flex items-center gap-1.5">
                        <Car className="w-3 h-3 text-purple-400" />
                        Custom Hood:
                      </span>
                      <span className="text-neutral-200 truncate max-w-[130px]">
                        {hoodName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="flex items-center gap-1.5">
                        <Palette className="w-3 h-3 text-emerald-400" />
                        Paint Color:
                      </span>
                      <span className="text-neutral-200 truncate max-w-[130px]">
                        {cfg.paintColorName}
                      </span>
                    </div>
                  </div>

                  {cfg.notes && (
                    <p className="text-[11px] text-neutral-400 italic bg-[#141722]/30 p-2 rounded mb-3 line-clamp-2">
                      &quot;{cfg.notes}&quot;
                    </p>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                  <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(cfg.createdAt).toLocaleDateString("id-ID")}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Launch into 3D Studio button with configId */}
                    <Link
                      href={`/workshop?configId=${cfg.id}&model=${cfg.carModelId}&color=${encodeURIComponent(
                        cfg.paintColorHex
                      )}&finish=${cfg.paintFinish}`}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-[#9cbbf8] hover:bg-[#b5ceff] text-[#08090c] rounded-md font-black transition-all text-[11px] shadow-[0_0_10px_rgba(156,187,248,0.2)] active:scale-95"
                      title="Load this user configuration into 3D Workshop"
                    >
                      <ExternalLink className="w-3 h-3 stroke-[2.5]" />
                      <span>LOAD PRESET</span>
                    </Link>

                    {/* Edit Name Button */}
                    <button
                      onClick={() => {
                        setEditingConfig(cfg);
                        setEditName(cfg.name);
                        setEditNotes(cfg.notes || "");
                      }}
                      className="p-1 bg-[#141722] hover:bg-white/10 text-neutral-400 hover:text-white rounded-md border border-white/10 transition-colors"
                      title="Edit Nama / Catatan"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(cfg.id, cfg.name)}
                      className="p-1 bg-[#141722] hover:bg-red-950/40 text-neutral-400 hover:text-red-400 rounded-md border border-white/10 transition-colors"
                      title="Hapus Build"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Config Modal */}
      {editingConfig && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1017] border border-white/20 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                EDIT 3D CAR BUILD NAME
              </h3>
              <button onClick={() => setEditingConfig(null)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-neutral-400 uppercase mb-1">
                  Nama Konfigurasi
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#141722] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#9cbbf8] text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 uppercase mb-1">
                  Catatan Setup / Tuning Notes
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Deskripsi setup, ban track day, camber..."
                  className="w-full bg-[#141722] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#9cbbf8] text-xs font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setEditingConfig(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleUpdate}
                disabled={isSaving}
                className="px-4 py-2 bg-[#9cbbf8] hover:bg-[#b4ceff] text-[#08090c] font-black rounded-lg text-xs transition-all"
              >
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
