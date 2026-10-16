"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Calendar,
  Lock,
  Edit3,
  Save,
  LogOut,
  Car,
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  Wrench,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

export default function ProfilePage() {
  const { user, loading: authLoading, logout, refreshUser } = useAuth();

  const [name, setName] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentName = name !== null ? name : (user?.name || "");
  const currentImage = image !== null ? image : (user?.image || "");

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#07080b] flex flex-col items-center justify-center font-mono">
        <Loader2 className="w-8 h-8 text-[#9cbbf8] animate-spin mb-3" />
        <span className="text-xs text-neutral-400 uppercase tracking-widest">
          FETCHING DRIVER TELEMETRY...
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#07080b] flex flex-col items-center justify-center px-4 font-mono">
        <div className="max-w-md w-full bg-[#0d0f15] border border-white/10 rounded-2xl p-8 text-center backdrop-blur-xl shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-blue-950/40 border border-[#9cbbf8]/30 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-[#9cbbf8]" />
          </div>
          <h2 className="text-lg font-black text-white uppercase tracking-wider mb-2">
            ACCESS RESTRICTED
          </h2>
          <p className="text-xs text-neutral-400 font-sans mb-6">
            Anda belum masuk. Silakan login atau registrasi untuk mengakses profil driver dan garasi modifikasi 3D.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full py-3 bg-[#9cbbf8] hover:bg-[#b4ceff] text-black font-black text-xs uppercase tracking-widest rounded-lg transition-all shadow-[0_0_15px_rgba(156,187,248,0.3)]"
          >
            GO TO LOGIN / REGISTER
          </Link>
        </div>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const payload: Record<string, string | undefined> = {};
      if (isEditingInfo) {
        payload.name = currentName;
        payload.image = currentImage;
      }
      if (isChangingPass) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui profil.");
      }

      setSuccessMsg(data.message || "Profil berhasil diperbarui!");
      setIsEditingInfo(false);
      setIsChangingPass(false);
      setName(null);
      setImage(null);
      setCurrentPassword("");
      setNewPassword("");
      await refreshUser();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setErrorMsg(message);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (nameStr: string) => {
    return nameStr
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#07080b] text-neutral-200 font-sans relative selection:bg-[#9cbbf8] selection:text-black py-8 px-4 sm:px-6 lg:px-8">
      {/* Blueprint Grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        {/* Alerts */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between font-mono animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-neutral-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center justify-between font-mono animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-neutral-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* 1. TOP HERO DRIVER CARD */}
        <div className="bg-[#0d0f15]/90 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl font-mono relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            {/* Avatar & User Details */}
            <div className="flex items-center gap-5">
              <div className="relative">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={96}
                    height={96}
                    unoptimized
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#9cbbf8] shadow-[0_0_20px_rgba(156,187,248,0.3)]"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border-2 border-[#9cbbf8] flex items-center justify-center text-xl font-black text-[#9cbbf8] shadow-[0_0_20px_rgba(156,187,248,0.3)]">
                    {getInitials(user.name)}
                  </div>
                )}
                <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-emerald-500 text-[9px] font-black text-black">
                  ONLINE
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#9cbbf8]/15 border border-[#9cbbf8]/30 text-[#9cbbf8] font-bold uppercase">
                    {user.role} DRIVER
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    ID: {user.id.slice(0, 8)}...
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase">
                  {user.name}
                </h1>
                <p className="text-xs text-neutral-400 font-sans flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{user.email}</span>
                </p>
                <p className="text-[10px] text-neutral-500 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Member Since: {new Date(user.createdAt).toLocaleDateString("id-ID", { month: "short", year: "numeric", day: "numeric" })}</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href="/workshop"
                className="flex-1 sm:flex-none px-4 py-2 bg-[#1e293b] hover:bg-[#2e3e56] text-neutral-200 border border-white/10 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5 text-[#9cbbf8]" />
                <span>3D STUDIO</span>
              </Link>
              <button
                onClick={logout}
                className="flex-1 sm:flex-none px-4 py-2 bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-500/30 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>LOGOUT</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. MAIN GRID: GARAGE TELEMETRY & ACCOUNT SETTINGS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
          {/* Left Column: Driver Quick Stats */}
          <div className="space-y-6">
            <div className="bg-[#0d0f15]/90 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 text-xs text-white font-bold uppercase">
                <Car className="w-4 h-4 text-[#9cbbf8]" />
                <span>GARAGE PROFILE STATUS</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                  <span className="text-neutral-400">Current Model:</span>
                  <span className="text-white font-bold">Porsche 911 GT3 RS</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                  <span className="text-neutral-400">Equipped Velg:</span>
                  <span className="text-[#9cbbf8] font-bold">Enkei RPF1 (F1 Silver)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                  <span className="text-neutral-400">Telemetry Engine:</span>
                  <span className="text-emerald-400 font-bold">ACTIVE (WebGL 2.0)</span>
                </div>
              </div>

              <Link
                href="/inventory"
                className="w-full py-2.5 bg-[#9cbbf8] hover:bg-[#b4ceff] text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-all text-center flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(156,187,248,0.25)]"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>EXPLORE PART VAULT</span>
              </Link>
            </div>
          </div>

          {/* Right 2 Columns: Edit Profile & Password */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Settings Box */}
            <div className="bg-[#0d0f15]/90 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    DRIVER CREDENTIALS & SETTINGS
                  </h2>
                  <p className="text-xs text-neutral-400 font-sans mt-0.5">
                    Kelola nama display, foto avatar, dan keamanan password.
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Section 1: Basic Information */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#9cbbf8] font-bold uppercase flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>PERSONAL INFORMATION</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (isEditingInfo) {
                          setName(null);
                          setImage(null);
                        }
                        setIsEditingInfo(!isEditingInfo);
                      }}
                      className="text-xs text-neutral-400 hover:text-white transition-colors underline"
                    >
                      {isEditingInfo ? "Cancel Edit" : "Edit Details"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] text-neutral-400 uppercase mb-1">
                        Driver Name
                      </label>
                      <input
                        type="text"
                        disabled={!isEditingInfo}
                        value={currentName}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full bg-[#111319] border rounded-lg px-3 py-2 text-xs font-sans text-white outline-none transition-all ${
                          isEditingInfo
                            ? "border-[#9cbbf8] focus:ring-1 focus:ring-[#9cbbf8]"
                            : "border-white/10 opacity-70 cursor-not-allowed"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 uppercase mb-1">
                        Email Address (Read Only)
                      </label>
                      <input
                        type="email"
                        disabled
                        value={user.email}
                        className="w-full bg-[#111319] border border-white/10 rounded-lg px-3 py-2 text-xs font-sans text-neutral-400 opacity-60 cursor-not-allowed"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-neutral-400 uppercase mb-1">
                        Avatar Image URL
                      </label>
                      <input
                        type="url"
                        disabled={!isEditingInfo}
                        value={currentImage}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className={`w-full bg-[#111319] border rounded-lg px-3 py-2 text-xs font-sans text-white outline-none transition-all ${
                          isEditingInfo
                            ? "border-[#9cbbf8] focus:ring-1 focus:ring-[#9cbbf8]"
                            : "border-white/10 opacity-70 cursor-not-allowed"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Security & Password */}
                <div className="space-y-4 pt-4 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#9cbbf8] font-bold uppercase flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>SECURITY // CHANGE PASSWORD</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsChangingPass(!isChangingPass)}
                      className="text-xs text-neutral-400 hover:text-white transition-colors underline"
                    >
                      {isChangingPass ? "Cancel Password Change" : "Change Password"}
                    </button>
                  </div>

                  {isChangingPass && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                      <div>
                        <label className="block text-[11px] text-neutral-400 uppercase mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#111319] border border-white/10 focus:border-[#9cbbf8] rounded-lg px-3 py-2 text-xs font-sans text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-neutral-400 uppercase mb-1">
                          New Password (Min 6 chars)
                        </label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#111319] border border-white/10 focus:border-[#9cbbf8] rounded-lg px-3 py-2 text-xs font-sans text-white outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Save Changes Button */}
                {(isEditingInfo || isChangingPass) && (
                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 bg-[#9cbbf8] hover:bg-[#b4ceff] text-black font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(156,187,248,0.3)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>SAVING CHANGES...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>SAVE CHANGES</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
