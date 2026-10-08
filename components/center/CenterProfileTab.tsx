'use client';

import { useState, useEffect } from 'react';
import { User, Phone, Mail, Save, Eye, EyeOff, AlertCircle, CheckCircle, Building2, MapPin, Clock } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
}

interface CenterData {
  centerName: string;
  category: string;
  address: string;
  centerEmail: string;
  centerPhone: string;
  licenseNumber: string;
  operatingHours: string;
  amenities: string[];
}

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

export default function CenterProfileTab() {
  const [ownerData, setOwnerData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
  });
  const [centerData, setCenterData] = useState<CenterData>({
    centerName: '',
    category: '',
    address: '',
    centerEmail: '',
    centerPhone: '',
    licenseNumber: '',
    operatingHours: '',
    amenities: [],
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch profile data
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        
        // Set owner data
        setOwnerData({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
        });

        // Set center data if exists
        if (data.profile) {
          setCenterData({
            centerName: data.profile.name || '',
            category: data.profile.category || '',
            address: data.profile.address || '',
            centerEmail: data.profile.email || '',
            centerPhone: data.profile.phone || '',
            licenseNumber: data.profile.licenseNumber || '',
            operatingHours: data.profile.operatingHours || '',
            amenities: data.profile.amenities || [],
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setCenterData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ownerData.name,
          phone: ownerData.phone,
          profileData: {
            name: centerData.centerName,
            category: centerData.category,
            address: centerData.address,
            email: centerData.centerEmail,
            phone: centerData.centerPhone,
            operatingHours: centerData.operatingHours,
            amenities: centerData.amenities,
          },
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        fetchProfile();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage(null);

    // Validate
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        const data = await response.json();
        setPasswordMessage({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Owner Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#D7E7F5] dark:bg-[#244766] rounded-lg">
            <User className="h-5 w-5 text-[#1769AA] dark:text-[#55A9E6]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Owner Information
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your personal account details
            </p>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg flex items-start gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${
              message.type === 'success'
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            }`}>
              {message.text}
            </p>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label htmlFor="ownerName" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Your Full Name *
            </label>
            <input
              id="ownerName"
              type="text"
              required
              value={ownerData.name}
              onChange={(e) => setOwnerData({ ...ownerData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="ownerEmail" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="ownerEmail"
                type="email"
                disabled
                value={ownerData.email}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label htmlFor="ownerPhone" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Your Phone Number
            </label>
            <PhoneInput
              international
              defaultCountry="SG"
              value={ownerData.phone}
              onChange={(value) => setOwnerData({ ...ownerData, phone: value || '' })}
              className="phone-input-custom w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus-within:ring-2 focus-within:ring-[#1769AA] transition"
            />
          </div>
        </form>
      </div>

      {/* Center Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#D7E7F5] dark:bg-[#244766] rounded-lg">
            <Building2 className="h-5 w-5 text-[#1769AA] dark:text-[#55A9E6]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Center Information
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your healthcare facility details
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label htmlFor="centerName" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Center Name *
            </label>
            <input
              id="centerName"
              type="text"
              required
              value={centerData.centerName}
              onChange={(e) => setCenterData({ ...centerData, centerName: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Category *
            </label>
            <select
              id="category"
              required
              value={centerData.category}
              onChange={(e) => setCenterData({ ...centerData, category: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Full Address *
            </label>
            <textarea
              id="address"
              required
              value={centerData.address}
              onChange={(e) => setCenterData({ ...centerData, address: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="centerEmail" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Center Email
              </label>
              <input
                id="centerEmail"
                type="email"
                value={centerData.centerEmail}
                onChange={(e) => setCenterData({ ...centerData, centerEmail: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="centerPhone" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Center Phone
              </label>
              <PhoneInput
                international
                defaultCountry="SG"
                value={centerData.centerPhone}
                onChange={(value) => setCenterData({ ...centerData, centerPhone: value || '' })}
                className="phone-input-custom w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus-within:ring-2 focus-within:ring-[#1769AA] transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="licenseNumber" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Medical License Number
            </label>
            <input
              id="licenseNumber"
              type="text"
              disabled
              value={centerData.licenseNumber}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              License number cannot be changed. Contact support if correction needed.
            </p>
          </div>

          <div>
            <label htmlFor="operatingHours" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Operating Hours
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="operatingHours"
                type="text"
                value={centerData.operatingHours}
                onChange={(e) => setCenterData({ ...centerData, operatingHours: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
                placeholder="Mon-Fri: 9AM-6PM, Sat: 9AM-2PM"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
              Amenities & Services
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableAmenities.map(amenity => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition ${
                    centerData.amenities.includes(amenity)
                      ? 'border-[#1769AA] bg-[#D7E7F5] dark:bg-[#244766] text-[#1769AA] dark:text-[#55A9E6]'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#1769AA] dark:hover:border-[#55A9E6] text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-[#1769AA] hover:bg-[#2F80B7] text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save All Changes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#D7E7F5] dark:bg-[#244766] rounded-lg">
            <Eye className="h-5 w-5 text-[#1769AA] dark:text-[#55A9E6]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Change Password
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update your account password
            </p>
          </div>
        </div>

        {passwordMessage && (
          <div className={`mb-4 p-4 rounded-lg flex items-start gap-2 ${
            passwordMessage.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            {passwordMessage.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${
              passwordMessage.type === 'success'
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            }`}>
              {passwordMessage.text}
            </p>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Current Password *
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              New Password *
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                required
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              At least 8 characters
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="flex items-center gap-2 px-6 py-3 bg-[#1769AA] hover:bg-[#2F80B7] text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Save className="h-4 w-4" />
            {passwordLoading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
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
