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

interface Slot {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
}

export default function DoctorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { formatCurrency } = useBranding();
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [center, setCenter] = useState<Center | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Booking state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

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

            // Fetch available slots for the next 30 days
            const today = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 30);
            
            const slotsRes = await fetch(
              `/api/slots?doctorId=${foundDoctor.id}&startDate=${today.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`
            );
            if (slotsRes.ok) {
              const slotsData = await slotsRes.json();
              // Only show available slots
              const availableSlots = (slotsData.slots || []).filter((s: Slot) => s.status === 'AVAILABLE');
              setSlots(availableSlots);
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

  // Get unique dates from available slots
  const availableDates = Array.from(new Set(slots.map(s => s.date))).sort();

  // Get slots for selected date
  const slotsForDate = selectedDate 
    ? slots.filter(s => s.date === selectedDate)
    : [];

  const handleBookingSubmit = async () => {
    if (!selectedSlot || !doctor) {
      setBookingError('Please select a time slot');
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    try {
      const selectedServiceData = services.find(s => s.id === selectedService);
      const price = selectedServiceData?.price || doctor.price;

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: doctor.id,
          slotId: selectedSlot.id,
          serviceId: selectedService || null,
          date: selectedSlot.date,
          time: selectedSlot.startTime,
          price,
          notes: bookingNotes,
          paymentMethod: 'Pay at Clinic',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      // Success! Redirect to patient dashboard
      alert('Booking confirmed! Check your email for confirmation details.');
      router.push('/patient?tab=appointments');
    } catch (error: any) {
      console.error('Booking error:', error);
      setBookingError(error.message || 'Failed to create booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

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
                      Select Service (Optional)
                    </label>
                    <select 
                      className="w-full p-3 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                    >
                      <option value="">General Consultation - {formatCurrency(doctor.price)}</option>
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
                onClick={() => setShowBookingModal(true)}
                disabled={!doctor.active || slots.length === 0}
                className="w-full bg-[var(--clay)] text-white py-4 rounded-2xl font-bold text-lg hover:opacity-95 transition-all shadow-lg shadow-[var(--clay)]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Calendar className="w-5 h-5" />
                <span>{slots.length === 0 ? 'No Slots Available' : 'Schedule Visit'}</span>
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

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--surface)] rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[var(--ink)]">Book Appointment</h2>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedDate('');
                  setSelectedSlot(null);
                  setBookingNotes('');
                  setBookingError(null);
                }}
                className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {bookingError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {bookingError}
              </div>
            )}

            {/* Doctor Summary */}
            <div className="mb-6 p-4 rounded-2xl bg-[var(--paper)] border border-[var(--mist)]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[var(--clay)]/10 text-[var(--clay)] flex items-center justify-center flex-none">
                  {doctor?.imageUrl ? (
                    <img src={doctor.imageUrl} alt={doctor.name} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <Stethoscope className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-[var(--ink)]">{doctor?.name}</h3>
                  <p className="text-sm text-[var(--muted)]">{doctor?.role}</p>
                  {center && (
                    <p className="text-sm text-[var(--muted)] flex items-center gap-1 mt-1">
                      <Building2 className="w-3 h-3" />
                      {center.name}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[var(--sage)]">
                    {formatCurrency(services.find(s => s.id === selectedService)?.price || doctor?.price || 0)}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1: Select Date */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[var(--ink)] mb-3">
                1. Select Date
              </label>
              {availableDates.length === 0 ? (
                <p className="text-[var(--muted)] text-center py-4">No available dates at this time</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableDates.slice(0, 12).map(date => {
                    const dateObj = new Date(date + 'T00:00:00');
                    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNum = dateObj.getDate();
                    const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
                    
                    return (
                      <button
                        key={date}
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedSlot(null);
                        }}
                        className={`p-4 rounded-xl border-2 transition-all text-center ${
                          selectedDate === date
                            ? 'border-[var(--clay)] bg-[var(--clay)]/5'
                            : 'border-[var(--mist)] hover:border-[var(--clay)]/40'
                        }`}
                      >
                        <div className="text-xs text-[var(--muted)] font-semibold uppercase">{dayName}</div>
                        <div className="text-2xl font-bold text-[var(--ink)] my-1">{dayNum}</div>
                        <div className="text-xs text-[var(--muted)]">{monthName}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 2: Select Time */}
            {selectedDate && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[var(--ink)] mb-3">
                  2. Select Time
                </label>
                {slotsForDate.length === 0 ? (
                  <p className="text-[var(--muted)] text-center py-4">No available times for this date</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {slotsForDate.map(slot => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3 rounded-xl border-2 transition-all text-center ${
                          selectedSlot?.id === slot.id
                            ? 'border-[var(--clay)] bg-[var(--clay)]/5'
                            : 'border-[var(--mist)] hover:border-[var(--clay)]/40'
                        }`}
                      >
                        <div className="text-sm font-bold text-[var(--ink)]">{slot.startTime}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Notes */}
            {selectedSlot && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[var(--ink)] mb-3">
                  3. Additional Notes (Optional)
                </label>
                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Any specific concerns or information for the doctor..."
                  className="w-full p-3 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20 min-h-[100px] resize-none"
                />
              </div>
            )}

            {/* Confirm Button */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedDate('');
                  setSelectedSlot(null);
                  setBookingNotes('');
                  setBookingError(null);
                }}
                className="flex-1 py-3 rounded-xl border-2 border-[var(--mist)] text-[var(--ink)] font-semibold hover:bg-[var(--paper)] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleBookingSubmit}
                disabled={!selectedSlot || bookingLoading}
                className="flex-1 bg-[var(--clay)] text-white py-3 rounded-xl font-bold hover:opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
