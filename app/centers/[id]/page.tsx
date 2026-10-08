"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, MapPin, ArrowLeft, Building2, Stethoscope, Phone, Mail, Clock } from "lucide-react";
import { useBranding } from "@/lib/branding";

interface Center {
  id: string;
  name: string;
  category: string;
  address: string;
  email: string;
  phone: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  logoUrl?: string;
  coverImageUrl?: string;
  operatingHours?: string;
}

interface Doctor {
  id: string;
  name: string;
  role: string;
  category: string;
  price: number;
  rating: number;
  reviewsCount: number;
  bio?: string;
  imageUrl?: string;
  active: boolean;
  centerId: string;
}

export default function CenterProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { formatCurrency } = useBranding();
  
  const [center, setCenter] = useState<Center | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCenterData() {
      try {
        setLoading(true);
        
        // Fetch all centers and find the one we need
        const centersRes = await fetch('/api/centers');
        if (centersRes.ok) {
          const centersData = await centersRes.json();
          const foundCenter = centersData.centers?.find((c: Center) => c.id === params.id);
          
          if (foundCenter) {
            setCenter(foundCenter);
            
            // Fetch doctors for this center
            const doctorsRes = await fetch(`/api/doctors?centerId=${foundCenter.id}`);
            if (doctorsRes.ok) {
              const doctorsData = await doctorsRes.json();
              setDoctors(doctorsData.doctors || []);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch center data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchCenterData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--clay)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--muted)]">Loading center profile...</p>
        </div>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-[var(--muted)] mx-auto mb-4" />
          <p className="text-[var(--muted)] mb-4">Center not found</p>
          <button
            onClick={() => router.push('/patient')}
            className="text-[var(--clay)] hover:underline"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  const averageRating = doctors.length > 0
    ? doctors.reduce((sum, d) => sum + d.rating, 0) / doctors.length
    : 0;

  const totalReviews = doctors.reduce((sum, d) => sum + d.reviewsCount, 0);

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {/* Header */}
      <div className="bg-[var(--surface)] border-b border-[var(--mist)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--ink)] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold">Back</span>
          </button>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Center Logo */}
            <div className="w-32 h-32 rounded-3xl bg-white border-2 border-[var(--mist)] p-4 flex items-center justify-center flex-none overflow-hidden shadow-lg">
              {center.logoUrl ? (
                <img src={center.logoUrl} alt={center.name} className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-12 h-12 text-[var(--clay)]" />
              )}
            </div>

            {/* Center Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl sm:text-4xl font-bold text-[var(--ink)]">
                      {center.name}
                    </h1>
                    {center.status === "ACTIVE" && (
                      <span className="badge-ledger badge-confirmed text-xs font-semibold px-3 py-1 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-lg text-[var(--clay)] font-semibold mb-2">
                    {center.category} Practice
                  </p>
                  <div className="flex items-center gap-4 text-sm text-[var(--muted)] flex-wrap">
                    {doctors.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-[var(--amber)] fill-current" />
                        <span className="font-bold text-[var(--ink)]">{averageRating.toFixed(1)}</span>
                        <span>({totalReviews} reviews)</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4" />
                      <span>{doctors.length} {doctors.length === 1 ? 'Doctor' : 'Doctors'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-[var(--muted)]">
                  <MapPin className="w-4 h-4 flex-none" />
                  <span>{center.address}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--muted)]">
                  <Phone className="w-4 h-4 flex-none" />
                  <span>{center.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--muted)]">
                  <Mail className="w-4 h-4 flex-none" />
                  <span>{center.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Doctors */}
            <div className="rounded-3xl bg-[var(--surface)] border border-[var(--mist)] p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-[var(--ink)] mb-6">
                Our Medical Team ({doctors.length})
              </h2>
              
              {doctors.length === 0 ? (
                <p className="text-[var(--muted)] text-center py-8">
                  No doctors listed yet
                </p>
              ) : (
                <div className="space-y-4">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      onClick={() => router.push(`/doctors/${doctor.id}`)}
                      className="p-5 rounded-2xl border border-[var(--mist)] bg-[var(--paper)] hover:border-[var(--clay)]/40 transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--clay)]/10 text-[var(--clay)] border border-[var(--clay)]/20 flex items-center justify-center font-mono-ledger text-base font-bold flex-none overflow-hidden shadow-xs">
                          {doctor.imageUrl ? (
                            <img src={doctor.imageUrl} alt={doctor.name} className="w-full h-full object-cover" />
                          ) : (
                            <Stethoscope className="w-6 h-6" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg text-[var(--ink)]">
                              {doctor.name}
                            </h3>
                            <div className="flex items-center gap-1 text-[var(--amber)] text-xs font-mono-ledger font-medium">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span className="font-bold">{doctor.rating.toFixed(1)}</span>
                              <span className="text-[var(--muted)]">({doctor.reviewsCount})</span>
                            </div>
                          </div>

                          <div className="text-sm font-medium text-[var(--clay)] mb-2">
                            {doctor.role}
                          </div>

                          {doctor.bio && (
                            <p className="text-sm text-[var(--muted)] line-clamp-2">
                              {doctor.bio}
                            </p>
                          )}
                        </div>

                        <div className="text-right flex-none">
                          <div className="text-xs uppercase font-semibold font-mono-ledger text-[var(--muted)] mb-0.5">
                            From
                          </div>
                          <div className="font-mono-ledger text-lg font-bold text-[var(--sage)]">
                            {formatCurrency(doctor.price)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="rounded-3xl bg-[var(--surface)] border border-[var(--mist)] p-6 shadow-sm sticky top-6">
              <h3 className="text-lg font-bold text-[var(--ink)] mb-4">Clinic Information</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-xs uppercase font-semibold text-[var(--muted)] mb-1">
                    Category
                  </div>
                  <div className="font-semibold text-[var(--ink)]">{center.category}</div>
                </div>
                
                {center.operatingHours && (
                  <div>
                    <div className="text-xs uppercase font-semibold text-[var(--muted)] mb-1">
                      Operating Hours
                    </div>
                    <div className="text-[var(--ink)]">{center.operatingHours}</div>
                  </div>
                )}

                <div>
                  <div className="text-xs uppercase font-semibold text-[var(--muted)] mb-1">
                    Status
                  </div>
                  <span className={`badge-ledger text-xs font-semibold px-3 py-1 rounded-full ${
                    center.status === "ACTIVE" ? "badge-confirmed" : "badge-pending"
                  }`}>
                    {center.status === "ACTIVE" ? 'Accepting Patients' : center.status}
                  </span>
                </div>

                <div className="pt-4 border-t border-[var(--mist)]">
                  <div className="text-xs uppercase font-semibold text-[var(--muted)] mb-2">
                    Contact
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[var(--clay)]" />
                      <span className="text-[var(--ink)]">{center.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[var(--clay)]" />
                      <span className="text-[var(--ink)]">{center.email}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[var(--clay)] mt-0.5" />
                      <span className="text-[var(--ink)]">{center.address}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
