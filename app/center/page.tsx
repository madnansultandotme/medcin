"use client";

import React, { Suspense } from "react";
import { CenterDashboard } from "@/components/center/CenterDashboard";

export default function CenterPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex-1 py-8 sm:py-12 bg-[var(--paper)] overflow-hidden">
      {/* Ambient Lighting Orbs matching Landing Page */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[var(--clay)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-[var(--sage)]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="p-16 text-center font-mono-ledger text-sm text-[var(--muted)]">
              Loading medical center operations workspace...
            </div>
          }
        >
          <CenterDashboard />
        </Suspense>
      </div>
    </div>
  );
}
