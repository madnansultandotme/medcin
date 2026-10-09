"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useBranding } from "@/lib/branding";

export default function PortalPage() {
  const router = useRouter();
  const { branding } = useBranding();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Fetch user role and redirect
    const fetchAndRedirect = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          const role = data.user?.role;

          // Redirect based on role
          if (role === 'ADMIN') {
            router.push('/admin');
          } else if (role === 'CENTER') {
            router.push('/center');
          } else if (role === 'PATIENT') {
            router.push('/patient');
          } else {
            // Fallback to login if role is unknown
            router.push('/login');
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
        router.push('/login');
      }
    };

    fetchAndRedirect();
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Welcome to {branding.client.name}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Redirecting to your dashboard...
        </p>
      </div>
    </div>
  );
}
