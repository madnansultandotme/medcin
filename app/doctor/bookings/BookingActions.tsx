'use client';

/**
 * Booking Actions Component (Client)
 * 
 * Check-in and check-out buttons for patient bookings.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BookingActionsProps {
  booking: any;
}

export default function BookingActions({ booking }: BookingActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckIn = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/doctor/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to check in');
        setLoading(false);
        return;
      }

      router.refresh();
    } catch (err) {
      setError('Network error');
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/doctor/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to check out');
        setLoading(false);
        return;
      }

      router.refresh();
    } catch (err) {
      setError('Network error');
      setLoading(false);
    }
  };

  // Show completed badge
  if (booking.status === 'COMPLETED') {
    return (
      <span className="text-green-600 font-medium">
        ✓ Completed
      </span>
    );
  }

  // Show check-out button if checked in
  if (booking.checkedInAt && !booking.checkedOutAt) {
    return (
      <div>
        <button
          onClick={handleCheckOut}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
        >
          {loading ? 'Processing...' : 'Check Out'}
        </button>
        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  // Show check-in button if confirmed
  if (booking.status === 'CONFIRMED' && !booking.checkedInAt) {
    return (
      <div>
        <button
          onClick={handleCheckIn}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          {loading ? 'Processing...' : 'Check In'}
        </button>
        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  return <span className="text-gray-400 text-sm">No actions</span>;
}
