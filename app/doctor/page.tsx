/**
 * Doctor Dashboard Page
 * 
 * Shows today's appointments and statistics.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, CheckCircle, Clock, Users } from 'lucide-react';

interface DashboardStats {
  todayBookings: number;
  pendingCheckIns: number;
  completedToday: number;
}

export default function DoctorDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    todayBookings: 0,
    pendingCheckIns: 0,
    completedToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const response = await fetch(`/api/doctor/bookings?date=${today}`);
        
        if (response.ok) {
          const data = await response.json();
          const bookings = data.bookings || [];
          
          setStats({
            todayBookings: bookings.length,
            pendingCheckIns: bookings.filter(
              (b: any) => b.status === 'CONFIRMED' && !b.checkedInAt
            ).length,
            completedToday: bookings.filter(
              (b: any) => b.status === 'COMPLETED'
            ).length,
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Today's Appointments",
      value: stats.todayBookings,
      icon: Calendar,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pending Check-Ins',
      value: stats.pendingCheckIns,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Completed Today',
      value: stats.completedToday,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/doctor/bookings"
          className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">View All Bookings</h3>
              <p className="mt-1 text-sm text-gray-600">
                Manage patient check-ins and check-outs
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </Link>

        <Link
          href="/doctor/profile"
          className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">My Profile</h3>
              <p className="mt-1 text-sm text-gray-600">
                View and update your professional information
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </Link>
      </div>
    </div>
  );
}
