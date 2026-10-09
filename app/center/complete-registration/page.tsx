'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Building2, CheckCircle, Upload, X, Camera } from 'lucide-react';
import { OperatingHoursInput, scheduleToString, stringToSchedule, type WeeklySchedule } from '@/components/center/OperatingHoursInput';

export default function CompleteCenterRegistrationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingCenter, setFetchingCenter] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [centerData, setCenterData] = useState<any>(null);
  const [formData, setFormData] = useState({
    logoUrl: '',
    coverImageUrl: '',
    operatingHours: null as WeeklySchedule | null,
    amenities: [] as string[],
  });

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

  useEffect(() => {
    async function fetchCenterData() {
      try {
        const response = await fetch('/api/centers');
        if (response.ok) {
          const data = await response.json();
          const userCenter = data.centers?.find((c: any) => c.userId === user?.id);
          
          if (userCenter) {
            setCenterData(userCenter);
            setFormData({
              logoUrl: userCenter.logoUrl || '',
              coverImageUrl: userCenter.coverImageUrl || '',
              operatingHours: userCenter.operatingHours 
                ? stringToSchedule(userCenter.operatingHours) 
                : null,
              amenities: userCenter.amenities || [],
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch center:', error);
        setError('Failed to load center information');
      } finally {
        setFetchingCenter(false);
      }
    }

    if (user) {
      fetchCenterData();
    }
  }, [user]);

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = async (file: File, type: 'logo' | 'cover') => {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }

      setError(null);
      setLoading(true);

      // Step 1: Get presigned upload URL
      const uploadUrlResponse = await fetch('/api/upload?action=get-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder: 'centers',
        }),
      });

      if (!uploadUrlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, publicUrl } = await uploadUrlResponse.json();

      // Step 2: Upload to storage
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // Update form data
      if (type === 'logo') {
        setFormData({ ...formData, logoUrl: publicUrl });
      } else {
        setFormData({ ...formData, coverImageUrl: publicUrl });
      }
    } catch (error) {
      setError(`Failed to upload ${type} image`);
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Update center with completed registration
      const response = await fetch('/api/centers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: centerData.id,
          logoUrl: formData.logoUrl,
          coverImageUrl: formData.coverImageUrl,
          operatingHours: formData.operatingHours ? scheduleToString(formData.operatingHours) : centerData.operatingHours,
          amenities: formData.amenities,
          completedRegistration: true, // Mark as complete
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update center');
      }

      setSuccess(true);
      
      // Redirect to under-review page after 2 seconds
      setTimeout(() => {
        router.push('/center/under-review');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to complete registration');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCenter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--paper)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--sage)] mx-auto mb-4"></div>
          <p className="text-[var(--muted)]">Loading center information...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--paper)]">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="inline-flex rounded-full bg-green-100 p-4 mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--ink)] mb-2">Registration Complete!</h2>
          <p className="text-[var(--muted)] mb-4">
            Your center profile has been updated successfully. Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex rounded-full bg-[var(--sage)]/10 p-3 mb-4">
            <Building2 className="h-8 w-8 text-[var(--sage)]" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--ink)] mb-2 font-sans-ledger">
            Complete Your Center Registration
          </h1>
          <p className="text-[var(--muted)] font-sans-ledger">
            Add additional details to complete your center profile
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Center Info Card */}
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--mist)] p-6">
            <h2 className="text-lg font-semibold text-[var(--ink)] mb-4 font-sans-ledger">
              Center Information
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Name:</span>
                <span className="text-[var(--ink)] font-medium">{centerData?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Category:</span>
                <span className="text-[var(--ink)] font-medium">{centerData?.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">License:</span>
                <span className="text-[var(--ink)] font-medium font-mono-ledger">{centerData?.licenseNumber}</span>
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--mist)] p-6">
            <h3 className="text-lg font-semibold text-[var(--ink)] mb-4 font-sans-ledger">
              Center Logo
            </h3>
            <div className="flex items-center gap-6">
              {formData.logoUrl ? (
                <div className="relative">
                  <img
                    src={formData.logoUrl}
                    alt="Center Logo"
                    className="w-24 h-24 rounded-xl object-cover border-2 border-[var(--mist)]"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, logoUrl: '' })}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl bg-[var(--sage)]/10 flex items-center justify-center border-2 border-dashed border-[var(--mist)]">
                  <Camera className="w-8 h-8 text-[var(--muted)]" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm text-[var(--muted)] mb-3">
                  JPG, PNG or WebP. Max size 5MB. Recommended: 200x200px
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--sage)] text-white rounded-lg hover:opacity-90 cursor-pointer transition">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">Upload Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Cover Image Upload */}
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--mist)] p-6">
            <h3 className="text-lg font-semibold text-[var(--ink)] mb-4 font-sans-ledger">
              Cover Image
            </h3>
            <div className="space-y-4">
              {formData.coverImageUrl ? (
                <div className="relative">
                  <img
                    src={formData.coverImageUrl}
                    alt="Cover Image"
                    className="w-full h-48 rounded-xl object-cover border-2 border-[var(--mist)]"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, coverImageUrl: '' })}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-full h-48 rounded-xl bg-[var(--sage)]/5 flex flex-col items-center justify-center border-2 border-dashed border-[var(--mist)]">
                  <Camera className="w-12 h-12 text-[var(--muted)] mb-2" />
                  <p className="text-sm text-[var(--muted)]">No cover image uploaded</p>
                </div>
              )}
              <div>
                <p className="text-sm text-[var(--muted)] mb-3">
                  JPG, PNG or WebP. Max size 5MB. Recommended: 1200x400px
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--sage)] text-white rounded-lg hover:opacity-90 cursor-pointer transition">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">Upload Cover Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cover')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--mist)] p-6">
            <OperatingHoursInput
              value={formData.operatingHours || undefined}
              onChange={(schedule) => setFormData({ ...formData, operatingHours: schedule })}
            />
          </div>

          {/* Amenities */}
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--mist)] p-6">
            <h3 className="text-lg font-semibold text-[var(--ink)] mb-4 font-sans-ledger">
              Amenities & Services
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {availableAmenities.map(amenity => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition ${
                    formData.amenities.includes(amenity)
                      ? 'border-[var(--sage)] bg-[var(--sage)]/10 text-[var(--sage)]'
                      : 'border-[var(--mist)] hover:border-[var(--sage)] text-[var(--ink)]'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/center/under-review')}
              className="flex-1 py-3 px-4 border-2 border-[var(--mist)] text-[var(--ink)] font-semibold rounded-xl hover:bg-[var(--paper)] transition"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-[var(--sage)] text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
