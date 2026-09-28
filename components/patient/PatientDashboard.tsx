"use client";

import React, { useState } from "react";
import { useMedcinStore, Doctor, Booking } from "@/lib/store";
import { useBranding } from "@/lib/branding";
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
  Globe2,
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

  const { branding, formatCurrency } = useBranding();

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
      const matchCity =
        selectedCity === "All" ||
        doc.location.toLowerCase().includes(selectedCity.toLowerCase()) ||
        doc.clinic.toLowerCase().includes(selectedCity.toLowerCase());
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
      patientName: activeBookingDraft.patientName || "Marcus Wei",
      patientEmail: activeBookingDraft.patientEmail || "marcus.wei@example.sg",
      patientPhone: activeBookingDraft.patientPhone || "+65 9123 4567",
      patientNotes: activeBookingDraft.patientNotes,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      doctorRole: selectedDoctor.role.split("·")[0].trim(),
      clinicName: selectedDoctor.clinic,
      clinicAddress: selectedDoctor.location,
      serviceName: selectedSvc.name,
      duration: selectedSvc.duration,
      date: activeBookingDraft.day || "Tue 30 Sep",
      time: activeBookingDraft.time || "10:30",
      price: selectedSvc.price,
      status: "confirmed",
    });

    setLatestBooking(newBooking);
    setActiveTab("confirm");
    addToast({
      type: "success",
      title: "Appointment Reserved",
      message: `Direct confirmation code ${newBooking.reference} issued.`,
    });
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
      <div className="backdrop-blur-xl bg-white/80 dark:bg-[#1B1F18]/85 border border-white/70 dark:border-white/10 p-6 md:p-8 rounded-3xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--clay)]/10 text-[var(--clay)] border border-[var(--clay)]/20 flex items-center justify-center font-mono-ledger text-lg font-bold shadow-xs">
              MW
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] tracking-tight">
                  Marcus Wei
                </h2>
                <span className="badge-ledger badge-confirmed font-mono-ledger text-xs px-3 py-1 rounded-full font-semibold">
                  Patient Workspace
                </span>
              </div>
              <p className="text-sm text-[var(--muted)] font-mono-ledger mt-1">
                marcus.wei@example.sg · +65 9123 4567 · Novena, Singapore
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="inline-flex p-1.5 bg-[var(--paper)] border border-[var(--mist)] rounded-full text-sm font-semibold overflow-x-auto shadow-inner">
            <button
              onClick={() => setActiveTab("search")}
              className={`px-5 py-2 rounded-full transition-all whitespace-nowrap ${
                activeTab === "search"
                  ? "bg-[var(--clay)] text-white shadow-xs font-semibold"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              Find Doctors
            </button>
            <button
              onClick={() => setActiveTab("book")}
              className={`px-5 py-2 rounded-full transition-all whitespace-nowrap ${
                activeTab === "book"
                  ? "bg-[var(--clay)] text-white shadow-xs font-semibold"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              Book Appointment
            </button>
            <button
              onClick={() => setActiveTab("mybookings")}
              className={`px-5 py-2 rounded-full transition-all whitespace-nowrap ${
                activeTab === "mybookings"
                  ? "bg-[var(--clay)] text-white shadow-xs font-semibold"
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
            <div className="backdrop-blur-xl bg-white/80 dark:bg-[#1B1F18]/85 border border-white/70 dark:border-white/10 p-6 rounded-3xl shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--mist)] text-sm">
                <span className="font-bold text-[var(--ink)] uppercase tracking-wider text-xs font-mono-ledger">Specialties & Filters</span>
                {(selectedCategory !== "All" || selectedCity !== "All" || searchTerm) && (
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setSelectedCity("All");
                      setSearchTerm("");
                    }}
                    className="text-xs font-semibold text-[var(--clay)] hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Specialty Category */}
              <div>
                <label className="block text-xs font-semibold font-mono-ledger uppercase text-[var(--muted)] mb-2.5 tracking-wider">
                  Select Specialty
                </label>
                <div className="space-y-1.5">
                  {["All", "Dental", "Massage", "Physio", "Dermatology"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3.5 py-2 text-sm rounded-xl transition-all flex items-center justify-between font-medium ${
                        selectedCategory === cat
                          ? "border border-[var(--clay)] bg-[var(--clay)] text-white font-semibold shadow-xs"
                          : "text-[var(--muted)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"
                      }`}
                    >
                      <span>{cat === "All" ? "All Specialties" : cat}</span>
                      {selectedCategory === cat && <span className="w-2 h-2 rounded-full bg-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* City Selection */}
              <div>
                <label className="block text-xs font-semibold font-mono-ledger uppercase text-[var(--muted)] mb-2.5 tracking-wider">
                  Target Hub / Geography
                </label>
                <div className="space-y-1.5">
                  {[
                    { key: "All", label: "All ASEAN Hubs", flag: "🌏" },
                    { key: "Singapore", label: "Singapore (Novena)", flag: "🇸🇬" },
                    { key: "Bangkok", label: "Bangkok (Sukhumvit)", flag: "🇹🇭" },
                    { key: "Kuala Lumpur", label: "Kuala Lumpur (KLCC)", flag: "🇲🇾" },
                    { key: "Phuket", label: "Phuket (Laguna)", flag: "🇹🇭" },
                    { key: "Penang", label: "Penang (George Town)", flag: "🇲🇾" },
                  ].map((city) => (
                    <button
                      key={city.key}
                      onClick={() => setSelectedCity(city.key)}
                      className={`w-full text-left px-3.5 py-2 text-sm rounded-xl transition-all flex items-center justify-between font-medium ${
                        selectedCity === city.key
                          ? "border border-[var(--clay)] bg-[var(--clay)] text-white font-semibold shadow-xs"
                          : "text-[var(--muted)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span>{city.flag}</span>
                        <span className="truncate">{city.label}</span>
                      </div>
                      {selectedCity === city.key && <span className="w-2 h-2 rounded-full bg-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-xs font-semibold font-mono-ledger uppercase text-[var(--muted)] mb-2.5 tracking-wider">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full p-3 border border-[var(--mist)] bg-[var(--surface)] text-sm font-medium text-[var(--ink)] focus:outline-none focus:border-[var(--clay)] rounded-xl"
                >
                  <option value="rating">Top Rated Practitioners</option>
                  <option value="price-asc">Price: Lowest First</option>
                  <option value="price-desc">Price: Highest First</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[var(--mist)] text-xs text-[var(--muted)] space-y-1.5 font-sans-ledger">
                <div className="flex items-center gap-2 text-[var(--sage)] font-medium">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Licensed MOH / JCI specialists</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--sage)] font-medium">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Pay at clinic after visit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Directory Feed */}
          <div className="lg:col-span-3 space-y-4">
            {/* Search Input Bar */}
            <div className="backdrop-blur-xl bg-white/80 dark:bg-[#1B1F18]/85 border border-white/70 dark:border-white/10 p-4 rounded-2xl shadow-sm flex items-center gap-3">
              <Search className="w-5 h-5 text-[var(--muted)] ml-1 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search practitioner by name, specialty, or clinic in Singapore, Bangkok, KL..."
                className="w-full bg-transparent text-sm font-sans-ledger text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-[var(--muted)] hover:text-[var(--ink)] p-1.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Doctor Cards List */}
            <div className="space-y-4">
              {filteredDoctors.length === 0 ? (
                <div className="backdrop-blur-xl bg-white/80 dark:bg-[#1B1F18]/85 border border-white/70 dark:border-white/10 p-12 text-center rounded-3xl">
                  <div className="text-base font-bold text-[var(--ink)]">
                    No practitioners matching criteria
                  </div>
                  <p className="text-sm text-[var(--muted)] font-mono-ledger mt-1">
                    Try broadening your specialty selection or choosing all ASEAN Hubs.
                  </p>
                </div>
              ) : (
                filteredDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="backdrop-blur-xl bg-white/85 dark:bg-[#1B1F18]/85 border border-white/70 dark:border-white/10 p-6 sm:p-7 rounded-3xl shadow-sm hover:shadow-md hover:border-[var(--clay)] transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row justify-between gap-5">
                      {/* Doctor Info */}
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--paper)] border border-[var(--mist)] flex items-center justify-center font-mono-ledger text-lg font-bold text-[var(--clay)] flex-none shadow-xs">
                          {doc.initials}
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="font-bold text-lg sm:text-xl text-[var(--ink)]">
                              {doc.name}
                            </h3>
                            <span className="badge-ledger badge-confirmed font-mono-ledger text-xs px-2.5 py-0.5 rounded-full font-semibold">
                              Verified
                            </span>
                            <div className="flex items-center gap-1 text-[var(--amber)] text-sm font-mono-ledger font-medium">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="font-bold">{doc.rating}</span>
                              <span className="text-[var(--muted)]">({doc.reviewsCount})</span>
                            </div>
                          </div>

                          <div className="text-sm font-medium text-[var(--clay)]">
                            {doc.role}
                          </div>

                          <div className="text-xs sm:text-sm font-sans-ledger text-[var(--muted)] flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 flex-none text-[var(--clay)]" />
                            <span>{doc.clinic} · {doc.location}</span>
                          </div>

                          {doc.bio && (
                            <p className="text-sm text-[var(--muted)] font-sans-ledger pt-1 max-w-xl leading-relaxed">
                              {doc.bio}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Starting Price & Book Button */}
                      <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end flex-none pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--mist)] gap-2">
                        <div>
                          <span className="text-xs font-mono-ledger text-[var(--muted)] uppercase font-semibold block">
                            Starting from
                          </span>
                          <span className="font-mono-ledger text-xl sm:text-2xl font-bold text-[var(--sage)]">
                            {formatCurrency(doc.price)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleStartBooking(doc)}
                          className="mt-1 bg-[var(--clay)] text-white px-6 py-3 rounded-xl font-mono-ledger text-sm font-semibold hover:opacity-95 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
                        >
                          <span>Select Doctor</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Procedure Catalog Preview */}
                    <div className="mt-4 pt-3.5 border-t border-[var(--mist)]/70">
                      <div className="text-xs font-semibold font-mono-ledger uppercase text-[var(--muted)] tracking-wider mb-2.5">
                        Available Procedures & Consultations
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {doc.services.map((svc) => (
                          <div
                            key={svc.id}
                            onClick={() => handleStartBooking(doc, svc.id)}
                            className="p-3.5 border border-[var(--mist)] bg-[var(--paper)] rounded-2xl hover:border-[var(--clay)] cursor-pointer transition-all flex justify-between items-center text-sm shadow-2xs hover:shadow-xs"
                          >
                            <div className="truncate pr-2">
                              <div className="font-semibold text-[var(--ink)] truncate">
                                {svc.name}
                              </div>
                              <div className="text-xs font-mono-ledger text-[var(--muted)] mt-0.5">
                                {svc.duration}
                              </div>
                            </div>
                            <span className="font-mono-ledger font-bold text-[var(--ink)] text-sm sm:text-base flex-none">
                              {formatCurrency(svc.price)}
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
          <div className="backdrop-blur-xl bg-white/80 dark:bg-[#1B1F18]/85 border border-white/70 dark:border-white/10 p-3 rounded-2xl shadow-sm">
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
                  className={`py-2 rounded-xl border transition-all ${
                    bookingStep === s.num
                      ? "border-[var(--clay)] bg-[var(--clay)] text-white font-semibold shadow-xs"
                      : bookingStep > s.num
                      ? "border-[var(--mist)] bg-[var(--paper)] text-[var(--sage)]"
                      : "border-transparent text-[var(--muted)]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Doctor Summary Card */}
          <div className="backdrop-blur-xl bg-white/80 dark:bg-[#1B1F18]/85 border border-white/70 dark:border-white/10 p-5 rounded-3xl shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[var(--clay)]/10 text-[var(--clay)] border border-[var(--clay)]/20 flex items-center justify-center font-mono-ledger font-bold text-sm shadow-xs">
                {selectedDoctor.initials}
              </div>
              <div>
                <div className="font-bold text-base sm:text-lg text-[var(--ink)]">
                  {selectedDoctor.name}
                </div>
                <div className="text-sm text-[var(--muted)]">
                  {selectedDoctor.role} · {selectedDoctor.clinic}
                </div>
                <div className="text-xs text-[var(--muted)] font-mono-ledger mt-0.5">
                  {selectedDoctor.location}
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("search")}
              className="text-sm font-semibold text-[var(--clay)] hover:underline"
            >
              Change Doctor
            </button>
          </div>

          {/* STEP 1: SELECT PROCEDURE */}
          {bookingStep === 1 && (
            <div className="backdrop-blur-xl bg-white/85 dark:bg-[#1B1F18]/85 border border-white/70 dark:border-white/10 p-6 sm:p-8 rounded-3xl shadow-sm space-y-5">
              <div className="flex justify-between items-center pb-3 border-b border-[var(--mist)]">
                <h3 className="font-bold text-lg text-[var(--ink)]">
                  Select Procedure / Consultation
                </h3>
                <span className="text-xs uppercase font-semibold tracking-wider text-[var(--muted)]">
                  Transparent Fee Schedule
                </span>
              </div>

              <div className="space-y-3">
                {selectedDoctor.services.map((svc) => {
                  const isSelected = activeBookingDraft.serviceId === svc.id;
                  return (
                    <div
                      key={svc.id}
                      onClick={() =>
                        setActiveBookingDraft((prev) => ({ ...prev, serviceId: svc.id }))
                      }
                      className={`p-5 border rounded-2xl cursor-pointer transition-all flex items-start justify-between gap-4 ${
                        isSelected
                          ? "border-[var(--clay)] bg-[var(--paper)] shadow-xs"
                          : "border-[var(--mist)] bg-[var(--surface)] hover:border-[var(--muted)]"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-5 h-5 mt-0.5 rounded-full border flex items-center justify-center transition-all ${
                            isSelected
                              ? "border-[var(--clay)] bg-[var(--clay)] text-white"
                              : "border-[var(--mist)]"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="font-bold text-base text-[var(--ink)]">
                            {svc.name}
                          </div>
                          {svc.description && (
                            <div className="text-sm text-[var(--muted)] mt-1 font-sans-ledger">
                              {svc.description}
                            </div>
                          )}
                          <div className="text-xs text-[var(--muted)] font-mono-ledger mt-1.5">
                            Duration: {svc.duration}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-none">
                        <div className="font-mono-ledger text-base sm:text-lg font-bold text-[var(--ink)]">
                          {formatCurrency(svc.price)}
                        </div>
                        <span className="badge-ledger badge-confirmed mt-1.5 rounded-full text-xs font-semibold px-2.5 py-0.5">
                          Available
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-3">
                <button
                  onClick={() => setBookingStep(2)}
                  className="bg-[var(--clay)] text-white px-7 py-3 rounded-xl text-sm font-semibold hover:opacity-95 flex items-center gap-2 shadow-sm shadow-[var(--clay)]/20"
                >
                  <span>Continue to Date & Slot</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SELECT DATE & TIME SLOT */}
          {bookingStep === 2 && (
            <div className="backdrop-blur-xl bg-white/85 dark:bg-[#1B1F18]/85 border border-white/70 dark:border-white/10 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-[var(--mist)]">
                <h3 className="font-bold text-lg text-[var(--ink)]">
                  Pick Appointment Date & Time
                </h3>
                <span className="text-xs uppercase font-semibold tracking-wider text-[var(--muted)]">
                  Real-Time Physician Schedule
                </span>
              </div>

              {/* Day Tabs */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2.5">
                  Select Day
                </label>
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {["Mon 29 Sep", "Tue 30 Sep", "Wed 1 Oct", "Thu 2 Oct", "Fri 3 Oct"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setActiveBookingDraft((prev) => ({ ...prev, day: d }))}
                      className={`text-sm px-5 py-2.5 rounded-xl border whitespace-nowrap font-semibold transition-all ${
                        activeBookingDraft.day === d
                          ? "border-[var(--clay)] text-white bg-[var(--clay)] shadow-xs"
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
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--clay)]" />
                  <span>Morning Sessions (09:00 – 12:00)</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
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
                          className="font-mono-ledger text-sm py-3 text-center border border-[var(--mist)] text-[var(--mist)] line-through bg-[var(--paper)] rounded-xl select-none"
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
                        className={`font-mono-ledger text-sm py-3 text-center border rounded-xl font-semibold transition-all ${
                          isSelected
                            ? "border-[var(--clay)] text-white bg-[var(--clay)] shadow-xs"
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
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--clay)]" />
                  <span>Afternoon Sessions (13:30 – 17:00)</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                  {[
                    { time: "13:30", open: true },
                    { time: "14:15", open: true },
                    { time: "15:00", open: true },
                    { time: "15:45", open: true },
                    { time: "16:30", open: true },
                  ].map((s) => {
                    const isSelected = activeBookingDraft.time === s.time;
                    return (
                      <button
                        key={s.time}
                        onClick={() => setActiveBookingDraft((prev) => ({ ...prev, time: s.time }))}
                        className={`font-mono-ledger text-sm py-3 text-center border rounded-xl font-semibold transition-all ${
                          isSelected
                            ? "border-[var(--clay)] text-white bg-[var(--clay)] shadow-xs"
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
                  className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  ← Back to Procedure
                </button>
                <button
                  onClick={() => setBookingStep(3)}
                  className="bg-[var(--clay)] text-white px-7 py-3 rounded-xl text-sm font-semibold hover:opacity-95 flex items-center gap-2 shadow-sm shadow-[var(--clay)]/20"
                >
                  <span>Continue to Patient Info</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PATIENT INFORMATION */}
          {bookingStep === 3 && (
            <div className="backdrop-blur-xl bg-white/85 dark:bg-[#1B1F18]/85 border border-white/70 dark:border-white/10 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-[var(--mist)]">
                <h3 className="font-bold text-lg text-[var(--ink)]">
                  Patient Contact & Clinical Notes
                </h3>
                <span className="text-xs uppercase font-semibold tracking-wider text-[var(--muted)]">
                  PDPA & HIPAA Encrypted
                </span>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={activeBookingDraft.patientName || "Marcus Wei"}
                    onChange={(e) =>
                      setActiveBookingDraft((prev) => ({ ...prev, patientName: e.target.value }))
                    }
                    className="w-full p-3.5 border border-[var(--mist)] bg-white/80 dark:bg-[#141712]/80 rounded-xl text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={activeBookingDraft.patientEmail || "marcus.wei@example.sg"}
                      onChange={(e) =>
                        setActiveBookingDraft((prev) => ({ ...prev, patientEmail: e.target.value }))
                      }
                      className="w-full p-3.5 border border-[var(--mist)] bg-white/80 dark:bg-[#141712]/80 rounded-xl text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                      Phone Number (WhatsApp notifications)
                    </label>
                    <input
                      type="tel"
                      value={activeBookingDraft.patientPhone || "+65 9123 4567"}
                      onChange={(e) =>
                        setActiveBookingDraft((prev) => ({ ...prev, patientPhone: e.target.value }))
                      }
                      className="w-full p-3.5 border border-[var(--mist)] bg-white/80 dark:bg-[#141712]/80 rounded-xl text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                    Symptoms or Clinical Intake Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={activeBookingDraft.patientNotes || ""}
                    onChange={(e) =>
                      setActiveBookingDraft((prev) => ({ ...prev, patientNotes: e.target.value }))
                    }
                    placeholder="Briefly state reason for visit or existing medications..."
                    className="w-full p-3.5 border border-[var(--mist)] bg-white/80 dark:bg-[#141712]/80 rounded-xl text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20 font-sans-ledger"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-[var(--mist)]">
                <button
                  onClick={() => setBookingStep(2)}
                  className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  ← Back to Slot Selection
                </button>
                <button
                  onClick={() => setBookingStep(4)}
                  className="bg-[var(--clay)] text-white px-7 py-3 rounded-xl text-sm font-semibold hover:opacity-95 flex items-center gap-2 shadow-sm shadow-[var(--clay)]/20"
                >
                  <span>Review & Finalize</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {bookingStep === 4 && (
            <div className="backdrop-blur-xl bg-white/85 dark:bg-[#1B1F18]/85 border border-white/70 dark:border-white/10 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-[var(--mist)]">
                <h3 className="font-bold text-lg text-[var(--ink)]">
                  Review Appointment Summary
                </h3>
                <span className="badge-ledger badge-confirmed text-xs font-semibold px-3 py-1 rounded-full">
                  Zero Upfront Charge
                </span>
              </div>

              <div className="border border-[var(--mist)] divide-y divide-[var(--mist)] text-sm rounded-2xl overflow-hidden bg-white/50 dark:bg-black/20">
                <div className="p-4 flex justify-between items-center">
                  <span className="text-[var(--muted)]">Physician</span>
                  <span className="font-bold text-[var(--ink)]">
                    {selectedDoctor.name} ({selectedDoctor.role})
                  </span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="text-[var(--muted)]">Location</span>
                  <span className="font-semibold text-[var(--ink)] text-right">
                    {selectedDoctor.clinic} · {selectedDoctor.location}
                  </span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="text-[var(--muted)]">Service / Procedure</span>
                  <span className="font-semibold text-[var(--ink)]">
                    {selectedDoctor.services.find((s) => s.id === activeBookingDraft.serviceId)?.name} (
                    {selectedDoctor.services.find((s) => s.id === activeBookingDraft.serviceId)?.duration})
                  </span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="text-[var(--muted)]">Slot Time</span>
                  <span className="font-bold text-[var(--clay)]">
                    {activeBookingDraft.day || "Tue 30 Sep"} at {activeBookingDraft.time || "10:30"}
                  </span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="text-[var(--muted)]">Patient</span>
                  <span className="font-semibold text-[var(--ink)]">
                    {activeBookingDraft.patientName || "Marcus Wei"} ({activeBookingDraft.patientPhone || "+65 9123 4567"})
                  </span>
                </div>
                <div className="p-4 bg-[var(--paper)] flex justify-between items-center text-base">
                  <span className="font-bold text-[var(--ink)]">Total Due at Clinic</span>
                  <span className="font-bold text-xl text-[var(--sage)]">
                    {formatCurrency(
                      selectedDoctor.services.find((s) => s.id === activeBookingDraft.serviceId)?.price || 0
                    )}
                  </span>
                </div>
              </div>

              <div className="text-xs text-[var(--muted)] space-y-1.5 leading-relaxed bg-[var(--paper)] p-4 rounded-xl border border-[var(--mist)]">
                <div>· Free cancellation up to 24 hours prior to appointment time.</div>
                <div>· Pay in person via credit card, PayNow/PromptPay, or cash upon consultation conclusion.</div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-[var(--mist)]">
                <button
                  onClick={() => setBookingStep(3)}
                  className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  ← Edit Details
                </button>
                <button
                  onClick={handleFinalizeBooking}
                  className="bg-[var(--clay)] text-white px-8 py-3.5 rounded-xl text-sm font-bold hover:opacity-95 shadow-sm shadow-[var(--clay)]/20 flex items-center gap-2"
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>
                    Confirm Appointment ·{" "}
                    {formatCurrency(
                      selectedDoctor.services.find((s) => s.id === activeBookingDraft.serviceId)?.price || 0
                    )}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: CONFIRMATION SUCCESS */}
      {activeTab === "confirm" && latestBooking && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="backdrop-blur-xl bg-white/85 dark:bg-[#1B1F18]/85 border border-white/70 dark:border-white/10 p-8 sm:p-10 rounded-3xl text-center space-y-5 shadow-xl">
            <div className="w-16 h-16 border-2 border-[var(--sage)] rounded-full flex items-center justify-center mx-auto text-[var(--sage)] bg-[var(--sage)]/10 shadow-sm">
              <Check className="w-9 h-9 stroke-[3]" />
            </div>

            <div>
              <span className="badge-ledger badge-confirmed mb-2 rounded-full text-xs font-semibold px-4 py-1 inline-block">
                Registration Confirmed
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] tracking-tight">
                Your Appointment is Booked
              </h2>
              <p className="text-sm text-[var(--muted)] mt-1.5">
                Booking Reference: <span className="font-bold text-[var(--clay)]">{latestBooking.reference}</span>
              </p>
            </div>

            {/* Structured Receipt Ledger */}
            <div className="border border-[var(--mist)] bg-[var(--surface)] text-left divide-y divide-[var(--mist)] text-sm max-w-lg mx-auto rounded-2xl overflow-hidden shadow-xs">
              <div className="p-4 flex justify-between items-center">
                <span className="text-[var(--muted)]">Practitioner</span>
                <span className="font-bold text-[var(--ink)]">
                  {latestBooking.doctorName}
                </span>
              </div>
              <div className="p-4 flex justify-between items-center">
                <span className="text-[var(--muted)]">Service</span>
                <span className="font-semibold text-[var(--ink)]">
                  {latestBooking.serviceName}
                </span>
              </div>
              <div className="p-4 flex justify-between items-center">
                <span className="text-[var(--muted)]">Date & Slot</span>
                <span className="font-bold text-[var(--clay)]">
                  {latestBooking.date} · {latestBooking.time}
                </span>
              </div>
              <div className="p-4 flex justify-between items-center">
                <span className="text-[var(--muted)]">Location</span>
                <span className="font-semibold text-[var(--ink)] text-right">
                  {latestBooking.clinicName} ({latestBooking.clinicAddress})
                </span>
              </div>
              <div className="p-4 bg-[var(--paper)] flex justify-between items-center text-base">
                <span className="font-bold text-[var(--ink)]">Total Payable</span>
                <span className="font-bold text-xl text-[var(--sage)]">{formatCurrency(latestBooking.price)}</span>
              </div>
            </div>

            {/* Preparation Instructions */}
            <div className="p-4 bg-[var(--paper)] border border-[var(--mist)] text-left text-xs font-mono-ledger text-[var(--muted)] space-y-1 max-w-md mx-auto rounded-2xl">
              <div className="font-semibold text-[var(--ink)] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[var(--clay)]" />
                <span>Patient Arrival Protocol:</span>
              </div>
              <div>· Please arrive 10 minutes before your slot for digital registration.</div>
              <div>· Bring a government-issued photo ID (NRIC / Passport).</div>
              <div>· Free parking available at the medical center garage.</div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2 font-mono-ledger text-xs">
              <button
                onClick={() =>
                  addToast({
                    type: "success",
                    title: "Calendar Exported",
                    message: "iCalendar (.ics) downloaded to device.",
                  })
                }
                className="bg-[var(--clay)] text-white px-6 py-2.5 rounded-xl font-semibold hover:opacity-95 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Add to Calendar (.ics)</span>
              </button>

              <button
                onClick={() => setActiveTab("mybookings")}
                className="border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)] px-6 py-2.5 rounded-xl hover:border-[var(--clay)] transition-colors"
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
          <div className="backdrop-blur-xl bg-white/85 dark:bg-[#1B1F18]/85 border border-white/70 dark:border-white/10 p-6 sm:p-8 rounded-3xl shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--mist)] gap-3">
              <div>
                <h3 className="font-bold text-xl sm:text-2xl text-[var(--ink)]">
                  Upcoming Consultations
                </h3>
                <p className="text-sm text-[var(--muted)] font-mono-ledger mt-0.5">
                  Scheduled care appointments & modification controls
                </p>
              </div>

              <button
                onClick={() => setActiveTab("search")}
                className="font-mono-ledger text-sm font-semibold text-[var(--clay)] border border-[var(--clay)] px-5 py-2.5 rounded-xl hover:bg-[var(--clay)] hover:text-white transition-all shadow-xs self-start sm:self-auto"
              >
                + Book New Care
              </button>
            </div>

            <div className="divide-y divide-[var(--mist)] border border-[var(--mist)] rounded-2xl overflow-hidden">
              {bookings.filter((b) => b.status === "confirmed" || b.status === "pending").length === 0 ? (
                <div className="p-12 text-center text-sm font-mono-ledger text-[var(--muted)]">
                  No upcoming appointments. Click '+ Book New Care' to browse practitioners.
                </div>
              ) : (
                bookings
                  .filter((b) => b.status === "confirmed" || b.status === "pending")
                  .map((b) => (
                    <div key={b.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-[var(--paper)]/40 transition-colors">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono-ledger text-xs font-bold text-[var(--clay)] px-2.5 py-0.5 rounded-full bg-[var(--clay)]/10 border border-[var(--clay)]/20">
                            {b.reference}
                          </span>
                          <span
                            className={`badge-ledger rounded-full text-xs font-semibold px-3 py-0.5 ${
                              b.status === "confirmed" ? "badge-confirmed" : "badge-pending"
                            }`}
                          >
                            {b.status === "confirmed" ? "Confirmed" : "Pending Clinic Triage"}
                          </span>
                        </div>
                        <div className="font-bold text-base sm:text-lg text-[var(--ink)]">
                          {b.serviceName}
                        </div>
                        <div className="text-sm font-sans-ledger text-[var(--muted)]">
                          {b.doctorName} · {b.clinicName}
                        </div>
                        <div className="text-sm font-sans-ledger text-[var(--ink)] flex items-center gap-3 pt-1">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Calendar className="w-4 h-4 text-[var(--clay)] shrink-0" />
                            <span>{b.date}</span>
                          </div>
                          <span>·</span>
                          <div className="flex items-center gap-1.5 font-medium">
                            <Clock className="w-4 h-4 text-[var(--clay)] shrink-0" />
                            <span>{b.time}</span>
                          </div>
                          <span>·</span>
                          <span className="text-[var(--sage)] font-bold font-mono-ledger text-base">{formatCurrency(b.price)}</span>
                        </div>
                      </div>

                      {/* Mini Actions */}
                      <div className="flex items-center gap-2 font-mono-ledger text-sm flex-none">
                        <button
                          onClick={() => setReschedulingBooking(b)}
                          className="px-4 py-2 border border-[var(--mist)] rounded-xl text-[var(--ink)] font-semibold hover:border-[var(--clay)] hover:text-[var(--clay)] transition-all shadow-2xs"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => setCancellingBooking(b)}
                          className="px-4 py-2 border border-[var(--mist)] rounded-xl text-[var(--muted)] hover:border-[var(--clay)] hover:text-[var(--clay)] transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() =>
                            addToast({
                              type: "info",
                              title: "PDF Receipt",
                              message: `Generated invoice slip for ${b.reference}.`,
                            })
                          }
                          className="p-2.5 border border-[var(--mist)] rounded-xl text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--ink)] transition-all"
                          title="Download receipt slip"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Past History Table */}
          <div className="backdrop-blur-xl bg-white/85 dark:bg-[#1B1F18]/85 border border-white/70 dark:border-white/10 p-6 sm:p-8 rounded-3xl shadow-sm space-y-5">
            <div className="pb-3 border-b border-[var(--mist)]">
              <h3 className="font-bold text-lg text-[var(--ink)]">
                Past Consultations History
              </h3>
              <p className="text-sm text-[var(--muted)] mt-1">
                Completed health visits & medical receipts
              </p>
            </div>

            <div className="divide-y divide-[var(--mist)] border border-[var(--mist)] rounded-2xl overflow-hidden bg-[var(--surface)]">
              {bookings
                .filter((b) => b.status === "completed" || b.status === "cancelled")
                .map((b) => (
                  <div key={b.id} className="p-4 flex items-center justify-between text-sm hover:bg-[var(--paper)]/50 transition-colors">
                    <div>
                      <div className="font-bold text-[var(--ink)]">
                        {b.serviceName}
                      </div>
                      <div className="text-xs text-[var(--muted)] mt-0.5">
                        {b.doctorName} · {b.clinicName} · {b.date}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-mono-ledger font-bold text-base text-[var(--ink)]">
                        {formatCurrency(b.price)}
                      </span>
                      <span
                        className={`badge-ledger rounded-full text-xs font-semibold px-3 py-1 ${
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-2xl bg-white/95 dark:bg-[#1B1F18]/95 border border-white/80 dark:border-white/10 p-6 sm:p-8 max-w-lg w-full shadow-2xl rounded-3xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--mist)]">
              <h3 className="font-bold text-lg sm:text-xl text-[var(--ink)]">
                Reschedule {reschedulingBooking.reference}
              </h3>
              <button
                onClick={() => setReschedulingBooking(null)}
                className="text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-full hover:bg-[var(--paper)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-sm text-[var(--muted)] leading-relaxed">
              Select an alternative open slot for{" "}
              <span className="font-semibold text-[var(--ink)]">{reschedulingBooking.serviceName}</span> with{" "}
              {reschedulingBooking.doctorName}.
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                New Target Day
              </label>
              <select
                value={newRescheduleDate}
                onChange={(e) => setNewRescheduleDate(e.target.value)}
                className="w-full p-3.5 border border-[var(--mist)] bg-[var(--surface)] text-sm font-semibold text-[var(--ink)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
              >
                <option value="Tue 30 Sep">Tue 30 Sep</option>
                <option value="Wed 1 Oct">Wed 1 Oct</option>
                <option value="Thu 2 Oct">Thu 2 Oct</option>
                <option value="Fri 3 Oct">Fri 3 Oct</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                Available Open Time
              </label>
              <div className="grid grid-cols-3 gap-2.5 text-sm font-semibold">
                {["10:00", "11:30", "14:15", "15:00", "16:30"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewRescheduleTime(t)}
                    className={`py-3 rounded-xl border text-center transition-all ${
                      newRescheduleTime === t
                        ? "border-[var(--clay)] bg-[var(--clay)] text-white shadow-xs"
                        : "border-[var(--mist)] text-[var(--ink)] bg-[var(--surface)] hover:border-[var(--muted)]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-[var(--mist)] text-sm">
              <button
                onClick={() => setReschedulingBooking(null)}
                className="flex-1 py-3 border border-[var(--mist)] text-[var(--muted)] font-semibold rounded-xl hover:bg-[var(--paper)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeReschedule}
                className="flex-1 py-3 bg-[var(--clay)] text-white font-semibold rounded-xl hover:opacity-95 shadow-sm shadow-[var(--clay)]/20"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CANCEL */}
      {cancellingBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-2xl bg-white/95 dark:bg-[#1B1F18]/95 border border-white/80 dark:border-white/10 p-6 sm:p-8 max-w-lg w-full shadow-2xl rounded-3xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--mist)]">
              <h3 className="font-bold text-lg sm:text-xl text-[var(--ink)]">
                Cancel Consultation {cancellingBooking.reference}
              </h3>
              <button
                onClick={() => setCancellingBooking(null)}
                className="text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-full hover:bg-[var(--paper)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[var(--paper)] border border-[var(--clay)]/30 text-sm text-[var(--clay)] font-medium rounded-xl leading-relaxed">
              Cancellation is permitted without penalty since consultation is &gt;24 hours ahead.
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                Reason for Cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-3.5 border border-[var(--mist)] bg-[var(--surface)] text-sm text-[var(--ink)] rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
              >
                <option value="Schedule conflict">Schedule conflict</option>
                <option value="Symptoms improved">Symptoms improved</option>
                <option value="Need different specialist">Need different specialist</option>
                <option value="Financial reasons">Financial reasons</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex gap-3 pt-3 border-t border-[var(--mist)] text-sm">
              <button
                onClick={() => setCancellingBooking(null)}
                className="flex-1 py-3 border border-[var(--mist)] text-[var(--muted)] font-semibold rounded-xl hover:bg-[var(--paper)] transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={executeCancel}
                className="flex-1 py-3 bg-[var(--clay)] text-white font-semibold rounded-xl hover:opacity-95 shadow-sm shadow-[var(--clay)]/20"
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
