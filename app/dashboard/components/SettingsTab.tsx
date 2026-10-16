"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  User,
  Lock,
  Sliders,
  Save,
  KeyRound,
} from "lucide-react";
import { message } from "antd";

interface SettingsTabProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
  };
  onRefreshUser?: () => void;
}

export default function SettingsTab({ user, onRefreshUser }: SettingsTabProps) {
  // Profile info
  const [name, setName] = useState(user.name || "");
  const [image, setImage] = useState(user.image || "");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 3D Studio Preferences (persisted in localStorage)
  const [defaultCar, setDefaultCar] = useState("porsche-gt3rs");
  const [graphicsQuality, setGraphicsQuality] = useState("Ultra");
  const [autoRotateDefault, setAutoRotateDefault] = useState(false);
  const [studioLighting, setStudioLighting] = useState("Cyber Neon");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const savedCar = localStorage.getItem("shift_pref_default_car");
    const savedQuality = localStorage.getItem("shift_pref_quality");
    const savedAutoRotate = localStorage.getItem("shift_pref_autorotate");
    const savedLighting = localStorage.getItem("shift_pref_lighting");

    if (savedCar) setDefaultCar(savedCar);
    if (savedQuality) setGraphicsQuality(savedQuality);
    if (savedAutoRotate) setAutoRotateDefault(savedAutoRotate === "true");
    if (savedLighting) setStudioLighting(savedLighting);
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      message.warning("Nama tidak boleh kosong.");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          image: image.trim() || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        message.success(data.message || "Profil berhasil disimpan!");
        if (onRefreshUser) onRefreshUser();
      } else {
        message.error(data.error || "Gagal memperbarui profil.");
      }
    } catch {
      message.error("Gagal terhubung ke server.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      message.warning("Masukkan password saat ini.");
      return;
    }
    if (newPassword.length < 6) {
      message.warning("Password baru minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      message.warning("Konfirmasi password baru tidak cocok.");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        message.success("Password baru berhasil disimpan!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        message.error(data.error || "Gagal memperbarui password.");
      }
    } catch {
      message.error("Gagal terhubung ke server.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveStudioPreferences = () => {
    localStorage.setItem("shift_pref_default_car", defaultCar);
    localStorage.setItem("shift_pref_quality", graphicsQuality);
    localStorage.setItem("shift_pref_autorotate", String(autoRotateDefault));
    localStorage.setItem("shift_pref_lighting", studioLighting);

    message.success("Preferensi 3D Studio berhasil disimpan!");
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Driver Profile Settings */}
        <div className="bg-[#0e1017] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <User className="w-4 h-4 text-[#9cbbf8]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              DRIVER PROFILE INFORMATION
            </h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-[11px] text-neutral-400 uppercase mb-1">
                Display Driver Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#141722] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#9cbbf8] text-xs"
                placeholder="Nama Anda"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 uppercase mb-1">
                Email Address (Account ID)
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full bg-[#0a0c12] border border-white/10 rounded-lg px-3 py-2 text-neutral-500 text-xs cursor-not-allowed"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">
                Email terverifikasi permanen untuk identifikasi lisensi pembalap.
              </span>
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 uppercase mb-1">
                Avatar Image URL
              </label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/... atau URL avatar"
                className="w-full bg-[#141722] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#9cbbf8] text-xs font-sans"
              />
            </div>

            {/* Quick Avatar Presets */}
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block mb-1.5">
                Quick Avatar Presets:
              </span>
              <div className="flex items-center gap-2">
                {[
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
                ].map((presetUrl, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setImage(presetUrl)}
                    className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/20 hover:border-[#9cbbf8] transition-all cursor-pointer"
                  >
                    <Image src={presetUrl} alt="Preset" width={32} height={32} unoptimized className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2.5 bg-[#9cbbf8] hover:bg-[#b4ceff] text-[#08090c] font-black rounded-lg uppercase tracking-wider text-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingProfile ? "SAVING..." : "UPDATE PROFILE"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Security & Password */}
        <div className="bg-[#0e1017] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              SECURITY & PASSWORD
            </h3>
          </div>

          <form onSubmit={handleSavePassword} className="space-y-4">
            <div>
              <label className="block text-[11px] text-neutral-400 uppercase mb-1">
                Current Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[#141722] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 text-xs"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 uppercase mb-1">
                New Password (Min. 6 Characters)
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#141722] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 text-xs"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 uppercase mb-1">
                Confirm New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#141722] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 text-xs"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-neutral-400 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded bg-[#141722] border-white/20 text-emerald-400"
                />
                <span>Tampilkan Password</span>
              </label>

              <button
                type="submit"
                disabled={savingPassword}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-lg uppercase tracking-wider text-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{savingPassword ? "UPDATING..." : "CHANGE PASSWORD"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Section 3: 3D Studio & Rendering Preferences */}
      <div className="bg-[#0e1017] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              3D SHOWROOM & GRAPHIC PREFERENCES
            </h3>
          </div>
          <span className="text-[10px] text-neutral-400 uppercase">
            CLIENT HARDWARE OPTIMIZATION
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Default Car Model */}
          <div className="bg-[#141722] p-3.5 rounded-xl border border-white/5 space-y-2">
            <label className="text-[11px] text-neutral-400 uppercase font-bold block">
              Default Showroom Car
            </label>
            <select
              value={defaultCar}
              onChange={(e) => setDefaultCar(e.target.value)}
              className="w-full bg-[#0a0c12] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs cursor-pointer"
            >
              <option value="porsche-gt3rs">Porsche 911 GT3 RS</option>
              <option value="bmw-m3-g81">BMW M4 Competition</option>
              <option value="toyota-supra-a91">Toyota GR86 Gazoo</option>
            </select>
            <span className="text-[10px] text-neutral-500 block">
              Model yang pertama dimuat saat membuka workshop.
            </span>
          </div>

          {/* Graphic Quality */}
          <div className="bg-[#141722] p-3.5 rounded-xl border border-white/5 space-y-2">
            <label className="text-[11px] text-neutral-400 uppercase font-bold block">
              3D Shaders & Resolution
            </label>
            <select
              value={graphicsQuality}
              onChange={(e) => setGraphicsQuality(e.target.value)}
              className="w-full bg-[#0a0c12] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs cursor-pointer"
            >
              <option value="Ultra">Ultra (ACES Tone, PCF Shadows 60FPS)</option>
              <option value="Balanced">Balanced (Standard Studio Shaders)</option>
              <option value="Performance">Performance (Low Laptop Battery)</option>
            </select>
            <span className="text-[10px] text-neutral-500 block">
              Menyesuaikan beban GPU laptop Anda.
            </span>
          </div>

          {/* Auto Rotate Turntable */}
          <div className="bg-[#141722] p-3.5 rounded-xl border border-white/5 space-y-2">
            <label className="text-[11px] text-neutral-400 uppercase font-bold block">
              Auto-Rotate Turntable
            </label>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAutoRotateDefault(!autoRotateDefault)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all border ${
                  autoRotateDefault
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                    : "bg-[#0a0c12] text-neutral-400 border-white/10"
                }`}
              >
                {autoRotateDefault ? "ENABLED (ON)" : "DISABLED (OFF)"}
              </button>
            </div>
            <span className="text-[10px] text-neutral-500 block">
              Putar otomatis stage showroom 3D saat pertama kali dimuat.
            </span>
          </div>

          {/* Studio Lighting */}
          <div className="bg-[#141722] p-3.5 rounded-xl border border-white/5 space-y-2">
            <label className="text-[11px] text-neutral-400 uppercase font-bold block">
              Studio Lighting Preset
            </label>
            <select
              value={studioLighting}
              onChange={(e) => setStudioLighting(e.target.value)}
              className="w-full bg-[#0a0c12] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs cursor-pointer"
            >
              <option value="Cyber Neon">Cyber Neon Studio (Cyan/Pink)</option>
              <option value="Studio Clean">Studio Clean (Neutral Daylight)</option>
              <option value="Dark Track">Dark Track (Night Paddock)</option>
            </select>
            <span className="text-[10px] text-neutral-500 block">
              Pencahayaan turntable studio Three.js.
            </span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSaveStudioPreferences}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-lg uppercase tracking-wider text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>SAVE 3D PREFERENCES</span>
          </button>
        </div>
      </div>
    </div>
  );
}
