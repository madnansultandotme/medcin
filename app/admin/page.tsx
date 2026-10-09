"use client";

import React, { useState, useEffect } from "react";
import { useBranding } from "@/lib/branding";
import Link from "next/link";
import {
  Building2,
  Stethoscope,
  Calendar,
  AlertOctagon,
  Users,
  ArrowRight,
  TrendingUp,
  Activity,
} from "lucide-react";

interface Stats {
  totalBookings: number;
  activeCenters: number;
  pendingCenters: number;
  openDisputes: number;
  totalDoctors: number;
  activeBookings: number;
}

export default function AdminDashboardPage() {
  const { branding } = useBranding();
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    activeCenters: 0,
    pendingCenters: 0,
    openDisputes: 0,
    totalDoctors: 0,
    activeBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [centersRes, doctorsRes, bookingsRes, disputesRes] = await Promise.all([
          fetch('/api/centers'),
          fetch('/api/doctors'),
          fetch('/api/bookings'),
          fetch('/api/disputes'),
        ]);

        const centers = centersRes.ok ? await centersRes.json() : { centers: [] };
        const doctors = doctorsRes.ok ? await doctorsRes.json() : { doctors: [] };
        const bookings = bookingsRes.ok ? await bookingsRes.json() : { bookings: [] };
        const disputes = disputesRes.ok ? await disputesRes.json() : { disputes: [] };

        const centersList = centers.centers || [];
        const bookingsList = bookings.bookings || [];
        const disputesList = disputes.disputes || [];

        setStats({
          totalBookings: bookingsList.length,
          activeCenters: centersList.filter((c: any) => c.status === 'ACTIVE').length,
          pendingCenters: centersList.filter((c: any) => c.status === 'PENDING').length,
          openDisputes: disputesList.filter((d: any) => d.status === 'OPEN').length,
          totalDoctors: (doctors.doctors || []).length,
          activeBookings: bookingsList.filter((b: any) => 
            b.status === 'CONFIRMED' || b.status === 'PENDING'
          ).length,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const quickLinks = [
    {
      title: "Users Management",
      description: "Manage admin users and permissions",
      href: "/admin/users",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Centers Directory",
      description: `${stats.pendingCenters} pending approval`,
      href: "/admin/centers",
      icon: Building2,
      color: "bg-purple-500",
      badge: stats.pendingCenters > 0 ? stats.pendingCenters : null,
    },
    {
      title: "Doctors Network",
      description: `${stats.totalDoctors} registered doctors`,
      href: "/admin/doctors",
      icon: Stethoscope,
      color: "bg-teal-500",
    },
    {
      title: "Global Bookings",
      description: `${stats.totalBookings} total bookings`,
      href: "/admin/bookings",
      icon: Calendar,
      color: "bg-green-500",
    },
    {
      title: "Disputes & Claims",
      description: `${stats.openDisputes} open disputes`,
      href: "/admin/disputes",
      icon: AlertOctagon,
      color: "bg-red-500",
      badge: stats.openDisputes > 0 ? stats.openDisputes : null,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[var(--sage)] to-[var(--clay)] rounded-2xl p-8 text-white shadow-sm">
        <h1 className="text-3xl font-bold mb-2 font-sans-ledger">
          Welcome to {branding.client.name} Admin
        </h1>
        <p className="text-white/80 text-lg font-sans-ledger">
          Platform Operations Console for {branding.localization.targetRegion || "Southeast Asia"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--mist)] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--muted)] text-sm font-medium font-sans-ledger">Total Bookings</span>
            <Activity className="h-5 w-5 text-[var(--muted)]" />
          </div>
          <div className="text-3xl font-bold text-[var(--ink)] font-mono-ledger">
            {stats.totalBookings}
          </div>
          <div className="text-sm text-[var(--sage)] mt-2 flex items-center gap-1 font-sans-ledger">
            <TrendingUp className="h-4 w-4" />
            {stats.activeBookings} active
          </div>
        </div>

        <div className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--mist)] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--muted)] text-sm font-medium font-sans-ledger">Active Centers</span>
            <Building2 className="h-5 w-5 text-[var(--muted)]" />
          </div>
          <div className="text-3xl font-bold text-[var(--ink)] font-mono-ledger">
            {stats.activeCenters}
          </div>
          <div className="text-sm text-[var(--muted)] mt-2 font-sans-ledger">
            {stats.pendingCenters} pending approval
          </div>
        </div>

        <div className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--mist)] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--muted)] text-sm font-medium font-sans-ledger">Total Doctors</span>
            <Stethoscope className="h-5 w-5 text-[var(--muted)]" />
          </div>
          <div className="text-3xl font-bold text-[var(--ink)] font-mono-ledger">
            {stats.totalDoctors}
          </div>
          <div className="text-sm text-[var(--muted)] mt-2 font-sans-ledger">
            Across {stats.activeCenters} centers
          </div>
        </div>

        <div className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--mist)] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--muted)] text-sm font-medium font-sans-ledger">Open Disputes</span>
            <AlertOctagon className="h-5 w-5 text-[var(--muted)]" />
          </div>
          <div className="text-3xl font-bold text-[var(--ink)] font-mono-ledger">
            {stats.openDisputes}
          </div>
          <div className="text-sm text-[var(--muted)] mt-2 font-sans-ledger">
            Requiring attention
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group bg-[var(--surface)] rounded-2xl p-6 border border-[var(--mist)] hover:border-[var(--sage)] transition-all hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`${link.color} p-3 rounded-xl text-white shadow-sm`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  {link.badge && (
                    <span className="bg-[var(--clay)]/10 text-[var(--clay)] text-xs font-semibold px-2.5 py-1 rounded-full font-mono-ledger">
                      {link.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-[var(--ink)] mb-1 group-hover:text-[var(--sage)] transition-colors font-sans-ledger">
                  {link.title}
                </h3>
                <p className="text-sm text-[var(--muted)] mb-3 font-sans-ledger">
                  {link.description}
                </p>
                <div className="flex items-center text-[var(--sage)] text-sm font-medium font-sans-ledger">
                  <span>View details</span>
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
