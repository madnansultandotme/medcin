'use client';

/**
 * Device Verification Page
 * 
 * Prompts user to enter OTP sent via email for new device verification.
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export default function VerifyDevicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deviceId = searchParams.get('deviceId');

  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!deviceId) {
      router.push('/doctor');
    }
  }, [deviceId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId,
          otp: otp.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        throw new Error(data.error || 'Verification failed');
      }

      // Success - redirect to doctor dashboard
      router.push('/doctor');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setResendSuccess(false);
    setError(null);

    try {
      const response = await fetch('/api/auth/request-device-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setResendSuccess(true);
      setAttemptsRemaining(null);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const handleOtpChange = (value: string) => {
    // Only allow digits and limit to 6 characters
    const sanitized = value.replace(/\D/g, '').slice(0, 6);
    setOtp(sanitized);
  };

  if (!deviceId) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-[#102A43] rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <ShieldCheck className="w-8 h-8 text-[#1769AA]" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-[#102A43] dark:text-[#EAF5FF]">
              Device Verification
            </h1>
            <p className="text-[#5C7185] dark:text-[#A1B8CB]">
              We've sent a 6-digit code to your email address
            </p>
          </div>

          {/* Success Message for Resend */}
          {resendSuccess && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-600 dark:text-green-400 text-sm">
                ✓ Verification code resent successfully
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                {attemptsRemaining !== null && attemptsRemaining > 0 && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                    {attemptsRemaining} {attemptsRemaining === 1 ? 'attempt' : 'attempts'} remaining
                  </p>
                )}
              </div>
            </div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium mb-2 text-[#102A43] dark:text-[#EAF5FF]">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                value={otp}
                onChange={(e) => handleOtpChange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#D7E7F5] dark:border-[#244766] bg-white dark:bg-[#081B2D] text-[#102A43] dark:text-[#EAF5FF] text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
                placeholder="000000"
                maxLength={6}
                autoComplete="one-time-code"
                autoFocus
              />
              <p className="mt-2 text-xs text-[#5C7185] dark:text-[#A1B8CB] text-center">
                Enter the 6-digit code from your email
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 px-4 bg-[#1769AA] hover:bg-[#2F80B7] text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Device'
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#5C7185] dark:text-[#A1B8CB] mb-2">
              Didn't receive the code?
            </p>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resending}
              className="text-[#1769AA] dark:text-[#55A9E6] hover:text-[#2F80B7] dark:hover:text-[#72BCE8] font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? 'Resending...' : 'Resend Code'}
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-[#5C7185] dark:text-[#A1B8CB] text-center">
              <strong>Security Notice:</strong> This code expires in 10 minutes. 
              If you didn't attempt to log in, please change your password immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
