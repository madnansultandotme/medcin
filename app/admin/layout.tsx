"use client";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useRequireRole } from "@/lib/hooks/useAuth";
import {
  LayoutDashboard,
  Building2,
  Stethoscope,
  Calendar,
  AlertOctagon,
  Settings,
  Users,
  User,
} from "lucide-react";

const adminNavItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Centers",
    href: "/admin/centers",
    icon: Building2,
  },
  {
    label: "Doctors",
    href: "/admin/doctors",
    icon: Stethoscope,
  },
  {
    label: "Bookings",
    href: "/admin/bookings",
    icon: Calendar,
  },
  {
    label: "Disputes",
    href: "/admin/disputes",
    icon: AlertOctagon,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    label: "Profile",
    href: "/admin/profile",
    icon: User,
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, hasAccess } = useRequireRole('ADMIN');

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
    <DashboardLayout navItems={adminNavItems} title="Admin Dashboard">
      {children}
    </DashboardLayout>
  );
}
