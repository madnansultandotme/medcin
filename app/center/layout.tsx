"use client";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useRequireRole } from "@/lib/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Stethoscope,
  Calendar,
  Briefcase,
  User,
  Clock,
} from "lucide-react";

const centerNavItems = [
  {
    label: "Dashboard",
    href: "/center",
    icon: LayoutDashboard,
  },
  {
    label: "Doctors",
    href: "/center/doctors",
    icon: Stethoscope,
  },
  {
    label: "Slots",
    href: "/center/slots",
    icon: Clock,
  },
  {
    label: "Bookings",
    href: "/center/bookings",
    icon: Calendar,
  },
  {
    label: "Services",
    href: "/center/services",
    icon: Briefcase,
  },
  {
    label: "Profile",
    href: "/center/profile",
    icon: User,
  },
];

export default function CenterLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, hasAccess } = useRequireRole('CENTER', 'ADMIN');
  const router = useRouter();
  const pathname = usePathname();
  const [checkingAccess, setCheckingAccess] = useState(true);

  // Pages that bypass the dashboard layout (standalone pages)
  const standalonePages = [
    '/center/under-review',
    '/center/complete-registration',
    '/center/rejected',
    '/center/suspended',
  ];

  useEffect(() => {
    async function checkCenterAccess() {
      // Skip if still loading auth or no user
      if (isLoading || !user) return;

      // Skip check for standalone pages
      if (standalonePages.some(page => pathname?.startsWith(page))) {
        setCheckingAccess(false);
        return;
      }

      // Only check access for CENTER role users
      if (user.role !== 'CENTER') {
        setCheckingAccess(false);
        return;
      }

      try {
        // Check center approval status
        const response = await fetch('/api/centers/access');
        if (response.ok) {
          const data = await response.json();
          
          // If no access, redirect to appropriate page
          if (!data.hasAccess && data.redirectPath) {
            router.push(data.redirectPath);
            return;
          }
        }
      } catch (error) {
        console.error('Failed to check center access:', error);
      } finally {
        setCheckingAccess(false);
      }
    }

    checkCenterAccess();
  }, [user, isLoading, router, pathname]);

  // Show loading while checking authentication
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

  // Show loading while checking center-specific access
  if (checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--paper)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--sage)] mx-auto mb-4"></div>
          <p className="text-[var(--muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  // Render standalone pages without dashboard layout
  if (standalonePages.some(page => pathname?.startsWith(page))) {
    return <>{children}</>;
  }

  // Render normal dashboard pages with layout
  return (
    <DashboardLayout navItems={centerNavItems} title="Center Dashboard">
      {children}
    </DashboardLayout>
  );
}
