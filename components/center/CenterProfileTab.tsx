'use client';

import { useState, useEffect } from 'react';
import { User, Phone, Mail, Save, Eye, EyeOff, AlertCircle, CheckCircle, Building2, MapPin, Clock, Upload, Image as ImageIcon, X } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { ASEAN_COUNTRIES, getCitiesForCountry, formatFullAddress } from '@/lib/data/locations';
import { PlacesAutocomplete } from '@/components/maps/PlacesAutocomplete';
import { MapDisplay } from '@/components/maps/MapDisplay';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  photoUrl?: string;
}

interface CenterData {
  centerName: string;
  category: string;
  city: string;
  country: string;
  streetAddress: string;
  address: string; // Legacy full address
  latitude?: number;
  longitude?: number;
  placeId?: string;
  formattedAddress?: string;
  centerEmail: string;
  centerPhone: string;
  licenseNumber: string;
  operatingHours: string;
  amenities: string[];
  logoUrl?: string;
  coverImageUrl?: string;
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
    photoUrl: '',
  });
  const [centerData, setCenterData] = useState<CenterData>({
    centerName: '',
    category: '',
    city: 'Singapore',
    country: 'SG',
    streetAddress: '',
    address: '',
    latitude: undefined,
    longitude: undefined,
    placeId: '',
    formattedAddress: '',
    centerEmail: '',
    centerPhone: '',
    licenseNumber: '',
    operatingHours: '',
    amenities: [],
    logoUrl: '',
    coverImageUrl: '',
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
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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
          photoUrl: data.user.photoUrl || '',
        });

        // Set center data if exists
        if (data.profile) {
          console.log('Center profile data:', data.profile);
          setCenterData({
            centerName: data.profile.name || '',
            category: data.profile.category || '',
            city: data.profile.city || 'Singapore',
            country: data.profile.country || 'SG',
            streetAddress: data.profile.streetAddress || '',
            address: data.profile.address || '',
            latitude: data.profile.latitude,
            longitude: data.profile.longitude,
            placeId: data.profile.placeId || '',
            formattedAddress: data.profile.formattedAddress || '',
            centerEmail: data.profile.email || '',
            centerPhone: data.profile.phone || '',
            licenseNumber: data.profile.licenseNumber || '',
            operatingHours: data.profile.operatingHours || '',
            amenities: data.profile.amenities || [],
            logoUrl: data.profile.logoUrl || '',
            coverImageUrl: data.profile.coverImageUrl || '',
          });
          console.log('Logo URL:', data.profile.logoUrl);
          console.log('Cover URL:', data.profile.coverImageUrl);
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleImageUpload = async (file: File, type: 'logo' | 'cover' | 'photo') => {
    try {
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select an image file' });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image must be less than 5MB' });
        return;
      }

      if (type === 'logo') {
        setUploadingLogo(true);
      } else if (type === 'cover') {
        setUploadingCover(true);
      } else {
        setUploadingPhoto(true);
      }
      setMessage(null);

      // Step 1: Get presigned upload URL
      const uploadUrlResponse = await fetch('/api/upload?action=get-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder: type === 'logo' ? 'center-logos' : type === 'cover' ? 'center-covers' : 'profile-photos',
        }),
      });

      if (!uploadUrlResponse.ok) {
        const error = await uploadUrlResponse.json();
        throw new Error(error.error || 'Failed to get upload URL');
      }

      const { uploadUrl, method, publicUrl } = await uploadUrlResponse.json();

      // Step 2: Upload file directly to presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: method || 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // Step 3: Update state with public URL
      if (type === 'logo') {
        setCenterData(prev => ({ ...prev, logoUrl: publicUrl }));
      } else if (type === 'cover') {
        setCenterData(prev => ({ ...prev, coverImageUrl: publicUrl }));
      } else {
        setOwnerData(prev => ({ ...prev, photoUrl: publicUrl }));
      }

      setMessage({ type: 'success', text: `${type === 'logo' ? 'Logo' : type === 'cover' ? 'Cover image' : 'Profile photo'} uploaded successfully!` });
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to upload image' });
    } finally {
      if (type === 'logo') {
        setUploadingLogo(false);
      } else if (type === 'cover') {
        setUploadingCover(false);
      } else {
        setUploadingPhoto(false);
      }
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
          photoUrl: ownerData.photoUrl,
          profileData: {
            name: centerData.centerName,
            category: centerData.category,
            city: centerData.city,
            country: centerData.country,
            streetAddress: centerData.streetAddress,
            address: centerData.formattedAddress || formatFullAddress(centerData.city, centerData.country, centerData.streetAddress),
            latitude: centerData.latitude,
            longitude: centerData.longitude,
            placeId: centerData.placeId,
            formattedAddress: centerData.formattedAddress,
            email: centerData.centerEmail,
            phone: centerData.centerPhone,
            operatingHours: centerData.operatingHours,
            amenities: centerData.amenities,
            logoUrl: centerData.logoUrl,
            coverImageUrl: centerData.coverImageUrl,
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
          {/* Profile Photo Upload */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Profile Photo
            </label>
            {ownerData.photoUrl && ownerData.photoUrl.trim() !== '' ? (
              <div className="space-y-3">
                <div className="relative inline-block">
                  <img
                    src={ownerData.photoUrl}
                    alt="Profile photo"
                    className="w-24 h-24 object-cover rounded-full border-2 border-gray-200 dark:border-gray-700"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="photoChange"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'photo');
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="photoChange"
                    className={`inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition font-medium ${
                      uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setOwnerData({ ...ownerData, photoUrl: '' })}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
                    disabled={uploadingPhoto}
                  >
                    <X className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    id="photoUpload"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'photo');
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="photoUpload"
                    className={`inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg cursor-pointer transition font-medium ${
                      uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Recommended: Square image, max 5MB
                  </p>
                </div>
              </div>
            )}
          </div>

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

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Center Logo
            </label>
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 mb-2">
                Logo URL: {centerData.logoUrl || '(empty)'}
              </div>
            )}
            {centerData.logoUrl && centerData.logoUrl.trim() !== '' ? (
              <div className="space-y-3">
                <div className="relative inline-block">
                  <img
                    src={centerData.logoUrl}
                    alt="Center logo"
                    className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="logoChange"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'logo');
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="logoChange"
                    className={`inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition font-medium ${
                      uploadingLogo ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    {uploadingLogo ? 'Uploading...' : 'Change Logo'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setCenterData({ ...centerData, logoUrl: '' })}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
                    disabled={uploadingLogo}
                  >
                    <X className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    id="logoUpload"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'logo');
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="logoUpload"
                    className={`inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg cursor-pointer transition font-medium ${
                      uploadingLogo ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Recommended: Square image, max 5MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Cover Image
            </label>
            {centerData.coverImageUrl && centerData.coverImageUrl.trim() !== '' ? (
              <div className="space-y-3">
                <div className="relative">
                  <img
                    src={centerData.coverImageUrl}
                    alt="Center cover"
                    className="w-full h-48 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="coverChange"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'cover');
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="coverChange"
                    className={`inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition font-medium ${
                      uploadingCover ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    {uploadingCover ? 'Uploading...' : 'Change Cover'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setCenterData({ ...centerData, coverImageUrl: '' })}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
                    disabled={uploadingCover}
                  >
                    <X className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <input
                    type="file"
                    id="coverUpload"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'cover');
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="coverUpload"
                    className={`inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg cursor-pointer transition font-medium ${
                      uploadingCover ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    {uploadingCover ? 'Uploading...' : 'Upload Cover Image'}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Recommended: 1200x400px, max 5MB
                  </p>
                </div>
              </div>
            )}
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

          {/* Google Places Autocomplete for Address */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Location * (Search for your center)
            </label>
            <PlacesAutocomplete
              onPlaceSelect={(place) => {
                // Map country code to our system
                const countryMapping: Record<string, string> = {
                  'SG': 'SG',
                  'TH': 'TH',
                  'MY': 'MY',
                  'VN': 'VN',
                  'ID': 'ID',
                  'PH': 'PH',
                };
                
                setCenterData({
                  ...centerData,
                  country: countryMapping[place.countryCode] || 'SG',
                  city: place.city,
                  streetAddress: place.streetAddress,
                  address: place.formattedAddress,
                  latitude: place.latitude,
                  longitude: place.longitude,
                  placeId: place.placeId,
                  formattedAddress: place.formattedAddress,
                });
              }}
              defaultValue={centerData.formattedAddress || centerData.address}
              placeholder="Search for your center location (e.g., Medical Tower Bangkok)"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Start typing to search for your center's address
            </p>
          </div>

          {/* Map Display */}
          {centerData.latitude && centerData.longitude && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Map Location
              </label>
              <MapDisplay
                latitude={centerData.latitude}
                longitude={centerData.longitude}
                title={centerData.centerName}
                height="250px"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Click "Open in Maps" to verify the location
              </p>
            </div>
          )}

          {/* Manual Override (Optional) */}
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#1769AA] transition">
              Advanced: Manual Address Entry
            </summary>
            <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="country" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Country
                  </label>
                  <select
                    id="country"
                    value={centerData.country}
                    onChange={(e) => {
                      const newCountry = e.target.value;
                      const cities = getCitiesForCountry(newCountry);
                      setCenterData({ 
                        ...centerData, 
                        country: newCountry,
                        city: cities.length > 0 ? cities[0].name : ''
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition text-sm"
                  >
                    {Object.entries(ASEAN_COUNTRIES).map(([code, country]) => (
                      <option key={code} value={code}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="city" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    City
                  </label>
                  <select
                    id="city"
                    value={centerData.city}
                    onChange={(e) => setCenterData({ ...centerData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition text-sm"
                  >
                    {getCitiesForCountry(centerData.country).map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="streetAddress" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Street Address
                </label>
                <textarea
                  id="streetAddress"
                  value={centerData.streetAddress}
                  onChange={(e) => setCenterData({ ...centerData, streetAddress: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition text-sm"
                  placeholder="Building number, street name, unit/suite number"
                  rows={2}
                />
              </div>
            </div>
          </details>

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
