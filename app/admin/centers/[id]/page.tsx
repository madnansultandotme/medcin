'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  Clock,
  Check,
  X,
  ArrowLeft,
  Calendar,
  Shield,
  AlertCircle,
  Image as ImageIcon,
  ExternalLink,
  Stethoscope,
  Briefcase,
  Star,
  Eye,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { useBranding } from '@/lib/branding';

interface CenterDetails {
  id: string;
  userId: string;
  name: string;
  category: string;
  address: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  logoUrl?: string;
  coverImageUrl?: string;
  operatingHours?: string;
  amenities?: string[];
  completedRegistration: boolean;
  submittedTime: string;
  createdAt: string;
  updatedAt: string;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

interface Doctor {
  id: string;
  name: string;
  role: string;
  category: string;
  price: number;
  rating: number;
  reviewsCount: number;
  licenseNumber: string;
  active: boolean;
  bio?: string;
  imageUrl?: string;
}

interface Service {
  id: string;
  doctorId: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
}

export default function CenterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { formatCurrency } = useBranding();
  const centerId = params.id as string;

  const [center, setCenter] = useState<CenterDetails | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: (() => void) | null;
    color: 'green' | 'red' | 'blue' | 'orange';
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: null,
    color: 'green',
  });

  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  useEffect(() => {
    async function fetchCenterDetails() {
      try {
        // Fetch center details
        const centersResponse = await fetch('/api/centers');
        if (!centersResponse.ok) throw new Error('Failed to fetch centers');
        
        const centersData = await centersResponse.json();
        const centerData = centersData.centers?.find((c: any) => c.id === centerId);
        
        if (!centerData) {
          setError('Center not found');
          setLoading(false);
          return;
        }
        
        setCenter(centerData);

        // Fetch user info
        const usersResponse = await fetch('/api/admin/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          const user = usersData.users?.find((u: any) => u.id === centerData.userId);
          if (user) setUserInfo(user);
        }

        // Fetch doctors for this center
        const doctorsResponse = await fetch(`/api/doctors?centerId=${centerId}`);
        if (doctorsResponse.ok) {
          const doctorsData = await doctorsResponse.json();
          setDoctors(doctorsData.doctors || []);
          
          // Fetch services for all doctors
          if (doctorsData.doctors && doctorsData.doctors.length > 0) {
            const allServices: Service[] = [];
            for (const doctor of doctorsData.doctors) {
              const servicesResponse = await fetch(`/api/services?doctorId=${doctor.id}`);
              if (servicesResponse.ok) {
                const servicesData = await servicesResponse.json();
                allServices.push(...(servicesData.services || []));
              }
            }
            setServices(allServices);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load center details');
      } finally {
        setLoading(false);
      }
    }

    if (centerId) {
      fetchCenterDetails();
    }
  }, [centerId]);

  const handleStatusChange = async (newStatus: 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED') => {
    if (!center) return;

    const dialogConfig = {
      APPROVED: {
        title: 'Approve Center',
        message: 'Are you sure you want to approve this center application? The center will gain access to the dashboard.',
        color: 'green' as const,
      },
      REJECTED: {
        title: 'Reject Application',
        message: 'Are you sure you want to reject this center application? This action will deny them access.',
        color: 'red' as const,
      },
      SUSPENDED: {
        title: 'Suspend Center',
        message: 'Are you sure you want to suspend this center? They will lose access to the dashboard immediately.',
        color: 'orange' as const,
      },
      UNDER_REVIEW: {
        title: 'Mark Under Review',
        message: 'Mark this center application as under review?',
        color: 'blue' as const,
      },
    };

    const config = dialogConfig[newStatus];

    setConfirmDialog({
      isOpen: true,
      title: config.title,
      message: config.message,
      color: config.color,
      action: async () => {
        setProcessing(true);
        setError(null);

        try {
          const response = await fetch('/api/centers', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: center.id,
              status: newStatus,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update status');
          }

          const result = await response.json();
          setCenter(result.center);
          
          setAlertDialog({
            isOpen: true,
            title: 'Status Updated',
            message: `Center status has been successfully updated to ${newStatus}.`,
            type: 'success',
          });
        } catch (err: any) {
          setAlertDialog({
            isOpen: true,
            title: 'Update Failed',
            message: err.message || 'Failed to update status',
            type: 'error',
          });
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const viewDoctorProfile = (doctorId: string) => {
    router.push(`/doctors/${doctorId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--sage)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--muted)]">Loading center details...</p>
        </div>
      </div>
    );
  }

  if (error && !center) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-[var(--ink)] mb-2">Error Loading Center</h2>
        <p className="text-[var(--muted)] mb-6">{error}</p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-6 py-2 bg-[var(--sage)] text-white rounded-lg hover:opacity-90 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
      </div>
    );
  }

  if (!center) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'APPROVED': return 'bg-green-100 text-green-700 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
      case 'SUSPENDED': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--ink)] transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Centers
        </button>

        <div className={`px-4 py-2 rounded-lg border ${getStatusColor(center.status)} font-semibold`}>
          {center.status}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Center Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover & Logo */}
          {(center.coverImageUrl || center.logoUrl) && (
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--mist)] overflow-hidden">
              {center.coverImageUrl && (
                <div className="h-48 bg-gray-100 relative">
                  <img
                    src={center.coverImageUrl}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {center.logoUrl && (
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={center.logoUrl}
                      alt={center.name}
                      className="w-20 h-20 rounded-xl object-cover border-2 border-[var(--mist)]"
                    />
                    <div>
                      <h2 className="text-xl font-bold text-[var(--ink)] font-sans-ledger">{center.name}</h2>
                      <p className="text-[var(--muted)] font-sans-ledger">{center.category}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--mist)] p-6">
            <h3 className="text-lg font-semibold text-[var(--ink)] mb-4 flex items-center gap-2 font-sans-ledger">
              <Building2 className="h-5 w-5" />
              Center Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[var(--muted)] font-medium block mb-1 font-sans-ledger">Center Name</label>
                <p className="text-[var(--ink)] font-sans-ledger">{center.name}</p>
              </div>

              <div>
                <label className="text-sm text-[var(--muted)] font-medium block mb-1 font-sans-ledger">Category</label>
                <p className="text-[var(--ink)] font-sans-ledger">{center.category}</p>
              </div>

              <div>
                <label className="text-sm text-[var(--muted)] font-medium block mb-1 font-sans-ledger">License Number</label>
                <p className="text-[var(--ink)] font-mono-ledger font-semibold">{center.licenseNumber}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[var(--muted)] font-medium block mb-1 font-sans-ledger">Registration Status</label>
                  <p className="text-[var(--ink)] font-sans-ledger">
                    {center.completedRegistration ? (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <Check className="h-4 w-4" />
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600">
                        <Clock className="h-4 w-4" />
                        Incomplete
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-[var(--muted)] font-medium block mb-1 font-sans-ledger">Submitted</label>
                  <p className="text-[var(--ink)] text-sm font-sans-ledger">
                    {new Date(center.submittedTime).toLocaleDateString('en-US', { 
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--mist)] p-6">
            <h3 className="text-lg font-semibold text-[var(--ink)] mb-4 flex items-center gap-2 font-sans-ledger">
              <Phone className="h-5 w-5" />
              Contact Information
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[var(--muted)] mt-0.5 flex-shrink-0" />
                <div>
                  <label className="text-sm text-[var(--muted)] font-medium block mb-1 font-sans-ledger">Address</label>
                  <p className="text-[var(--ink)] font-sans-ledger">{center.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-[var(--muted)] mt-0.5 flex-shrink-0" />
                <div>
                  <label className="text-sm text-[var(--muted)] font-medium block mb-1 font-sans-ledger">Email</label>
                  <a href={`mailto:${center.email}`} className="text-[var(--sage)] hover:underline font-sans-ledger">
                    {center.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-[var(--muted)] mt-0.5 flex-shrink-0" />
                <div>
                  <label className="text-sm text-[var(--muted)] font-medium block mb-1 font-sans-ledger">Phone</label>
                  <a href={`tel:${center.phone}`} className="text-[var(--sage)] hover:underline font-sans-ledger">
                    {center.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Operating Hours & Amenities */}
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--mist)] p-6">
            <h3 className="text-lg font-semibold text-[var(--ink)] mb-4 flex items-center gap-2 font-sans-ledger">
              <Clock className="h-5 w-5" />
              Operating Details
            </h3>
            
            <div className="space-y-4">
              {center.operatingHours && (
                <div>
                  <label className="text-sm text-[var(--muted)] font-medium block mb-2 font-sans-ledger">Operating Hours</label>
                  <p className="text-[var(--ink)] whitespace-pre-line font-sans-ledger">{center.operatingHours}</p>
                </div>
              )}

              {center.amenities && center.amenities.length > 0 && (
                <div>
                  <label className="text-sm text-[var(--muted)] font-medium block mb-2 font-sans-ledger">Amenities</label>
                  <div className="flex flex-wrap gap-2">
                    {center.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[var(--sage)]/10 text-[var(--sage)] rounded-lg text-sm font-sans-ledger"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Actions & User Info */}
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--mist)] p-6">
            <h3 className="text-lg font-semibold text-[var(--ink)] mb-4 font-sans-ledger">Actions</h3>
            
            <div className="space-y-3">
              {center.status !== 'APPROVED' && (
                <button
                  onClick={() => handleStatusChange('APPROVED')}
                  disabled={processing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="h-5 w-5" />
                  Approve Center
                </button>
              )}

              {center.status !== 'UNDER_REVIEW' && center.status !== 'APPROVED' && (
                <button
                  onClick={() => handleStatusChange('UNDER_REVIEW')}
                  disabled={processing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="h-5 w-5" />
                  Mark Under Review
                </button>
              )}

              {center.status !== 'REJECTED' && (
                <button
                  onClick={() => handleStatusChange('REJECTED')}
                  disabled={processing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-5 w-5" />
                  Reject Application
                </button>
              )}

              {center.status === 'APPROVED' && (
                <button
                  onClick={() => handleStatusChange('SUSPENDED')}
                  disabled={processing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Shield className="h-5 w-5" />
                  Suspend Center
                </button>
              )}
            </div>
          </div>

          {/* Owner Information */}
          {userInfo && (
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--mist)] p-6">
              <h3 className="text-lg font-semibold text-[var(--ink)] mb-4 font-sans-ledger">Owner Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-[var(--muted)] font-medium block mb-1 font-sans-ledger">Name</label>
                  <p className="text-[var(--ink)] font-sans-ledger">{userInfo.name}</p>
                </div>

                <div>
                  <label className="text-sm text-[var(--muted)] font-medium block mb-1 font-sans-ledger">Email</label>
                  <a href={`mailto:${userInfo.email}`} className="text-[var(--sage)] hover:underline text-sm font-sans-ledger">
                    {userInfo.email}
                  </a>
                </div>

                {userInfo.phone && (
                  <div>
                    <label className="text-sm text-[var(--muted)] font-medium block mb-1 font-sans-ledger">Phone</label>
                    <a href={`tel:${userInfo.phone}`} className="text-[var(--sage)] hover:underline text-sm font-sans-ledger">
                      {userInfo.phone}
                    </a>
                  </div>
                )}

                <div>
                  <label className="text-sm text-[var(--muted)] font-medium block mb-1 font-sans-ledger">User ID</label>
                  <p className="text-[var(--ink)] text-xs font-mono-ledger break-all">{userInfo.id}</p>
                </div>

                <div>
                  <label className="text-sm text-[var(--muted)] font-medium block mb-1 font-sans-ledger">Account Created</label>
                  <p className="text-[var(--ink)] text-sm font-sans-ledger">
                    {new Date(userInfo.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--mist)] p-6">
            <h3 className="text-lg font-semibold text-[var(--ink)] mb-4 font-sans-ledger">Metadata</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-[var(--muted)] font-medium block mb-1 font-sans-ledger">Center ID</label>
                <p className="text-[var(--ink)] font-mono-ledger break-all text-xs">{center.id}</p>
              </div>

              <div>
                <label className="text-[var(--muted)] font-medium block mb-1 font-sans-ledger">Created At</label>
                <p className="text-[var(--ink)] font-sans-ledger">
                  {new Date(center.createdAt).toLocaleString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>

              <div>
                <label className="text-[var(--muted)] font-medium block mb-1 font-sans-ledger">Last Updated</label>
                <p className="text-[var(--ink)] font-sans-ledger">
                  {new Date(center.updatedAt).toLocaleString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Doctors Section */}
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--mist)] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-[var(--ink)] flex items-center gap-2 font-sans-ledger">
            <Stethoscope className="h-5 w-5" />
            Doctors ({doctors.length})
          </h3>
        </div>

        {doctors.length === 0 ? (
          <div className="text-center py-12 text-[var(--muted)]">
            <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-sans-ledger">No doctors registered yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="border border-[var(--mist)] rounded-xl p-5 hover:border-[var(--sage)] transition-all bg-[var(--paper)]"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[var(--sage)]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {doctor.imageUrl ? (
                      <img src={doctor.imageUrl} alt={doctor.name} className="w-full h-full object-cover" />
                    ) : (
                      <Stethoscope className="h-7 w-7 text-[var(--sage)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[var(--ink)] font-sans-ledger truncate">{doctor.name}</h4>
                        <p className="text-sm text-[var(--muted)] font-sans-ledger">{doctor.role}</p>
                      </div>
                      <button
                        onClick={() => viewDoctorProfile(doctor.id)}
                        className="p-1.5 text-[var(--muted)] hover:text-[var(--sage)] hover:bg-[var(--sage)]/10 rounded-lg transition-colors flex-shrink-0"
                        title="View profile"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[var(--muted)] mb-2 font-sans-ledger">
                      <span className="px-2 py-0.5 bg-[var(--sage)]/10 text-[var(--sage)] rounded-md text-xs font-medium">
                        {doctor.category}
                      </span>
                      <span className={`text-xs ${doctor.active ? 'text-green-600' : 'text-red-600'}`}>
                        {doctor.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <span className="font-semibold text-[var(--ink)] font-sans-ledger">{doctor.rating.toFixed(1)}</span>
                        <span className="text-[var(--muted)] font-sans-ledger">({doctor.reviewsCount})</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-[var(--sage)] font-sans-ledger">{formatCurrency(doctor.price)}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-[var(--muted)] font-mono-ledger">
                      License: {doctor.licenseNumber}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Services Section */}
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--mist)] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-[var(--ink)] flex items-center gap-2 font-sans-ledger">
            <Briefcase className="h-5 w-5" />
            Services Offered ({services.length})
          </h3>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-12 text-[var(--muted)]">
            <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-sans-ledger">No services listed yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => {
              const doctor = doctors.find(d => d.id === service.doctorId);
              return (
                <div
                  key={service.id}
                  className="border border-[var(--mist)] rounded-xl p-4 hover:border-[var(--sage)] transition-all bg-[var(--paper)]"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[var(--ink)] font-sans-ledger mb-1">{service.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-[var(--muted)] font-sans-ledger">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(service.duration)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {service.description && (
                    <p className="text-sm text-[var(--muted)] mb-3 line-clamp-2 font-sans-ledger">
                      {service.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--mist)]">
                    <div className="text-sm text-[var(--muted)] font-sans-ledger">
                      {doctor ? doctor.name : 'Unknown Doctor'}
                    </div>
                    <div className="text-lg font-bold text-[var(--sage)] font-sans-ledger">
                      {formatCurrency(service.price)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.action || (() => {})}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmColor={confirmDialog.color}
        confirmText="Confirm"
        cancelText="Cancel"
      />

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
      />
    </div>
  );
}
