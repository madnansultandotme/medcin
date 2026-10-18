"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Search, Check, X, LogIn, LogOut } from "lucide-react";

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
  checkedInAt?: string | null;
  checkedOutAt?: string | null;
  commissionAmount?: number | null;
  centerEarnings?: number | null;
  commissionStatus?: string | null;
  createdAt: string;
}

export default function CenterBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleCheckIn = async (bookingId: string) => {
    setActionLoading(bookingId);
    setError(null);
    
    try {
      const response = await fetch('/api/center/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json();

      if (response.ok) {
        setBookings(prev => prev.map(b => 
          b.id === bookingId ? { ...b, checkedInAt: data.booking.checkedInAt } : b
        ));
      } else {
        setError(data.error || 'Failed to check in patient');
      }
    } catch (error) {
      console.error('Failed to check in:', error);
      setError('Failed to check in patient');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckOut = async (bookingId: string) => {
    setActionLoading(bookingId);
    setError(null);
    
    try {
      const response = await fetch('/api/center/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json();

      if (response.ok) {
        setBookings(prev => prev.map(b => 
          b.id === bookingId ? { 
            ...b, 
            checkedOutAt: data.booking.checkedOutAt,
            status: 'COMPLETED' as const,
            commissionAmount: data.booking.commissionAmount,
            centerEarnings: data.booking.centerEarnings,
            commissionStatus: data.booking.commissionStatus,
          } : b
        ));
      } else {
        setError(data.error || 'Failed to check out patient');
      }
    } catch (error) {
      console.error('Failed to check out:', error);
      setError('Failed to check out patient');
    } finally {
      setActionLoading(null);
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
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <X className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 dark:text-red-200 font-medium">Error</p>
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {booking.reference}
                    {booking.commissionAmount !== null && booking.commissionAmount !== undefined && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Commission: ${booking.commissionAmount.toFixed(2)} | 
                        Earnings: ${booking.centerEarnings?.toFixed(2) || '0.00'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {booking.date} at {booking.time}
                    {booking.checkedInAt && (
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        ✓ Checked in
                      </div>
                    )}
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
                  <td className="px-6 py-4">
                    {booking.status === 'CONFIRMED' && !booking.checkedInAt && (
                      <button
                        onClick={() => handleCheckIn(booking.id)}
                        disabled={actionLoading === booking.id}
                        className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                      >
                        {actionLoading === booking.id ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <LogIn className="h-4 w-4" />
                            Check In
                          </>
                        )}
                      </button>
                    )}
                    {booking.status === 'CONFIRMED' && booking.checkedInAt && !booking.checkedOutAt && (
                      <button
                        onClick={() => handleCheckOut(booking.id)}
                        disabled={actionLoading === booking.id}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                      >
                        {actionLoading === booking.id ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <LogOut className="h-4 w-4" />
                            Check Out
                          </>
                        )}
                      </button>
                    )}
                    {booking.status === 'COMPLETED' && booking.checkedOutAt && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Completed
                      </span>
                    )}
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
