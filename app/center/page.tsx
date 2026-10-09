"use client";

import React, { useState, useEffect } from "react";
import { useBranding } from "@/lib/branding";
import Link from "next/link";
import {
  Stethoscope,
  Calendar,
  Briefcase,
  TrendingUp,
  Users,
  Clock,
  ArrowRight,
} from "lucide-react";

interface Stats {
  totalDoctors: number;
  activeDoctors: number;
  totalBookings: number;
  pendingBookings: number;
  totalServices: number;
}

export default function CenterDashboardPage() {
  const { branding } = useBranding();
  const [stats, setStats] = useState<Stats>({
    totalDoctors: 0,
    activeDoctors: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalServices: 0,
  });
  const [centerName, setCenterName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [centersRes, doctorsRes, bookingsRes, servicesRes] = await Promise.all([
          fetch('/api/centers'),
          fetch('/api/doctors'),
          fetch('/api/bookings'),
          fetch('/api/services'),
        ]);

        const centers = centersRes.ok ? await centersRes.json() : { centers: [] };
        const doctors = doctorsRes.ok ? await doctorsRes.json() : { doctors: [] };
        const bookings = bookingsRes.ok ? await bookingsRes.json() : { bookings: [] };
        const services = servicesRes.ok ? await servicesRes.json() : { services: [] };

        // Get user's center
        const userCenters = centers.centers || [];
        if (userCenters.length > 0) {
          setCenterName(userCenters[0].name);
        }

        const doctorsList = doctors.doctors || [];
        const bookingsList = bookings.bookings || [];

        setStats({
          totalDoctors: doctorsList.length,
          activeDoctors: doctorsList.filter((d: any) => d.active).length,
          totalBookings: bookingsList.length,
          pendingBookings: bookingsList.filter((b: any) => b.status === 'PENDING').length,
          totalServices: (services.services || []).length,
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
      title: "Manage Doctors",
      description: `${stats.totalDoctors} doctors in your team`,
      href: "/center/doctors",
      icon: Stethoscope,
      color: "bg-teal-500",
    },
    {
      title: "Doctor Availability & Slots",
      description: "Set up appointment schedules",
      href: "/center/slots",
      icon: Clock,
      color: "bg-indigo-500",
    },
    {
      title: "Bookings & Appointments",
      description: `${stats.pendingBookings} pending requests`,
      href: "/center/bookings",
      icon: Calendar,
      color: "bg-blue-500",
      badge: stats.pendingBookings > 0 ? stats.pendingBookings : null,
    },
    {
      title: "Services & Pricing",
      description: `${stats.totalServices} services offered`,
      href: "/center/services",
      icon: Briefcase,
      color: "bg-purple-500",
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
      <div className="bg-gradient-to-r from-purple-500 to-teal-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {centerName || "Center Dashboard"}
        </h1>
        <p className="text-purple-50 text-lg">
          Manage your practice, doctors, and patient appointments
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Doctors</span>
            <Stethoscope className="h-5 w-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalDoctors}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400 mt-2">
            {stats.activeDoctors} active
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Bookings</span>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalBookings}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            All time
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Pending Requests</span>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.pendingBookings}
          </div>
          <div className="text-sm text-amber-600 dark:text-amber-400 mt-2">
            Needs attention
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Services</span>
            <Briefcase className="h-5 w-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalServices}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Available offerings
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-500 transition-all hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`${link.color} p-3 rounded-lg text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  {link.badge && (
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {link.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {link.description}
                </p>
                <div className="flex items-center text-teal-600 dark:text-teal-400 text-sm font-medium">
                  <span>Manage</span>
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
