"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBranding } from "@/lib/branding";
import {
  Calendar,
  Heart,
  User,
  Search,
  MapPin,
  Star,
  Clock,
  Building2,
  Stethoscope,
  Phone,
  Mail,
  XCircle,
} from "lucide-react";
import PatientProfileTab from "./PatientProfileTab";

// Types matching database schema
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
  category: string;
  address: string;
  email: string;
  phone: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  logoUrl?: string;
}

interface Booking {
  id: string;
  reference: string;
  patientId: string;
  doctorId: string;
  slotId: string;
  date: string;
  time: string;
  price: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  patientNotes?: string;
  createdAt: string;
}

interface PatientProfile {
  id: string;
  userId: string;
  location?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  medicalNotes?: string;
}

export function PatientDashboard() {
  const router = useRouter();
  const { branding, formatCurrency } = useBranding();
  
  // Data state
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"browse" | "appointments" | "profile">("browse");

  // Browse Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  // Booking Details Modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Fetch data from APIs
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch doctors
        const doctorsRes = await fetch('/api/doctors');
        if (doctorsRes.ok) {
          const doctorsData = await doctorsRes.json();
          setDoctors(doctorsData.doctors || []);
        }

        // Fetch centers
        const centersRes = await fetch('/api/centers');
        if (centersRes.ok) {
          const centersData = await centersRes.json();
          setCenters(centersData.centers || []);
        }

        // Fetch patient bookings
        const bookingsRes = await fetch('/api/bookings');
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setBookings(bookingsData.bookings || []);
        }

        // Fetch patient profile
        const profileRes = await fetch('/api/patient/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setPatientProfile(profileData.profile || null);
        }

      } catch (error) {
        console.error('Failed to fetch patient data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const addToast = (toast: any) => {
    console.log('Toast:', toast);
  };

  // Filter doctors
  const filteredDoctors = doctors
    .filter((d) => {
      if (categoryFilter !== "all" && d.category !== categoryFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          d.name.toLowerCase().includes(query) ||
          d.role.toLowerCase().includes(query) ||
          d.category.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => b.rating - a.rating);

  const upcomingBookings = bookings
    .filter(b => b.status === "CONFIRMED" || b.status === "PENDING")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastBookings = bookings
    .filter(b => b.status === "COMPLETED" || b.status === "CANCELLED")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: bookingId,
          status: "CANCELLED",
          cancellationReason: "Patient requested cancellation",
        }),
      });

      if (!response.ok) throw new Error("Failed to cancel booking");

      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: "CANCELLED" as const } : b
      ));

      setSelectedBooking(null);

      addToast({
        type: "info",
        title: "Booking Cancelled",
        message: "Your appointment has been cancelled successfully.",
      });
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      addToast({
        type: "error",
        title: "Cancellation Failed",
        message: "Please try again or contact support.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--clay)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--muted)]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <div className="rounded-3xl border border-[var(--mist)] bg-[var(--surface)] p-6 md:p-8 shadow-sm backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--clay)] animate-pulse" />
              <span className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider">
                {branding.client.name} Patient Portal
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] tracking-tight">
              Your Healthcare Journey
            </h2>
            <p className="text-sm text-[var(--muted)] mt-1.5">
              Book appointments, browse doctors, and manage your medical records
            </p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 font-mono-ledger text-xs">
            <div className="rounded-2xl border border-[var(--mist)] p-4 bg-[var(--paper)] text-right shadow-2xs min-w-[120px]">
              <span className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider block mb-1">Upcoming</span>
              <span className="text-2xl sm:text-3xl font-bold text-[var(--sage)]">{upcomingBookings.length}</span>
            </div>
            <div className="rounded-2xl border border-[var(--mist)] p-4 bg-[var(--paper)] text-right shadow-2xs min-w-[120px]">
              <span className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider block mb-1">Past Visits</span>
              <span className="text-2xl sm:text-3xl font-bold text-[var(--ink)]">{pastBookings.length}</span>
            </div>
            <div className="rounded-2xl border border-[var(--mist)] p-4 bg-[var(--paper)] text-right shadow-2xs min-w-[120px]">
              <span className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider block mb-1">Doctors</span>
              <span className="text-2xl sm:text-3xl font-bold text-[var(--clay)]">{doctors.length}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 border border-[var(--mist)] p-1.5 bg-[var(--paper)] font-mono-ledger text-xs mt-6 overflow-x-auto rounded-full">
          <button
            onClick={() => setActiveTab("browse")}
            className={`px-5 py-2.5 transition-all whitespace-nowrap flex items-center gap-2 rounded-full text-sm ${
              activeTab === "browse"
                ? "bg-[var(--surface)] text-[var(--clay)] font-semibold shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Browse Doctors</span>
          </button>

          <button
            onClick={() => setActiveTab("appointments")}
            className={`px-5 py-2.5 transition-all whitespace-nowrap flex items-center gap-2 rounded-full text-sm ${
              activeTab === "appointments"
                ? "bg-[var(--surface)] text-[var(--clay)] font-semibold shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>My Appointments {upcomingBookings.length > 0 ? `(${upcomingBookings.length})` : ""}</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`px-5 py-2.5 transition-all whitespace-nowrap flex items-center gap-2 rounded-full text-sm ${
              activeTab === "profile"
                ? "bg-[var(--surface)] text-[var(--clay)] font-semibold shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Profile</span>
          </button>
        </div>
      </div>

      {/* VIEW: BROWSE DOCTORS */}
      {activeTab === "browse" && (
        <div className="rounded-3xl backdrop-blur-xl bg-white/85 border border-white/70 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--mist)]">
            <div>
              <h3 className="font-bold text-xl sm:text-2xl text-[var(--ink)]">
                Find Your Healthcare Provider
              </h3>
              <p className="text-sm text-[var(--muted)] mt-1">
                Browse verified doctors and book appointments instantly
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Search by name, specialty, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-[var(--mist)] bg-[var(--paper)] text-[var(--ink)] font-sans-ledger focus:outline-none focus:border-[var(--clay)] rounded-xl"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2.5 px-4 border border-[var(--mist)] text-sm rounded-xl bg-[var(--surface)] text-[var(--ink)] font-semibold focus:outline-none focus:border-[var(--clay)]"
            >
              <option value="all">All Specialties</option>
              <option value="Dental">Dental</option>
              <option value="Massage">Massage Therapy</option>
              <option value="Physio">Physiotherapy</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Acupuncture">Acupuncture</option>
            </select>
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredDoctors.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-[var(--muted)] font-mono-ledger">
                No doctors found matching your search
              </div>
            ) : (
              filteredDoctors.map((doctor) => {
                const center = centers.find(c => c.id === doctor.centerId);
                return (
                  <div
                    key={doctor.id}
                    className="rounded-2xl border border-[var(--mist)] bg-[var(--surface)] p-5 shadow-xs hover:border-[var(--clay)]/40 transition-all space-y-4 cursor-pointer"
                    onClick={() => router.push(`/doctors/${doctor.id}`)}
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
                          <h4 className="font-bold text-base text-[var(--ink)]">
                            {doctor.name}
                          </h4>
                          <div className="flex items-center gap-1 text-[var(--amber)] text-xs font-mono-ledger font-medium">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span className="font-bold">{doctor.rating.toFixed(1)}</span>
                            <span className="text-[var(--muted)]">({doctor.reviewsCount})</span>
                          </div>
                        </div>

                        <div className="text-sm font-medium text-[var(--clay)] mb-2">
                          {doctor.role}
                        </div>

                        <div className="text-xs text-[var(--muted)] space-y-1">
                          {center && (
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 flex-none" />
                              <span className="truncate">{center.name}</span>
                            </div>
                          )}
                          {center && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 flex-none" />
                              <span className="truncate">{center.address}</span>
                            </div>
                          )}
                        </div>
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

                    {doctor.bio && (
                      <div className="text-sm text-[var(--muted)] bg-[var(--paper)] p-3 rounded-xl border border-[var(--mist)] line-clamp-2">
                        {doctor.bio}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW: MY APPOINTMENTS */}
      {activeTab === "appointments" && (
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          <div className="rounded-3xl backdrop-blur-xl bg-white/85 border border-white/70 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--mist)]">
              <div>
                <h3 className="font-bold text-xl sm:text-2xl text-[var(--ink)]">
                  Upcoming Appointments
                </h3>
                <p className="text-sm text-[var(--muted)] mt-1">
                  Your scheduled medical visits
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-12 text-[var(--muted)] font-mono-ledger">
                  No upcoming appointments
                </div>
              ) : (
                upcomingBookings.map((booking) => {
                  const doctor = doctors.find(d => d.id === booking.doctorId);
                  const center = doctor ? centers.find(c => c.id === doctor.centerId) : null;
                  return (
                    <div
                      key={booking.id}
                      className="p-6 rounded-2xl border border-[var(--mist)] bg-[var(--surface)] shadow-xs hover:border-[var(--clay)]/40 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2.5 mb-2">
                            <span className="font-mono-ledger text-sm font-bold text-[var(--clay)]">
                              {booking.reference}
                            </span>
                            <span
                              className={`badge-ledger text-xs font-semibold px-3 py-1 rounded-full ${
                                booking.status === "PENDING"
                                  ? "badge-pending"
                                  : booking.status === "CONFIRMED"
                                  ? "badge-confirmed"
                                  : "badge-completed"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider block mb-1">
                                Doctor
                              </span>
                              <span className="font-semibold text-[var(--ink)]">{doctor?.name || 'Unknown'}</span>
                            </div>
                            <div>
                              <span className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider block mb-1">
                                Location
                              </span>
                              <span className="text-[var(--ink)]">{center?.name || 'Unknown Center'}</span>
                            </div>
                            <div>
                              <span className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider block mb-1">
                                Date & Time
                              </span>
                              <span className="font-semibold text-[var(--ink)]">{booking.date} at {booking.time}</span>
                            </div>
                            <div>
                              <span className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider block mb-1">
                                Fee
                              </span>
                              <span className="font-bold text-[var(--sage)]">{formatCurrency(booking.price)}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBooking(booking);
                          }}
                          className="px-4 py-2 border border-[var(--mist)] rounded-xl text-sm font-semibold text-[var(--muted)] hover:text-[var(--clay)] hover:border-[var(--clay)] transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Past Appointments */}
          {pastBookings.length > 0 && (
            <div className="rounded-3xl backdrop-blur-xl bg-white/85 border border-white/70 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="pb-4 border-b border-[var(--mist)]">
                <h3 className="font-bold text-xl sm:text-2xl text-[var(--ink)]">
                  Past Appointments
                </h3>
              </div>

              <div className="space-y-3">
                {pastBookings.slice(0, 5).map((booking) => {
                  const doctor = doctors.find(d => d.id === booking.doctorId);
                  return (
                    <div
                      key={booking.id}
                      className="p-4 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm flex justify-between items-center"
                    >
                      <div>
                        <div className="font-semibold text-[var(--ink)] mb-1">{doctor?.name || 'Unknown'}</div>
                        <div className="text-xs text-[var(--muted)]">{booking.date} · {booking.reference}</div>
                      </div>
                      <span
                        className={`badge-ledger text-xs font-semibold px-3 py-1 rounded-full ${
                          booking.status === "COMPLETED" ? "badge-completed" : "badge-pending"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: MY PROFILE */}
      {activeTab === "profile" && (
        <PatientProfileTab />
      )}

      {/* MODAL: BOOKING DETAILS */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="rounded-3xl bg-[var(--surface)] border border-white/70 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--mist)]">
              <h3 className="font-bold text-lg sm:text-xl text-[var(--ink)]">
                Appointment Details
              </h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-full hover:bg-[var(--paper)] transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--mist)]">
                <div className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider mb-2">
                  Reference Number
                </div>
                <div className="font-mono-ledger text-lg font-bold text-[var(--clay)]">
                  {selectedBooking.reference}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider mb-1">
                    Date
                  </div>
                  <div className="font-semibold text-[var(--ink)]">{selectedBooking.date}</div>
                </div>
                <div>
                  <div className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider mb-1">
                    Time
                  </div>
                  <div className="font-semibold text-[var(--ink)]">{selectedBooking.time}</div>
                </div>
                <div>
                  <div className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider mb-1">
                    Fee
                  </div>
                  <div className="font-bold text-[var(--sage)]">{formatCurrency(selectedBooking.price)}</div>
                </div>
                <div>
                  <div className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider mb-1">
                    Status
                  </div>
                  <span
                    className={`badge-ledger text-xs font-semibold px-3 py-1 rounded-full ${
                      selectedBooking.status === "PENDING"
                        ? "badge-pending"
                        : selectedBooking.status === "CONFIRMED"
                        ? "badge-confirmed"
                        : "badge-completed"
                    }`}
                  >
                    {selectedBooking.status}
                  </span>
                </div>
              </div>

              {selectedBooking.patientNotes && (
                <div className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--mist)]">
                  <div className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider mb-2">
                    Your Notes
                  </div>
                  <div className="text-sm text-[var(--ink)]">{selectedBooking.patientNotes}</div>
                </div>
              )}
            </div>

            {(selectedBooking.status === "PENDING" || selectedBooking.status === "CONFIRMED") && (
              <div className="flex gap-3 pt-3 border-t border-[var(--mist)]">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="flex-1 py-3 rounded-xl border border-[var(--mist)] text-[var(--muted)] font-semibold hover:bg-[var(--paper)] transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleCancelBooking(selectedBooking.id)}
                  className="flex-1 py-3 rounded-xl bg-[var(--clay)] text-white font-semibold hover:opacity-95 shadow-sm shadow-[var(--clay)]/20"
                >
                  Cancel Appointment
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
