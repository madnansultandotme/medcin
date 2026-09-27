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
      <div className="border-b border-[var(--mist)] bg-[var(--paper)] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono-ledger text-[var(--muted)]">
          <div className="flex items-center gap-6 flex-wrap justify-center sm:justify-start">
            <span className="flex items-center gap-1.5 text-[var(--ink)] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[var(--sage)]" />
              <span>{branding.compliance.regulatoryBody}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[var(--clay)]" />
              <span>{branding.compliance.dataProtection}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[var(--amber)]" />
              <span>100% Verified Practitioners</span>
            </span>
          </div>

          <div className="text-[11px] text-[var(--muted)]">
            {branding.compliance.guarantee}
          </div>
        </div>
      </div>

      {/* Main Footer Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <MedcinLogo size="lg" />
            <p className="text-xs sm:text-sm text-[var(--muted)] max-w-sm leading-relaxed">
              {branding.client.description}
            </p>
            <div className="text-xs font-mono-ledger text-[var(--muted)] space-y-1">
              <div>{branding.localization.supportedCities.join(" · ").toUpperCase()}</div>
              <div>Operating under {branding.compliance.healthProtocol}</div>
            </div>
          </div>

          {/* Patients Column */}
          <div>
            <h5 className="font-mono-ledger text-xs font-bold text-[var(--ink)] mb-3 uppercase tracking-wider">
              Patient Portal
            </h5>
            <ul className="space-y-2 text-xs text-[var(--muted)]">
              <li>
                <Link href="/patient" className="hover:text-[var(--clay)] transition-colors">
                  Find Doctors & Clinics
                </Link>
              </li>
              <li>
                <Link href="/patient" className="hover:text-[var(--clay)] transition-colors">
                  Book an Appointment
                </Link>
              </li>
              <li>
                <Link href="/patient" className="hover:text-[var(--clay)] transition-colors">
                  My Consultations
                </Link>
              </li>
              <li>
                <Link href="/patient" className="hover:text-[var(--clay)] transition-colors">
                  Specialties & Pricing
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[var(--clay)] transition-colors">
                  Patient Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Medical Centers Column */}
          <div>
            <h5 className="font-mono-ledger text-xs font-bold text-[var(--ink)] mb-3 uppercase tracking-wider">
              For Medical Centers
            </h5>
            <ul className="space-y-2 text-xs text-[var(--muted)]">
              <li>
                <Link href="/center" className="hover:text-[var(--clay)] transition-colors">
                  Practice Operations Portal
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-[var(--clay)] transition-colors">
                  Register Your Practice
                </Link>
              </li>
              <li>
                <Link href="/center" className="hover:text-[var(--clay)] transition-colors">
                  Roster & Slot Scheduling
                </Link>
              </li>
              <li>
                <Link href="/center" className="hover:text-[var(--clay)] transition-colors">
                  Appointments Inbox
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[var(--clay)] transition-colors">
                  Clinic Staff Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Enterprise & Admin Column */}
          <div>
            <h5 className="font-mono-ledger text-xs font-bold text-[var(--ink)] mb-3 uppercase tracking-wider">
              Platform & Legal
            </h5>
            <ul className="space-y-2 text-xs text-[var(--muted)]">
              <li>
                <Link href="/admin" className="hover:text-[var(--clay)] transition-colors">
                  Platform Admin Console
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[var(--clay)] transition-colors">
                  Facility Vetting & Directory
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[var(--clay)] transition-colors">
                  Dispute Settlement Desk
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
        <div className="pt-8 mt-8 border-t border-[var(--mist)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono-ledger text-[var(--muted)]">
          <div>
            © {new Date().getFullYear()} {branding.client.legalName}. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>{branding.contact.address}</span>
            <span>·</span>
            <span>{branding.contact.email}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
