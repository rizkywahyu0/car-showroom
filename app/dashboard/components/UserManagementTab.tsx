"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Users,
  Search,
  Shield,
  Coins,
  Crown,
  Trash2,
  Edit2,
  RefreshCw,
  X,
  AlertTriangle,
} from "lucide-react";
import { message } from "antd";

interface UserItem {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  balance: number;
  subscriptionTier: string;
  subscriptionStatus: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    savedConfigs: number;
    orders: number;
    transactions: number;
  };
}

export default function UserManagementTab() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [tierFilter, setTierFilter] = useState<string>("ALL");

  // Edit User Modal
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editRole, setEditRole] = useState<string>("USER");
  const [editTier, setEditTier] = useState<string>("FREE");
  const [editBalance, setEditBalance] = useState<number>(0);
  const [balanceReason, setBalanceReason] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete User Confirmation
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        const err = await res.json();
        message.error(err.error || "Gagal memuat daftar user.");
      }
    } catch {
      message.error("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  const openEditModal = (u: UserItem) => {
    setEditingUser(u);
    setEditRole(u.role);
    setEditTier(u.subscriptionTier || "FREE");
    setEditBalance(u.balance || 0);
    setBalanceReason("");
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: editRole,
          subscriptionTier: editTier,
          balance: Number(editBalance),
          balanceAdjustmentReason: balanceReason || "Admin manual adjustment",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        message.success(data.message || "User berhasil diperbarui!");
        setEditingUser(null);
        fetchUsers();
      } else {
        message.error(data.error || "Gagal memperbarui user.");
      }
    } catch {
      message.error("Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        message.success(data.message || "User berhasil dihapus.");
        setDeletingUser(null);
        fetchUsers();
      } else {
        message.error(data.error || "Gagal menghapus user.");
      }
    } catch {
      message.error("Terjadi kesalahan saat menghapus.");
    }
  };

  // Filtered list
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchTier = tierFilter === "ALL" || u.subscriptionTier === tierFilter;
    return matchSearch && matchRole && matchTier;
  });

  return (
    <div className="space-y-6">
      {/* Top Telemetry Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0e1017] border border-white/10 rounded-xl p-4 font-mono">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span>TOTAL DRIVERS</span>
            <Users className="w-4 h-4 text-[#9cbbf8]" />
          </div>
          <div className="text-2xl font-black text-white">{users.length}</div>
          <div className="text-[10px] text-emerald-400 mt-1">● Active Registered Accounts</div>
        </div>

        <div className="bg-[#0e1017] border border-white/10 rounded-xl p-4 font-mono">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span>SUPER USERS</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            {users.filter((u) => u.role === "SUPERUSER" || u.role === "ADMIN").length}
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">Master Privileges</div>
        </div>

        <div className="bg-[#0e1017] border border-white/10 rounded-xl p-4 font-mono">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span>VIP SUBSCRIBERS</span>
            <Shield className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">
            {users.filter((u) => u.subscriptionTier === "PRO" || u.subscriptionTier === "APEX").length}
          </div>
          <div className="text-[10px] text-purple-300/80 mt-1">PRO & APEX Members</div>
        </div>

        <div className="bg-[#0e1017] border border-white/10 rounded-xl p-4 font-mono">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span>CIRCULATING SALDO</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            ${users.reduce((acc, u) => acc + (u.balance || 0), 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">Total Member Wallet</div>
        </div>
      </div>

      {/* Control Filters Bar */}
      <div className="bg-[#0e1017] border border-white/10 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari nama atau email driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141722] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-[#9cbbf8] transition-all text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 bg-[#141722] border border-white/10 rounded-lg px-2.5 py-1.5">
            <span className="text-neutral-400 text-[11px]">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none text-xs cursor-pointer"
            >
              <option value="ALL" className="bg-[#141722] text-white">ALL ROLES</option>
              <option value="SUPERUSER" className="bg-[#141722] text-white">SUPERUSER</option>
              <option value="USER" className="bg-[#141722] text-white">USER</option>
            </select>
          </div>

          {/* Tier Filter */}
          <div className="flex items-center gap-1.5 bg-[#141722] border border-white/10 rounded-lg px-2.5 py-1.5">
            <span className="text-neutral-400 text-[11px]">Subs:</span>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none text-xs cursor-pointer"
            >
              <option value="ALL" className="bg-[#141722] text-white">ALL TIERS</option>
              <option value="FREE" className="bg-[#141722] text-white">FREE</option>
              <option value="PRO" className="bg-[#141722] text-white">PRO RACER</option>
              <option value="APEX" className="bg-[#141722] text-white">APEX VIP</option>
            </select>
          </div>

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2 bg-[#141722] hover:bg-[#1c2233] border border-white/10 rounded-lg text-neutral-300 hover:text-white transition-all cursor-pointer"
            title="Refresh Users"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#9cbbf8]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0e1017] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#141722] text-neutral-400 border-b border-white/10 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Driver Profile</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Subscription</th>
                <th className="py-3 px-4">Balance</th>
                <th className="py-3 px-4">3D Builds</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-neutral-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#9cbbf8] mb-2" />
                    Memuat data master users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    Tidak ada driver yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSuper = u.role === "SUPERUSER" || u.role === "ADMIN";
                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {u.image ? (
                            <Image
                              src={u.image}
                              alt={u.name}
                              width={36}
                              height={36}
                              unoptimized
                              className="w-9 h-9 rounded-full object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#1b2233] border border-[#9cbbf8]/40 flex items-center justify-center font-bold text-[#9cbbf8]">
                              {u.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isSuper && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                            </div>
                            <div className="text-[11px] text-neutral-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                            isSuper
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.subscriptionTier === "APEX"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : u.subscriptionTier === "PRO"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-neutral-800 text-neutral-400"
                          }`}
                        >
                          {u.subscriptionTier || "FREE"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-emerald-400">
                        ${(u.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4 text-neutral-300">
                        <span className="bg-white/[0.06] px-2 py-0.5 rounded">
                          {u._count.savedConfigs} Build
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-neutral-400">
                        {new Date(u.createdAt).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 bg-[#141722] hover:bg-blue-900/40 text-blue-400 border border-blue-500/20 rounded-md transition-colors"
                            title="Edit Role, Balance, Subscription"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingUser(u)}
                            className="p-1.5 bg-[#141722] hover:bg-red-900/40 text-red-400 border border-red-500/20 rounded-md transition-colors"
                            title="Hapus User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono text-xs animate-fadeIn">
          <div className="bg-[#0e1017] border border-white/20 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#9cbbf8]" />
                  MANAGE DRIVER ACCOUNT
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {editingUser.name} ({editingUser.email})
                </p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Role Setting */}
              <div>
                <label className="block text-[11px] text-neutral-400 uppercase mb-1">
                  Access Level / Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full bg-[#141722] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#9cbbf8]"
                >
                  <option value="USER">USER (Regular Driver)</option>
                  <option value="SUPERUSER">SUPERUSER (Super Admin Dashboard Access)</option>
                  <option value="ADMIN">ADMIN (Full System Administrator)</option>
                </select>
              </div>

              {/* Subscription Tier */}
              <div>
                <label className="block text-[11px] text-neutral-400 uppercase mb-1">
                  Subscription Tier
                </label>
                <select
                  value={editTier}
                  onChange={(e) => setEditTier(e.target.value)}
                  className="w-full bg-[#141722] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#9cbbf8]"
                >
                  <option value="FREE">FREE (Rookie Driver)</option>
                  <option value="PRO">PRO (Pro Track Racer - $19/mo)</option>
                  <option value="APEX">APEX (Apex VIP Supercar - $49/mo)</option>
                </select>
              </div>

              {/* Balance Adjust */}
              <div>
                <label className="block text-[11px] text-neutral-400 uppercase mb-1">
                  Wallet Balance (USD $)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editBalance}
                    onChange={(e) => setEditBalance(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#141722] border border-white/15 rounded-lg pl-7 pr-3 py-2 text-white focus:outline-none focus:border-[#9cbbf8]"
                  />
                </div>
                <p className="text-[10px] text-neutral-500 mt-1">
                  Saldo sebelumnya: ${editingUser.balance.toFixed(2)}
                </p>
              </div>

              {/* Reason for Audit */}
              <div>
                <label className="block text-[11px] text-neutral-400 uppercase mb-1">
                  Audit Log / Catatan Perubahan Saldo
                </label>
                <input
                  type="text"
                  placeholder="Misal: Bonus event tuning, refund part, grant kompensasi..."
                  value={balanceReason}
                  onChange={(e) => setBalanceReason(e.target.value)}
                  className="w-full bg-[#141722] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#9cbbf8]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                disabled={isSaving}
                className="px-4 py-2 bg-[#9cbbf8] hover:bg-[#b5ceff] text-[#08090c] font-black rounded-lg transition-all"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono text-xs">
          <div className="bg-[#0e1017] border border-red-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                CONFIRM USER DELETION
              </h3>
            </div>
            <p className="text-neutral-300">
              Apakah Anda yakin ingin menghapus user <strong className="text-white">{deletingUser.name}</strong> ({deletingUser.email})? Semua build 3D dan riwayat saldo user ini akan dihapus permanen.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black rounded-lg transition-all"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
