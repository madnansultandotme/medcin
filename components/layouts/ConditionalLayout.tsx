"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if we're on a dashboard route
  const isDashboardRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/center") ||
    pathname.startsWith("/patient");

  // For dashboard routes, don't show public navbar/footer (they have their own layout)
  if (isDashboardRoute) {
    return <>{children}</>;
  }

  // For public routes, show navbar and footer
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </>
  );
}
