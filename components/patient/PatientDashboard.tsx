"use client";

import React, { useState } from "react";
import { useMedcinStore, Doctor, Booking } from "@/lib/store";
import {
  Search,
  Star,
  MapPin,
  Calendar,
  Clock,
  Check,
  ChevronRight,
  ArrowLeft,
  X,
  CalendarCheck,
  ShieldCheck,
  Download,
  Info,
  SlidersHorizontal,
} from "lucide-react";

export function PatientDashboard() {
  const {
    doctors,
    bookings,
    createBooking,
    updateBookingStatus,
    rescheduleBooking,
    activeBookingDraft,
    setActiveBookingDraft,
    addToast,
  } = useMedcinStore();

  const [activeTab, setActiveTab] = useState<"search" | "book" | "confirm" | "mybookings">("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");
  const [sortBy, setSortBy] = useState<"rating" | "price-asc" | "price-desc">("rating");

  // Booking Flow Steps: 1: Procedure, 2: Slot, 3: Patient Details, 4: Review & Confirm
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3 | 4>(1);

  // Active doctor for booking
  const selectedDoctor: Doctor =
    activeBookingDraft.doctor || doctors.find((d) => d.id === "doc-2") || doctors[0];

  // Reschedule & Cancel Modal States
  const [reschedulingBooking, setReschedulingBooking] = useState<Booking | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState("Tue 30 Sep");
  const [newRescheduleTime, setNewRescheduleTime] = useState("11:30");
  const [cancelReason, setCancelReason] = useState("Schedule conflict");

  // Most recent booking for confirm screen
  const [latestBooking, setLatestBooking] = useState<Booking | null>(bookings[0] || null);

  // Filter Doctors
  const filteredDoctors = doctors
    .filter((doc) => {
      const matchCat = selectedCategory === "All" || doc.category === selectedCategory;
      const matchCity = selectedCity === "All" || doc.location.toLowerCase().includes(selectedCity.toLowerCase());
      const matchSearch =
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.clinic.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchCity && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });

  const handleStartBooking = (doc: Doctor, svcId?: string) => {
    setActiveBookingDraft((prev) => ({
      ...prev,
      doctor: doc,
      serviceId: svcId || doc.services[0]?.id || "s1",
    }));
    setBookingStep(1);
    setActiveTab("book");
  };

  const handleFinalizeBooking = () => {
    const selectedSvc =
      selectedDoctor.services.find((s) => s.id === activeBookingDraft.serviceId) ||
      selectedDoctor.services[0];

    const newBooking = createBooking({
      patientName: activeBookingDraft.patientName || "Jonas Kazlauskas",
      patientEmail: activeBookingDraft.patientEmail || "jonas@example.com",
      patientPhone: activeBookingDraft.patientPhone || "+370 600 12345",
      patientNotes: activeBookingDraft.patientNotes,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      doctorRole: selectedDoctor.role.split("·")[0].trim(),
      clinicName: selectedDoctor.clinic,
      clinicAddress: selectedDoctor.location,
      serviceName: selectedSvc.name,
      duration: selectedSvc.duration,
      date: activeBookingDraft.day,
      time: activeBookingDraft.time,
      price: selectedSvc.price,
      status: "confirmed",
    });

    setLatestBooking(newBooking);
    setActiveTab("confirm");
  };

  const executeReschedule = () => {
    if (!reschedulingBooking) return;
    rescheduleBooking(reschedulingBooking.id, newRescheduleDate, newRescheduleTime);
    setReschedulingBooking(null);
  };

  const executeCancel = () => {
    if (!cancellingBooking) return;
    updateBookingStatus(cancellingBooking.id, "cancelled", cancelReason);
    setCancellingBooking(null);
  };

  return (
    <div className="space-y-6">
      {/* Patient Workspace Header */}
      <div className="border border-[var(--mist)] bg-[var(--surface)] p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[var(--mist)] border border-[var(--mist)] flex items-center justify-center font-mono-ledger text-base font-bold text-[var(--ink)]">
              JK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[var(--ink)] tracking-tight">
                  Marcus Wei
                </h2>
                <span className="badge-ledger badge-confirmed">Patient Account</span>
              </div>
              <p className="text-xs text-[var(--muted)] font-mono-ledger">
                marcus.wei@example.sg · +65 9123 4567 · Novena, Singapore
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 border border-[var(--mist)] p-1 bg-[var(--paper)] font-mono-ledger text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab("search")}
              className={`px-3 py-1.5 transition-colors whitespace-nowrap ${
                activeTab === "search"
                  ? "bg-[var(--surface)] text-[var(--clay)] font-semibold shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              Find Doctors
            </button>
            <button
              onClick={() => setActiveTab("book")}
              className={`px-3 py-1.5 transition-colors whitespace-nowrap ${
                activeTab === "book"
                  ? "bg-[var(--surface)] text-[var(--clay)] font-semibold shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              Book Appointment
            </button>
            <button
              onClick={() => setActiveTab("mybookings")}
              className={`px-3 py-1.5 transition-colors whitespace-nowrap ${
                activeTab === "mybookings"
                  ? "bg-[var(--surface)] text-[var(--clay)] font-semibold shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              My Consultations ({bookings.filter((b) => b.status === "confirmed" || b.status === "pending").length})
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: SEARCH & DIRECTORY */}
      {activeTab === "search" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Filter Rail */}
          <div className="lg:col-span-1 space-y-4">
            <div className="border border-[var(--mist)] bg-[var(--surface)] p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--mist)] font-mono-ledger text-xs">
                <span className="font-semibold text-[var(--ink)] uppercase">Specialties</span>
                {(selectedCategory !== "All" || selectedCity !== "All" || searchTerm) && (
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setSelectedCity("All");
                      setSearchTerm("");
                    }}
                    className="text-[var(--clay)] text-[11px] hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Specialty Category */}
              <div>
                <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-2 tracking-wider">
                  Select Specialty
                </label>
                <div className="space-y-1">
                  {["All", "Dental", "Massage", "Physio", "Dermatology"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-2.5 py-1.5 text-xs font-mono-ledger border transition-colors flex items-center justify-between ${
                        selectedCategory === cat
                          ? "border-[var(--clay)] bg-[var(--paper)] text-[var(--clay)] font-semibold"
                          : "border-transparent text-[var(--muted)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"
                      }`}
                    >
                      <span>{cat}</span>
                      {selectedCategory === cat && <span className="w-1.5 h-1.5 rounded-full bg-[var(--clay)]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* City Selection */}
              <div>
                <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-2 tracking-wider">
                  Location
                </label>
                <div className="space-y-1">
                  {["All", "Singapore", "Bangkok", "Kuala Lumpur", "Phuket", "Penang"].map((city) => (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      className={`w-full text-left px-2.5 py-1.5 text-xs font-mono-ledger border transition-colors flex items-center justify-between ${
                        selectedCity === city
                          ? "border-[var(--clay)] bg-[var(--paper)] text-[var(--clay)] font-semibold"
                          : "border-transparent text-[var(--muted)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"
                      }`}
                    >
                      <span>{city}</span>
                      {selectedCity === city && <span className="w-1.5 h-1.5 rounded-full bg-[var(--clay)]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-2 tracking-wider">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] text-xs font-mono-ledger text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
                >
                  <option value="rating">Top Rated Practitioners</option>
                  <option value="price-asc">Price: Lowest First</option>
                  <option value="price-desc">Price: Highest First</option>
                </select>
              </div>

              <div className="pt-2 border-t border-[var(--mist)] text-[11px] font-mono-ledger text-[var(--muted)] space-y-1">
                <div className="flex items-center gap-1.5 text-[var(--sage)]">
                  <Check className="w-3.5 h-3.5" />
                  <span>Licensed medical staff</span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--sage)]">
                  <Check className="w-3.5 h-3.5" />
                  <span>Pay at clinic after visit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Directory Feed */}
          <div className="lg:col-span-3 space-y-4">
            {/* Search Input Bar */}
            <div className="border border-[var(--mist)] bg-[var(--surface)] p-2.5 flex items-center gap-3">
              <Search className="w-4 h-4 text-[var(--muted)] flex-none ml-1" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search dentist, neuromuscular massage, spinal rehab, clinic name..."
                className="w-full text-xs font-sans-ledger bg-transparent text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-xs font-mono-ledger text-[var(--muted)] hover:text-[var(--ink)] px-2"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Doctor Cards */}
            <div className="space-y-4">
              {filteredDoctors.length === 0 ? (
                <div className="border border-[var(--mist)] bg-[var(--surface)] p-12 text-center text-xs font-mono-ledger text-[var(--muted)]">
                  No practitioners found matching your filter criteria.
                </div>
              ) : (
                filteredDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="border border-[var(--mist)] bg-[var(--surface)] p-5 hover:border-[var(--clay)]/50 transition-colors shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Doctor Info */}
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-[var(--mist)] flex-none flex items-center justify-center font-mono-ledger text-base font-bold text-[var(--ink)] border border-[var(--mist)]">
                          {doc.initials}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-[var(--ink)]">
                              {doc.name}
                            </h3>
                            <span className="badge-ledger badge-confirmed">Verified</span>
                          </div>
                          <div className="text-xs text-[var(--clay)] font-medium">
                            {doc.role}
                          </div>
                          <div className="text-xs text-[var(--muted)] flex items-center gap-3 font-mono-ledger pt-0.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[var(--muted)]" />
                              {doc.clinic} · {doc.location}
                            </span>
                            <span className="flex items-center gap-1 text-[var(--amber)]">
                              <Star className="w-3 h-3 fill-current" />
                              {doc.rating} ({doc.reviewsCount} reviews)
                            </span>
                          </div>
                          {doc.bio && (
                            <p className="text-xs text-[var(--muted)] font-sans-ledger pt-1.5 max-w-xl leading-relaxed">
                              {doc.bio}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Starting Price & Book Button */}
                      <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end flex-none pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--mist)]">
                        <div>
                          <span className="text-[10px] font-mono-ledger text-[var(--muted)] uppercase block">
                            Starting from
                          </span>
                          <span className="font-mono-ledger text-lg font-bold text-[var(--sage)]">
                            €{doc.price}.00
                          </span>
                        </div>
                        <button
                          onClick={() => handleStartBooking(doc)}
                          className="mt-2 bg-[var(--clay)] text-white px-4 py-2 font-mono-ledger text-xs font-semibold hover:opacity-95 transition-opacity flex items-center gap-1.5"
                        >
                          <span>Select Doctor</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Procedure Catalog Preview */}
                    <div className="mt-4 pt-3 border-t border-[var(--mist)]">
                      <div className="text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-2">
                        Available Procedures & Consultations
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {doc.services.map((svc) => (
                          <div
                            key={svc.id}
                            onClick={() => handleStartBooking(doc, svc.id)}
                            className="p-2 border border-[var(--mist)] bg-[var(--paper)] hover:border-[var(--clay)] cursor-pointer transition-colors flex justify-between items-center text-xs"
                          >
                            <div className="truncate pr-2">
                              <div className="font-medium text-[var(--ink)] truncate">
                                {svc.name}
                              </div>
                              <div className="text-[10px] font-mono-ledger text-[var(--muted)]">
                                {svc.duration}
                              </div>
                            </div>
                            <span className="font-mono-ledger font-semibold text-[var(--ink)] flex-none">
                              €{svc.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: FULL BOOKING WORKFLOW (STEP 1 - 4) */}
      {activeTab === "book" && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Stepper Progress Bar */}
          <div className="border border-[var(--mist)] bg-[var(--surface)] p-3">
            <div className="grid grid-cols-4 gap-2 text-center font-mono-ledger text-xs">
              {[
                { num: 1, label: "1. Procedure" },
                { num: 2, label: "2. Date & Slot" },
                { num: 3, label: "3. Patient Info" },
                { num: 4, label: "4. Confirm" },
              ].map((s) => (
                <button
                  key={s.num}
                  onClick={() => setBookingStep(s.num as any)}
                  className={`py-1.5 border transition-colors ${
                    bookingStep === s.num
                      ? "border-[var(--clay)] bg-[var(--paper)] text-[var(--clay)] font-semibold"
                      : bookingStep > s.num
                      ? "border-[var(--mist)] bg-[var(--surface)] text-[var(--sage)]"
                      : "border-[var(--mist)] bg-[var(--surface)] text-[var(--muted)]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Doctor Summary Card */}
          <div className="border border-[var(--mist)] bg-[var(--surface)] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[var(--mist)] flex items-center justify-center font-mono-ledger font-bold text-sm text-[var(--ink)]">
                {selectedDoctor.initials}
              </div>
              <div>
                <div className="font-bold text-sm text-[var(--ink)]">
                  {selectedDoctor.name}
                </div>
                <div className="text-xs text-[var(--muted)]">
                  {selectedDoctor.role} · {selectedDoctor.clinic}
                </div>
                <div className="text-[11px] font-mono-ledger text-[var(--muted)]">
                  {selectedDoctor.location}
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("search")}
              className="text-xs font-mono-ledger text-[var(--clay)] hover:underline"
            >
              Change Doctor
            </button>
          </div>

          {/* STEP 1: SELECT PROCEDURE */}
          {bookingStep === 1 && (
            <div className="border border-[var(--mist)] bg-[var(--surface)] p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--mist)]">
                <h3 className="font-bold text-sm text-[var(--ink)]">
                  Select Procedure / Consultation
                </h3>
                <span className="font-mono-ledger text-xs text-[var(--muted)]">
                  Transparent Fee Schedule
                </span>
              </div>

              <div className="space-y-2">
                {selectedDoctor.services.map((svc) => {
                  const isSelected = activeBookingDraft.serviceId === svc.id;
                  return (
                    <div
                      key={svc.id}
                      onClick={() =>
                        setActiveBookingDraft((prev) => ({ ...prev, serviceId: svc.id }))
                      }
                      className={`p-3.5 border cursor-pointer transition-all flex items-start justify-between gap-4 ${
                        isSelected
                          ? "border-[var(--clay)] bg-[var(--paper)]"
                          : "border-[var(--mist)] bg-[var(--surface)] hover:border-[var(--muted)]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-4 h-4 mt-0.5 border flex items-center justify-center ${
                            isSelected
                              ? "border-[var(--clay)] bg-[var(--clay)] text-white"
                              : "border-[var(--mist)]"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-[var(--ink)]">
                            {svc.name}
                          </div>
                          {svc.description && (
                            <div className="text-xs text-[var(--muted)] mt-0.5 font-sans-ledger">
                              {svc.description}
                            </div>
                          )}
                          <div className="text-[11px] font-mono-ledger text-[var(--muted)] mt-1">
                            Duration: {svc.duration}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-none">
                        <div className="font-mono-ledger text-sm font-bold text-[var(--ink)]">
                          €{svc.price}.00
                        </div>
                        <span className="badge-ledger badge-confirmed mt-1">Available</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-3">
                <button
                  onClick={() => setBookingStep(2)}
                  className="bg-[var(--clay)] text-white px-5 py-2.5 font-mono-ledger text-xs font-semibold hover:opacity-95 flex items-center gap-1.5"
                >
                  <span>Continue to Date & Slot</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SELECT DATE & TIME SLOT */}
          {bookingStep === 2 && (
            <div className="border border-[var(--mist)] bg-[var(--surface)] p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--mist)]">
                <h3 className="font-bold text-sm text-[var(--ink)]">
                  Pick Appointment Date & Time
                </h3>
                <span className="font-mono-ledger text-xs text-[var(--muted)]">
                  Real-Time Physician Schedule
                </span>
              </div>

              {/* Day Tabs */}
              <div>
                <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-2">
                  Select Day
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {["Mon 29 Sep", "Tue 30 Sep", "Wed 1 Oct", "Thu 2 Oct", "Fri 3 Oct"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setActiveBookingDraft((prev) => ({ ...prev, day: d }))}
                      className={`font-mono-ledger text-xs px-3.5 py-2 border whitespace-nowrap transition-colors ${
                        activeBookingDraft.day === d
                          ? "border-[var(--clay)] text-[var(--clay)] bg-[var(--paper)] font-semibold shadow-xs"
                          : "border-[var(--mist)] text-[var(--muted)] bg-[var(--surface)] hover:border-[var(--muted)]"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Morning Slots */}
              <div>
                <div className="text-[11px] font-mono-ledger uppercase text-[var(--muted)] mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--clay)]" />
                  <span>Morning Sessions (09:00 – 12:00)</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {[
                    { time: "09:00", open: true },
                    { time: "09:45", open: true },
                    { time: "10:30", open: true },
                    { time: "11:15", open: true },
                    { time: "12:00", open: false },
                  ].map((s) => {
                    const isSelected = activeBookingDraft.time === s.time;
                    if (!s.open) {
                      return (
                        <div
                          key={s.time}
                          className="font-mono-ledger text-xs py-2 text-center border border-[var(--mist)] text-[var(--mist)] line-through bg-[var(--paper)] select-none"
                          title="Booked by another patient"
                        >
                          {s.time}
                        </div>
                      );
                    }
                    return (
                      <button
                        key={s.time}
                        onClick={() => setActiveBookingDraft((prev) => ({ ...prev, time: s.time }))}
                        className={`font-mono-ledger text-xs py-2 text-center border transition-all ${
                          isSelected
                            ? "border-[var(--clay)] text-[var(--clay)] bg-[var(--paper)] font-semibold shadow-xs"
                            : "border-[var(--mist)] text-[var(--ink)] bg-[var(--surface)] hover:border-[var(--muted)]"
                        }`}
                      >
                        {s.time}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Afternoon Slots */}
              <div>
                <div className="text-[11px] font-mono-ledger uppercase text-[var(--muted)] mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--clay)]" />
                  <span>Afternoon Sessions (14:00 – 17:00)</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {[
                    { time: "14:00", open: true },
                    { time: "14:45", open: true },
                    { time: "15:30", open: false },
                    { time: "16:15", open: true },
                  ].map((s) => {
                    const isSelected = activeBookingDraft.time === s.time;
                    if (!s.open) {
                      return (
                        <div
                          key={s.time}
                          className="font-mono-ledger text-xs py-2 text-center border border-[var(--mist)] text-[var(--mist)] line-through bg-[var(--paper)] select-none"
                        >
                          {s.time}
                        </div>
                      );
                    }
                    return (
                      <button
                        key={s.time}
                        onClick={() => setActiveBookingDraft((prev) => ({ ...prev, time: s.time }))}
                        className={`font-mono-ledger text-xs py-2 text-center border transition-all ${
                          isSelected
                            ? "border-[var(--clay)] text-[var(--clay)] bg-[var(--paper)] font-semibold shadow-xs"
                            : "border-[var(--mist)] text-[var(--ink)] bg-[var(--surface)] hover:border-[var(--muted)]"
                        }`}
                      >
                        {s.time}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-[var(--mist)]">
                <button
                  onClick={() => setBookingStep(1)}
                  className="text-xs font-mono-ledger text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  ← Back to Procedure
                </button>
                <button
                  onClick={() => setBookingStep(3)}
                  className="bg-[var(--clay)] text-white px-5 py-2.5 font-mono-ledger text-xs font-semibold hover:opacity-95 flex items-center gap-1.5"
                >
                  <span>Continue to Patient Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PATIENT INTAKE INFORMATION */}
          {bookingStep === 3 && (
            <div className="border border-[var(--mist)] bg-[var(--surface)] p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--mist)]">
                <h3 className="font-bold text-sm text-[var(--ink)]">
                  Patient Intake & Contact Information
                </h3>
                <span className="font-mono-ledger text-xs text-[var(--muted)]">
                  Encrypted Health Records
                </span>
              </div>

              <div className="space-y-3 font-sans-ledger text-xs">
                <div>
                  <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={activeBookingDraft.patientName}
                    onChange={(e) =>
                      setActiveBookingDraft((prev) => ({ ...prev, patientName: e.target.value }))
                    }
                    className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                      Email for Confirmation
                    </label>
                    <input
                      type="email"
                      value={activeBookingDraft.patientEmail}
                      onChange={(e) =>
                        setActiveBookingDraft((prev) => ({ ...prev, patientEmail: e.target.value }))
                      }
                      className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                      Mobile Phone (SMS Reminders)
                    </label>
                    <input
                      type="tel"
                      value={activeBookingDraft.patientPhone}
                      onChange={(e) =>
                        setActiveBookingDraft((prev) => ({ ...prev, patientPhone: e.target.value }))
                      }
                      className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] font-mono-ledger text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                    Reason for Consultation / Medical Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe symptoms, relevant allergies, or prior treatments..."
                    value={activeBookingDraft.patientNotes}
                    onChange={(e) =>
                      setActiveBookingDraft((prev) => ({ ...prev, patientNotes: e.target.value }))
                    }
                    className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
                  />
                </div>

                <div className="p-3 bg-[var(--paper)] border border-[var(--mist)] text-[11px] font-mono-ledger text-[var(--muted)] flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--sage)] flex-none mt-0.5" />
                  <span>
                    Your health information is confidential and shared solely with the treating clinician at {selectedDoctor.clinic}.
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-[var(--mist)]">
                <button
                  onClick={() => setBookingStep(2)}
                  className="text-xs font-mono-ledger text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  ← Back to Slot Picker
                </button>
                <button
                  onClick={() => setBookingStep(4)}
                  className="bg-[var(--clay)] text-white px-5 py-2.5 font-mono-ledger text-xs font-semibold hover:opacity-95 flex items-center gap-1.5"
                >
                  <span>Review Booking Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {bookingStep === 4 && (
            <div className="border border-[var(--mist)] bg-[var(--surface)] p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--mist)]">
                <h3 className="font-bold text-sm text-[var(--ink)]">
                  Review & Finalize Booking
                </h3>
                <span className="badge-ledger badge-confirmed">No Booking Surcharges</span>
              </div>

              {/* Structured Summary Table */}
              <div className="border border-[var(--mist)] bg-[var(--surface)] divide-y divide-[var(--mist)] text-xs font-sans-ledger">
                <div className="p-3 flex justify-between">
                  <span className="text-[var(--muted)]">Treating Provider</span>
                  <span className="font-semibold text-[var(--ink)] font-mono-ledger">
                    {selectedDoctor.name} ({selectedDoctor.role.split("·")[0]})
                  </span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-[var(--muted)]">Clinic Facility</span>
                  <span className="font-semibold text-[var(--ink)] font-mono-ledger">
                    {selectedDoctor.clinic} · {selectedDoctor.location}
                  </span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-[var(--muted)]">Selected Procedure</span>
                  <span className="font-semibold text-[var(--ink)] font-mono-ledger">
                    {selectedDoctor.services.find((s) => s.id === activeBookingDraft.serviceId)?.name}
                  </span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-[var(--muted)]">Session Time</span>
                  <span className="font-semibold text-[var(--clay)] font-mono-ledger">
                    {activeBookingDraft.day} at {activeBookingDraft.time}
                  </span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-[var(--muted)]">Patient</span>
                  <span className="font-semibold text-[var(--ink)] font-mono-ledger">
                    {activeBookingDraft.patientName} ({activeBookingDraft.patientPhone})
                  </span>
                </div>
                <div className="p-3 bg-[var(--paper)] flex justify-between font-mono-ledger text-sm">
                  <span className="font-bold text-[var(--ink)]">Total Due at Clinic</span>
                  <span className="font-bold text-[var(--sage)]">
                    €{selectedDoctor.services.find((s) => s.id === activeBookingDraft.serviceId)?.price}.00
                  </span>
                </div>
              </div>

              <div className="text-[11px] font-mono-ledger text-[var(--muted)] space-y-1">
                <div>· Free cancellation up to 24 hours prior to appointment time.</div>
                <div>· Pay in person via card or cash upon consultation conclusion.</div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-[var(--mist)]">
                <button
                  onClick={() => setBookingStep(3)}
                  className="text-xs font-mono-ledger text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  ← Edit Details
                </button>
                <button
                  onClick={handleFinalizeBooking}
                  className="bg-[var(--clay)] text-white px-6 py-3 font-mono-ledger text-xs font-bold hover:opacity-95 shadow-xs flex items-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Confirm Appointment · €{selectedDoctor.services.find((s) => s.id === activeBookingDraft.serviceId)?.price}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: CONFIRMATION SUCCESS */}
      {activeTab === "confirm" && latestBooking && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="border border-[var(--mist)] bg-[var(--surface)] p-8 text-center space-y-4">
            <div className="w-14 h-14 border-2 border-[var(--sage)] rounded-full flex items-center justify-center mx-auto text-[var(--sage)]">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <span className="badge-ledger badge-confirmed mb-2">Registration Confirmed</span>
              <h2 className="text-2xl font-bold text-[var(--ink)] tracking-tight">
                Your Appointment is Booked
              </h2>
              <p className="text-xs text-[var(--muted)] font-mono-ledger mt-1">
                Booking Reference: <span className="font-bold text-[var(--clay)]">{latestBooking.reference}</span>
              </p>
            </div>

            {/* Structured Receipt Ledger */}
            <div className="border border-[var(--mist)] bg-[var(--surface)] text-left divide-y divide-[var(--mist)] text-xs font-sans-ledger max-w-md mx-auto">
              <div className="p-3 flex justify-between">
                <span className="text-[var(--muted)]">Practitioner</span>
                <span className="font-mono-ledger font-semibold text-[var(--ink)]">
                  {latestBooking.doctorName}
                </span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-[var(--muted)]">Service</span>
                <span className="font-mono-ledger text-[var(--ink)]">
                  {latestBooking.serviceName}
                </span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-[var(--muted)]">Date & Slot</span>
                <span className="font-mono-ledger font-semibold text-[var(--clay)]">
                  {latestBooking.date} · {latestBooking.time}
                </span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-[var(--muted)]">Location</span>
                <span className="font-mono-ledger text-[var(--ink)]">
                  {latestBooking.clinicName} ({latestBooking.clinicAddress})
                </span>
              </div>
              <div className="p-3 bg-[var(--paper)] flex justify-between font-mono-ledger">
                <span className="font-bold text-[var(--ink)]">Total Payable</span>
                <span className="font-bold text-[var(--sage)]">€{latestBooking.price}.00</span>
              </div>
            </div>

            {/* Preparation Instructions */}
            <div className="p-4 bg-[var(--paper)] border border-[var(--mist)] text-left text-xs font-mono-ledger text-[var(--muted)] space-y-1 max-w-md mx-auto">
              <div className="font-semibold text-[var(--ink)] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[var(--clay)]" />
                <span>Patient Arrival Protocol:</span>
              </div>
              <div>· Please arrive 10 minutes before your slot for registration.</div>
              <div>· Bring a government-issued photo ID or digital insurance card.</div>
              <div>· Free parking available at the medical center garage.</div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2 font-mono-ledger text-xs">
              <button
                onClick={() => addToast({ type: "success", title: "Calendar Exported", message: "iCalendar (.ics) downloaded to device." })}
                className="bg-[var(--clay)] text-white px-5 py-2.5 font-semibold hover:opacity-95 flex items-center justify-center gap-1.5"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Add to Calendar (.ics)</span>
              </button>

              <button
                onClick={() => setActiveTab("mybookings")}
                className="border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)] px-5 py-2.5 hover:border-[var(--clay)] transition-colors"
              >
                View in My Consultations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: MY BOOKINGS */}
      {activeTab === "mybookings" && (
        <div className="space-y-6">
          <div className="border border-[var(--mist)] bg-[var(--surface)] p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--mist)]">
              <div>
                <h3 className="font-bold text-base text-[var(--ink)]">
                  Upcoming Consultations
                </h3>
                <p className="text-xs text-[var(--muted)] font-mono-ledger">
                  Scheduled care appointments & modification controls
                </p>
              </div>

              <button
                onClick={() => setActiveTab("search")}
                className="font-mono-ledger text-xs text-[var(--clay)] border border-[var(--clay)] px-3 py-1.5 hover:bg-[var(--clay)] hover:text-white transition-colors"
              >
                + Book New Care
              </button>
            </div>

            <div className="divide-y divide-[var(--mist)] border border-[var(--mist)]">
              {bookings.filter((b) => b.status === "confirmed" || b.status === "pending").length === 0 ? (
                <div className="p-8 text-center text-xs font-mono-ledger text-[var(--muted)]">
                  No upcoming appointments. Click '+ Book New Care' to browse practitioners.
                </div>
              ) : (
                bookings
                  .filter((b) => b.status === "confirmed" || b.status === "pending")
                  .map((b) => (
                    <div key={b.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-ledger text-xs font-bold text-[var(--clay)]">
                            {b.reference}
                          </span>
                          <span
                            className={`badge-ledger ${
                              b.status === "confirmed" ? "badge-confirmed" : "badge-pending"
                            }`}
                          >
                            {b.status === "confirmed" ? "Confirmed" : "Pending Clinic Triage"}
                          </span>
                        </div>
                        <div className="font-bold text-sm text-[var(--ink)]">
                          {b.serviceName}
                        </div>
                        <div className="text-xs font-mono-ledger text-[var(--muted)]">
                          {b.doctorName} · {b.clinicName}
                        </div>
                        <div className="text-xs font-mono-ledger text-[var(--ink)] flex items-center gap-2 pt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-[var(--clay)]" />
                          <span className="font-semibold">{b.date}</span>
                          <span>·</span>
                          <Clock className="w-3.5 h-3.5 text-[var(--clay)]" />
                          <span className="font-semibold">{b.time}</span>
                          <span>·</span>
                          <span className="text-[var(--sage)] font-bold">€{b.price}.00</span>
                        </div>
                      </div>

                      {/* Mini Actions */}
                      <div className="flex items-center gap-2 font-mono-ledger text-xs flex-none">
                        <button
                          onClick={() => setReschedulingBooking(b)}
                          className="px-3 py-1.5 border border-[var(--mist)] text-[var(--ink)] hover:border-[var(--clay)] hover:text-[var(--clay)] transition-colors"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => setCancellingBooking(b)}
                          className="px-3 py-1.5 border border-[var(--mist)] text-[var(--muted)] hover:border-[var(--clay)] hover:text-[var(--clay)] transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => addToast({ type: "info", title: "PDF Receipt", message: `Generated invoice slip for ${b.reference}.` })}
                          className="p-1.5 border border-[var(--mist)] text-[var(--muted)] hover:text-[var(--ink)]"
                          title="Download receipt slip"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Past History Table */}
          <div className="border border-[var(--mist)] bg-[var(--surface)] p-6 space-y-4">
            <div className="pb-2 border-b border-[var(--mist)]">
              <h3 className="font-bold text-base text-[var(--ink)]">
                Past Consultations History
              </h3>
              <p className="text-xs text-[var(--muted)] font-mono-ledger">
                Completed health visits & medical receipts
              </p>
            </div>

            <div className="divide-y divide-[var(--mist)] border border-[var(--mist)]">
              {bookings
                .filter((b) => b.status === "completed" || b.status === "cancelled")
                .map((b) => (
                  <div key={b.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium text-[var(--ink)]">
                        {b.serviceName}
                      </div>
                      <div className="text-[11px] font-mono-ledger text-[var(--muted)]">
                        {b.doctorName} · {b.clinicName} · {b.date}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono-ledger font-semibold text-[var(--ink)]">
                        €{b.price}.00
                      </span>
                      <span
                        className={`badge-ledger ${
                          b.status === "completed" ? "badge-completed" : "badge-muted"
                        }`}
                      >
                        {b.status === "completed" ? "Completed" : "Cancelled"}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESCHEDULE */}
      {reschedulingBooking && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] border border-[var(--mist)] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--mist)]">
              <h3 className="font-bold text-base text-[var(--ink)]">
                Reschedule {reschedulingBooking.reference}
              </h3>
              <button
                onClick={() => setReschedulingBooking(null)}
                className="text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[var(--muted)] font-sans-ledger">
              Select an alternative open slot for <span className="font-semibold text-[var(--ink)]">{reschedulingBooking.serviceName}</span> with {reschedulingBooking.doctorName}.
            </div>

            <div>
              <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                New Target Day
              </label>
              <select
                value={newRescheduleDate}
                onChange={(e) => setNewRescheduleDate(e.target.value)}
                className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] text-xs font-mono-ledger text-[var(--ink)]"
              >
                <option value="Tue 30 Sep">Tue 30 Sep</option>
                <option value="Wed 1 Oct">Wed 1 Oct</option>
                <option value="Thu 2 Oct">Thu 2 Oct</option>
                <option value="Fri 3 Oct">Fri 3 Oct</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                Available Open Time
              </label>
              <div className="grid grid-cols-3 gap-2 font-mono-ledger text-xs">
                {["10:00", "11:30", "14:15", "15:00", "16:30"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewRescheduleTime(t)}
                    className={`py-2 border text-center ${
                      newRescheduleTime === t
                        ? "border-[var(--clay)] bg-[var(--paper)] text-[var(--clay)] font-semibold"
                        : "border-[var(--mist)] text-[var(--ink)]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[var(--mist)] font-mono-ledger text-xs">
              <button
                onClick={() => setReschedulingBooking(null)}
                className="flex-1 py-2 border border-[var(--mist)] text-[var(--muted)]"
              >
                Cancel
              </button>
              <button
                onClick={executeReschedule}
                className="flex-1 py-2 bg-[var(--clay)] text-white font-semibold"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CANCEL */}
      {cancellingBooking && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] border border-[var(--mist)] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--mist)]">
              <h3 className="font-bold text-base text-[var(--ink)]">
                Cancel Consultation {cancellingBooking.reference}
              </h3>
              <button
                onClick={() => setCancellingBooking(null)}
                className="text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[var(--paper)] border border-[var(--clay)] text-xs font-mono-ledger text-[var(--clay)]">
              Cancellation is permitted without penalty since consultation is &gt;24 hours ahead.
            </div>

            <div>
              <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                Reason for Cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] text-xs font-sans-ledger text-[var(--ink)]"
              >
                <option value="Schedule conflict">Schedule conflict</option>
                <option value="Symptoms improved">Symptoms improved</option>
                <option value="Need different specialist">Need different specialist</option>
                <option value="Financial reasons">Financial reasons</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[var(--mist)] font-mono-ledger text-xs">
              <button
                onClick={() => setCancellingBooking(null)}
                className="flex-1 py-2 border border-[var(--mist)] text-[var(--muted)]"
              >
                Keep Booking
              </button>
              <button
                onClick={executeCancel}
                className="flex-1 py-2 bg-[var(--clay)] text-white font-semibold"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
