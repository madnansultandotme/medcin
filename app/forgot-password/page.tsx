'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MedcinLogo } from '@/components/MedcinLogo';
import { useBranding } from '@/lib/branding';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { branding } = useBranding();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--paper)] via-[var(--mist)] to-[var(--sage)]/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <MedcinLogo size="lg" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-[var(--mist)]">
          {!success ? (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[var(--sage)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-[var(--sage)]" />
                </div>
                <h1 className="text-2xl font-sans-ledger font-bold text-[var(--ink)] mb-2">
                  Forgot Password?
                </h1>
                <p className="text-sm text-[var(--muted)]">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[var(--ink)] mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-[var(--mist)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--sage)] focus:border-transparent transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[var(--sage)] text-white rounded-xl font-sans-ledger font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="text-sm text-[var(--sage)] hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-sans-ledger font-bold text-[var(--ink)] mb-2">
                Check Your Email
              </h2>
              <p className="text-sm text-[var(--muted)] mb-6">
                We've sent a password reset link to <strong>{email}</strong>.
                Please check your inbox and follow the instructions.
              </p>
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="block w-full py-3 bg-[var(--sage)] text-white rounded-xl font-sans-ledger font-semibold hover:opacity-90 transition text-center"
                >
                  Return to Login
                </Link>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="block w-full py-3 border border-[var(--mist)] text-[var(--ink)] rounded-xl font-sans-ledger font-semibold hover:bg-[var(--paper)] transition"
                >
                  Try Another Email
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-[var(--muted)]">
            Need help?{' '}
            <a href="mailto:support@medcin.com" className="text-[var(--sage)] hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
