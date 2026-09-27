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
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[var(--paper)]">
      <div className="w-full max-w-lg border border-[var(--mist)] bg-[var(--surface)] p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Header */}
        <div className="text-center space-y-2">
          <MedcinLogo size="lg" className="justify-center" />
          <h1 className="text-xl font-bold text-[var(--ink)] tracking-tight">
            Create Your {branding.client.name} Account
          </h1>
          <p className="text-xs text-[var(--muted)] font-mono-ledger">
            Join the clinical health network
          </p>
        </div>

        {success && (
          <div className="p-3 bg-[var(--paper)] border border-[var(--sage)] text-xs font-mono-ledger text-[var(--sage)] flex items-center gap-2">
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
              className={`p-3 border text-left flex items-center gap-2.5 transition-all ${
                accountType === "patient"
                  ? "border-[var(--clay)] bg-[var(--paper)] text-[var(--clay)]"
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
              className={`p-3 border text-left flex items-center gap-2.5 transition-all ${
                accountType === "center"
                  ? "border-[var(--clay)] bg-[var(--paper)] text-[var(--clay)]"
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
                  placeholder="e.g. Jonas Kazlauskas"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--mist)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
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
                    placeholder="jonas@example.com"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--mist)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
                  />
                </div>
                <div>
                  <label className="block font-mono-ledger text-[10px] text-[var(--muted)] mb-1 uppercase tracking-wider">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+370 600 12345"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--mist)] text-xs font-mono-ledger text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
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
                  className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--mist)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
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
                  placeholder="e.g. Vilnius Dental Studio"
                  value={centerName}
                  onChange={(e) => setCenterName(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--mist)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
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
                    className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--mist)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
                  >
                    <option value="Dental clinic">Dental clinic</option>
                    <option value="Physiotherapy center">Physiotherapy center</option>
                    <option value="Massage therapy lounge">Massage therapy lounge</option>
                    <option value="Dermatology institute">Dermatology institute</option>
                    <option value="Integrative wellness clinic">Integrative wellness clinic</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono-ledger text-[10px] text-[var(--muted)] mb-1 uppercase tracking-wider">
                    Healthcare License / Reg #
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LT-MED-2024-998"
                    value={centerRegNumber}
                    onChange={(e) => setCenterRegNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--mist)] text-xs font-mono-ledger text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
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
                  placeholder="e.g. Gedimino pr. 12, Vilnius"
                  value={centerAddress}
                  onChange={(e) => setCenterAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--mist)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
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
                    placeholder="hello@vilniusdental.lt"
                    value={centerEmail}
                    onChange={(e) => setCenterEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--mist)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
                  />
                </div>
                <div>
                  <label className="block font-mono-ledger text-[10px] text-[var(--muted)] mb-1 uppercase tracking-wider">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+370 5 212 3456"
                    value={centerPhone}
                    onChange={(e) => setCenterPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--mist)] text-xs font-mono-ledger text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
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
                  className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--mist)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
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
                className="mt-0.5 accent-[var(--clay)]"
              />
              <span>
                I agree to the Medcin clinical charter, transparent pricing rules, and data handling policy.
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-[var(--clay)] text-white font-mono-ledger text-xs font-semibold py-2.5 hover:opacity-95 transition-opacity mt-2"
          >
            Create {accountType === "patient" ? "Patient" : "Center"} Account
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-[var(--mist)] text-xs text-[var(--muted)] font-mono-ledger">
          <span>Already registered with Medcin? </span>
          <Link href="/login" className="text-[var(--clay)] font-semibold hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
