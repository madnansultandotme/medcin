'use client';

import { useState, useEffect } from 'react';
import { User, Phone, Mail, Save, Eye, EyeOff, AlertCircle, CheckCircle, MapPin, Heart, UserPlus, Shield } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
}

interface PatientData {
  location: string;
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
  medicalNotes: string;
  insuranceProvider: string;
  insurancePolicy: string;
  preferredLanguage: string;
}

const languages = [
  'English',
  'Mandarin',
  'Malay',
  'Tamil',
  'Thai',
  'Bahasa Indonesia',
  'Vietnamese',
  'Japanese',
  'Korean',
];

export default function PatientProfileTab() {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
  });
  const [patientData, setPatientData] = useState<PatientData>({
    location: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    medicalNotes: '',
    insuranceProvider: '',
    insurancePolicy: '',
    preferredLanguage: 'English',
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
        
        // Set user data
        setProfileData({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
        });

        // Set patient profile data if exists
        if (data.profile) {
          setPatientData({
            location: data.profile.location || '',
            emergencyName: data.profile.emergencyName || '',
            emergencyRelation: data.profile.emergencyRelation || '',
            emergencyPhone: data.profile.emergencyPhone || '',
            medicalNotes: data.profile.medicalNotes || '',
            insuranceProvider: data.profile.insuranceProvider || '',
            insurancePolicy: data.profile.insurancePolicy || '',
            preferredLanguage: data.profile.preferredLanguage || 'English',
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
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
          name: profileData.name,
          phone: profileData.phone,
          profileData: patientData,
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
      {/* Personal Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#D7E7F5] dark:bg-[#244766] rounded-lg">
            <User className="h-5 w-5 text-[#1769AA] dark:text-[#55A9E6]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Personal Information
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your basic account details
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
            <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Full Name *
            </label>
            <input
              id="name"
              type="text"
              required
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                disabled
                value={profileData.email}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Phone Number
            </label>
            <PhoneInput
              international
              defaultCountry="SG"
              value={profileData.phone}
              onChange={(value) => setProfileData({ ...profileData, phone: value || '' })}
              className="phone-input-custom w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus-within:ring-2 focus-within:ring-[#1769AA] transition"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Location / City
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="location"
                type="text"
                value={patientData.location}
                onChange={(e) => setPatientData({ ...patientData, location: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
                placeholder="Singapore, Bangkok, Kuala Lumpur"
              />
            </div>
          </div>

          <div>
            <label htmlFor="preferredLanguage" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Preferred Language
            </label>
            <select
              id="preferredLanguage"
              value={patientData.preferredLanguage}
              onChange={(e) => setPatientData({ ...patientData, preferredLanguage: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Medical Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#D7E7F5] dark:bg-[#244766] rounded-lg">
            <Heart className="h-5 w-5 text-[#1769AA] dark:text-[#55A9E6]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Medical Information
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Important health details for your care providers
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label htmlFor="medicalNotes" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Medical Notes / Allergies
            </label>
            <textarea
              id="medicalNotes"
              value={patientData.medicalNotes}
              onChange={(e) => setPatientData({ ...patientData, medicalNotes: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
              rows={4}
              placeholder="Any allergies, chronic conditions, medications, or important medical history..."
            />
          </div>
        </form>
      </div>

      {/* Emergency Contact */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#D7E7F5] dark:bg-[#244766] rounded-lg">
            <UserPlus className="h-5 w-5 text-[#1769AA] dark:text-[#55A9E6]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Emergency Contact
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Person to contact in case of emergency
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label htmlFor="emergencyName" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Contact Name
            </label>
            <input
              id="emergencyName"
              type="text"
              value={patientData.emergencyName}
              onChange={(e) => setPatientData({ ...patientData, emergencyName: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="emergencyRelation" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Relationship
            </label>
            <input
              id="emergencyRelation"
              type="text"
              value={patientData.emergencyRelation}
              onChange={(e) => setPatientData({ ...patientData, emergencyRelation: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
              placeholder="Spouse, Parent, Sibling, Friend"
            />
          </div>

          <div>
            <label htmlFor="emergencyPhone" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Contact Phone
            </label>
            <PhoneInput
              international
              defaultCountry="SG"
              value={patientData.emergencyPhone}
              onChange={(value) => setPatientData({ ...patientData, emergencyPhone: value || '' })}
              className="phone-input-custom w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus-within:ring-2 focus-within:ring-[#1769AA] transition"
            />
          </div>
        </form>
      </div>

      {/* Insurance Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#D7E7F5] dark:bg-[#244766] rounded-lg">
            <Shield className="h-5 w-5 text-[#1769AA] dark:text-[#55A9E6]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Insurance Information
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your health insurance details
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label htmlFor="insuranceProvider" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Insurance Provider
            </label>
            <input
              id="insuranceProvider"
              type="text"
              value={patientData.insuranceProvider}
              onChange={(e) => setPatientData({ ...patientData, insuranceProvider: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
              placeholder="AIA, Prudential, Great Eastern, etc."
            />
          </div>

          <div>
            <label htmlFor="insurancePolicy" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Policy Number
            </label>
            <input
              id="insurancePolicy"
              type="text"
              value={patientData.insurancePolicy}
              onChange={(e) => setPatientData({ ...patientData, insurancePolicy: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition"
              placeholder="Policy or membership number"
            />
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
