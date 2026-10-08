'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function PatientSignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.name, 'PATIENT', formData.phone);
      router.push('/patient');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#1769AA] dark:hover:text-gray-200 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to signup options
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex rounded-full bg-[#D7E7F5] dark:bg-[#244766] p-3 mb-4">
              <User className="h-8 w-8 text-[#1769AA] dark:text-[#55A9E6]" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-[#102A43] dark:text-[#EAF5FF]">Patient Sign Up</h1>
            <p className="text-[#5C7185] dark:text-[#A1B8CB]">
              Create your account to book appointments
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2 text-[#102A43] dark:text-[#EAF5FF]">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-[#D7E7F5] dark:border-[#244766] bg-white dark:bg-[#102A43] text-[#102A43] dark:text-[#EAF5FF] focus:ring-2 focus:ring-[#1769AA] dark:focus:ring-[#55A9E6] focus:border-transparent transition"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-[#102A43] dark:text-[#EAF5FF]">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-[#D7E7F5] dark:border-[#244766] bg-white dark:bg-[#102A43] text-[#102A43] dark:text-[#EAF5FF] focus:ring-2 focus:ring-[#1769AA] dark:focus:ring-[#55A9E6] focus:border-transparent transition"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2 text-[#102A43] dark:text-[#EAF5FF]">
                Phone Number
              </label>
              <PhoneInput
                international
                defaultCountry="SG"
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value || '' })}
                className="phone-input-custom w-full px-4 py-3 rounded-lg border border-[#D7E7F5] dark:border-[#244766] bg-white dark:bg-[#102A43] text-[#102A43] dark:text-[#EAF5FF] focus-within:ring-2 focus-within:ring-[#1769AA] dark:focus-within:ring-[#55A9E6] transition"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-[#102A43] dark:text-[#EAF5FF]">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-[#D7E7F5] dark:border-[#244766] bg-white dark:bg-[#102A43] text-[#102A43] dark:text-[#EAF5FF] focus:ring-2 focus:ring-[#1769AA] dark:focus:ring-[#55A9E6] focus:border-transparent transition"
                  placeholder="••••••••"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C7185] hover:text-[#1769AA] dark:text-[#A1B8CB] dark:hover:text-[#55A9E6] transition"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-[#5C7185] dark:text-[#A1B8CB]">
                At least 8 characters
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-[#102A43] dark:text-[#EAF5FF]">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-[#D7E7F5] dark:border-[#244766] bg-white dark:bg-[#102A43] text-[#102A43] dark:text-[#EAF5FF] focus:ring-2 focus:ring-[#1769AA] dark:focus:ring-[#55A9E6] focus:border-transparent transition"
                  placeholder="••••••••"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C7185] hover:text-[#1769AA] dark:text-[#A1B8CB] dark:hover:text-[#55A9E6] transition"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#1769AA] hover:bg-[#2F80B7] text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Creating Account...' : 'Create Patient Account'}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm text-[#5C7185] dark:text-[#A1B8CB]">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-[#1769AA] dark:text-[#55A9E6] hover:text-[#2F80B7] dark:hover:text-[#72BCE8] font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <style jsx global>{`
        .phone-input-custom input {
          border: none !important;
          background: transparent !important;
          outline: none !important;
          font-size: 1rem;
          padding: 0;
        }
        .phone-input-custom .PhoneInputCountry {
          margin-right: 0.5rem;
        }
      `}</style>
    </div>
  );
}
