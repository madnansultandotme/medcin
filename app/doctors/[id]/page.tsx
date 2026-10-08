"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, MapPin, ArrowLeft, Building2, Stethoscope, Clock, Calendar, Phone } from "lucide-react";
import { useBranding } from "@/lib/branding";

interface Doctor {
  id: string;
  name: string;
  role: string;
  category: string;
  price: number;
  rating: number;
  reviewsCount: number;
  licenseNumber: string;
  bio?: string;
  imageUrl?: string;
  active: boolean;
  centerId: string;
}

interface Center {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface Service {
  id: string;
  doctorId: string;
  name: string;
  duration: string;
  price: number;
  description?: string;
}

export default function DoctorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { formatCurrency } = useBranding();
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [center, setCenter] = useState<Center | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDoctorData() {
      try {
        setLoading(true);
        
        // Fetch all doctors and find the one we need
        const doctorsRes = await fetch('/api/doctors');
        if (doctorsRes.ok) {
          const doctorsData = await doctorsRes.json();
          const foundDoctor = doctorsData.doctors?.find((d: Doctor) => d.id === params.id);
          
          if (foundDoctor) {
            setDoctor(foundDoctor);
            
            // Fetch center details
            const centersRes = await fetch('/api/centers');
            if (centersRes.ok) {
              const centersData = await centersRes.json();
              const foundCenter = centersData.centers?.find((c: Center) => c.id === foundDoctor.centerId);
              setCenter(foundCenter || null);
            }

            // Fetch services for this doctor
            const servicesRes = await fetch(`/api/services?doctorId=${foundDoctor.id}`);
            if (servicesRes.ok) {
              const servicesData = await servicesRes.json();
              setServices(servicesData.services || []);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch doctor data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchDoctorData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--clay)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--muted)]">Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center">
        <div className="text-center">
          <Stethoscope className="w-16 h-16 text-[var(--muted)] mx-auto mb-4" />
          <p className="text-[var(--muted)] mb-4">Doctor not found</p>
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
            {/* Doctor Avatar */}
            <div className="w-32 h-32 rounded-3xl bg-[var(--clay)]/10 text-[var(--clay)] border-2 border-[var(--clay)]/20 flex items-center justify-center font-mono-ledger text-3xl font-bold flex-none overflow-hidden shadow-lg">
              {doctor.imageUrl ? (
                <img src={doctor.imageUrl} alt={doctor.name} className="w-full h-full object-cover" />
              ) : (
                <Stethoscope className="w-12 h-12" />
              )}
            </div>

            {/* Doctor Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-[var(--ink)] mb-2">
                    {doctor.name}
                  </h1>
                  <p className="text-lg text-[var(--clay)] font-semibold mb-2">
                    {doctor.role}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-[var(--muted)] flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-[var(--amber)] fill-current" />
                      <span className="font-bold text-[var(--ink)]">{doctor.rating.toFixed(1)}</span>
                      <span>({doctor.reviewsCount} reviews)</span>
                    </div>
                    {center && (
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4" />
                        <span>{center.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm uppercase font-semibold text-[var(--muted)] mb-1">
                    From
                  </div>
                  <div className="text-3xl font-bold text-[var(--sage)]">
                    {formatCurrency(doctor.price)}
                  </div>
                </div>
              </div>

              {center && (
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-[var(--muted)]">
                    <MapPin className="w-4 h-4 flex-none" />
                    <span>{center.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--muted)]">
                    <Phone className="w-4 h-4 flex-none" />
                    <span>{center.phone}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            {doctor.bio && (
              <div className="rounded-3xl bg-[var(--surface)] border border-[var(--mist)] p-6 sm:p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-[var(--ink)] mb-4">About</h2>
                <p className="text-[var(--muted)] leading-relaxed">{doctor.bio}</p>
              </div>
            )}

            {/* Services */}
            <div className="rounded-3xl bg-[var(--surface)] border border-[var(--mist)] p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-[var(--ink)] mb-6">Services & Procedures</h2>
              
              {services.length === 0 ? (
                <p className="text-[var(--muted)] text-center py-8">
                  No services listed yet
                </p>
              ) : (
                <div className="space-y-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="p-5 rounded-2xl border border-[var(--mist)] bg-[var(--paper)] hover:border-[var(--clay)]/40 transition-all"
                    >
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-[var(--ink)] mb-1">
                            {service.name}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              <span>{service.duration}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-none">
                          <div className="text-2xl font-bold text-[var(--sage)]">
                            {formatCurrency(service.price)}
                          </div>
                        </div>
                      </div>
                      {service.description && (
                        <p className="text-sm text-[var(--muted)]">{service.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* License Info */}
            <div className="rounded-3xl bg-[var(--surface)] border border-[var(--mist)] p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-[var(--ink)] mb-4">Professional Credentials</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--muted)]">Medical License</span>
                  <span className="font-mono-ledger font-bold text-[var(--ink)]">{doctor.licenseNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--muted)]">Category</span>
                  <span className="font-semibold text-[var(--ink)]">{doctor.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--muted)]">Status</span>
                  <span className="badge-ledger badge-confirmed text-xs font-semibold px-3 py-1 rounded-full">
                    {doctor.active ? 'Active & Accepting Patients' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="rounded-3xl bg-[var(--surface)] border border-[var(--mist)] p-6 shadow-sm sticky top-6">
              <h3 className="text-xl font-bold text-[var(--ink)] mb-4">
                Book Appointment
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--mist)]">
                  <div className="text-sm text-[var(--muted)] mb-1">Consultation Fee</div>
                  <div className="text-2xl font-bold text-[var(--sage)]">
                    {formatCurrency(doctor.price)}
                  </div>
                </div>

                {services.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-[var(--muted)] mb-2">
                      Select Service
                    </label>
                    <select className="w-full p-3 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20">
                      {services.map(service => (
                        <option key={service.id} value={service.id}>
                          {service.name} - {formatCurrency(service.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  // Navigate to booking with doctor info
                  alert('Booking flow coming soon! This will integrate with the booking API.');
                }}
                className="w-full bg-[var(--clay)] text-white py-4 rounded-2xl font-bold text-lg hover:opacity-95 transition-all shadow-lg shadow-[var(--clay)]/20 flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Schedule Visit</span>
              </button>

              <p className="text-xs text-center text-[var(--muted)] mt-4">
                Payment on-site at clinic. No online charges.
              </p>
            </div>

            {/* Clinic Info Card */}
            {center && (
              <div className="rounded-3xl bg-[var(--surface)] border border-[var(--mist)] p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[var(--ink)] mb-4">Clinic Location</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-xs uppercase font-semibold text-[var(--muted)] mb-1">
                      Practice Name
                    </div>
                    <div className="font-semibold text-[var(--ink)]">{center.name}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase font-semibold text-[var(--muted)] mb-1">
                      Address
                    </div>
                    <div className="text-[var(--ink)]">{center.address}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase font-semibold text-[var(--muted)] mb-1">
                      Phone
                    </div>
                    <div className="text-[var(--ink)]">{center.phone}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
