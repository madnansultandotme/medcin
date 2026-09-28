"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBranding } from "@/lib/branding";
import { useMedcinStore, Role } from "@/lib/store";
import {
  User,
  Building2,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  Sparkles,
  Globe2,
} from "lucide-react";

export default function PortalPage() {
  const router = useRouter();
  const { branding } = useBranding();
  const { setRole, addToast } = useMedcinStore();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [selectedRole, setSelectedRole] = useState<Role>("patient");
  const [email, setEmail] = useState("marcus.wei@example.sg");
  const [password, setPassword] = useState("••••••••");
  const [name, setName] = useState("Marcus Wei");
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    if (role === "patient") {
      setEmail("marcus.wei@example.sg");
      setName("Marcus Wei");
    } else if (role === "center") {
      setEmail("appointments@novenamedical.sg");
      setName("Novena Specialist Clinic");
    } else if (role === "admin") {
      setEmail("admin@medcin.asia");
      setName("Compliance Officer");
    }
  };

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Apply role in global store
    setRole(selectedRole);

    setTimeout(() => {
      setIsLoading(false);
      addToast({
        type: "success",
        title: mode === "signin" ? "Access Granted" : "Account Initialized",
        message: `Welcome to ${branding.client.name} ${selectedRole.toUpperCase()} workspace.`,
      });

      if (selectedRole === "patient") {
        router.push("/patient");
      } else if (selectedRole === "center") {
        router.push("/center");
      } else {
        router.push("/admin");
      }
    }, 450);
  };

  const handleDirectRoleLogin = (role: Role) => {
    setRole(role);
    addToast({
      type: "info",
      title: "Direct Authentication",
      message: `Entering ${role.toUpperCase()} operations portal.`,
    });
    if (role === "patient") router.push("/patient");
    else if (role === "center") router.push("/center");
    else router.push("/admin");
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-[var(--paper)]">
      {/* Background Image with Ambient Glass Blur */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/bg-sanctuary.jpg"
          alt="Medcin Clinical Sanctuary"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105 transform"
        />
        <div className="absolute inset-0 bg-black/55 backdrop-blur-md" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--paper)]/80 via-transparent to-black/60" />
      </div>

      <div className="relative z-10 w-full max-w-5xl space-y-6">
        {/* Header Branding Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-mono-ledger">
            <Globe2 className="w-3.5 h-3.5 text-[var(--clay)]" />
            <span>{branding.localization.targetRegion || "Southeast Asia"} Regional Gateway</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--sage)]" />
            <span>Singapore · Thailand · Malaysia</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {branding.client.name} Unified Portal
          </h1>
          <p className="text-sm text-white/80 max-w-xl mx-auto font-mono-ledger">
            Secure, role-based gateway for patients, accredited clinics, and governance officers
          </p>

          {/* Mode Switcher */}
          <div className="inline-flex p-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-mono-ledger mt-2">
            <button
              onClick={() => setMode("signin")}
              className={`px-5 py-1.5 rounded-full transition-all ${
                mode === "signin"
                  ? "bg-white text-[var(--ink)] font-bold shadow-md"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`px-5 py-1.5 rounded-full transition-all ${
                mode === "signup"
                  ? "bg-white text-[var(--ink)] font-bold shadow-md"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* 3 Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Patient Role Card */}
          <div
            onClick={() => handleRoleSelect("patient")}
            className={`cursor-pointer rounded-3xl p-5 border transition-all backdrop-blur-xl relative flex flex-col justify-between ${
              selectedRole === "patient"
                ? "bg-white/95 border-[var(--clay)] text-[var(--ink)] shadow-2xl ring-2 ring-[var(--clay)]/40"
                : "bg-white/15 border-white/20 text-white hover:bg-white/25 hover:border-white/40"
            }`}
          >
            {selectedRole === "patient" && (
              <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-[var(--clay)] text-white text-[10px] font-mono-ledger font-semibold shadow-xs">
                Selected
              </span>
            )}
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--paper)] border border-[var(--mist)] flex items-center justify-center text-[var(--clay)] shadow-xs">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Patient Workspace</h3>
                <p className="text-xs opacity-75 font-mono-ledger mt-0.5">
                  Direct cross-border consultations & transparent appointments
                </p>
              </div>

              <ul className="text-xs space-y-1.5 font-sans-ledger pt-2 border-t border-black/10">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--sage)] shrink-0" />
                  <span>Real-time booking across SG, TH, MY</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--sage)] shrink-0" />
                  <span>Multi-currency pricing ({branding.localization.currency.symbol})</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--sage)] shrink-0" />
                  <span>Verified practitioner credentials</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 mt-3 border-t border-black/10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDirectRoleLogin("patient");
                }}
                className="w-full py-2 px-3 rounded-xl bg-[var(--clay)] text-white text-xs font-mono-ledger font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-1 shadow-xs"
              >
                <span>Quick Enter as Patient</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Medical Center Role Card */}
          <div
            onClick={() => handleRoleSelect("center")}
            className={`cursor-pointer rounded-3xl p-5 border transition-all backdrop-blur-xl relative flex flex-col justify-between ${
              selectedRole === "center"
                ? "bg-white/95 border-[var(--clay)] text-[var(--ink)] shadow-2xl ring-2 ring-[var(--clay)]/40"
                : "bg-white/15 border-white/20 text-white hover:bg-white/25 hover:border-white/40"
            }`}
          >
            {selectedRole === "center" && (
              <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-[var(--clay)] text-white text-[10px] font-mono-ledger font-semibold shadow-xs">
                Selected
              </span>
            )}
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--paper)] border border-[var(--mist)] flex items-center justify-center text-[var(--clay)] shadow-xs">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Clinic Operations</h3>
                <p className="text-xs opacity-75 font-mono-ledger mt-0.5">
                  Accredited facility roster, calendar & inbox management
                </p>
              </div>

              <ul className="text-xs space-y-1.5 font-sans-ledger pt-2 border-t border-black/10">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--sage)] shrink-0" />
                  <span>Real-time appointment inbox</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--sage)] shrink-0" />
                  <span>Practitioner schedule management</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--sage)] shrink-0" />
                  <span>MOH / KKM / MOPH licensing profile</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 mt-3 border-t border-black/10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDirectRoleLogin("center");
                }}
                className="w-full py-2 px-3 rounded-xl bg-[var(--clay)] text-white text-xs font-mono-ledger font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-1 shadow-xs"
              >
                <span>Quick Enter as Clinic</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Platform Admin Role Card */}
          <div
            onClick={() => handleRoleSelect("admin")}
            className={`cursor-pointer rounded-3xl p-5 border transition-all backdrop-blur-xl relative flex flex-col justify-between ${
              selectedRole === "admin"
                ? "bg-white/95 border-[var(--clay)] text-[var(--ink)] shadow-2xl ring-2 ring-[var(--clay)]/40"
                : "bg-white/15 border-white/20 text-white hover:bg-white/25 hover:border-white/40"
            }`}
          >
            {selectedRole === "admin" && (
              <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-[var(--clay)] text-white text-[10px] font-mono-ledger font-semibold shadow-xs">
                Selected
              </span>
            )}
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--paper)] border border-[var(--mist)] flex items-center justify-center text-[var(--clay)] shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Platform Governance</h3>
                <p className="text-xs opacity-75 font-mono-ledger mt-0.5">
                  Audit, dispute mediation, and white-label branding control
                </p>
              </div>

              <ul className="text-xs space-y-1.5 font-sans-ledger pt-2 border-t border-black/10">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--sage)] shrink-0" />
                  <span>Gross Booking Vol. & take-rate audit</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--sage)] shrink-0" />
                  <span>Dispute settlement & arbitration desk</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--sage)] shrink-0" />
                  <span>Client JSON branding export</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 mt-3 border-t border-black/10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDirectRoleLogin("admin");
                }}
                className="w-full py-2 px-3 rounded-xl bg-[var(--clay)] text-white text-xs font-mono-ledger font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-1 shadow-xs"
              >
                <span>Quick Enter as Admin</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Credentials Form Box */}
        <div className="rounded-3xl bg-white/95 backdrop-blur-xl border border-white/40 p-6 md:p-8 shadow-2xl">
          <form onSubmit={handleAuthenticate} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--mist)] gap-2">
              <div>
                <h2 className="text-lg font-bold text-[var(--ink)]">
                  {mode === "signin" ? "Authenticate Credentials" : "Register Workspace Identity"}
                </h2>
                <p className="text-xs text-[var(--muted)] font-mono-ledger">
                  Current Target: <span className="font-bold text-[var(--clay)] capitalize">{selectedRole}</span> portal
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-[var(--paper)] border border-[var(--mist)] text-xs font-mono-ledger text-[var(--sage)] self-start">
                256-bit TLS Encrypted
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mode === "signup" && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono-ledger uppercase text-[var(--muted)] mb-1">
                    Full Legal Name / Entity Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-mono-ledger uppercase text-[var(--muted)] mb-1">
                  Work / Personal Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm font-mono-ledger text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-ledger uppercase text-[var(--muted)] mb-1">
                  Security Passkey / Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm font-mono-ledger text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-[var(--muted)] font-mono-ledger">
                Protected by {branding.compliance.regulatoryBody} guidelines
              </span>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[var(--clay)] text-white font-mono-ledger text-sm font-semibold hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Enter {selectedRole.toUpperCase()} Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Navigation */}
        <div className="text-center font-mono-ledger text-xs text-white/70">
          <Link href="/" className="hover:text-white underline underline-offset-4">
            ← Return to {branding.client.name} Public Directory
          </Link>
        </div>
      </div>
    </div>
  );
}
