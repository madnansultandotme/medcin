"use client";

import React, { useState, useEffect } from "react";
import { useMedcinStore, Doctor, Booking } from "@/lib/store";
import { useBranding } from "@/lib/branding";
import {
  Building2,
  Stethoscope,
  Clock,
  Inbox,
  Check,
  Plus,
  Trash2,
  Copy,
  Calendar,
  XCircle,
  Search,
  Camera,
  Upload,
  Image as ImageIcon,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export function CenterDashboard() {
  const { branding, formatCurrency } = useBranding();
  const {
    centers,
    updateCenterProfile,
    doctors,
    addDoctor,
    updateDoctor,
    addProcedure,
    removeProcedure,
    bookings,
    updateBookingStatus,
    selectedDoctorAvailability,
    setSelectedDoctorAvailability,
    selectedDayAvailability,
    setSelectedDayAvailability,
    slotStates,
    toggleSlot,
    copySlotsToRestOfWeek,
    addToast,
  } = useMedcinStore();

  const [activeTab, setActiveTab] = useState<"onboarding" | "doctors" | "availability" | "inbox">("inbox");
  const currentCenter = centers.find((c) => c.id === "c-1") || centers[0];

  // Inbox Filters
  const [inboxFilter, setInboxFilter] = useState<"all" | "pending" | "confirmed" | "completed">("all");
  const [inboxSearch, setInboxSearch] = useState("");

  // Modals
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showAddProcedureModal, setShowAddProcedureModal] = useState(false);
  const [declineBookingModal, setDeclineBookingModal] = useState<Booking | null>(null);
  const [declineReason, setDeclineReason] = useState("Practitioner unavailable for emergency");

  // Form states for adding doctor
  const [newDocName, setNewDocName] = useState("");
  const [newDocRole, setNewDocRole] = useState("Dentist · Restorative Surgery");
  const [newDocLicense, setNewDocLicense] = useState("SG-MOH-9420");
  const [newDocPrice, setNewDocPrice] = useState("85");
  const [newDocBio, setNewDocBio] = useState("");

  // Form states for adding procedure
  const [targetDoctorId, setTargetDoctorId] = useState("doc-1");
  const [newProcName, setNewProcName] = useState("");
  const [newProcDuration, setNewProcDuration] = useState("30 min");
  const [newProcPrice, setNewProcPrice] = useState("45");
  const [newProcDesc, setNewProcDesc] = useState("");

  // Center Profile edit state
  const [profileForm, setProfileForm] = useState({
    name: currentCenter.name,
    category: currentCenter.category,
    address: currentCenter.address,
    email: currentCenter.email,
    phone: currentCenter.phone,
    licenseNumber: currentCenter.licenseNumber,
    operatingHours: currentCenter.operatingHours || "Mon-Fri 08:30 – 19:30, Sat 09:00 – 16:00",
    logo: currentCenter.logo || "/images/centers/center-novena-logo.jpg",
    coverImage: currentCenter.coverImage || "/images/centers/center-novena.jpg",
    amenities: currentCenter.amenities || [
      "Wheelchair Accessible",
      "On-site Diagnostics",
      "Multilingual Interpreters",
      "Complimentary Valet",
      "Direct MOH Integration",
    ],
  });

  useEffect(() => {
    if (currentCenter) {
      setProfileForm({
        name: currentCenter.name,
        category: currentCenter.category,
        address: currentCenter.address,
        email: currentCenter.email,
        phone: currentCenter.phone,
        licenseNumber: currentCenter.licenseNumber,
        operatingHours: currentCenter.operatingHours || "Mon-Fri 08:30 – 19:30, Sat 09:00 – 16:00",
        logo: currentCenter.logo || "/images/centers/center-novena-logo.jpg",
        coverImage: currentCenter.coverImage || "/images/centers/center-novena.jpg",
        amenities: currentCenter.amenities || [
          "Wheelchair Accessible",
          "On-site Diagnostics",
          "Multilingual Interpreters",
          "Complimentary Valet",
          "Direct MOH Integration",
        ],
      });
    }
  }, [currentCenter]);

  const centerBookings = bookings.filter((b) =>
    b.clinicName.toLowerCase().includes("dental")
  );

  const pendingCount = centerBookings.filter((b) => b.status === "pending").length;
  const confirmedCount = centerBookings.filter((b) => b.status === "confirmed").length;

  const filteredInbox = centerBookings
    .filter((b) => {
      if (inboxFilter === "pending") return b.status === "pending";
      if (inboxFilter === "confirmed") return b.status === "confirmed";
      if (inboxFilter === "completed") return b.status === "completed";
      return true;
    })
    .filter(
      (b) =>
        b.patientName.toLowerCase().includes(inboxSearch.toLowerCase()) ||
        b.reference.toLowerCase().includes(inboxSearch.toLowerCase()) ||
        b.serviceName.toLowerCase().includes(inboxSearch.toLowerCase())
    );

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCenterProfile(profileForm);
    addToast({
      type: "success",
      title: "Practice Profile Saved",
      message: "Clinic branding assets, facility photos, and licensing details updated.",
    });
  };

  const handleCreateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName) return;
    addDoctor({
      name: newDocName,
      role: newDocRole,
      category: "Dental",
      clinic: currentCenter.name,
      location: currentCenter.address,
      price: parseInt(newDocPrice, 10) || 45,
      rating: 5.0,
      reviewsCount: 1,
      initials: newDocName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
      licenseNumber: newDocLicense,
      active: true,
      bio: newDocBio,
      services: [
        {
          id: `s-${Date.now()}`,
          name: "Initial Consultation",
          duration: "30 min",
          price: parseInt(newDocPrice, 10) || 45,
          description: "Diagnostic checkup and treatment roadmap.",
        },
      ],
    });
    setNewDocName("");
    setNewDocBio("");
    setShowAddDoctorModal(false);
  };

  const handleCreateProcedure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProcName) return;
    addProcedure(targetDoctorId, {
      name: newProcName,
      duration: newProcDuration,
      price: parseInt(newProcPrice, 10) || 40,
      description: newProcDesc,
    });
    setNewProcName("");
    setNewProcDesc("");
    setShowAddProcedureModal(false);
  };

  const executeDeclineBooking = () => {
    if (!declineBookingModal) return;
    updateBookingStatus(declineBookingModal.id, "cancelled", declineReason);
    setDeclineBookingModal(null);
  };

  const clinicDoctors = doctors.filter((d) => d.clinic.includes("Dental"));

  return (
    <div className="space-y-6">
      {/* Clinic Operations Header */}
      <div className="rounded-3xl border border-[var(--mist)] bg-[var(--surface)] p-6 md:p-8 shadow-sm backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#141712] border border-[var(--mist)] flex items-center justify-center overflow-hidden shadow-xs relative flex-none p-1.5">
              {currentCenter.logo ? (
                <img
                  src={currentCenter.logo}
                  alt={currentCenter.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <Building2 className="w-7 h-7 text-[var(--clay)]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-[var(--ink)] tracking-tight">
                  {currentCenter.name}
                </h2>
                <span className="badge-ledger badge-confirmed rounded-full px-2.5 py-0.5 text-xs font-semibold">MOH Accredited</span>
              </div>
              <p className="text-xs text-[var(--muted)] font-mono-ledger mt-0.5">
                {currentCenter.category} · {currentCenter.address} · License: {currentCenter.licenseNumber}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 font-mono-ledger text-xs">
            <div className="rounded-2xl border border-[var(--mist)] p-4 bg-[var(--paper)] text-right shadow-2xs min-w-[120px]">
              <span className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider block mb-1">Pending Inbox</span>
              <span className="text-2xl sm:text-3xl font-bold text-[var(--amber)]">{pendingCount}</span>
            </div>
            <div className="rounded-2xl border border-[var(--mist)] p-4 bg-[var(--paper)] text-right shadow-2xs min-w-[120px]">
              <span className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider block mb-1">Confirmed Visits</span>
              <span className="text-2xl sm:text-3xl font-bold text-[var(--sage)]">{confirmedCount}</span>
            </div>
            <div className="rounded-2xl border border-[var(--mist)] p-4 bg-[var(--paper)] text-right shadow-2xs min-w-[120px]">
              <span className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider block mb-1">Doctors On Duty</span>
              <span className="text-2xl sm:text-3xl font-bold text-[var(--ink)]">{clinicDoctors.length}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 border border-[var(--mist)] p-1.5 bg-[var(--paper)] font-mono-ledger text-xs mt-6 overflow-x-auto rounded-full">
          <button
            onClick={() => setActiveTab("inbox")}
            className={`px-4 py-2 transition-all whitespace-nowrap flex items-center gap-2 rounded-full ${
              activeTab === "inbox"
                ? "bg-[var(--surface)] text-[var(--clay)] font-semibold shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Bookings Inbox {pendingCount > 0 ? `(${pendingCount})` : ""}</span>
          </button>

          <button
            onClick={() => setActiveTab("availability")}
            className={`px-4 py-2 transition-all whitespace-nowrap flex items-center gap-2 rounded-full ${
              activeTab === "availability"
                ? "bg-[var(--surface)] text-[var(--clay)] font-semibold shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Availability Schedule</span>
          </button>

          <button
            onClick={() => setActiveTab("doctors")}
            className={`px-4 py-2 transition-all whitespace-nowrap flex items-center gap-2 rounded-full ${
              activeTab === "doctors"
                ? "bg-[var(--surface)] text-[var(--clay)] font-semibold shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctors & Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab("onboarding")}
            className={`px-4 py-2 transition-all whitespace-nowrap flex items-center gap-2 rounded-full ${
              activeTab === "onboarding"
                ? "bg-[var(--surface)] text-[var(--clay)] font-semibold shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Practice Profile & Legal</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: BOOKINGS INBOX */}
      {activeTab === "inbox" && (
        <div className="rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-[#1B1F18]/85 border border-white/70 dark:border-white/10 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--mist)]">
            <div>
              <h3 className="font-bold text-xl sm:text-2xl text-[var(--ink)]">
                Appointments Inbox
              </h3>
              <p className="text-sm text-[var(--muted)] font-mono-ledger mt-0.5">
                Patient consultation requests and real-time appointment dispatch
              </p>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="text"
                  placeholder="Filter patient or reference..."
                  value={inboxSearch}
                  onChange={(e) => setInboxSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 text-sm border border-[var(--mist)] bg-[var(--paper)] text-[var(--ink)] font-sans-ledger focus:outline-none focus:border-[var(--clay)] rounded-xl"
                />
              </div>

              <div className="flex p-1 bg-[var(--paper)] border border-[var(--mist)] rounded-full text-xs font-mono-ledger">
                {(["all", "pending", "confirmed", "completed"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setInboxFilter(f)}
                    className={`px-3.5 py-1.5 rounded-full capitalize font-semibold transition-all ${
                      inboxFilter === f
                        ? "bg-[var(--clay)] text-white shadow-xs"
                        : "text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Feed */}
          <div className="divide-y divide-[var(--mist)] border border-[var(--mist)] rounded-2xl overflow-hidden bg-white/40 dark:bg-black/20">
            {filteredInbox.length === 0 ? (
              <div className="p-12 text-center text-sm font-mono-ledger text-[var(--muted)]">
                No bookings found matching current filters.
              </div>
            ) : (
              filteredInbox.map((b) => {
                const isPending = b.status === "pending";
                return (
                  <div key={b.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-[var(--paper)]/50 transition-colors">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono-ledger text-xs font-bold text-[var(--clay)] px-2.5 py-0.5 rounded-full bg-[var(--clay)]/10 border border-[var(--clay)]/20">
                          {b.reference}
                        </span>
                        <span
                          className={`badge-ledger rounded-full text-xs font-semibold px-3 py-0.5 ${
                            isPending
                              ? "badge-pending"
                              : b.status === "confirmed"
                              ? "badge-confirmed"
                              : "badge-completed"
                          }`}
                        >
                          {isPending ? "Pending Clinic Approval" : b.status}
                        </span>
                        <span className="text-xs font-mono-ledger text-[var(--muted)]">
                          Booked {new Date(b.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="font-bold text-base sm:text-lg text-[var(--ink)] flex items-center gap-2">
                        <span>{b.patientName}</span>
                        <span className="text-sm font-normal text-[var(--muted)]">
                          ({b.patientPhone} · {b.patientEmail})
                        </span>
                      </div>

                      <div className="text-sm text-[var(--muted)] font-sans-ledger flex items-center gap-2">
                        <span className="font-semibold text-[var(--ink)]">{b.serviceName}</span>
                        <span>·</span>
                        <span>Doctor: {b.doctorName}</span>
                        <span>·</span>
                        <span className="font-mono-ledger text-xs">{b.duration}</span>
                      </div>

                      <div className="text-sm font-sans-ledger text-[var(--ink)] flex items-center gap-3 pt-0.5">
                        <div className="flex items-center gap-1.5 font-medium text-[var(--clay)]">
                          <Calendar className="w-4 h-4 shrink-0" />
                          <span>{b.date} at {b.time}</span>
                        </div>
                        <span>·</span>
                        <span className="font-bold text-[var(--sage)] font-mono-ledger text-base">{formatCurrency(b.price)}</span>
                      </div>

                      {b.patientNotes && (
                        <div className="text-sm text-[var(--muted)] font-sans-ledger bg-[var(--paper)] p-3 border border-[var(--mist)] rounded-xl mt-2 max-w-xl">
                          <span className="font-semibold text-[var(--ink)] font-mono-ledger text-xs block uppercase mb-0.5">
                            Patient Note:
                          </span>
                          {b.patientNotes}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2.5 font-mono-ledger text-sm flex-none">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => updateBookingStatus(b.id, "confirmed")}
                            className="bg-[var(--sage)] text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-xs"
                          >
                            <Check className="w-4 h-4" />
                            <span>Accept</span>
                          </button>

                          <button
                            onClick={() => setDeclineBookingModal(b)}
                            className="border border-[var(--mist)] text-[var(--muted)] px-4 py-2 rounded-xl hover:border-[var(--clay)] hover:text-[var(--clay)] transition-all font-semibold"
                          >
                            Decline
                          </button>
                        </>
                      ) : b.status === "confirmed" ? (
                        <>
                          <button
                            onClick={() => updateBookingStatus(b.id, "completed")}
                            className="border border-[var(--sage)] text-[var(--sage)] px-4 py-2 rounded-xl hover:bg-[var(--sage)] hover:text-white transition-all font-semibold shadow-2xs"
                          >
                            Mark Completed
                          </button>
                          <button
                            onClick={() => setDeclineBookingModal(b)}
                            className="border border-[var(--mist)] text-[var(--muted)] px-3 py-2 rounded-xl hover:text-[var(--clay)] hover:border-[var(--clay)] transition-all"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <span className="badge-ledger badge-completed">Archived</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: AVAILABILITY SCHEDULER */}
      {activeTab === "availability" && (
        <div className="rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-[#1B1F18]/85 border border-white/70 dark:border-white/10 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--mist)]">
            <div>
              <h3 className="font-bold text-xl sm:text-2xl text-[var(--ink)]">
                Slot Availability Scheduler
              </h3>
              <p className="text-sm text-[var(--muted)] font-mono-ledger mt-0.5">
                Click any slot to open or block consultation appointments across the regional calendar
              </p>
            </div>

            <button
              onClick={copySlotsToRestOfWeek}
              className="bg-[var(--clay)] text-white px-5 py-2.5 rounded-xl font-mono-ledger text-sm font-semibold hover:opacity-95 flex items-center gap-2 shadow-xs transition-all self-start sm:self-auto"
            >
              <Copy className="w-4 h-4" />
              <span>Clone {selectedDayAvailability} Schedule to Week</span>
            </button>
          </div>

          {/* Practitioner Selector Chips */}
          <div>
            <label className="block text-xs font-semibold font-mono-ledger uppercase text-[var(--muted)] mb-2.5 tracking-wider">
              Select Physician
            </label>
            <div className="flex gap-2.5 flex-wrap">
              {clinicDoctors.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoctorAvailability(doc.id)}
                  className={`px-4 py-2 rounded-xl font-mono-ledger text-sm flex items-center gap-2 transition-all ${
                    selectedDoctorAvailability === doc.id
                      ? "border border-[var(--clay)] bg-[var(--paper)] text-[var(--clay)] font-semibold shadow-xs"
                      : "border border-[var(--mist)] text-[var(--muted)] bg-[var(--surface)] hover:border-[var(--muted)]"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--sage)]" />
                  <span>{doc.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Weekday Selector */}
          <div>
            <label className="block text-xs font-semibold font-mono-ledger uppercase text-[var(--muted)] mb-2.5 tracking-wider">
              Day of Week
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDayAvailability(day)}
                  className={`px-5 py-2.5 rounded-xl border font-mono-ledger text-sm font-semibold transition-all ${
                    selectedDayAvailability === day
                      ? "border-[var(--clay)] text-white bg-[var(--clay)] shadow-xs"
                      : "border-[var(--mist)] text-[var(--muted)] bg-[var(--surface)] hover:text-[var(--ink)] hover:border-[var(--muted)]"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Slot Grid Matrix */}
          <div>
            <div className="flex justify-between items-center text-sm font-mono-ledger text-[var(--muted)] mb-3">
              <span>Appointment Matrix (30-minute intervals)</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-[var(--clay)] font-medium">
                  <span className="w-3 h-3 border border-[var(--clay)] bg-[var(--paper)] rounded-xs inline-block" />
                  <span>Available</span>
                </span>
                <span className="flex items-center gap-1.5 text-[var(--muted)]">
                  <span className="w-3 h-3 border border-[var(--mist)] bg-[var(--surface)] rounded-xs inline-block" />
                  <span className="line-through">Blocked</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {[
                "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
                "12:00", "12:30", "14:00", "14:30", "15:00", "15:30", "16:00",
                "16:30", "17:00", "17:30", "18:00"
              ].map((time) => {
                const slotKey = `${selectedDoctorAvailability}-${selectedDayAvailability}-${time}`;
                const isAvailable = slotStates[slotKey] !== "blocked";

                return (
                  <button
                    key={time}
                    onClick={() => toggleSlot(slotKey)}
                    className={`py-3 px-3 text-center border font-mono-ledger text-sm rounded-xl transition-all ${
                      isAvailable
                        ? "border-[var(--clay)] bg-[var(--paper)] text-[var(--clay)] font-bold shadow-xs hover:border-[var(--ink)]"
                        : "border-[var(--mist)] bg-[var(--surface)] text-[var(--mist)] line-through hover:border-[var(--muted)] hover:text-[var(--muted)]"
                    }`}
                    title={isAvailable ? "Open slot (click to block)" : "Blocked slot (click to open)"}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: DOCTORS & CATALOG */}
      {activeTab === "doctors" && (
        <div className="space-y-6">
          <div className="rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-[#1B1F18]/85 border border-white/70 dark:border-white/10 p-6 md:p-8 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--mist)] gap-3">
              <div>
                <h3 className="font-bold text-xl sm:text-2xl text-[var(--ink)]">
                  Practitioner Staff
                </h3>
                <p className="text-sm text-[var(--muted)] font-mono-ledger mt-0.5">
                  Registered doctors and active duty statuses in Novena facility
                </p>
              </div>

              <button
                onClick={() => setShowAddDoctorModal(true)}
                className="bg-[var(--clay)] text-white px-5 py-2.5 rounded-xl font-mono-ledger text-sm font-semibold hover:opacity-95 flex items-center gap-1.5 shadow-xs transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Doctor</span>
              </button>
            </div>

            <div className="divide-y divide-[var(--mist)] border border-[var(--mist)] rounded-2xl overflow-hidden bg-white/40 dark:bg-black/20">
              {clinicDoctors.map((doc) => (
                <div key={doc.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:bg-[var(--paper)]/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--mist)]/40 flex items-center justify-center font-mono-ledger font-bold text-base text-[var(--ink)] border border-[var(--mist)] overflow-hidden relative flex-none">
                      {doc.image ? (
                        <img
                          src={doc.image}
                          alt={doc.name}
                          className="w-full h-full object-cover object-top"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        doc.initials
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-base sm:text-lg text-[var(--ink)] flex items-center gap-2.5">
                        <span>{doc.name}</span>
                        <span className="badge-ledger badge-confirmed rounded-full text-xs px-2.5 py-0.5 font-semibold">Active</span>
                      </div>
                      <div className="text-sm font-medium text-[var(--clay)] mt-0.5">
                        {doc.role}
                      </div>
                      <div className="text-xs sm:text-sm font-mono-ledger text-[var(--muted)] mt-0.5">
                        License: {doc.licenseNumber} · Starting Fee: {formatCurrency(doc.price)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono-ledger text-sm">
                    <button
                      onClick={() =>
                        updateDoctor(doc.id, {
                          price: doc.price + 5,
                        })
                      }
                      className="px-3.5 py-2 border border-[var(--mist)] rounded-xl hover:border-[var(--clay)] text-[var(--ink)] font-semibold transition-all shadow-2xs"
                    >
                      Fee: {formatCurrency(doc.price)} (Edit)
                    </button>
                    <button
                      onClick={() => {
                        setTargetDoctorId(doc.id);
                        setShowAddProcedureModal(true);
                      }}
                      className="px-3.5 py-2 rounded-xl border border-[var(--clay)] text-[var(--clay)] hover:bg-[var(--clay)] hover:text-white transition-all font-semibold shadow-2xs"
                    >
                      + Procedure
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Procedures Catalog */}
          <div className="rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-[#1B1F18]/85 border border-white/70 dark:border-white/10 p-6 md:p-8 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--mist)] gap-3">
              <div>
                <h3 className="font-bold text-xl sm:text-2xl text-[var(--ink)]">
                  Procedures & Pricing
                </h3>
                <p className="text-sm text-[var(--muted)] font-mono-ledger mt-0.5">
                  Standard consultation durations and transparent fees published on patient portal
                </p>
              </div>

              <button
                onClick={() => setShowAddProcedureModal(true)}
                className="bg-[var(--clay)] text-white px-5 py-2.5 rounded-xl font-mono-ledger text-sm font-semibold hover:opacity-95 flex items-center gap-1.5 shadow-xs transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Procedure</span>
              </button>
            </div>

            <div className="divide-y divide-[var(--mist)] border border-[var(--mist)] rounded-2xl overflow-hidden bg-white/40 dark:bg-black/20">
              {clinicDoctors[0]?.services.map((svc) => (
                <div key={svc.id} className="p-4 flex items-center justify-between text-sm hover:bg-[var(--paper)]/50 transition-colors">
                  <div>
                    <div className="font-bold text-base text-[var(--ink)]">
                      {svc.name}
                    </div>
                    {svc.description && (
                      <div className="text-sm text-[var(--muted)] font-sans-ledger mt-0.5">
                        {svc.description}
                      </div>
                    )}
                    <div className="text-xs font-mono-ledger text-[var(--muted)] mt-1">
                      Duration: {svc.duration}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-mono-ledger text-base sm:text-lg font-bold text-[var(--ink)]">
                      {formatCurrency(svc.price)}
                    </span>
                    <button
                      onClick={() => removeProcedure(clinicDoctors[0].id, svc.id)}
                      className="text-[var(--muted)] hover:text-[var(--clay)] p-1.5 rounded-lg hover:bg-[var(--paper)] transition-all"
                      title="Remove procedure"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: CENTER PROFILE */}
      {activeTab === "onboarding" && (
        <div className="rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-[#1B1F18]/85 border border-white/70 dark:border-white/10 p-6 md:p-8 shadow-sm space-y-8 max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--mist)] gap-3">
            <div>
              <h3 className="font-bold text-xl sm:text-2xl text-[var(--ink)]">
                Practice Profile & Facility Branding
              </h3>
              <p className="text-sm text-[var(--muted)] font-mono-ledger mt-0.5">
                Manage clinic credentials, logo emblem, facility imagery, and statutory parameters for patient discovery
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="badge-ledger badge-confirmed rounded-full text-xs font-semibold px-3 py-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--sage)]" />
                <span>MOH Singapore Licensed</span>
              </span>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-8">
            {/* Visual Branding Assets: Logo & Facility Cover Photo */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--mist)]">
                <ImageIcon className="w-4 h-4 text-[var(--clay)]" />
                <h4 className="font-bold text-sm uppercase tracking-wider text-[var(--ink)] font-mono-ledger">
                  1. Visual Assets & Clinic Branding
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Clinic Logo Upload */}
                <div className="p-5 rounded-2xl bg-[var(--paper)] border border-[var(--mist)] space-y-4 text-center">
                  <span className="block text-xs font-semibold font-mono-ledger uppercase text-[var(--muted)] tracking-wider">
                    Clinic Emblem / Logo
                  </span>
                  <div className="w-24 h-24 mx-auto rounded-2xl bg-white border border-[var(--mist)] p-2 shadow-xs flex items-center justify-center overflow-hidden relative group">
                    {profileForm.logo ? (
                      <img
                        src={profileForm.logo}
                        alt="Clinic Logo Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Building2 className="w-10 h-10 text-[var(--clay)]" />
                    )}
                    <label className="absolute inset-0 bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-xs font-semibold gap-1">
                      <Camera className="w-4 h-4" />
                      <span>Change</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (reader.result) {
                                setProfileForm((prev) => ({
                                  ...prev,
                                  logo: reader.result as string,
                                }));
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--clay)] text-[var(--clay)] hover:bg-[var(--clay)] hover:text-white transition-all text-xs font-semibold">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (reader.result) {
                                setProfileForm((prev) => ({
                                  ...prev,
                                  logo: reader.result as string,
                                }));
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setProfileForm((prev) => ({
                          ...prev,
                          logo: "/images/centers/center-novena-logo.jpg",
                        }))
                      }
                      className="block mx-auto text-xs text-[var(--muted)] hover:text-[var(--clay)] hover:underline"
                    >
                      Reset Default Logo
                    </button>
                  </div>
                </div>

                {/* Facility Cover Photo Upload */}
                <div className="md:col-span-2 p-5 rounded-2xl bg-[var(--paper)] border border-[var(--mist)] space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="block text-xs font-semibold font-mono-ledger uppercase text-[var(--muted)] tracking-wider">
                      Facility Exterior / Reception Photo
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setProfileForm((prev) => ({
                          ...prev,
                          coverImage: "/images/centers/center-novena.jpg",
                        }))
                      }
                      className="text-xs text-[var(--muted)] hover:text-[var(--clay)] hover:underline"
                    >
                      Reset Default Photo
                    </button>
                  </div>

                  <div className="w-full h-36 rounded-2xl overflow-hidden border border-[var(--mist)] relative group bg-[var(--surface)] shadow-xs">
                    {profileForm.coverImage ? (
                      <img
                        src={profileForm.coverImage}
                        alt="Facility Cover Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[var(--muted)]">
                        No cover photo uploaded
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-xs font-semibold gap-1">
                      <Camera className="w-5 h-5" />
                      <span>Upload New Facility Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (reader.result) {
                                setProfileForm((prev) => ({
                                  ...prev,
                                  coverImage: reader.result as string,
                                }));
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[var(--muted)] font-mono-ledger">
                    <span>High-resolution reception or surgical wing photo (16:9 recommended)</span>
                    <label className="cursor-pointer text-[var(--clay)] hover:underline font-semibold flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Browse Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (reader.result) {
                                setProfileForm((prev) => ({
                                  ...prev,
                                  coverImage: reader.result as string,
                                }));
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Statutory Registration & Parameters */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--mist)]">
                <Building2 className="w-4 h-4 text-[var(--clay)]" />
                <h4 className="font-bold text-sm uppercase tracking-wider text-[var(--ink)] font-mono-ledger">
                  2. Facility & Regulatory Credentials
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans-ledger text-sm">
                <div>
                  <label className="block text-xs font-semibold font-mono-ledger uppercase text-[var(--muted)] mb-1.5 tracking-wider">
                    Facility Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full p-3.5 rounded-xl border border-[var(--mist)] bg-[var(--surface)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold font-mono-ledger uppercase text-[var(--muted)] mb-1.5 tracking-wider">
                    Practice Specialty Category
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.category}
                    onChange={(e) => setProfileForm({ ...profileForm, category: e.target.value })}
                    className="w-full p-3.5 rounded-xl border border-[var(--mist)] bg-[var(--surface)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold font-mono-ledger uppercase text-[var(--muted)] mb-1.5 tracking-wider">
                    Statutory Medical License
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.licenseNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, licenseNumber: e.target.value })}
                    className="w-full p-3.5 rounded-xl border border-[var(--mist)] bg-[var(--surface)] font-mono-ledger text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold font-mono-ledger uppercase text-[var(--muted)] mb-1.5 tracking-wider">
                    Primary Accreditation Body
                  </label>
                  <select
                    className="w-full p-3.5 rounded-xl border border-[var(--mist)] bg-[var(--surface)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                  >
                    <option value="MOH Singapore">Ministry of Health (MOH) Singapore</option>
                    <option value="JCI International">Joint Commission International (JCI)</option>
                    <option value="KKM Malaysia">Ministry of Health (KKM) Malaysia</option>
                    <option value="MOPH Thailand">Ministry of Public Health (MOPH) Thailand</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold font-mono-ledger uppercase text-[var(--muted)] mb-1.5 tracking-wider">
                    Physical Address & Floor
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full p-3.5 rounded-xl border border-[var(--mist)] bg-[var(--surface)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Communication & Operating Schedule */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--mist)]">
                <Clock className="w-4 h-4 text-[var(--clay)]" />
                <h4 className="font-bold text-sm uppercase tracking-wider text-[var(--ink)] font-mono-ledger">
                  3. Contact Hotline, Hours & Facility Amenities
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans-ledger text-sm">
                <div>
                  <label className="block text-xs font-semibold font-mono-ledger uppercase text-[var(--muted)] mb-1.5 tracking-wider">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full p-3.5 rounded-xl border border-[var(--mist)] bg-[var(--surface)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold font-mono-ledger uppercase text-[var(--muted)] mb-1.5 tracking-wider">
                    Clinic Phone Hotline
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full p-3.5 rounded-xl border border-[var(--mist)] bg-[var(--surface)] font-mono-ledger text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold font-mono-ledger uppercase text-[var(--muted)] mb-1.5 tracking-wider">
                    Weekly Operating Hours
                  </label>
                  <input
                    type="text"
                    value={profileForm.operatingHours}
                    onChange={(e) => setProfileForm({ ...profileForm, operatingHours: e.target.value })}
                    className="w-full p-3.5 rounded-xl border border-[var(--mist)] bg-[var(--surface)] font-mono-ledger text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-xs font-semibold font-mono-ledger uppercase text-[var(--muted)] mb-1.5 tracking-wider">
                    Facility Amenities & Features
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Wheelchair Accessible",
                      "On-site Diagnostics",
                      "Multilingual Interpreters",
                      "Complimentary Valet",
                      "VIP Recovery Suites",
                      "Direct MOH Integration",
                      "Emergency Pharmacy",
                    ].map((amenity) => {
                      const isSelected = profileForm.amenities?.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => {
                            const updated = isSelected
                              ? profileForm.amenities?.filter((a) => a !== amenity)
                              : [...(profileForm.amenities || []), amenity];
                            setProfileForm({ ...profileForm, amenities: updated });
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            isSelected
                              ? "bg-[var(--clay)] text-white border-[var(--clay)] shadow-xs"
                              : "bg-[var(--surface)] text-[var(--muted)] border-[var(--mist)] hover:border-[var(--clay)]"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {amenity}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-[var(--mist)] flex justify-between items-center">
              <span className="text-xs text-[var(--muted)] font-mono-ledger">
                Live changes sync immediately to directory listing and patient workspace.
              </span>
              <button
                type="submit"
                className="bg-[var(--clay)] text-white px-8 py-3.5 rounded-xl font-mono-ledger text-sm font-semibold hover:opacity-95 shadow-sm shadow-[var(--clay)]/20 transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save Practice Details</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD DOCTOR */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="rounded-3xl bg-[var(--surface)] border border-white/70 dark:border-white/10 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--mist)]">
              <h3 className="font-bold text-lg sm:text-xl text-[var(--ink)]">
                Add Doctor to Practice
              </h3>
              <button
                onClick={() => setShowAddDoctorModal(false)}
                className="text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-full hover:bg-[var(--paper)] transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ieva Balčiūnaitė"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                  Specialty
                </label>
                <input
                  type="text"
                  required
                  placeholder="Dentist · Periodontology Specialist"
                  value={newDocRole}
                  onChange={(e) => setNewDocRole(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                    License ID
                  </label>
                  <input
                    type="text"
                    required
                    value={newDocLicense}
                    onChange={(e) => setNewDocLicense(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-[var(--mist)] bg-[var(--paper)] font-mono-ledger text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                    Starting Fee ({branding.localization.currency.symbol})
                  </label>
                  <input
                    type="number"
                    required
                    value={newDocPrice}
                    onChange={(e) => setNewDocPrice(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-[var(--mist)] bg-[var(--paper)] font-mono-ledger text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                  Bio / Qualifications
                </label>
                <textarea
                  rows={3}
                  placeholder="Specialization background..."
                  value={newDocBio}
                  onChange={(e) => setNewDocBio(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-[var(--mist)] text-sm">
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
                  Save Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PROCEDURE */}
      {showAddProcedureModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="rounded-3xl bg-[var(--surface)] border border-white/70 dark:border-white/10 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--mist)]">
              <h3 className="font-bold text-lg sm:text-xl text-[var(--ink)]">
                Add Procedure
              </h3>
              <button
                onClick={() => setShowAddProcedureModal(false)}
                className="text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-full hover:bg-[var(--paper)] transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProcedure} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                  Procedure Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Composite Veneer Restructuring"
                  value={newProcName}
                  onChange={(e) => setNewProcName(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                    Duration
                  </label>
                  <select
                    value={newProcDuration}
                    onChange={(e) => setNewProcDuration(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                  >
                    <option value="30 min">30 min</option>
                    <option value="45 min">45 min</option>
                    <option value="60 min">60 min</option>
                    <option value="90 min">90 min</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                    Price ({branding.localization.currency.symbol})
                  </label>
                  <input
                    type="number"
                    required
                    value={newProcPrice}
                    onChange={(e) => setNewProcPrice(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-[var(--mist)] bg-[var(--paper)] font-mono-ledger text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Procedure details..."
                  value={newProcDesc}
                  onChange={(e) => setNewProcDesc(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-[var(--mist)] text-sm">
                <button
                  type="button"
                  onClick={() => setShowAddProcedureModal(false)}
                  className="flex-1 py-3 rounded-xl border border-[var(--mist)] text-[var(--muted)] font-semibold hover:bg-[var(--paper)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[var(--clay)] text-white font-semibold hover:opacity-95 shadow-sm shadow-[var(--clay)]/20"
                >
                  Save Procedure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DECLINE BOOKING */}
      {declineBookingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="rounded-3xl bg-[var(--surface)] border border-white/70 dark:border-white/10 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
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

            <div className="text-sm text-[var(--muted)]">
              Patient <span className="font-semibold text-[var(--ink)]">{declineBookingModal.patientName}</span> will receive immediate cancellation notification.
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                Decline Reason
              </label>
              <select
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
              >
                <option value="Practitioner unavailable for emergency">Practitioner unavailable for emergency</option>
                <option value="Slot double-booked offline">Slot double-booked offline</option>
                <option value="Equipment maintenance required">Equipment maintenance required</option>
                <option value="Contacted patient directly to reschedule">Contacted patient directly to reschedule</option>
              </select>
            </div>

            <div className="flex gap-3 pt-3 border-t border-[var(--mist)] text-sm">
              <button
                onClick={() => setDeclineBookingModal(null)}
                className="flex-1 py-3 rounded-xl border border-[var(--mist)] text-[var(--muted)] font-semibold hover:bg-[var(--paper)] transition-colors"
              >
                Back
              </button>
              <button
                onClick={executeDeclineBooking}
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
