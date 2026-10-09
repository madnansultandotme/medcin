"use client";

import React from "react";
import Link from "next/link";
import { useBranding } from "@/lib/branding";
import { ShieldCheck, Lock, Award } from "lucide-react";

export function DashboardFooter() {
  const { branding } = useBranding();

  return (
    <footer className="w-full bg-[var(--surface)] border-t border-[var(--mist)] text-[var(--ink)] mt-auto font-sans-ledger">
      {/* Minimal Trust Bar */}
      <div className="border-b border-[var(--mist)] bg-[var(--paper)] py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] font-mono-ledger text-[var(--muted)]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[var(--ink)] font-semibold">
              <ShieldCheck className="w-3 h-3 text-[var(--sage)]" />
              <span className="hidden sm:inline">{branding.compliance.regulatoryBody}</span>
              <span className="sm:hidden">PDPA</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-[var(--clay)]" />
              <span className="hidden sm:inline">{branding.compliance.dataProtection}</span>
              <span className="sm:hidden">Secure</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="w-3 h-3 text-[var(--amber)]" />
              <span className="hidden sm:inline">100% Verified</span>
              <span className="sm:hidden">Verified</span>
            </span>
          </div>
          <div className="hidden md:block text-[10px] text-[var(--muted)]">
            {branding.compliance.guarantee}
          </div>
        </div>
      </div>

      {/* Minimal Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono-ledger text-[var(--muted)]">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} {branding.client.legalName}</span>
            <span className="hidden sm:inline">·</span>
            <Link href="#" className="hover:text-[var(--clay)] transition-colors hidden sm:inline">
              Privacy Policy
            </Link>
            <span className="hidden sm:inline">·</span>
            <Link href="#" className="hover:text-[var(--clay)] transition-colors hidden sm:inline">
              Terms of Service
            </Link>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="hidden lg:inline">{branding.contact.address}</span>
            <span className="hidden lg:inline">·</span>
            <span>{branding.contact.email}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
