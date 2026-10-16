"use client";

import React, { useState, useEffect } from "react";
import {
  Crown,
  Check,
  TrendingUp,
  RefreshCw,
  Users,
} from "lucide-react";
import { message } from "antd";

interface Plan {
  tier: string;
  name: string;
  price: number;
  interval: string;
  badge: string;
  popular?: boolean;
  description: string;
  features: string[];
}

interface Subscriber {
  id: string;
  name: string;
  email: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionsTabProps {
  isSuperUser: boolean;
  currentUserTier?: string;
  currentUserBalance?: number;
  onRefreshUser?: () => void;
}

export default function SubscriptionsTab({
  isSuperUser,
  currentUserTier = "FREE",
  currentUserBalance = 0,
  onRefreshUser,
}: SubscriptionsTabProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentTier, setCurrentTier] = useState<string>(currentUserTier);
  const [userBalance, setUserBalance] = useState<number>(currentUserBalance);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<{
    totalUsers: number;
    freeCount: number;
    proCount: number;
    apexCount: number;
    activeSubscribersCount: number;
    estimatedMRR: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingTier, setSubmittingTier] = useState<string | null>(null);

  const fetchSubscriptions = React.useCallback(async () => {
    setLoading(true);
    try {
      const url = isSuperUser ? "/api/subscriptions?stats=true" : "/api/subscriptions";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
        if (data.currentTier) setCurrentTier(data.currentTier);
        if (data.userBalance !== undefined) setUserBalance(data.userBalance);
        if (data.stats) setStats(data.stats);
        if (data.subscribers) setSubscribers(data.subscribers);
      } else {
        const err = await res.json();
        message.error(err.error || "Gagal memuat data langganan.");
      }
    } catch {
      message.error("Gagal terhubung ke server langganan.");
    } finally {
      setLoading(false);
    }
  }, [isSuperUser]);

  useEffect(() => {
    void fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleUpgradePlan = async (targetTier: string, planName: string, price: number) => {
    if (targetTier === currentTier) {
      message.info(`Anda sudah berlangganan paket ${planName}.`);
      return;
    }

    if (targetTier !== "FREE" && userBalance < price) {
      const missing = price - userBalance;
      message.warning({
        content: `Saldo tidak mencukupi ($${userBalance.toFixed(2)}). Anda butuh tambahan $${missing.toFixed(2)}. Silakan Top Up saldo Anda di tab Balance!`,
        duration: 4,
      });
      return;
    }

    const confirmAction = window.confirm(
      targetTier === "FREE"
        ? "Apakah Anda yakin ingin beralih ke paket Rookie Driver (Free Tier)?"
        : `Konfirmasi aktivasi paket ${planName} seharga $${price.toFixed(2)}/bulan? Saldo dompet Anda akan dipotong otomatis.`
    );

    if (!confirmAction) return;

    setSubmittingTier(targetTier);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetTier }),
      });

      const data = await res.json();
      if (res.ok) {
        message.success(data.message || `Paket ${planName} aktif!`);
        setCurrentTier(targetTier);
        fetchSubscriptions();
        if (onRefreshUser) onRefreshUser();
      } else {
        message.error(data.error || "Gagal memproses langganan.");
      }
    } catch {
      message.error("Terjadi kesalahan.");
    } finally {
      setSubmittingTier(null);
    }
  };

  if (loading && plans.length === 0) {
    return (
      <div className="py-20 text-center text-neutral-400 bg-[#0e1017] border border-white/10 rounded-xl font-mono">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#9cbbf8] mb-3" />
        <p className="uppercase tracking-widest text-xs">LOADING SUBSCRIPTION PLANS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Super User Telemetry Overview */}
      {isSuperUser && stats && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              SUBSCRIPTION REVENUE & MRR TELEMETRY
            </h3>
            <span className="text-[11px] text-neutral-400">
              ESTIMATED MRR: <strong className="text-emerald-400 text-sm font-black">${stats.estimatedMRR.toLocaleString("en-US", { minimumFractionDigits: 2 })} / mo</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#0e1017] border border-white/10 rounded-xl p-4">
              <span className="text-[11px] text-neutral-400 uppercase block mb-1">
                Active Paid Subs
              </span>
              <span className="text-2xl font-black text-white">
                {stats.activeSubscribersCount}
              </span>
              <span className="text-[10px] text-emerald-400 block mt-1">
                PRO & APEX Subscribers
              </span>
            </div>

            <div className="bg-[#0e1017] border border-white/10 rounded-xl p-4">
              <span className="text-[11px] text-neutral-400 uppercase block mb-1">
                Apex VIP Members
              </span>
              <span className="text-2xl font-black text-purple-400">
                {stats.apexCount}
              </span>
              <span className="text-[10px] text-purple-300 block mt-1">$49 / mo Tier</span>
            </div>

            <div className="bg-[#0e1017] border border-white/10 rounded-xl p-4">
              <span className="text-[11px] text-neutral-400 uppercase block mb-1">
                Pro Racer Members
              </span>
              <span className="text-2xl font-black text-blue-400">
                {stats.proCount}
              </span>
              <span className="text-[10px] text-blue-300 block mt-1">$19 / mo Tier</span>
            </div>

            <div className="bg-[#0e1017] border border-white/10 rounded-xl p-4">
              <span className="text-[11px] text-neutral-400 uppercase block mb-1">
                Free Tier Users
              </span>
              <span className="text-2xl font-black text-neutral-400">
                {stats.freeCount}
              </span>
              <span className="text-[10px] text-neutral-500 block mt-1">Standard Access</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Subscription Status Banner for Regular User */}
      <div className="bg-gradient-to-r from-[#0d1326] via-[#0f172a] to-[#0a0d18] border border-blue-500/30 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-blue-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#9cbbf8]/20 text-[#9cbbf8] border border-[#9cbbf8]/40">
                CURRENT MEMBERSHIP STATUS
              </span>
              <span className="text-emerald-400 text-[11px] font-bold">● ACTIVE</span>
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              TIER: {currentTier === "APEX" ? "APEX VIP MOTORSPORT" : currentTier === "PRO" ? "PRO TRACK RACER" : "ROOKIE DRIVER (FREE)"}
              {currentTier === "APEX" && <Crown className="w-5 h-5 text-amber-400" />}
            </h2>
            <p className="text-xs text-neutral-300 font-sans max-w-xl">
              Tingkatkan tier langganan Anda untuk membuka penyimpanan build tak terbatas, dynamic color picker finishing carbon & matte, serta import model 3D custom sendiri.
            </p>
          </div>

          <div className="bg-[#141722]/80 border border-white/10 rounded-xl p-3 text-right shrink-0">
            <span className="text-[10px] text-neutral-400 uppercase block">Saldo Dompet Tersedia</span>
            <span className="text-lg font-black text-emerald-400">
              ${userBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Comparison Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => {
          const isCurrent = currentTier === p.tier;
          const isApex = p.tier === "APEX";
          const isPro = p.tier === "PRO";

          return (
            <div
              key={p.tier}
              className={`rounded-2xl border transition-all flex flex-col justify-between relative p-6 font-mono ${
                isCurrent
                  ? "bg-[#101422] border-[#9cbbf8] shadow-[0_0_25px_rgba(156,187,248,0.2)]"
                  : isApex
                  ? "bg-[#0e0f17] border-purple-500/30 hover:border-purple-500/60"
                  : isPro
                  ? "bg-[#0e1017] border-blue-500/30 hover:border-blue-500/60"
                  : "bg-[#0c0d12] border-white/10 hover:border-white/20"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                  {p.badge}
                </div>
              )}

              {isApex && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                  {p.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    {p.name}
                  </h3>
                  {isCurrent && (
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                      ACTIVE PLAN
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-black text-white">
                    {p.price === 0 ? "FREE" : `$${p.price}`}
                  </span>
                  {p.price > 0 && <span className="text-neutral-400 text-xs ml-1">/ month</span>}
                </div>

                <p className="text-neutral-400 text-[11px] font-sans mb-6 min-h-[35px]">
                  {p.description}
                </p>

                {/* Features List */}
                <div className="space-y-2.5 border-t border-white/10 pt-4 mb-6">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">
                    INCLUDED TELEMETRY PERKS:
                  </span>
                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] text-neutral-300">
                      <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isApex ? "text-purple-400" : isPro ? "text-blue-400" : "text-emerald-400"}`} />
                      <span className="font-sans leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleUpgradePlan(p.tier, p.name, p.price)}
                  disabled={submittingTier === p.tier || isCurrent}
                  className={`w-full py-3 rounded-xl font-black uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isCurrent
                      ? "bg-white/10 text-neutral-400 cursor-default"
                      : isApex
                      ? "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                      : isPro
                      ? "bg-[#9cbbf8] hover:bg-[#b5ceff] text-[#08090c] shadow-[0_0_15px_rgba(156,187,248,0.3)]"
                      : "bg-[#181d2e] hover:bg-[#20273d] text-white"
                  }`}
                >
                  {submittingTier === p.tier ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : isCurrent ? (
                    "SUDAH AKTIF"
                  ) : p.price === 0 ? (
                    "SWITCH TO ROOKIE"
                  ) : (
                    `UPGRADE KE ${p.tier} ($${p.price})`
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Super User: Subscriber Registry Table */}
      {isSuperUser && subscribers.length > 0 && (
        <div className="bg-[#0e1017] border border-white/10 rounded-xl overflow-hidden mt-8">
          <div className="p-4 bg-[#141722] border-b border-white/10 flex items-center justify-between">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              ACTIVE PRO & APEX VIP SUBSCRIBER ROSTER
            </h4>
            <span className="text-[11px] text-neutral-400">
              {subscribers.length} Paid Members
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#0a0c12] text-neutral-400 text-[10px] uppercase border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-4">Driver Name</th>
                  <th className="py-2.5 px-4">Email</th>
                  <th className="py-2.5 px-4">Tier</th>
                  <th className="py-2.5 px-4">Billing Status</th>
                  <th className="py-2.5 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-neutral-300">
                {subscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-bold text-white">{s.name}</td>
                    <td className="py-3 px-4 text-neutral-400">{s.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.subscriptionTier === "APEX"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {s.subscriptionTier}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">
                      ● {s.subscriptionStatus || "ACTIVE"}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-neutral-400">
                      {new Date(s.createdAt).toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
