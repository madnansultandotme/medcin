"use client";

import React, { Suspense } from "react";
import { CenterDashboard } from "@/components/center/CenterDashboard";

export default function CenterPage() {
  return (
    <div className="flex-1 py-8 sm:py-10 bg-[var(--paper)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="p-12 text-center font-mono-ledger text-xs text-[var(--muted)]">
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
