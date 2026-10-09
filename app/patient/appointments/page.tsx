"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, X } from "lucide-react";

interface Booking {
  id: string;
  reference: string;
  doctorId: string;
  date: string;
  time: string;
  price: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  patientNotes?: string;
  createdAt: string;
}

export default function PatientAppointmentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await fetch('/api/bookings');
        if (response.ok) {
          const data = await response.json();
          setBookings(data.bookings || []);
        }
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, status: 'CANCELLED' }),
      });

      if (response.ok) {
        setBookings(prev => prev.map(b => 
          b.id === bookingId ? { ...b, status: 'CANCELLED' as const } : b
        ));
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  const filteredBookings = bookings.filter(b => 
    statusFilter === "all" || b.status === statusFilter
  );

  const upcomingBookings = filteredBookings.filter(b => 
    b.status === 'CONFIRMED' || b.status === 'PENDING'
  );

  const pastBookings = filteredBookings.filter(b => 
    b.status === 'COMPLETED' || b.status === 'CANCELLED'
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Appointments</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your scheduled and past appointments
        </p>
      </div>

      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">All Appointments</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Upcoming Appointments */}
      {upcomingBookings.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Upcoming Appointments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingBookings.map((booking) => (
              <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      booking.status === 'CONFIRMED' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${booking.price}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>{booking.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>{booking.time}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                  Ref: {booking.reference}
                </div>

                {booking.status !== 'CANCELLED' && (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    className="w-full px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel Appointment
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Appointments */}
      {pastBookings.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Past Appointments
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
            {pastBookings.map((booking) => (
              <div key={booking.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        booking.status === 'COMPLETED' 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>{booking.date} at {booking.time}</span>
                      <span className="text-xs">Ref: {booking.reference}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${booking.price}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredBookings.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No appointments found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start by browsing our healthcare providers
          </p>
          <a
            href="/patient/browse"
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Browse Doctors
          </a>
        </div>
      )}
    </div>
  );
}
