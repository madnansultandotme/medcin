'use client';

import { useState, useRef } from 'react';
import { Save, Upload, X, Camera } from 'lucide-react';

interface DoctorFormData {
  name: string;
  role: string;
  category: string;
  price: number;
  licenseNumber: string;
  bio: string;
  imageUrl: string;
  active: boolean;
}

interface DoctorFormProps {
  initialData?: Partial<DoctorFormData>;
  onSubmit: (data: DoctorFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

const MEDICAL_CATEGORIES = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Orthopedic',
  'Neurologist',
  'Dentist',
  'Gynecologist',
  'Psychiatrist',
  'ENT Specialist',
  'Ophthalmologist',
  'Urologist',
  'Endocrinologist',
  'Gastroenterologist',
  'Pulmonologist',
];

export function DoctorForm({ initialData, onSubmit, onCancel, isEditing = false }: DoctorFormProps) {
  const [formData, setFormData] = useState<DoctorFormData>({
    name: initialData?.name || '',
    role: initialData?.role || '',
    category: initialData?.category || '',
    price: initialData?.price || 0,
    licenseNumber: initialData?.licenseNumber || '',
    bio: initialData?.bio || '',
    imageUrl: initialData?.imageUrl || '',
    active: initialData?.active ?? true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      // Get presigned upload URL
      const uploadUrlResponse = await fetch('/api/upload?action=get-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder: 'doctors',
        }),
      });

      if (!uploadUrlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, publicUrl } = await uploadUrlResponse.json();

      // Upload to storage
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      setImagePreview(publicUrl);
      setFormData({ ...formData, imageUrl: publicUrl });
    } catch (err) {
      setError('Failed to upload image');
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, imageUrl: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to save doctor');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Profile Photo */}
      <div>
        <label className="block text-sm font-medium text-[var(--ink)] mb-3 font-sans-ledger">
          Profile Photo
        </label>
        <div className="flex items-center gap-4">
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Doctor"
                className="w-24 h-24 rounded-xl object-cover border-2 border-[var(--mist)]"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-xl bg-[var(--sage)]/10 flex items-center justify-center border-2 border-dashed border-[var(--mist)]">
              <Camera className="w-8 h-8 text-[var(--muted)]" />
            </div>
          )}
          <div>
            <p className="text-sm text-[var(--muted)] mb-2 font-sans-ledger">
              JPG, PNG or WebP. Max 5MB. Recommended: 400x400px
            </p>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--sage)] text-white rounded-lg hover:opacity-90 cursor-pointer transition text-sm font-medium font-sans-ledger">
              <Upload className="w-4 h-4" />
              {uploadingImage ? 'Uploading...' : imagePreview ? 'Change Photo' : 'Upload Photo'}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                className="hidden"
                disabled={uploadingImage}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-[var(--ink)] mb-2 font-sans-ledger">
          Doctor Name *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)] focus:ring-2 focus:ring-[var(--sage)] focus:border-transparent transition font-sans-ledger"
          placeholder="Dr. John Smith"
        />
      </div>

      {/* Role/Title */}
      <div>
        <label className="block text-sm font-medium text-[var(--ink)] mb-2 font-sans-ledger">
          Role/Title *
        </label>
        <input
          type="text"
          required
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)] focus:ring-2 focus:ring-[var(--sage)] focus:border-transparent transition font-sans-ledger"
          placeholder="Senior Consultant, Chief Physician, etc."
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-[var(--ink)] mb-2 font-sans-ledger">
          Medical Category *
        </label>
        <select
          required
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)] focus:ring-2 focus:ring-[var(--sage)] focus:border-transparent transition font-sans-ledger"
        >
          <option value="">Select specialty</option>
          {MEDICAL_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* License Number */}
      <div>
        <label className="block text-sm font-medium text-[var(--ink)] mb-2 font-sans-ledger">
          Medical License Number *
        </label>
        <input
          type="text"
          required
          value={formData.licenseNumber}
          onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)] focus:ring-2 focus:ring-[var(--sage)] focus:border-transparent transition font-mono-ledger"
          placeholder="MED-2024-001"
        />
      </div>

      {/* Consultation Price */}
      <div>
        <label className="block text-sm font-medium text-[var(--ink)] mb-2 font-sans-ledger">
          Consultation Price ($) *
        </label>
        <input
          type="number"
          required
          min="0"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
          className="w-full px-4 py-3 rounded-xl border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)] focus:ring-2 focus:ring-[var(--sage)] focus:border-transparent transition font-mono-ledger"
          placeholder="100.00"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-[var(--ink)] mb-2 font-sans-ledger">
          Professional Bio (Optional)
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)] focus:ring-2 focus:ring-[var(--sage)] focus:border-transparent transition font-sans-ledger resize-none"
          placeholder="Professional background, experience, education, etc."
        />
      </div>

      {/* Active Status */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="active"
          checked={formData.active}
          onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
          className="w-4 h-4 text-[var(--sage)] rounded focus:ring-[var(--sage)]"
        />
        <label htmlFor="active" className="text-sm text-[var(--ink)] font-sans-ledger">
          Active (accepting appointments)
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 border-2 border-[var(--mist)] text-[var(--ink)] font-semibold rounded-xl hover:bg-[var(--paper)] transition font-sans-ledger"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || uploadingImage}
          className="flex-1 px-4 py-3 bg-[var(--sage)] text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-sans-ledger"
        >
          <Save className="h-4 w-4" />
          {submitting ? 'Saving...' : isEditing ? 'Update Doctor' : 'Add Doctor'}
        </button>
      </div>
    </form>
  );
}
