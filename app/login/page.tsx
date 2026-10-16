"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Car,
  Crown,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, refreshUser } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { email, password }
          : { name, email, password, image: image.trim() || undefined };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses permintaan.");
      }

      setSuccessMsg(data.message || (mode === "login" ? "Login berhasil! Mengarahkan ke Dashboard..." : "Registrasi berhasil! Mengarahkan ke Dashboard..."));
      if (data.user) {
        login(data.user);
      }
      await refreshUser();

      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan. Silakan coba lagi.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#07080b] text-neutral-200 font-sans relative flex items-center justify-center px-4 py-12 selection:bg-[#9cbbf8] selection:text-black">
      {/* Background Studio Tech Blueprint */}
      <div
        className="fixed inset-0 pointer-events-none opacity-25 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Atmospheric Glow */}
      <div className="fixed top-1/4 left-1/3 w-96 h-96 bg-blue-900/10 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="fixed bottom-1/4 right-1/3 w-96 h-96 bg-indigo-950/15 rounded-full blur-[180px] pointer-events-none z-0" />

      {/* Main Card */}
      <div className="relative z-10 max-w-md w-full bg-[#0d0f15]/90 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.8)] font-mono">
        {/* Top Branding Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs text-[#9cbbf8] font-bold mb-3 shadow-[0_0_12px_rgba(156,187,248,0.2)]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SHIFT_TECH SECURITY ACCESS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
            {mode === "login" ? "USER AUTHENTICATION" : "CREATE DRIVER ACCOUNT"}
          </h1>
          <p className="text-xs text-neutral-400 font-sans mt-1">
            {mode === "login"
              ? "Masuk ke portal modifikasi, telemetri, dan garasi mobil 3D Anda."
              : "Daftar untuk menyimpan konfigurasi build, telemetri, dan profil custom."}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="grid grid-cols-2 gap-1 bg-[#141720] p-1 rounded-xl border border-white/[0.06] mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all text-center ${
              mode === "login"
                ? "bg-[#253046] text-[#9cbbf8] shadow-[0_0_12px_rgba(156,187,248,0.25)] border border-[#9cbbf8]/40"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all text-center ${
              mode === "register"
                ? "bg-[#253046] text-[#9cbbf8] shadow-[0_0_12px_rgba(156,187,248,0.25)] border border-[#9cbbf8]/40"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            REGISTER
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 font-sans animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-sans animate-fadeIn">
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Quick Fill Super User Credentials Helper */}
        {mode === "login" && (
          <div className="mb-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-amber-300">
              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Super User: <strong>youzaenkgantenk@gmail.com</strong></span>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail("youzaenkgantenk@gmail.com");
                setPassword("password123");
              }}
              className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-black font-black rounded text-[10px] uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
            >
              Autofill
            </button>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-[11px] text-neutral-400 uppercase tracking-wider mb-1">
                Full Driver Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kenji Takahashi"
                  className="w-full bg-[#111319] border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-[#9cbbf8] focus:ring-1 focus:ring-[#9cbbf8] outline-none transition-all font-sans"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] text-neutral-400 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="driver@shifttech.com"
                className="w-full bg-[#111319] border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-[#9cbbf8] focus:ring-1 focus:ring-[#9cbbf8] outline-none transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-neutral-400 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-neutral-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#111319] border border-white/10 rounded-lg pl-9 pr-10 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-[#9cbbf8] focus:ring-1 focus:ring-[#9cbbf8] outline-none transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-neutral-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-[11px] text-neutral-400 uppercase tracking-wider mb-1">
                Avatar Image URL (Optional)
              </label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full bg-[#111319] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-[#9cbbf8] focus:ring-1 focus:ring-[#9cbbf8] outline-none transition-all font-sans"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#9cbbf8] hover:bg-[#b4ceff] text-[#08090c] font-black text-xs uppercase tracking-widest rounded-lg transition-all shadow-[0_0_16px_rgba(156,187,248,0.3)] hover:shadow-[0_0_24px_rgba(156,187,248,0.5)] flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>PROCESSING...</span>
              </>
            ) : (
              <>
                <span>{mode === "login" ? "AUTHENTICATE & ENTER" : "CREATE ACCOUNT"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer quick links */}
        <div className="mt-6 pt-4 border-t border-white/[0.06] text-center text-xs text-neutral-500 font-sans">
          <Link
            href="/workshop"
            className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-[#9cbbf8] transition-colors"
          >
            <Car className="w-3.5 h-3.5" />
            <span>Continue as Guest in 3D Workshop</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
