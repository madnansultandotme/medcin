"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MedcinLogo } from "@/components/MedcinLogo";
import { useMedcinStore, Role } from "@/lib/store";
import { useBranding } from "@/lib/branding";
import { User, Building2, CheckCircle2, ArrowRight, ShieldCheck, Mail, Lock, Phone } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { setRole } = useMedcinStore();
  const { branding } = useBranding();
  const [accountType, setAccountType] = useState<"patient" | "center">("patient");
  const [success, setSuccess] = useState(false);

  // Patient fields
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientPassword, setPatientPassword] = useState("");

  // Center fields
  const [centerName, setCenterName] = useState("");
  const [centerCategory, setCenterCategory] = useState("Dental clinic");
  const [centerAddress, setCenterAddress] = useState("");
  const [centerRegNumber, setCenterRegNumber] = useState("");
  const [centerContactName, setCenterContactName] = useState("");
  const [centerEmail, setCenterEmail] = useState("");
  const [centerPhone, setCenterPhone] = useState("");
  const [centerPassword, setCenterPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setRole(accountType);

    setTimeout(() => {
      if (accountType === "patient") {
        router.push("/patient");
      } else {
        router.push("/center");
      }
    }, 800);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative min-h-[calc(100vh-4rem)] overflow-hidden font-sans-ledger">
      {/* Background Sanctuary Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/images/bg-sanctuary.jpg')` }}
      />
      <div className="absolute inset-0 bg-[var(--paper)]/85 dark:bg-[var(--paper)]/92 backdrop-blur-md" />

      <div className="relative z-10 w-full max-w-lg backdrop-blur-2xl bg-white/85 dark:bg-[#1B1F18]/90 border border-white/80 dark:border-white/10 p-8 sm:p-10 space-y-6 shadow-2xl rounded-3xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <MedcinLogo size="lg" className="justify-center" />
          <h1 className="text-xl font-bold text-[var(--ink)] tracking-tight">
            Create Your {branding.client.name} Account
          </h1>
          <p className="text-xs text-[var(--muted)] font-mono-ledger">
            Join the ASEAN healthcare & wellness network
          </p>
        </div>

        {success && (
          <div className="p-3 bg-[var(--paper)] border border-[var(--sage)] text-xs font-mono-ledger text-[var(--sage)] flex items-center gap-2 rounded-xl">
            <CheckCircle2 className="w-4 h-4 flex-none" />
            <span>Account initialized! Forwarding to workspace...</span>
          </div>
        )}

        {/* Account Type Selector Tabs */}
        <div>
          <label className="block font-mono-ledger text-[10px] text-[var(--muted)] mb-1.5 uppercase tracking-wider">
            I am registering as:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAccountType("patient")}
              className={`p-3 border text-left flex items-center gap-2.5 transition-all rounded-xl ${
                accountType === "patient"
                  ? "border-[var(--clay)] bg-[var(--paper)] text-[var(--clay)] font-semibold shadow-xs"
                  : "border-[var(--mist)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--muted)]"
              }`}
            >
              <User className="w-4 h-4 flex-none" />
              <div>
                <div className="font-semibold text-xs text-[var(--ink)]">
                  Patient
                </div>
                <div className="text-[10px] font-mono-ledger text-[var(--muted)]">
                  Personal bookings & care
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAccountType("center")}
              className={`p-3 border text-left flex items-center gap-2.5 transition-all rounded-xl ${
                accountType === "center"
                  ? "border-[var(--clay)] bg-[var(--paper)] text-[var(--clay)] font-semibold shadow-xs"
                  : "border-[var(--mist)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--muted)]"
              }`}
            >
              <Building2 className="w-4 h-4 flex-none" />
              <div>
                <div className="font-semibold text-xs text-[var(--ink)]">
                  Medical Center
                </div>
                <div className="text-[10px] font-mono-ledger text-[var(--muted)]">
                  Clinic & practitioner roster
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-sans-ledger">
          {accountType === "patient" ? (
            /* Patient Fields */
            <>
              <div>
                <label className="block font-mono-ledger text-[10px] text-[var(--muted)] mb-1 uppercase tracking-wider">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marcus Wei"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[var(--surface)] border border-[var(--mist)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--clay)] rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono-ledger text-[10px] text-[var(--muted)] mb-1 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="marcus.wei@example.sg"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[var(--surface)] border border-[var(--mist)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--clay)] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-mono-ledger text-[10px] text-[var(--muted)] mb-1 uppercase tracking-wider">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+65 9123 4567"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[var(--surface)] border border-[var(--mist)] text-xs font-mono-ledger text-[var(--ink)] focus:outline-none focus:border-[var(--clay)] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono-ledger text-[10px] text-[var(--muted)] mb-1 uppercase tracking-wider">
                  Create Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 8 characters"
                  value={patientPassword}
                  onChange={(e) => setPatientPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[var(--surface)] border border-[var(--mist)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--clay)] rounded-xl"
                />
              </div>
            </>
          ) : (
            /* Medical Center Fields */
            <>
              <div>
                <label className="block font-mono-ledger text-[10px] text-[var(--muted)] mb-1 uppercase tracking-wider">
                  Medical Center / Practice Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Novena Premier Specialist Medical"
                  value={centerName}
                  onChange={(e) => setCenterName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[var(--surface)] border border-[var(--mist)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--clay)] rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono-ledger text-[10px] text-[var(--muted)] mb-1 uppercase tracking-wider">
                    Primary Category
                  </label>
                  <select
                    value={centerCategory}
                    onChange={(e) => setCenterCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[var(--surface)] border border-[var(--mist)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--clay)] rounded-xl"
                  >
                    <option value="Specialist diagnostics">Specialist diagnostics</option>
                    <option value="Aesthetic & anti-aging clinic">Aesthetic & anti-aging clinic</option>
                    <option value="Physiotherapy & sports medicine">Physiotherapy & sports medicine</option>
                    <option value="Dental surgery & aesthetics">Dental surgery & aesthetics</option>
                    <option value="Integrative wellness sanctuary">Integrative wellness sanctuary</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono-ledger text-[10px] text-[var(--muted)] mb-1 uppercase tracking-wider">
                    Healthcare License / Reg #
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MOH-SG-NOV-8812"
                    value={centerRegNumber}
                    onChange={(e) => setCenterRegNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[var(--surface)] border border-[var(--mist)] text-xs font-mono-ledger text-[var(--ink)] focus:outline-none focus:border-[var(--clay)] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono-ledger text-[10px] text-[var(--muted)] mb-1 uppercase tracking-wider">
                  Physical Practice Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10 Sinaran Drive, Novena Medical Hub, Singapore"
                  value={centerAddress}
                  onChange={(e) => setCenterAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[var(--surface)] border border-[var(--mist)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--clay)] rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono-ledger text-[10px] text-[var(--muted)] mb-1 uppercase tracking-wider">
                    Practice Work Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="appointments@novenamedical.sg"
                    value={centerEmail}
                    onChange={(e) => setCenterEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[var(--surface)] border border-[var(--mist)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--clay)] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-mono-ledger text-[10px] text-[var(--muted)] mb-1 uppercase tracking-wider">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+65 6712 8900"
                    value={centerPhone}
                    onChange={(e) => setCenterPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[var(--surface)] border border-[var(--mist)] text-xs font-mono-ledger text-[var(--ink)] focus:outline-none focus:border-[var(--clay)] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono-ledger text-[10px] text-[var(--muted)] mb-1 uppercase tracking-wider">
                  Account Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 8 characters"
                  value={centerPassword}
                  onChange={(e) => setCenterPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[var(--surface)] border border-[var(--mist)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--clay)] rounded-xl"
                />
              </div>
            </>
          )}

          {/* Terms Agreement */}
          <div className="pt-1">
            <label className="flex items-start gap-2 cursor-pointer font-mono-ledger text-[11px] text-[var(--muted)]">
              <input
                type="checkbox"
                required
                defaultChecked
                className="mt-0.5 accent-[var(--clay)] rounded"
              />
              <span>
                I agree to the {branding.client.name} clinical charter, transparent pricing rules, and data handling policy.
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-[var(--clay)] text-white font-mono-ledger text-xs font-bold py-3 hover:opacity-95 transition-opacity mt-2 rounded-xl shadow-md"
          >
            Create {accountType === "patient" ? "Patient" : "Medical Center"} Account
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-[var(--mist)]/70 text-xs text-[var(--muted)] font-mono-ledger">
          <span>Already registered with {branding.client.name}? </span>
          <Link href="/login" className="text-[var(--clay)] font-bold hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
