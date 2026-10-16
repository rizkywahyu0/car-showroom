"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  Users,
  Car,
  Shield,
  Coins,
  Settings,
  Crown,
  Lock,
  Loader2,
  Eye,
  Wrench,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

function TabLoadingSkeleton({ label }: { label: string }) {
  return (
    <div className="py-16 text-center text-neutral-400 bg-[#0e1017] border border-white/10 rounded-xl font-mono">
      <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#9cbbf8] mb-3" />
      <p className="uppercase tracking-widest text-xs">LOADING {label}...</p>
    </div>
  );
}

const UserManagementTab = dynamic(() => import("./components/UserManagementTab"), {
  loading: () => <TabLoadingSkeleton label="USER MANAGEMENT TELEMETRY" />,
  ssr: false,
});
const SavedConfigsTab = dynamic(() => import("./components/SavedConfigsTab"), {
  loading: () => <TabLoadingSkeleton label="SAVED 3D CONFIGURATIONS" />,
  ssr: false,
});
const SubscriptionsTab = dynamic(() => import("./components/SubscriptionsTab"), {
  loading: () => <TabLoadingSkeleton label="SUBSCRIPTION & MEMBERSHIP" />,
  ssr: false,
});
const BalanceTab = dynamic(() => import("./components/BalanceTab"), {
  loading: () => <TabLoadingSkeleton label="BALANCE & FINANCIAL LOGS" />,
  ssr: false,
});
const SettingsTab = dynamic(() => import("./components/SettingsTab"), {
  loading: () => <TabLoadingSkeleton label="GARAGE PREFERENCES & PROFILE" />,
  ssr: false,
});

export default function DashboardPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();

  // Selected tab
  const [activeTab, setActiveTab] = useState<string>("users");

  // Mode switcher for Super User: "SUPER" | "REGULAR"
  const [viewMode, setViewMode] = useState<"SUPER" | "REGULAR">("SUPER");

  const isSuperUser = user?.role === "SUPERUSER" || user?.role === "ADMIN";

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#07080b] flex flex-col items-center justify-center font-mono">
        <Loader2 className="w-8 h-8 text-[#9cbbf8] animate-spin mb-3" />
        <span className="text-xs text-neutral-400 uppercase tracking-widest">
          INITIALIZING TELEMETRY DASHBOARD ENGINE...
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#07080b] flex flex-col items-center justify-center px-4 font-mono">
        <div className="max-w-md w-full bg-[#0d0f15] border border-white/10 rounded-2xl p-8 text-center backdrop-blur-xl shadow-2xl space-y-4">
          <div className="w-14 h-14 rounded-full bg-blue-950/40 border border-[#9cbbf8]/30 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-[#9cbbf8]" />
          </div>
          <h2 className="text-lg font-black text-white uppercase tracking-wider">
            AUTHENTICATION REQUIRED
          </h2>
          <p className="text-xs text-neutral-400 font-sans">
            Akses dashboard terkunci. Silakan masuk dengan akun terdaftar untuk mengelola profil, build 3D, langganan, dan saldo garasi.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full py-3 bg-[#9cbbf8] hover:bg-[#b4ceff] text-black font-black text-xs uppercase tracking-widest rounded-lg transition-all shadow-[0_0_15px_rgba(156,187,248,0.3)]"
            >
              SIGN IN / REGISTER
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const effectiveIsSuper = isSuperUser && viewMode === "SUPER";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#07080b] text-neutral-200 font-sans relative selection:bg-[#9cbbf8] selection:text-black py-8 px-4 sm:px-6 lg:px-8">
      {/* Background Tech Blueprint Grid */}
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

      {/* Ambient Lighting Accents */}
      <div className="fixed top-20 left-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[150px] pointer-events-none z-0" />

      <div className="max-w-[1536px] mx-auto relative z-10 space-y-6">
        {/* Top Header Card */}
        <div className="bg-[#0c0e14]/90 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 font-mono">
          <div className="flex items-center gap-4">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                width={64}
                height={64}
                unoptimized
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#9cbbf8]/50 shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#141722] border-2 border-[#9cbbf8]/50 flex items-center justify-center text-xl font-black text-[#9cbbf8] shadow-lg">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  {user.name}
                </span>

                {isSuperUser ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <Crown className="w-3 h-3 text-amber-400" />
                    SUPER USER // OPERATOR
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    RACER DRIVER
                  </span>
                )}

                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    user.subscriptionTier === "APEX"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : user.subscriptionTier === "PRO"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-neutral-800 text-neutral-400"
                  }`}
                >
                  {user.subscriptionTier || "FREE TIER"}
                </span>
              </div>

              <p className="text-xs text-neutral-400 mt-1 font-sans">
                {user.email} • ID: <span className="font-mono text-neutral-500">{user.id.substring(0, 10)}...</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end flex-wrap">
            {/* Super User View Mode Toggle */}
            {isSuperUser && (
              <div className="flex items-center gap-1 bg-[#141722] border border-white/10 rounded-xl p-1 text-xs">
                <button
                  onClick={() => {
                    setViewMode("SUPER");
                    setActiveTab("users");
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-bold ${
                    viewMode === "SUPER"
                      ? "bg-amber-400 text-black shadow-md"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>SUPER DASHBOARD</span>
                </button>
                <button
                  onClick={() => {
                    setViewMode("REGULAR");
                    setActiveTab("configs");
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-bold ${
                    viewMode === "REGULAR"
                      ? "bg-blue-400 text-black shadow-md"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>USER VIEW</span>
                </button>
              </div>
            )}

            {/* Quick Balance Badge & Workshop Link */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("balance")}
                className="bg-[#141722] hover:bg-[#1a2030] border border-white/10 px-3.5 py-2 rounded-xl text-left cursor-pointer transition-colors"
                title="Buka Tab Saldo"
              >
                <span className="text-[9px] text-neutral-400 uppercase block leading-none">
                  GARAGE WALLET
                </span>
                <span className="text-sm font-black text-emerald-400">
                  ${(user.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </button>

              <Link
                href="/workshop"
                className="flex items-center gap-2 px-4 py-2.5 bg-[#9cbbf8] hover:bg-[#b4ceff] text-[#08090c] font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(156,187,248,0.25)] active:scale-95"
              >
                <Wrench className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">3D STUDIO</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="border-b border-white/10 pb-1 font-mono text-xs">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {effectiveIsSuper ? (
              // Super User Tabs: User Management, User Save 3D Config, Subs, Balance
              <>
                <button
                  onClick={() => setActiveTab("users")}
                  className={`flex items-center gap-2 px-4 py-3 rounded-t-xl font-bold transition-all border-b-2 cursor-pointer ${
                    activeTab === "users"
                      ? "border-amber-400 text-amber-300 bg-amber-400/10 shadow-sm"
                      : "border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>1. USER MANAGEMENT</span>
                </button>

                <button
                  onClick={() => setActiveTab("configs")}
                  className={`flex items-center gap-2 px-4 py-3 rounded-t-xl font-bold transition-all border-b-2 cursor-pointer ${
                    activeTab === "configs"
                      ? "border-[#9cbbf8] text-[#9cbbf8] bg-[#9cbbf8]/10 shadow-sm"
                      : "border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span>2. USER SAVE 3D CONFIG</span>
                </button>

                <button
                  onClick={() => setActiveTab("subs")}
                  className={`flex items-center gap-2 px-4 py-3 rounded-t-xl font-bold transition-all border-b-2 cursor-pointer ${
                    activeTab === "subs"
                      ? "border-purple-400 text-purple-300 bg-purple-400/10 shadow-sm"
                      : "border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>3. SUBS (SUBSCRIPTIONS)</span>
                </button>

                <button
                  onClick={() => setActiveTab("balance")}
                  className={`flex items-center gap-2 px-4 py-3 rounded-t-xl font-bold transition-all border-b-2 cursor-pointer ${
                    activeTab === "balance"
                      ? "border-emerald-400 text-emerald-300 bg-emerald-400/10 shadow-sm"
                      : "border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  <span>4. BALANCE (FINANCIAL)</span>
                </button>
              </>
            ) : (
              // Regular User Tabs: User Save 3D Config, Option / Settings, Subs, Balance
              <>
                <button
                  onClick={() => setActiveTab("configs")}
                  className={`flex items-center gap-2 px-4 py-3 rounded-t-xl font-bold transition-all border-b-2 cursor-pointer ${
                    activeTab === "configs"
                      ? "border-[#9cbbf8] text-[#9cbbf8] bg-[#9cbbf8]/10 shadow-sm"
                      : "border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span>1. USER SAVE 3D CONFIG</span>
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  className={`flex items-center gap-2 px-4 py-3 rounded-t-xl font-bold transition-all border-b-2 cursor-pointer ${
                    activeTab === "settings"
                      ? "border-cyan-400 text-cyan-300 bg-cyan-400/10 shadow-sm"
                      : "border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>2. OPTION / SETTINGS</span>
                </button>

                <button
                  onClick={() => setActiveTab("subs")}
                  className={`flex items-center gap-2 px-4 py-3 rounded-t-xl font-bold transition-all border-b-2 cursor-pointer ${
                    activeTab === "subs"
                      ? "border-purple-400 text-purple-300 bg-purple-400/10 shadow-sm"
                      : "border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>3. SUBS (SUBSCRIPTIONS)</span>
                </button>

                <button
                  onClick={() => setActiveTab("balance")}
                  className={`flex items-center gap-2 px-4 py-3 rounded-t-xl font-bold transition-all border-b-2 cursor-pointer ${
                    activeTab === "balance"
                      ? "border-emerald-400 text-emerald-300 bg-emerald-400/10 shadow-sm"
                      : "border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  <span>4. BALANCE (MY WALLET)</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="pt-2 animate-fadeIn">
          {effectiveIsSuper ? (
            // Super User Views
            activeTab === "users" ? (
              <UserManagementTab />
            ) : activeTab === "configs" ? (
              <SavedConfigsTab
                isSuperUser={true}
                currentUserSubscriptionTier={user.subscriptionTier}
              />
            ) : activeTab === "subs" ? (
              <SubscriptionsTab
                isSuperUser={true}
                currentUserTier={user.subscriptionTier}
                currentUserBalance={user.balance}
                onRefreshUser={refreshUser}
              />
            ) : activeTab === "balance" ? (
              <BalanceTab
                isSuperUser={true}
                currentUserBalance={user.balance}
                userName={user.name}
                userEmail={user.email}
                onRefreshUser={refreshUser}
              />
            ) : null
          ) : (
            // Regular User Views
            activeTab === "configs" ? (
              <SavedConfigsTab
                isSuperUser={false}
                currentUserSubscriptionTier={user.subscriptionTier}
              />
            ) : activeTab === "settings" ? (
              <SettingsTab user={user} onRefreshUser={refreshUser} />
            ) : activeTab === "subs" ? (
              <SubscriptionsTab
                isSuperUser={false}
                currentUserTier={user.subscriptionTier}
                currentUserBalance={user.balance}
                onRefreshUser={refreshUser}
              />
            ) : activeTab === "balance" ? (
              <BalanceTab
                isSuperUser={false}
                currentUserBalance={user.balance}
                userName={user.name}
                userEmail={user.email}
                onRefreshUser={refreshUser}
              />
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
