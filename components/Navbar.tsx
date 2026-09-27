"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MedcinLogo } from "./MedcinLogo";
import { useMedcinStore } from "@/lib/store";
import { useBranding } from "@/lib/branding";
import {
  Sun,
  Moon,
  Calendar,
  Menu,
  X,
  User,
  Building2,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useMedcinStore();
  const { branding } = useBranding();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);

  // Check if current route is inside one of the private dashboards
  const isDashboardRoute =
    pathname.startsWith("/patient") ||
    pathname.startsWith("/center") ||
    pathname.startsWith("/admin");

  return (
    <nav className="sticky top-0 z-50 w-full bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--mist)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <MedcinLogo size="md" />

            {/* Public Website Navigation Links */}
            {!isDashboardRoute && (
              <div className="hidden md:flex items-center gap-7 text-xs font-mono-ledger">
                {branding.navigation.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-[var(--ink)] hover:text-[var(--clay)] transition-colors py-1"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Dashboard Contextual Breadcrumb */}
            {isDashboardRoute && (
              <div className="hidden sm:flex items-center gap-2 font-mono-ledger text-xs text-[var(--muted)]">
                <span>/</span>
                <span className="font-semibold text-[var(--clay)] uppercase">
                  {pathname.startsWith("/patient")
                    ? "Patient Workspace"
                    : pathname.startsWith("/center")
                    ? "Clinic Management"
                    : "Platform Administration"}
                </span>
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 border border-[var(--mist)] text-[var(--ink)] bg-[var(--paper)] hover:border-[var(--clay)] transition-colors"
              title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
              aria-label="Toggle color theme"
            >
              {theme === "light" ? (
                <Moon className="w-3.5 h-3.5 text-[var(--muted)]" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-[var(--amber)]" />
              )}
            </button>

            {/* Sign In Dropdown / Link */}
            <div className="relative">
              <button
                onClick={() => setLoginMenuOpen(!loginMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--mist)] text-[var(--ink)] font-mono-ledger text-xs hover:border-[var(--clay)] hover:text-[var(--clay)] transition-colors font-medium bg-[var(--surface)]"
              >
                <span>Sign In</span>
                <ChevronDown className="w-3 h-3 text-[var(--muted)]" />
              </button>

              {loginMenuOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-[var(--surface)] border border-[var(--mist)] shadow-xl py-1 z-50">
                  <div className="px-3 py-1.5 border-b border-[var(--mist)] font-mono-ledger text-[10px] text-[var(--muted)] uppercase tracking-wider">
                    Sign in to your account
                  </div>
                  <Link
                    href="/login?role=patient"
                    onClick={() => setLoginMenuOpen(false)}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-[var(--paper)] transition-colors text-[var(--ink)]"
                  >
                    <User className="w-3.5 h-3.5 text-[var(--clay)]" />
                    <span>Patient Account</span>
                  </Link>
                  <Link
                    href="/login?role=center"
                    onClick={() => setLoginMenuOpen(false)}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-[var(--paper)] transition-colors text-[var(--ink)]"
                  >
                    <Building2 className="w-3.5 h-3.5 text-[var(--clay)]" />
                    <span>Medical Center Account</span>
                  </Link>
                  <Link
                    href="/login?role=admin"
                    onClick={() => setLoginMenuOpen(false)}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-[var(--paper)] transition-colors text-[var(--ink)] border-t border-[var(--mist)]/50"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[var(--clay)]" />
                    <span>Platform Admin Console</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            <Link
              href="/patient"
              className="px-4 py-2 font-mono-ledger text-xs font-bold bg-[var(--clay)] text-white hover:opacity-95 transition-opacity inline-flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{branding.navigation.ctaLabel}</span>
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 border border-[var(--mist)] text-[var(--ink)] bg-[var(--paper)]"
            >
              {theme === "light" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border border-[var(--mist)] text-[var(--ink)] bg-[var(--surface)]"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--mist)] bg-[var(--surface)] px-4 py-4 space-y-3 font-mono-ledger text-xs">
          <div className="grid grid-cols-1 gap-1">
            <Link
              href="/patient"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-[var(--ink)]"
            >
              Find Care Nearby
            </Link>
            <Link
              href="/center"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-[var(--ink)]"
            >
              For Medical Centers
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-[var(--ink)]"
            >
              Platform Administration
            </Link>
          </div>

          <div className="pt-2 border-t border-[var(--mist)] flex gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2.5 border border-[var(--mist)] text-[var(--ink)] font-semibold"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2.5 bg-[var(--clay)] text-white font-bold"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
