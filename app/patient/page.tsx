"use client";

import React, { Suspense } from "react";
import { PatientDashboard } from "@/components/patient/PatientDashboard";

export default function PatientPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex-1 py-8 sm:py-12 bg-white overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="p-16 text-center font-mono-ledger text-sm text-[var(--muted)]">
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
