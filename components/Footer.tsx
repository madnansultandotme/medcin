"use client";

import React from "react";
import Link from "next/link";
import { MedcinLogo } from "./MedcinLogo";
import { useBranding } from "@/lib/branding";
import { ShieldCheck, Lock, Award, Heart } from "lucide-react";

export function Footer() {
  const { branding } = useBranding();

  return (
    <footer className="w-full bg-[var(--surface)] border-t border-[var(--mist)] text-[var(--ink)] mt-auto font-sans-ledger">
      {/* Trust & Accreditation Bar */}
      <div className="border-b border-[var(--mist)] bg-[var(--paper)] py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] sm:text-xs font-mono-ledger text-[var(--muted)]">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center sm:justify-start">
            <span className="flex items-center gap-1.5 text-[var(--ink)] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--sage)]" />
              <span className="hidden sm:inline">{branding.compliance.regulatoryBody}</span>
              <span className="sm:hidden">PDPA Compliant</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[var(--clay)]" />
              <span className="hidden sm:inline">{branding.compliance.dataProtection}</span>
              <span className="sm:hidden">Secure</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[var(--amber)]" />
              <span className="hidden sm:inline">100% Verified Practitioners</span>
              <span className="sm:hidden">Verified</span>
            </span>
          </div>

          <div className="text-[10px] text-[var(--muted)] hidden lg:block">
            {branding.compliance.guarantee}
          </div>
        </div>
      </div>

      {/* Main Footer Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8">
          {/* Brand Info */}
          <div className="col-span-2 sm:col-span-3 md:col-span-2 space-y-3">
            <MedcinLogo size="md" />
            <p className="text-xs text-[var(--muted)] max-w-sm leading-relaxed">
              {branding.client.description}
            </p>
            <div className="text-[10px] font-mono-ledger text-[var(--muted)] space-y-1">
              <div className="hidden sm:block">{branding.localization.supportedCities.join(" · ").toUpperCase()}</div>
              <div className="hidden sm:block">Operating under {branding.compliance.healthProtocol}</div>
            </div>
          </div>

          {/* Patients Column */}
          <div>
            <h5 className="font-mono-ledger text-[10px] sm:text-xs font-bold text-[var(--ink)] mb-2 sm:mb-3 uppercase tracking-wider">
              Patient Portal
            </h5>
            <ul className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs text-[var(--muted)]">
              <li>
                <Link href="/patient" className="hover:text-[var(--clay)] transition-colors">
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link href="/patient" className="hover:text-[var(--clay)] transition-colors">
                  Book Appointment
                </Link>
              </li>
              <li className="hidden sm:block">
                <Link href="/patient" className="hover:text-[var(--clay)] transition-colors">
                  My Consultations
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[var(--clay)] transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Medical Centers Column */}
          <div>
            <h5 className="font-mono-ledger text-[10px] sm:text-xs font-bold text-[var(--ink)] mb-2 sm:mb-3 uppercase tracking-wider">
              Medical Centers
            </h5>
            <ul className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs text-[var(--muted)]">
              <li>
                <Link href="/center" className="hover:text-[var(--clay)] transition-colors">
                  Operations Portal
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-[var(--clay)] transition-colors">
                  Register Practice
                </Link>
              </li>
              <li className="hidden sm:block">
                <Link href="/center" className="hover:text-[var(--clay)] transition-colors">
                  Roster & Slots
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[var(--clay)] transition-colors">
                  Clinic Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Enterprise & Admin Column */}
          <div>
            <h5 className="font-mono-ledger text-[10px] sm:text-xs font-bold text-[var(--ink)] mb-2 sm:mb-3 uppercase tracking-wider">
              Platform
            </h5>
            <ul className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs text-[var(--muted)]">
              <li className="hidden sm:block">
                <Link href="/admin" className="hover:text-[var(--clay)] transition-colors">
                  Admin Console
                </Link>
              </li>
              <li>
                <span className="text-[var(--muted)]">Privacy Policy</span>
              </li>
              <li>
                <span className="text-[var(--muted)]">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-[var(--mist)] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono-ledger text-[var(--muted)]">
          <div>
            © {new Date().getFullYear()} {branding.client.legalName}. All rights reserved.
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-[10px] flex-wrap justify-center">
            <span className="hidden sm:inline">{branding.contact.address}</span>
            <span className="hidden sm:inline">·</span>
            <span>{branding.contact.email}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
