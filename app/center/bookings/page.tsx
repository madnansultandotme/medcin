"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Search, Check, X } from "lucide-react";

interface Booking {
  id: string;
  reference: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  price: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  patientNotes?: string;
  createdAt: string;
}

export default function CenterBookingsPage() {
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

  const handleConfirm = async (bookingId: string) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, status: 'CONFIRMED' }),
      });

      if (response.ok) {
        setBookings(prev => prev.map(b => 
          b.id === bookingId ? { ...b, status: 'CONFIRMED' as const } : b
        ));
      }
    } catch (error) {
      console.error('Failed to confirm booking:', error);
    }
  };

  const handleCancel = async (bookingId: string) => {
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

  const pendingBookings = filteredBookings.filter(b => b.status === 'PENDING');

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bookings & Appointments</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage incoming patient appointments
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === "all"
              ? "bg-teal-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-teal-500"
          }`}
        >
          All Status
        </button>
        <button
          onClick={() => setStatusFilter("PENDING")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === "PENDING"
              ? "bg-amber-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-amber-500"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setStatusFilter("CONFIRMED")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === "CONFIRMED"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-blue-500"
          }`}
        >
          Confirmed
        </button>
        <button
          onClick={() => setStatusFilter("COMPLETED")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === "COMPLETED"
              ? "bg-green-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-green-500"
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setStatusFilter("CANCELLED")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === "CANCELLED"
              ? "bg-red-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-red-500"
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Pending Bookings */}
      {pendingBookings.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>Pending Requests</span>
            <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-sm px-2.5 py-0.5 rounded-full">
              {pendingBookings.length}
            </span>
          </h2>
          
          <div className="space-y-4">
            {pendingBookings.map((booking) => (
              <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{booking.reference}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {booking.date} at {booking.time}
                    </p>
                  </div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${booking.price}
                  </span>
                </div>
                
                {booking.patientNotes && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Note: {booking.patientNotes}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleConfirm(booking.id)}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Confirm
                  </button>
                  <button
                    onClick={() => handleCancel(booking.id)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Bookings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-750">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {booking.reference}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {booking.date} at {booking.time}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    ${booking.price}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      booking.status === 'CONFIRMED' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      booking.status === 'PENDING' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                      booking.status === 'COMPLETED' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredBookings.length === 0 && (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">No bookings found</div>
        )}
      </div>
    </div>
  );
}
