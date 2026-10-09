"use client";

import React, { useState, useEffect } from "react";
import { useBranding } from "@/lib/branding";
import Link from "next/link";
import {
  Calendar,
  Search,
  Heart,
  User,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface Stats {
  upcomingAppointments: number;
  completedAppointments: number;
  favoritesDoctors: number;
}

export default function PatientDashboardPage() {
  const { branding } = useBranding();
  const [stats, setStats] = useState<Stats>({
    upcomingAppointments: 0,
    completedAppointments: 0,
    favoritesDoctors: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const bookingsRes = await fetch('/api/bookings');
        
        if (bookingsRes.ok) {
          const bookings = await bookingsRes.json();
          const bookingsList = bookings.bookings || [];

          setStats({
            upcomingAppointments: bookingsList.filter((b: any) => 
              b.status === 'CONFIRMED' || b.status === 'PENDING'
            ).length,
            completedAppointments: bookingsList.filter((b: any) => 
              b.status === 'COMPLETED'
            ).length,
            favoritesDoctors: 0, // TODO: Implement favorites
          });
        }
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
      title: "Browse Doctors",
      description: "Find and book healthcare providers",
      href: "/patient/browse",
      icon: Search,
      color: "bg-blue-500",
    },
    {
      title: "My Appointments",
      description: `${stats.upcomingAppointments} upcoming appointments`,
      href: "/patient/appointments",
      icon: Calendar,
      color: "bg-green-500",
      badge: stats.upcomingAppointments > 0 ? stats.upcomingAppointments : null,
    },
    {
      title: "My Profile",
      description: "Manage your health information",
      href: "/patient/profile",
      icon: User,
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
      <div className="bg-gradient-to-r from-blue-500 to-teal-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome to {branding.client.name}
        </h1>
        <p className="text-blue-50 text-lg">
          Your health journey starts here
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Upcoming Visits</span>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.upcomingAppointments}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400 mt-2">
            Scheduled appointments
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Completed</span>
            <CheckCircle2 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.completedAppointments}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Total visits
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Favorites</span>
            <Heart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.favoritesDoctors}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Saved doctors
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <span>Go</span>
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Health Tip */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-teal-200 dark:border-teal-800">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          💡 Health Tip of the Day
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Regular health check-ups are essential for early detection and prevention of diseases. 
          Schedule your annual check-up today!
        </p>
      </div>
    </div>
  );
}
