'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { Building2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function CenterSignupPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Owner Info
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    // Center Info
    centerName: '',
    category: '',
    address: '',
    centerEmail: '',
    centerPhone: '',
    licenseNumber: '',
    operatingHours: '',
    amenities: [] as string[],
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { signUp } = useAuth();
  const router = useRouter();

  const categories = [
    'Multi-Specialty Clinic',
    'Dental Clinic',
    'Eye Care Center',
    'Physiotherapy Center',
    'Diagnostic Center',
    'General Practice',
    'Pediatric Clinic',
    'Women\'s Health Clinic',
  ];

  const availableAmenities = [
    'Parking',
    'Wheelchair Access',
    'Pharmacy',
    'Lab Services',
    'Emergency Care',
    'Online Consultation',
    'Home Visit',
    'Insurance Accepted',
  ];

  const handleNext = () => {
    if (step === 1) {
      // Validate step 1
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all required fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
    }
    setError(null);
    setStep(2);
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate step 2
    if (!formData.centerName || !formData.category || !formData.address || !formData.licenseNumber) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create auth account
      await signUp(formData.email, formData.password, formData.name, 'CENTER', formData.phone);

      // Step 2: Create center profile
      const response = await fetch('/api/centers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.centerName,
          category: formData.category,
          address: formData.address,
          email: formData.centerEmail || formData.email,
          phone: formData.centerPhone || formData.phone,
          licenseNumber: formData.licenseNumber,
          operatingHours: formData.operatingHours || 'Mon-Fri: 9AM-6PM',
          amenities: formData.amenities,
          status: 'PENDING', // Awaiting admin approval
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create center profile');
      }

      // Redirect to under review page
      router.push('/center/under-review');
    } catch (err: any) {
      setError(err.message || 'Failed to complete registration');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-2xl">
        {/* Back Link */}
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 text-sm text-[#5C7185] dark:text-[#A1B8CB] hover:text-[#1769AA] dark:hover:text-[#55A9E6] mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to signup options
        </Link>

        <div className="bg-white dark:bg-[#102A43] rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex rounded-full bg-[#D7E7F5] dark:bg-[#244766] p-3 mb-4">
              <Building2 className="h-8 w-8 text-[#1769AA] dark:text-[#55A9E6]" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-[#102A43] dark:text-[#EAF5FF]">Register Your Healthcare Center</h1>
            <p className="text-[#5C7185] dark:text-[#A1B8CB]">
              Step {step} of 2: {step === 1 ? 'Your Information' : 'Center Details'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex gap-2">
              <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-[#1769AA]' : 'bg-[#D7E7F5] dark:bg-[#244766]'}`} />
              <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-[#1769AA]' : 'bg-[#D7E7F5] dark:bg-[#244766]'}`} />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Owner Information */}
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-[#102A43] dark:text-[#EAF5FF]">
                  Your Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-[#D7E7F5] dark:border-[#244766] bg-white dark:bg-[#081B2D] text-[#102A43] dark:text-[#EAF5FF] focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
                  placeholder="Dr. John Smith"
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
                  className="w-full px-4 py-3 rounded-lg border border-[#D7E7F5] dark:border-[#244766] bg-white dark:bg-[#081B2D] text-[#102A43] dark:text-[#EAF5FF] focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
                  placeholder="john@clinic.com"
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
                  className="phone-input-custom w-full px-4 py-3 rounded-lg border border-[#D7E7F5] dark:border-[#244766] bg-white dark:bg-[#081B2D] text-[#102A43] dark:text-[#EAF5FF] focus-within:ring-2 focus-within:ring-[#1769AA] transition"
                  placeholder="+65 1234 5678"
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
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-[#D7E7F5] dark:border-[#244766] bg-white dark:bg-[#081B2D] text-[#102A43] dark:text-[#EAF5FF] focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
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
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-[#D7E7F5] dark:border-[#244766] bg-white dark:bg-[#081B2D] text-[#102A43] dark:text-[#EAF5FF] focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
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
                className="w-full py-3 px-4 bg-[#1769AA] hover:bg-[#2F80B7] text-white font-semibold rounded-lg transition shadow-sm"
              >
                Continue to Center Details
              </button>
            </form>
          )}

          {/* Step 2: Center Details */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="centerName" className="block text-sm font-medium mb-2 text-[#102A43] dark:text-[#EAF5FF]">
                  Center Name *
                </label>
                <input
                  id="centerName"
                  type="text"
                  required
                  value={formData.centerName}
                  onChange={(e) => setFormData({ ...formData, centerName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-[#D7E7F5] dark:border-[#244766] bg-white dark:bg-[#081B2D] text-[#102A43] dark:text-[#EAF5FF] focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
                  placeholder="City Wellness Medical Center"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-2 text-[#102A43] dark:text-[#EAF5FF]">
                  Category *
                </label>
                <select
                  id="category"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-[#D7E7F5] dark:border-[#244766] bg-white dark:bg-[#081B2D] text-[#102A43] dark:text-[#EAF5FF] focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-2 text-[#102A43] dark:text-[#EAF5FF]">
                  Full Address *
                </label>
                <textarea
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-[#D7E7F5] dark:border-[#244766] bg-white dark:bg-[#081B2D] text-[#102A43] dark:text-[#EAF5FF] focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
                  placeholder="123 Health Street, Medical District, City, State, ZIP"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="centerEmail" className="block text-sm font-medium mb-2 text-[#102A43] dark:text-[#EAF5FF]">
                    Center Email
                  </label>
                  <input
                    id="centerEmail"
                    type="email"
                    value={formData.centerEmail}
                    onChange={(e) => setFormData({ ...formData, centerEmail: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-[#D7E7F5] dark:border-[#244766] bg-white dark:bg-[#081B2D] text-[#102A43] dark:text-[#EAF5FF] focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
                    placeholder="info@center.com"
                  />
                </div>

                <div>
                  <label htmlFor="centerPhone" className="block text-sm font-medium mb-2 text-[#102A43] dark:text-[#EAF5FF]">
                    Center Phone
                  </label>
                  <PhoneInput
                    international
                    defaultCountry="SG"
                    value={formData.centerPhone}
                    onChange={(value) => setFormData({ ...formData, centerPhone: value || '' })}
                    className="phone-input-custom w-full px-4 py-3 rounded-lg border border-[#D7E7F5] dark:border-[#244766] bg-white dark:bg-[#081B2D] text-[#102A43] dark:text-[#EAF5FF] focus-within:ring-2 focus-within:ring-[#1769AA] transition"
                    placeholder="+65 1234 5678"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="licenseNumber" className="block text-sm font-medium mb-2 text-[#102A43] dark:text-[#EAF5FF]">
                  Medical License Number *
                </label>
                <input
                  id="licenseNumber"
                  type="text"
                  required
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-[#D7E7F5] dark:border-[#244766] bg-white dark:bg-[#081B2D] text-[#102A43] dark:text-[#EAF5FF] focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
                  placeholder="MLC-2024-001"
                />
              </div>

              <div>
                <label htmlFor="operatingHours" className="block text-sm font-medium mb-2 text-[#102A43] dark:text-[#EAF5FF]">
                  Operating Hours
                </label>
                <input
                  id="operatingHours"
                  type="text"
                  value={formData.operatingHours}
                  onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-[#D7E7F5] dark:border-[#244766] bg-white dark:bg-[#081B2D] text-[#102A43] dark:text-[#EAF5FF] focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
                  placeholder="Mon-Fri: 9AM-6PM, Sat: 9AM-2PM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-[#102A43] dark:text-[#EAF5FF]">
                  Amenities
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableAmenities.map(amenity => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition ${
                        formData.amenities.includes(amenity)
                          ? 'border-[#1769AA] bg-[#D7E7F5] dark:bg-[#244766] text-[#1769AA] dark:text-[#55A9E6]'
                          : 'border-[#D7E7F5] dark:border-[#244766] hover:border-[#1769AA] dark:hover:border-[#55A9E6] text-[#102A43] dark:text-[#EAF5FF]'
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 px-4 border-2 border-[#D7E7F5] dark:border-[#244766] text-[#102A43] dark:text-[#EAF5FF] font-semibold rounded-lg hover:bg-[#D7E7F5] dark:hover:bg-[#244766] transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-[#1769AA] hover:bg-[#2F80B7] text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? 'Submitting...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          )}

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
