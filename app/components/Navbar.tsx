"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { User, LogOut, ChevronDown, Wrench, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

const NAV_LINKS = [
  { label: "Visualizer", href: "/" },
  { label: "Workshop", href: "/workshop" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Inventory", href: "/inventory" },
  { label: "Portofolio", href: "/portofolio" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getInitials = (nameStr: string) => {
    return nameStr
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="relative z-30 border-b border-white/[0.08] bg-[#08090c]/90 backdrop-blur-md shrink-0 font-sans">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-8 xl:px-12 h-16 xl:h-20 flex items-center justify-between gap-4">
        {/* Brand & Navigation Links */}
        <div className="flex items-center gap-6 lg:gap-10">
          {/* Logo & Version */}
          <Link
            href="/"
            className="text-base sm:text-lg xl:text-xl font-black tracking-wider text-white hover:text-[#9cbbf8] transition-colors flex items-center gap-2 shrink-0 font-mono"
          >
            <span className="tracking-[0.14em]">SHIFT_TECH MOD</span>
            <span className="text-[10px] xl:text-xs bg-white/10 text-white/90 px-1.5 py-0.5 rounded font-mono font-normal">
              V1.0
            </span>
          </Link>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-4 sm:gap-6 lg:gap-8 text-sm xl:text-base font-semibold tracking-wide">
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href === "/" && pathname === "/visualizer");

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`transition-colors py-1 ${
                    isActive
                      ? "text-white border-b-2 border-[#9cbbf8] font-bold"
                      : "text-neutral-400 hover:text-[#00e5ff]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side User Profile / Login Button */}
        <div className="flex items-center gap-3 font-mono">
          {!loading && user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-[#141722] hover:bg-[#1a1f2e] border border-white/10 hover:border-[#9cbbf8]/40 transition-all text-xs text-white group"
              >
                {/* Avatar */}
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={32}
                    height={32}
                    unoptimized
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[#9cbbf8]"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1e293b] border border-[#9cbbf8] flex items-center justify-center text-[11px] font-bold text-[#9cbbf8]">
                    {getInitials(user.name)}
                  </div>
                )}

                <div className="text-left hidden sm:block">
                  <span className="block font-bold text-white leading-tight max-w-[110px] truncate">
                    {user.name}
                  </span>
                  <span className="text-[9px] text-[#9cbbf8] uppercase block">
                    {user.role} DRIVER
                  </span>
                </div>

                <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* User Dropdown Menu */}
              {dropdownOpen && (
                <div
                  onMouseLeave={() => setDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-56 bg-[#0d0f15] border border-white/15 rounded-xl p-2 shadow-2xl backdrop-blur-xl space-y-1 text-xs z-50 animate-fadeIn font-mono"
                >
                  <div className="px-3 py-2 border-b border-white/[0.08] mb-1">
                    <p className="text-white font-bold truncate">{user.name}</p>
                    <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-white font-bold bg-[#9cbbf8]/10 border border-[#9cbbf8]/20 hover:bg-[#9cbbf8]/20 transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#9cbbf8]" />
                    <span>
                      {user.role === "SUPERUSER" || user.role === "ADMIN"
                        ? "Super User Dashboard"
                        : "Driver Dashboard"}
                    </span>
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-[#9cbbf8]" />
                    <span>My Driver Profile</span>
                  </Link>

                  <Link
                    href="/workshop"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <Wrench className="w-3.5 h-3.5 text-[#00e5ff]" />
                    <span>3D Garage Studio</span>
                  </Link>

                  <div className="pt-1 border-t border-white/[0.08]">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-950/40 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#9cbbf8] hover:bg-[#b4ceff] text-[#08090c] font-black text-[11px] sm:text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_0_12px_rgba(156,187,248,0.25)] hover:shadow-[0_0_18px_rgba(156,187,248,0.45)] flex items-center gap-1.5 active:scale-95"
            >
              <User className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>SIGN IN</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
