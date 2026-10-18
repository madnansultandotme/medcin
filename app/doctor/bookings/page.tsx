/**
 * Doctor Bookings Page
 * 
 * List all bookings with check-in/check-out actions.
 */

'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, User } from 'lucide-react';

interface Booking {
  id: string;
  reference: string;
  date: string;
  time: string;
  status: string;
  price: number;
  checkedInAt: string | null;
  checkedOutAt: string | null;
  patient: {
    name: string;
    email: string;
    phone: string | null;
  } | null;
  service: {
    name: string;
    duration: number;
  } | null;
  commissionAmount?: number;
  centerEarnings?: number;
}

export default function DoctorBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchBookings();
  }, [dateFilter]);

  async function fetchBookings() {
    try {
      setLoading(true);
      const response = await fetch(`/api/doctor/bookings?date=${dateFilter}`);
      
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      } else {
        setError('Failed to load bookings');
      }
    } catch (err) {
      setError('An error occurred while loading bookings');
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckIn(bookingId: string) {
    try {
      setActionLoading(bookingId);
      setError('');

      const response = await fetch('/api/doctor/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to check in patient');
        return;
      }

      // Refresh bookings
      await fetchBookings();
    } catch (err) {
      setError('An error occurred during check-in');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCheckOut(bookingId: string) {
    try {
      setActionLoading(bookingId);
      setError('');

      const response = await fetch('/api/doctor/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to check out patient');
        return;
      }

      // Refresh bookings
      await fetchBookings();
    } catch (err) {
      setError('An error occurred during check-out');
    } finally {
      setActionLoading(null);
    }
  }

  function getStatusBadge(booking: Booking) {
    if (booking.status === 'COMPLETED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </span>
      );
    }

    if (booking.checkedInAt && !booking.checkedOutAt) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Clock className="w-3 h-3 mr-1" />
          Checked In
        </span>
      );
    }

    if (booking.status === 'CONFIRMED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Awaiting Check-In
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {booking.status}
      </span>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Patient Bookings</h1>
        <p className="mt-2 text-gray-600">
          Manage patient check-ins and check-outs
        </p>
      </div>

      {/* Date Filter */}
      <div className="mb-6">
        <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Date
        </label>
        <input
          type="date"
          id="dateFilter"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-600">Loading bookings...</div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No appointments for the selected date.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.patient?.name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.patient?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.service?.name || 'General Consultation'}
                    </div>
                    {booking.service?.duration && (
                      <div className="text-sm text-gray-500">
                        {booking.service.duration} mins
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(booking)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    SGD {booking.price.toFixed(2)}
                    {booking.status === 'COMPLETED' && booking.commissionAmount !== undefined && (
                      <div className="text-xs text-gray-500 mt-1">
                        Commission: SGD {booking.commissionAmount.toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {booking.status === 'CONFIRMED' && !booking.checkedInAt && (
                      <button
                        onClick={() => handleCheckIn(booking.id)}
                        disabled={actionLoading === booking.id}
                        className="text-blue-600 hover:text-blue-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        {actionLoading === booking.id ? 'Processing...' : 'Check In'}
                      </button>
                    )}
                    {booking.checkedInAt && !booking.checkedOutAt && (
                      <button
                        onClick={() => handleCheckOut(booking.id)}
                        disabled={actionLoading === booking.id}
                        className="text-green-600 hover:text-green-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        {actionLoading === booking.id ? 'Processing...' : 'Check Out'}
                      </button>
                    )}
                    {booking.status === 'COMPLETED' && (
                      <span className="text-gray-400">No actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
