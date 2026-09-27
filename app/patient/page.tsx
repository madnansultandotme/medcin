"use client";

import React, { Suspense } from "react";
import { PatientDashboard } from "@/components/patient/PatientDashboard";

export default function PatientPage() {
  return (
    <div className="flex-1 py-8 sm:py-10 bg-[var(--paper)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="p-12 text-center font-mono-ledger text-xs text-[var(--muted)]">
              Loading clinical patient workspace...
            </div>
          }
        >
          <PatientDashboard />
        </Suspense>
      </div>
    </div>
  );
}
