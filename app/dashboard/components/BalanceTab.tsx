"use client";

import React, { useState, useEffect } from "react";
import {
  Coins,
  PlusCircle,
  Clock,
  CheckCircle2,
  DollarSign,
  RefreshCw,
  Zap,
} from "lucide-react";
import { message } from "antd";

interface Transaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface BalanceTabProps {
  isSuperUser: boolean;
  currentUserBalance?: number;
  userName?: string;
  userEmail?: string;
  onRefreshUser?: () => void;
}

export default function BalanceTab({
  isSuperUser,
  currentUserBalance = 0,
  userName = "Driver",
  onRefreshUser,
}: BalanceTabProps) {
  const [balance, setBalance] = useState<number>(currentUserBalance);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<{
    totalPlatformBalance: number;
    totalUsers: number;
    totalTransactionsCount: number;
    totalTopupVolume: number;
    totalSubsVolume: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Top Up State
  const [topupAmount, setTopupAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("BCA Virtual Account");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchBalanceData = React.useCallback(async () => {
    setLoading(true);
    try {
      const url = isSuperUser ? "/api/balance?all=true" : "/api/balance";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.balance !== undefined) setBalance(data.balance);
        if (data.transactions) setTransactions(data.transactions);
        if (data.stats) setStats(data.stats);
      } else {
        const err = await res.json();
        message.error(err.error || "Gagal memuat data keuangan.");
      }
    } catch {
      message.error("Gagal terhubung ke server balance.");
    } finally {
      setLoading(false);
    }
  }, [isSuperUser]);

  useEffect(() => {
    void fetchBalanceData();
  }, [fetchBalanceData]);

  const handleTopup = async () => {
    const amountToCharge = customAmount ? parseFloat(customAmount) : topupAmount;
    if (isNaN(amountToCharge) || amountToCharge < 5) {
      message.warning("Minimal top up adalah $5.00.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch("/api/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountToCharge,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        message.success(data.message || "Top up berhasil!");
        setBalance(data.newBalance);
        setCustomAmount("");
        fetchBalanceData();
        if (onRefreshUser) onRefreshUser();
      } else {
        message.error(data.error || "Gagal memproses top up.");
      }
    } catch {
      message.error("Terjadi kesalahan.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Super User Platform Financial Analytics Cards */}
      {isSuperUser && stats && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              GLOBAL PLATFORM FINANCIAL TELEMETRY
            </h3>
            <span className="text-[11px] text-neutral-400">
              AUDITED FINANCIAL DATA
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0e1017] border border-white/10 rounded-xl p-4">
              <span className="text-[11px] text-neutral-400 uppercase block mb-1">
                Total Member Balance
              </span>
              <span className="text-2xl font-black text-emerald-400">
                ${stats.totalPlatformBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-neutral-500 block mt-1">Across all driver accounts</span>
            </div>

            <div className="bg-[#0e1017] border border-white/10 rounded-xl p-4">
              <span className="text-[11px] text-neutral-400 uppercase block mb-1">
                Total Top-Up Volume
              </span>
              <span className="text-2xl font-black text-[#9cbbf8]">
                ${stats.totalTopupVolume.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-blue-300/80 block mt-1">Direct Deposits</span>
            </div>

            <div className="bg-[#0e1017] border border-white/10 rounded-xl p-4">
              <span className="text-[11px] text-neutral-400 uppercase block mb-1">
                Subscription Revenue
              </span>
              <span className="text-2xl font-black text-purple-400">
                ${Math.abs(stats.totalSubsVolume).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-purple-300/80 block mt-1">Recurring Plan Fees</span>
            </div>

            <div className="bg-[#0e1017] border border-white/10 rounded-xl p-4">
              <span className="text-[11px] text-neutral-400 uppercase block mb-1">
                Transactions Count
              </span>
              <span className="text-2xl font-black text-white">
                {stats.totalTransactionsCount}
              </span>
              <span className="text-[10px] text-neutral-500 block mt-1">Audit Ledger Entries</span>
            </div>
          </div>
        </div>
      )}

      {/* User Wallet Card & Top-Up Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Futuristic Garage Wallet Card */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="bg-gradient-to-br from-[#121626] via-[#101422] to-[#0a0c14] border border-[#9cbbf8]/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            {/* Holographic Chip and Watermark */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-7 rounded bg-amber-400/20 border border-amber-400/50 flex items-center justify-center">
                  <div className="w-6 h-4 border border-amber-400/40 rounded-sm" />
                </div>
                <span className="text-[10px] text-neutral-400 tracking-widest uppercase">
                  SHIFT_TECH VIRTUAL PASS
                </span>
              </div>
              <span className="text-[11px] font-black text-[#9cbbf8] uppercase tracking-wider">
                PLATINUM GARAGE
              </span>
            </div>

            <div className="my-2">
              <span className="text-[11px] text-neutral-400 uppercase block tracking-wider mb-1">
                AVAILABLE TUNING BALANCE
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-baseline gap-1">
                <span className="text-emerald-400 font-sans">$</span>
                <span>{balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="flex items-end justify-between pt-4 border-t border-white/10 mt-4 text-[10px]">
              <div>
                <span className="text-neutral-500 uppercase block">DRIVER CARD HOLDER</span>
                <span className="text-white font-bold tracking-wide">{userName}</span>
              </div>
              <div className="text-right">
                <span className="text-neutral-500 uppercase block">STATUS</span>
                <span className="text-emerald-400 font-bold">ONLINE ● VERIFIED</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0e1017] border border-white/10 rounded-xl p-4 mt-4 font-sans text-xs text-neutral-400 space-y-2">
            <div className="flex items-center gap-2 text-white font-mono font-bold text-[11px] uppercase">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              KEGUNAAN SALDO GARASI:
            </div>
            <p className="text-[11px]">
              • Aktivasi langganan PRO Racer ($19) dan Apex VIP ($49).<br />
              • Pembelian part velg modular Enkei RPF1, Michelin Cup 2 tyres, dan aero bodykit.<br />
              • Instant saldo tanpa biaya admin tambahan.
            </p>
          </div>
        </div>

        {/* Right: Instant Top-Up Panel */}
        <div className="lg:col-span-7 bg-[#0e1017] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-[#9cbbf8]" />
              INSTANT BALANCE TOP-UP
            </h3>
            <span className="text-[10px] text-neutral-400 uppercase">
              VIRTUAL SIMULATOR
            </span>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-[11px] text-neutral-400 uppercase mb-2">
              PILIH NOMINAL TOP-UP:
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[25, 50, 100, 250, 500].map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    setTopupAmount(amt);
                    setCustomAmount("");
                  }}
                  className={`py-2.5 rounded-lg font-black text-xs transition-all border cursor-pointer ${
                    !customAmount && topupAmount === amt
                      ? "bg-[#9cbbf8] text-[#08090c] border-[#9cbbf8] shadow-md"
                      : "bg-[#141722] hover:bg-[#1a2030] text-neutral-200 border-white/10"
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input */}
          <div>
            <label className="block text-[11px] text-neutral-400 uppercase mb-1">
              ATAU MASUKKAN NOMINAL LAIN:
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">$</span>
              <input
                type="number"
                placeholder="Nominal custom (min. $5.00)..."
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full bg-[#141722] border border-white/15 rounded-lg pl-7 pr-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-[#9cbbf8] text-xs font-mono"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[11px] text-neutral-400 uppercase mb-1">
              METODE PEMBAYARAN:
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-[#141722] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#9cbbf8] text-xs cursor-pointer"
            >
              <option value="BCA Virtual Account" className="bg-[#141722]">BCA Virtual Account (Instant)</option>
              <option value="Mandiri Livin" className="bg-[#141722]">Mandiri Livin (Instant)</option>
              <option value="GoPay / QRIS" className="bg-[#141722]">QRIS / GoPay / OVO</option>
              <option value="Credit Card (Visa/Mastercard)" className="bg-[#141722]">Credit Card (Visa / Mastercard)</option>
              <option value="Cryptocurrency (USDT/USDC)" className="bg-[#141722]">Web3 Crypto (USDT / USDC)</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              onClick={handleTopup}
              disabled={isProcessing}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black uppercase tracking-wider text-xs rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>MEMPROSES TRANSAKSI...</span>
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4 stroke-[2.5]" />
                  <span>
                    TOP UP SEBESAR ${customAmount ? parseFloat(customAmount) || 0 : topupAmount} SEKARANG
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-[#0e1017] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-[#141722] border-b border-white/10 flex items-center justify-between">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#9cbbf8]" />
            {isSuperUser ? "GLOBAL TRANSACTION AUDIT LEDGER" : "TRANSACTION & BILLING HISTORY"}
          </h4>
          <button
            onClick={fetchBalanceData}
            disabled={loading}
            className="p-1 bg-[#0a0c12] hover:bg-white/10 rounded border border-white/10 text-neutral-300"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#0a0c12] text-neutral-400 text-[10px] uppercase border-b border-white/10">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                {isSuperUser && <th className="py-2.5 px-4">Driver</th>}
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Description</th>
                <th className="py-2.5 px-4 text-right">Amount</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-neutral-300">
              {loading ? (
                <tr>
                  <td colSpan={isSuperUser ? 6 : 5} className="py-10 text-center text-neutral-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#9cbbf8] mb-2" />
                    Memuat riwayat transaksi...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={isSuperUser ? 6 : 5} className="py-10 text-center text-neutral-500">
                    Belum ada riwayat transaksi.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => {
                  const isPositive = t.amount >= 0;
                  return (
                    <tr key={t.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 text-[11px] text-neutral-400">
                        {new Date(t.createdAt).toLocaleString("id-ID", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {isSuperUser && (
                        <td className="py-3 px-4 font-bold text-white">
                          {t.user?.name || "Driver"}
                        </td>
                      )}

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            t.type === "TOPUP"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : t.type === "SUBSCRIPTION"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-neutral-200">
                        {t.description}
                      </td>

                      <td
                        className={`py-3 px-4 text-right font-black ${
                          isPositive ? "text-emerald-400" : "text-neutral-300"
                        }`}
                      >
                        {isPositive ? `+$${t.amount.toFixed(2)}` : `-$${Math.abs(t.amount).toFixed(2)}`}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          SUCCESS
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
