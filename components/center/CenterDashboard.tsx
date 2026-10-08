"use client";

import React, { useState, useEffect } from "react";
import { useBranding } from "@/lib/branding";
import {
  Building2,
  Stethoscope,
  Clock,
  Inbox,
  Check,
  Plus,
  Trash2,
  Calendar,
  XCircle,
  Search,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import CenterProfileTab from "./CenterProfileTab";

// Types matching database schema
interface Center {
  id: string;
  name: string;
  category: string;
  address: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  logoUrl?: string;
  coverImageUrl?: string;
  operatingHours?: string;
  userId: string;
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
  bio?: string;
  imageUrl?: string;
  active: boolean;
  centerId: string;
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

interface Service {
  id: string;
  doctorId: string;
  name: string;
  duration: string;
  price: number;
  description?: string;
}

export function CenterDashboard() {
  const { branding, formatCurrency } = useBranding();
  
  // Data state
  const [center, setCenter] = useState<Center | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"doctors" | "inbox" | "profile">("inbox");

  // Inbox Filters
  const [inboxFilter, setInboxFilter] = useState<"all" | "PENDING" | "CONFIRMED" | "COMPLETED">("all");
  const [inboxSearch, setInboxSearch] = useState("");

  // Modals
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [declineBookingModal, setDeclineBookingModal] = useState<Booking | null>(null);
  const [declineReason, setDeclineReason] = useState("Practitioner unavailable");

  // Form states for adding doctor
  const [newDocName, setNewDocName] = useState("");
  const [newDocRole, setNewDocRole] = useState("");
  const [newDocCategory, setNewDocCategory] = useState("Dental");
  const [newDocLicense, setNewDocLicense] = useState("");
  const [newDocPrice, setNewDocPrice] = useState("85");
  const [newDocBio, setNewDocBio] = useState("");

  // Form states for adding service
  const [targetDoctorId, setTargetDoctorId] = useState("");
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState("30 min");
  const [newServicePrice, setNewServicePrice] = useState("45");
  const [newServiceDesc, setNewServiceDesc] = useState("");

  // Fetch data from APIs
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch current center
        const centersRes = await fetch('/api/centers');
        if (centersRes.ok) {
          const centersData = await centersRes.json();
          // Get the first center for current user (in real app, filter by userId)
          setCenter(centersData.centers?.[0] || null);
        }

        // Fetch doctors for this center
        const doctorsRes = await fetch('/api/doctors');
        if (doctorsRes.ok) {
          const doctorsData = await doctorsRes.json();
          setDoctors(doctorsData.doctors || []);
        }

        // Fetch bookings
        const bookingsRes = await fetch('/api/bookings');
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setBookings(bookingsData.bookings || []);
        }

        // Fetch services
        const servicesRes = await fetch('/api/services');
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          setServices(servicesData.services || []);
        }

      } catch (error) {
        console.error('Failed to fetch center data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const addToast = (toast: any) => {
    console.log('Toast:', toast);
  };

  // Get bookings for doctors in this center
  const centerBookings = center ? bookings.filter(b => {
    const doctor = doctors.find(d => d.id === b.doctorId);
    return doctor && doctor.centerId === center.id;
  }) : [];

  const pendingCount = centerBookings.filter((b) => b.status === "PENDING").length;
  const confirmedCount = centerBookings.filter((b) => b.status === "CONFIRMED").length;

  const filteredInbox = centerBookings
    .filter((b) => {
      if (inboxFilter === "PENDING") return b.status === "PENDING";
      if (inboxFilter === "CONFIRMED") return b.status === "CONFIRMED";
      if (inboxFilter === "COMPLETED") return b.status === "COMPLETED";
      return true;
    })
    .filter(
      (b) =>
        b.reference.toLowerCase().includes(inboxSearch.toLowerCase())
    );

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName || !center) return;
    
    try {
      const response = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          centerId: center.id,
          name: newDocName,
          role: newDocRole,
          category: newDocCategory,
          licenseNumber: newDocLicense,
          bio: newDocBio,
          price: parseFloat(newDocPrice) || 85,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create doctor");
      }

      const data = await response.json();
      
      // Add to local state
      setDoctors(prev => [...prev, data.doctor]);
      
      // Reset form and close modal
      setNewDocName("");
      setNewDocRole("");
      setNewDocLicense("");
      setNewDocBio("");
      setNewDocPrice("85");
      setShowAddDoctorModal(false);
      
      addToast({
        type: "success",
        title: "Doctor Added",
        message: `${newDocName} has been added to your practice.`,
      });
    } catch (error) {
      console.error('Failed to create doctor:', error);
      addToast({
        type: "error",
        title: "Failed to Add Doctor",
        message: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName || !targetDoctorId) return;
    
    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: targetDoctorId,
          name: newServiceName,
          duration: newServiceDuration,
          price: parseFloat(newServicePrice) || 45,
          description: newServiceDesc,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create service");
      }

      const data = await response.json();
      
      // Add to local state
      setServices(prev => [...prev, data.service]);
      
      // Reset form and close modal
      setNewServiceName("");
      setNewServiceDuration("30 min");
      setNewServicePrice("45");
      setNewServiceDesc("");
      setShowAddServiceModal(false);
      
      addToast({
        type: "success",
        title: "Service Added",
        message: `${newServiceName} has been added to the catalog.`,
      });
    } catch (error) {
      console.error('Failed to create service:', error);
      addToast({
        type: "error",
        title: "Failed to Add Service",
        message: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      const response = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: bookingId,
          status: "CONFIRMED",
        }),
      });

      if (!response.ok) throw new Error("Failed to confirm booking");

      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: "CONFIRMED" as const } : b
      ));

      addToast({
        type: "success",
        title: "Booking Confirmed",
        message: "Patient has been notified of confirmation.",
      });
    } catch (error) {
      console.error('Failed to confirm booking:', error);
      addToast({
        type: "error",
        title: "Confirmation Failed",
        message: "Please try again.",
      });
    }
  };

  const handleDeclineBooking = async () => {
    if (!declineBookingModal) return;

    try {
      const response = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: declineBookingModal.id,
          status: "CANCELLED",
          cancellationReason: declineReason,
        }),
      });

      if (!response.ok) throw new Error("Failed to decline booking");

      setBookings(prev => prev.map(b => 
        b.id === declineBookingModal.id ? { ...b, status: "CANCELLED" as const } : b
      ));

      setDeclineBookingModal(null);
      setDeclineReason("Practitioner unavailable");

      addToast({
        type: "info",
        title: "Booking Declined",
        message: "Patient has been notified of cancellation.",
      });
    } catch (error) {
      console.error('Failed to decline booking:', error);
      addToast({
        type: "error",
        title: "Decline Failed",
        message: "Please try again.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--clay)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--muted)]">Loading center dashboard...</p>
        </div>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-[var(--muted)] mx-auto mb-4" />
          <p className="text-[var(--muted)]">No center found. Please contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Center Header */}
      <div className="rounded-3xl border border-[var(--mist)] bg-[var(--surface)] p-6 md:p-8 shadow-sm backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[var(--mist)] p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
              {center.logoUrl ? (
                <img src={center.logoUrl} alt={center.name} className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-8 h-8 text-[var(--clay)]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--sage)] animate-pulse" />
                <span className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider">
                  {center.category} Practice
                </span>
                {center.status === "ACTIVE" && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[var(--sage)]/10 border border-[var(--sage)]/20 text-xs font-semibold text-[var(--sage)]">
                    Active & Bookable
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] tracking-tight">
                {center.name}
              </h2>
              <p className="text-sm text-[var(--muted)] mt-1">
                {center.address}
              </p>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 font-mono-ledger text-xs">
            <div className="rounded-2xl border border-[var(--mist)] p-4 bg-[var(--paper)] text-right shadow-2xs min-w-[120px]">
              <span className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider block mb-1">Pending</span>
              <span className="text-2xl sm:text-3xl font-bold text-[var(--amber)]">{pendingCount}</span>
            </div>
            <div className="rounded-2xl border border-[var(--mist)] p-4 bg-[var(--paper)] text-right shadow-2xs min-w-[120px]">
              <span className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider block mb-1">Confirmed</span>
              <span className="text-2xl sm:text-3xl font-bold text-[var(--sage)]">{confirmedCount}</span>
            </div>
            <div className="rounded-2xl border border-[var(--mist)] p-4 bg-[var(--paper)] text-right shadow-2xs min-w-[120px]">
              <span className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider block mb-1">Doctors</span>
              <span className="text-2xl sm:text-3xl font-bold text-[var(--ink)]">{doctors.length}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 border border-[var(--mist)] p-1.5 bg-[var(--paper)] font-mono-ledger text-xs mt-6 overflow-x-auto rounded-full">
          <button
            onClick={() => setActiveTab("inbox")}
            className={`px-5 py-2.5 transition-all whitespace-nowrap flex items-center gap-2 rounded-full text-sm ${
              activeTab === "inbox"
                ? "bg-[var(--surface)] text-[var(--clay)] font-semibold shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Appointment Inbox {pendingCount > 0 ? `(${pendingCount})` : ""}</span>
          </button>

          <button
            onClick={() => setActiveTab("doctors")}
            className={`px-5 py-2.5 transition-all whitespace-nowrap flex items-center gap-2 rounded-full text-sm ${
              activeTab === "doctors"
                ? "bg-[var(--surface)] text-[var(--clay)] font-semibold shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Medical Team ({doctors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`px-5 py-2.5 transition-all whitespace-nowrap flex items-center gap-2 rounded-full text-sm ${
              activeTab === "profile"
                ? "bg-[var(--surface)] text-[var(--clay)] font-semibold shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Practice Profile</span>
          </button>
        </div>
      </div>

      {/* VIEW: APPOINTMENT INBOX */}
      {activeTab === "inbox" && (
        <div className="rounded-3xl backdrop-blur-xl bg-white/85 border border-white/70 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--mist)]">
            <div>
              <h3 className="font-bold text-xl sm:text-2xl text-[var(--ink)]">
                Appointment Requests
              </h3>
              <p className="text-sm text-[var(--muted)] mt-1">
                Patient bookings requiring your review and confirmation
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="text"
                  placeholder="Filter by reference..."
                  value={inboxSearch}
                  onChange={(e) => setInboxSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 text-sm rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                />
              </div>

              <select
                value={inboxFilter}
                onChange={(e) => setInboxFilter(e.target.value as any)}
                className="py-2 px-3 border border-[var(--mist)] text-sm rounded-xl bg-[var(--surface)] text-[var(--ink)] font-semibold"
              >
                <option value="all">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredInbox.length === 0 ? (
              <div className="text-center py-12 text-[var(--muted)] font-mono-ledger">
                No appointments found
              </div>
            ) : (
              filteredInbox.map((booking) => {
                const doctor = doctors.find(d => d.id === booking.doctorId);
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
                          <span className="text-xs text-[var(--muted)]">
                            {new Date(booking.createdAt).toLocaleDateString()}
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
                              Appointment
                            </span>
                            <span className="font-semibold text-[var(--ink)]">{booking.date} at {booking.time}</span>
                          </div>
                          <div>
                            <span className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider block mb-1">
                              Fee
                            </span>
                            <span className="font-bold text-[var(--sage)]">{formatCurrency(booking.price)}</span>
                          </div>
                          {booking.patientNotes && (
                            <div className="sm:col-span-2">
                              <span className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider block mb-1">
                                Patient Notes
                              </span>
                              <span className="text-[var(--ink)]">{booking.patientNotes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {booking.status === "PENDING" && (
                        <div className="flex gap-2 flex-none">
                          <button
                            onClick={() => handleConfirmBooking(booking.id)}
                            className="bg-[var(--sage)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-95 flex items-center gap-1.5 shadow-sm"
                          >
                            <Check className="w-4 h-4" />
                            <span>Confirm</span>
                          </button>
                          <button
                            onClick={() => setDeclineBookingModal(booking)}
                            className="px-4 py-2.5 border border-[var(--mist)] rounded-xl text-[var(--muted)] hover:text-[var(--clay)] hover:border-[var(--clay)] transition-all font-semibold"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW: MEDICAL TEAM */}
      {activeTab === "doctors" && (
        <div className="rounded-3xl backdrop-blur-xl bg-white/85 border border-white/70 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--mist)]">
            <div>
              <h3 className="font-bold text-xl sm:text-2xl text-[var(--ink)]">
                Medical Team Roster
              </h3>
              <p className="text-sm text-[var(--muted)] mt-1">
                Manage your practice's healthcare providers and services
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddServiceModal(true)}
                className="px-4 py-2 border border-[var(--mist)] rounded-xl text-sm font-semibold text-[var(--ink)] hover:border-[var(--clay)] hover:text-[var(--clay)] transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Service</span>
              </button>
              <button
                onClick={() => setShowAddDoctorModal(true)}
                className="bg-[var(--clay)] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-95 flex items-center gap-2 shadow-sm shadow-[var(--clay)]/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Doctor</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {doctors.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-[var(--muted)] font-mono-ledger">
                No doctors yet. Add your first practitioner to start accepting bookings.
              </div>
            ) : (
              doctors.map((doctor) => {
                const doctorServices = services.filter(s => s.doctorId === doctor.id);
                return (
                  <div
                    key={doctor.id}
                    className="rounded-2xl border border-[var(--mist)] bg-[var(--surface)] p-5 shadow-xs space-y-4"
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
                          <span
                            className={`badge-ledger text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                              doctor.active ? "badge-confirmed" : "badge-pending"
                            }`}
                          >
                            {doctor.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-[var(--clay)] mb-1">
                          {doctor.role}
                        </div>
                        <div className="text-xs text-[var(--muted)] font-mono-ledger">
                          License: {doctor.licenseNumber}
                        </div>
                      </div>

                      <div className="text-right flex-none">
                        <div className="text-xs uppercase font-semibold font-mono-ledger text-[var(--muted)] mb-0.5">
                          Starting Fee
                        </div>
                        <div className="font-mono-ledger text-lg font-bold text-[var(--sage)]">
                          {formatCurrency(doctor.price)}
                        </div>
                      </div>
                    </div>

                    {doctor.bio && (
                      <div className="text-sm text-[var(--muted)] bg-[var(--paper)] p-3 rounded-xl border border-[var(--mist)]">
                        {doctor.bio}
                      </div>
                    )}

                    {doctorServices.length > 0 && (
                      <div className="pt-3 border-t border-[var(--mist)]">
                        <div className="text-xs font-semibold font-mono-ledger uppercase text-[var(--muted)] tracking-wider mb-2">
                          Services ({doctorServices.length})
                        </div>
                        <div className="space-y-2">
                          {doctorServices.slice(0, 3).map((service) => (
                            <div
                              key={service.id}
                              className="flex justify-between items-center text-xs bg-[var(--paper)] p-2.5 rounded-lg border border-[var(--mist)]"
                            >
                              <div className="flex-1 min-w-0 pr-2">
                                <div className="font-semibold text-[var(--ink)] truncate">
                                  {service.name}
                                </div>
                                <div className="text-[var(--muted)] font-mono-ledger">
                                  {service.duration}
                                </div>
                              </div>
                              <div className="font-mono-ledger font-bold text-[var(--ink)] flex-none">
                                {formatCurrency(service.price)}
                              </div>
                            </div>
                          ))}
                          {doctorServices.length > 3 && (
                            <div className="text-xs text-center text-[var(--muted)] font-mono-ledger py-1">
                              + {doctorServices.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW: PRACTICE PROFILE */}
      {activeTab === "profile" && (
        <CenterProfileTab />
      )}

      {/* MODAL: ADD DOCTOR */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="rounded-3xl bg-[var(--surface)] border border-white/70 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--mist)]">
              <h3 className="font-bold text-lg sm:text-xl text-[var(--ink)]">
                Add Medical Practitioner
              </h3>
              <button
                onClick={() => setShowAddDoctorModal(false)}
                className="text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-full hover:bg-[var(--paper)] transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="Dr. Jane Smith"
                  className="w-full p-3 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                  Role / Specialty *
                </label>
                <input
                  type="text"
                  required
                  value={newDocRole}
                  onChange={(e) => setNewDocRole(e.target.value)}
                  placeholder="Dentist · General Practice"
                  className="w-full p-3 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                  Category *
                </label>
                <select
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                >
                  <option value="Dental">Dental</option>
                  <option value="Massage">Massage</option>
                  <option value="Physio">Physiotherapy</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Acupuncture">Acupuncture</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                  License Number *
                </label>
                <input
                  type="text"
                  required
                  value={newDocLicense}
                  onChange={(e) => setNewDocLicense(e.target.value)}
                  placeholder="SG-MOH-12345"
                  className="w-full p-3 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                  Consultation Fee ({branding.localization.currency.symbol})
                </label>
                <input
                  type="number"
                  value={newDocPrice}
                  onChange={(e) => setNewDocPrice(e.target.value)}
                  placeholder="85"
                  className="w-full p-3 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                  Bio (Optional)
                </label>
                <textarea
                  rows={3}
                  value={newDocBio}
                  onChange={(e) => setNewDocBio(e.target.value)}
                  placeholder="Brief professional background..."
                  className="w-full p-3 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-[var(--mist)]">
                <button
                  type="button"
                  onClick={() => setShowAddDoctorModal(false)}
                  className="flex-1 py-3 rounded-xl border border-[var(--mist)] text-[var(--muted)] font-semibold hover:bg-[var(--paper)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[var(--clay)] text-white font-semibold hover:opacity-95 shadow-sm shadow-[var(--clay)]/20"
                >
                  Add Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SERVICE */}
      {showAddServiceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="rounded-3xl bg-[var(--surface)] border border-white/70 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--mist)]">
              <h3 className="font-bold text-lg sm:text-xl text-[var(--ink)]">
                Add Service / Procedure
              </h3>
              <button
                onClick={() => setShowAddServiceModal(false)}
                className="text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-full hover:bg-[var(--paper)] transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                  Select Doctor *
                </label>
                <select
                  required
                  value={targetDoctorId}
                  onChange={(e) => setTargetDoctorId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                >
                  <option value="">Choose a practitioner...</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Root Canal Treatment"
                  className="w-full p-3 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(e.target.value)}
                    placeholder="30 min"
                    className="w-full p-3 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                    Price ({branding.localization.currency.symbol})
                  </label>
                  <input
                    type="number"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    placeholder="45"
                    className="w-full p-3 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  placeholder="Service details..."
                  className="w-full p-3 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-[var(--mist)]">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="flex-1 py-3 rounded-xl border border-[var(--mist)] text-[var(--muted)] font-semibold hover:bg-[var(--paper)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[var(--clay)] text-white font-semibold hover:opacity-95 shadow-sm shadow-[var(--clay)]/20"
                >
                  Add Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DECLINE BOOKING */}
      {declineBookingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="rounded-3xl bg-[var(--surface)] border border-white/70 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--mist)]">
              <h3 className="font-bold text-lg sm:text-xl text-[var(--ink)]">
                Decline Booking {declineBookingModal.reference}
              </h3>
              <button
                onClick={() => setDeclineBookingModal(null)}
                className="text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-full hover:bg-[var(--paper)] transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--mist)] text-sm text-[var(--muted)]">
              Appointment: <span className="font-semibold text-[var(--ink)]">{declineBookingModal.date} at {declineBookingModal.time}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                Reason for Decline
              </label>
              <select
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full p-3 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
              >
                <option value="Practitioner unavailable">Practitioner unavailable</option>
                <option value="Facility maintenance">Facility maintenance</option>
                <option value="Emergency closure">Emergency closure</option>
                <option value="Slot no longer available">Slot no longer available</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex gap-3 pt-3 border-t border-[var(--mist)]">
              <button
                onClick={() => setDeclineBookingModal(null)}
                className="flex-1 py-3 rounded-xl border border-[var(--mist)] text-[var(--muted)] font-semibold hover:bg-[var(--paper)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeclineBooking}
                className="flex-1 py-3 rounded-xl bg-[var(--clay)] text-white font-semibold hover:opacity-95 shadow-sm shadow-[var(--clay)]/20"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
