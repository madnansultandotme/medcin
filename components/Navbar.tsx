"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MedcinLogo } from "./MedcinLogo";
import { useBranding } from "@/lib/branding";
import { useAuth } from "@/lib/hooks/useAuth";
import NotificationsBell from "./NotificationsBell";
import {
  Calendar,
  Menu,
  X,
  LogOut,
  User,
  Building2,
  ShieldCheck,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { branding } = useBranding();
  const { user, isAuthenticated, signOut } = useAuth();
  const role = user?.role || null;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if current route is inside one of the private role dashboards
  const isDashboardRoute =
    pathname.startsWith("/patient") ||
    pathname.startsWith("/center") ||
    pathname.startsWith("/admin");

  const currentRoleLabel = pathname.startsWith("/patient")
    ? "Patient Workspace"
    : pathname.startsWith("/center")
    ? "Clinic Operations"
    : pathname.startsWith("/admin")
    ? "Platform Governance"
    : null;

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full pt-2 sm:pt-3 pb-2 px-3 sm:px-6 lg:px-8 bg-[var(--paper)]/80 backdrop-blur-md transition-colors">
      <nav className="max-w-7xl mx-auto bg-[var(--surface)]/90 backdrop-blur-xl border border-[var(--mist)] rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 shadow-sm transition-all">
        <div className="flex items-center justify-between h-11">
          {/* Brand Logo & Navigation */}
          <div className="flex items-center gap-6 sm:gap-8">
            <MedcinLogo size="md" />

            {/* Public Website Navigation Links */}
            {!isDashboardRoute && (
              <div className="hidden md:flex items-center gap-1.5 text-xs font-mono-ledger">
                {branding.navigation.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-[var(--ink)] hover:text-[var(--clay)] hover:bg-[var(--paper)] rounded-full px-3 py-1.5 transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Role Context Breadcrumb Pill when in Dashboard */}
            {isDashboardRoute && isAuthenticated && (
              <div className="hidden sm:flex items-center gap-2 font-mono-ledger text-xs">
                <span className="text-[var(--muted)]">/</span>
                <span className="badge-ledger badge-confirmed font-mono-ledger text-[11px] rounded-full flex items-center gap-1.5">
                  {pathname.startsWith("/patient") ? (
                    <User className="w-3 h-3 text-[var(--sage)]" />
                  ) : pathname.startsWith("/center") ? (
                    <Building2 className="w-3 h-3 text-[var(--sage)]" />
                  ) : (
                    <ShieldCheck className="w-3 h-3 text-[var(--sage)]" />
                  )}
                  <span>{currentRoleLabel}</span>
                </span>
                <span className="text-[var(--muted)] px-2">•</span>
                <span className="text-[var(--muted)]">{user?.name}</span>
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {/* If authenticated: Show notifications, user info and logout */}
            {isAuthenticated ? (
              <>
                <NotificationsBell />
                {!isDashboardRoute && (
                  <Link
                    href="/portal"
                    className="px-4 py-1.5 font-mono-ledger text-xs font-bold bg-[var(--clay)] text-white hover:opacity-95 transition-opacity inline-flex items-center gap-1.5 rounded-full shadow-sm"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Go to Dashboard</span>
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-[var(--sage)] rounded-full text-[var(--sage)] font-sans-ledger text-sm hover:bg-[var(--sage)] hover:text-white transition-all font-semibold shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              /* Not authenticated: Show sign in button */
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-5 py-2.5 border-2 border-[var(--sage)] rounded-full text-[var(--sage)] font-sans-ledger text-sm hover:bg-[var(--sage)] hover:text-white transition-all font-semibold shadow-sm"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-2 px-5 py-2.5 bg-[var(--clay)] text-white hover:bg-[var(--clay)]/90 transition-all rounded-full shadow-sm font-sans-ledger text-sm font-semibold"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border border-[var(--mist)] rounded-xl text-[var(--ink)] bg-[var(--surface)]"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-[var(--mist)] bg-[var(--surface)] px-2 py-3 space-y-3 font-mono-ledger text-xs rounded-2xl">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 bg-[var(--paper)] rounded-lg">
                  <p className="text-[var(--muted)] text-xs mb-1">Signed in as</p>
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-[var(--muted)] text-xs">{user?.email}</p>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {!isDashboardRoute && (
                    <Link
                      href="/portal"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 px-3 rounded-lg bg-[var(--clay)] text-white font-bold text-center flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Go to Dashboard</span>
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="py-2 px-3 rounded-lg hover:bg-[var(--paper)] text-[var(--ink)] text-left"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-1">
                  {branding.navigation.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 px-3 rounded-lg hover:bg-[var(--paper)] text-[var(--ink)]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <div className="pt-2 border-t border-[var(--mist)] flex gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 border border-[var(--mist)] rounded-xl text-[var(--ink)] font-semibold"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 bg-[var(--clay)] text-white font-bold rounded-xl"
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
