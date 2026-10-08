"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBranding } from "@/lib/branding";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  User,
  Building2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function PortalPage() {
  const router = useRouter();
  const { branding } = useBranding();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [fetchingRole, setFetchingRole] = useState(true);

  // Fetch user role from database
  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          const role = data.user?.role;
          setUserRole(role);

          // Auto-route based on role
          if (role === 'ADMIN') {
            router.push('/admin');
          } else if (role === 'CENTER') {
            router.push('/center');
          } else if (role === 'PATIENT') {
            router.push('/patient');
          }
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
      } finally {
        setFetchingRole(false);
      }
    };

    fetchUserRole();
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || fetchingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  // Fallback: Manual role selector (only shown if auto-routing didn't work)
  // This handles edge cases or allows manual override

  // Role selection interface for authenticated users
  const handleRoleSelect = (role: 'patient' | 'center' | 'admin') => {
    if (role === 'patient') {
      router.push('/patient');
    } else if (role === 'center') {
      router.push('/center');
    } else {
      router.push('/admin');
    }
  };

  const roles = [
    {
      id: 'patient' as const,
      title: 'Patient Portal',
      description: 'Book appointments, manage your health records, and connect with healthcare providers',
      icon: User,
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'center' as const,
      title: 'Healthcare Center',
      description: 'Manage your clinic, doctors, appointments, and patient interactions',
      icon: Building2,
      color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      id: 'admin' as const,
      title: 'Admin Dashboard',
      description: 'Platform management, analytics, user oversight, and system configuration',
      icon: ShieldCheck,
      color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
            Welcome to {branding.client.name}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {user?.name ? `Hello, ${user.name}!` : 'Hello!'} Select your workspace to continue
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className={`${role.color} group relative overflow-hidden rounded-2xl border-2 p-8 text-left transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-500/50`}
              >
                {/* Icon */}
                <div className={`${role.iconColor} mb-6 inline-flex rounded-xl bg-white/50 dark:bg-gray-900/50 p-4 backdrop-blur-sm`}>
                  <Icon className="h-8 w-8" />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {role.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {role.description}
                  </p>
                </div>

                {/* Arrow */}
                <div className="mt-6 flex items-center justify-between">
                  <span className={`${role.iconColor} text-sm font-semibold`}>
                    Continue
                  </span>
                  <ArrowRight className={`${role.iconColor} h-5 w-5 transition-transform group-hover:translate-x-1`} />
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-white/10" />
              </button>
            );
          })}
        </div>

        {/* User Info Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Logged in as: <span className="font-semibold text-gray-700 dark:text-gray-300">{user?.email}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
