"use client";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useRequireRole } from "@/lib/hooks/useAuth";
import {
  LayoutDashboard,
  Search,
  Calendar,
  User,
} from "lucide-react";

const patientNavItems = [
  {
    label: "Dashboard",
    href: "/patient",
    icon: LayoutDashboard,
  },
  {
    label: "Browse Doctors",
    href: "/patient/browse",
    icon: Search,
  },
  {
    label: "My Appointments",
    href: "/patient/appointments",
    icon: Calendar,
  },
  {
    label: "Profile",
    href: "/patient/profile",
    icon: User,
  },
];

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, hasAccess } = useRequireRole('PATIENT', 'ADMIN');

  // Show loading while checking authentication and role
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--paper)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--sage)] mx-auto mb-4"></div>
          <p className="text-[var(--muted)]">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Redirect if no access (handled by useRequireRole)
  if (!hasAccess) {
    return null;
  }

  return (
    <DashboardLayout navItems={patientNavItems} title="Patient Dashboard">
      {children}
    </DashboardLayout>
  );
}
