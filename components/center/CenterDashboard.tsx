"use client";

import React, { useState } from "react";
import { useMedcinStore, Doctor, Booking } from "@/lib/store";
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
} from "lucide-react";

export function CenterDashboard() {
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
  const [newDocLicense, setNewDocLicense] = useState("LT-DENT-8840");
  const [newDocPrice, setNewDocPrice] = useState("45");
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
  });

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
      <div className="border border-[var(--mist)] bg-[var(--surface)] p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[var(--mist)] flex items-center justify-center font-mono-ledger text-base font-bold text-[var(--ink)] border border-[var(--mist)]">
              VD
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[var(--ink)] tracking-tight">
                  {currentCenter.name}
                </h2>
                <span className="badge-ledger badge-confirmed">Accredited Facility</span>
              </div>
              <p className="text-xs text-[var(--muted)] font-mono-ledger">
                {currentCenter.category} · {currentCenter.address} · License: {currentCenter.licenseNumber}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 font-mono-ledger text-xs">
            <div className="border border-[var(--mist)] p-2 bg-[var(--paper)] text-right">
              <span className="text-[10px] text-[var(--muted)] block">PENDING INBOX</span>
              <span className="text-base font-bold text-[var(--amber)]">{pendingCount}</span>
            </div>
            <div className="border border-[var(--mist)] p-2 bg-[var(--paper)] text-right">
              <span className="text-[10px] text-[var(--muted)] block">CONFIRMED VISITS</span>
              <span className="text-base font-bold text-[var(--sage)]">{confirmedCount}</span>
            </div>
            <div className="border border-[var(--mist)] p-2 bg-[var(--paper)] text-right">
              <span className="text-[10px] text-[var(--muted)] block">DOCTORS ON DUTY</span>
              <span className="text-base font-bold text-[var(--ink)]">{clinicDoctors.length}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 border border-[var(--mist)] p-1 bg-[var(--paper)] font-mono-ledger text-xs mt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab("inbox")}
            className={`px-3 py-1.5 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
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
            className={`px-3 py-1.5 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
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
            className={`px-3 py-1.5 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
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
            className={`px-3 py-1.5 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
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
        <div className="border border-[var(--mist)] bg-[var(--surface)] p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--mist)]">
            <div>
              <h3 className="font-bold text-base text-[var(--ink)]">
                Appointments Inbox
              </h3>
              <p className="text-xs text-[var(--muted)] font-mono-ledger">
                Patient consultation requests and real-time appointment dispatch
              </p>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="text"
                  placeholder="Filter patient or reference..."
                  value={inboxSearch}
                  onChange={(e) => setInboxSearch(e.target.value)}
                  className="pl-8 pr-2 py-1 text-xs border border-[var(--mist)] bg-[var(--paper)] text-[var(--ink)] font-sans-ledger focus:outline-none"
                />
              </div>

              <div className="flex border border-[var(--mist)] font-mono-ledger text-xs">
                {(["all", "pending", "confirmed", "completed"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setInboxFilter(f)}
                    className={`px-2.5 py-1 capitalize ${
                      inboxFilter === f
                        ? "bg-[var(--clay)] text-white font-semibold"
                        : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Feed */}
          <div className="divide-y divide-[var(--mist)] border border-[var(--mist)]">
            {filteredInbox.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono-ledger text-[var(--muted)]">
                No bookings found matching current filters.
              </div>
            ) : (
              filteredInbox.map((b) => {
                const isPending = b.status === "pending";
                return (
                  <div key={b.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-ledger text-xs font-bold text-[var(--clay)]">
                          {b.reference}
                        </span>
                        <span
                          className={`badge-ledger ${
                            isPending
                              ? "badge-pending"
                              : b.status === "confirmed"
                              ? "badge-confirmed"
                              : "badge-completed"
                          }`}
                        >
                          {isPending ? "Pending Clinic Approval" : b.status}
                        </span>
                        <span className="text-[11px] font-mono-ledger text-[var(--muted)]">
                          Booked {new Date(b.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="font-bold text-sm text-[var(--ink)] flex items-center gap-2">
                        <span>{b.patientName}</span>
                        <span className="text-xs font-normal text-[var(--muted)]">
                          ({b.patientPhone} · {b.patientEmail})
                        </span>
                      </div>

                      <div className="text-xs text-[var(--muted)] font-mono-ledger flex items-center gap-2">
                        <span className="font-semibold text-[var(--ink)]">{b.serviceName}</span>
                        <span>·</span>
                        <span>Doctor: {b.doctorName}</span>
                        <span>·</span>
                        <span>{b.duration}</span>
                      </div>

                      <div className="text-xs font-mono-ledger text-[var(--clay)] flex items-center gap-2 pt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{b.date} at {b.time}</span>
                        <span>·</span>
                        <span className="font-bold text-[var(--sage)]">€{b.price}.00</span>
                      </div>

                      {b.patientNotes && (
                        <div className="text-xs text-[var(--muted)] font-sans-ledger bg-[var(--paper)] p-2 border border-[var(--mist)] mt-1.5 max-w-lg">
                          <span className="font-semibold text-[var(--ink)] font-mono-ledger text-[10px] block uppercase">
                            Patient Note:
                          </span>
                          {b.patientNotes}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 font-mono-ledger text-xs flex-none">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => updateBookingStatus(b.id, "confirmed")}
                            className="bg-[var(--sage)] text-white px-3.5 py-1.5 font-semibold hover:opacity-90 transition-opacity flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>

                          <button
                            onClick={() => setDeclineBookingModal(b)}
                            className="border border-[var(--mist)] text-[var(--muted)] px-3 py-1.5 hover:border-[var(--clay)] hover:text-[var(--clay)] transition-colors"
                          >
                            Decline
                          </button>
                        </>
                      ) : b.status === "confirmed" ? (
                        <>
                          <button
                            onClick={() => updateBookingStatus(b.id, "completed")}
                            className="border border-[var(--sage)] text-[var(--sage)] px-3 py-1.5 hover:bg-[var(--sage)] hover:text-white transition-colors"
                          >
                            Mark Completed
                          </button>
                          <button
                            onClick={() => setDeclineBookingModal(b)}
                            className="border border-[var(--mist)] text-[var(--muted)] px-2.5 py-1.5 hover:text-[var(--clay)]"
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
        <div className="border border-[var(--mist)] bg-[var(--surface)] p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--mist)]">
            <div>
              <h3 className="font-bold text-base text-[var(--ink)]">
                Slot Availability Scheduler
              </h3>
              <p className="text-xs text-[var(--muted)] font-mono-ledger">
                Click any slot to open or block consultation appointments
              </p>
            </div>

            <button
              onClick={copySlotsToRestOfWeek}
              className="bg-[var(--clay)] text-white px-4 py-2 font-mono-ledger text-xs font-semibold hover:opacity-95 flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Clone {selectedDayAvailability} Schedule to Week</span>
            </button>
          </div>

          {/* Practitioner Selector Chips */}
          <div>
            <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-2">
              Select Physician
            </label>
            <div className="flex gap-2 flex-wrap">
              {clinicDoctors.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoctorAvailability(doc.id)}
                  className={`px-3 py-1.5 border font-mono-ledger text-xs flex items-center gap-2 transition-all ${
                    selectedDoctorAvailability === doc.id
                      ? "border-[var(--clay)] bg-[var(--paper)] text-[var(--clay)] font-semibold shadow-xs"
                      : "border-[var(--mist)] text-[var(--muted)] bg-[var(--surface)] hover:border-[var(--muted)]"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[var(--sage)]" />
                  <span>{doc.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Weekday Selector */}
          <div>
            <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-2">
              Day of Week
            </label>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDayAvailability(day)}
                  className={`px-4 py-2 border font-mono-ledger text-xs transition-colors ${
                    selectedDayAvailability === day
                      ? "border-[var(--clay)] text-[var(--clay)] bg-[var(--paper)] font-bold shadow-xs"
                      : "border-[var(--mist)] text-[var(--muted)] bg-[var(--surface)] hover:text-[var(--ink)]"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Slot Grid Matrix */}
          <div>
            <div className="flex justify-between items-center text-xs font-mono-ledger text-[var(--muted)] mb-2">
              <span>Appointment Matrix (30-minute intervals)</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[var(--clay)]">
                  <span className="w-2.5 h-2.5 border border-[var(--clay)] bg-[var(--paper)] inline-block" />
                  <span>Available</span>
                </span>
                <span className="flex items-center gap-1 text-[var(--mist)]">
                  <span className="w-2.5 h-2.5 border border-[var(--mist)] bg-[var(--surface)] inline-block" />
                  <span className="line-through text-[var(--muted)]">Blocked</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
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
                    className={`py-2.5 px-2 text-center border font-mono-ledger text-xs transition-all ${
                      isAvailable
                        ? "border-[var(--clay)] bg-[var(--paper)] text-[var(--clay)] font-semibold shadow-xs hover:border-[var(--ink)]"
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
          <div className="border border-[var(--mist)] bg-[var(--surface)] p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--mist)]">
              <div>
                <h3 className="font-bold text-base text-[var(--ink)]">
                  Practitioner Staff
                </h3>
                <p className="text-xs text-[var(--muted)] font-mono-ledger">
                  Registered doctors and active duty statuses
                </p>
              </div>

              <button
                onClick={() => setShowAddDoctorModal(true)}
                className="bg-[var(--clay)] text-white px-3.5 py-1.5 font-mono-ledger text-xs font-semibold hover:opacity-95 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Doctor</span>
              </button>
            </div>

            <div className="divide-y divide-[var(--mist)] border border-[var(--mist)]">
              {clinicDoctors.map((doc) => (
                <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 bg-[var(--mist)] flex items-center justify-center font-mono-ledger font-bold text-sm text-[var(--ink)]">
                      {doc.initials}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[var(--ink)] flex items-center gap-2">
                        <span>{doc.name}</span>
                        <span className="badge-ledger badge-confirmed">Active</span>
                      </div>
                      <div className="text-xs text-[var(--muted)]">
                        {doc.role}
                      </div>
                      <div className="text-[11px] font-mono-ledger text-[var(--muted)]">
                        License: {doc.licenseNumber} · Starting Fee: €{doc.price}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono-ledger text-xs">
                    <button
                      onClick={() =>
                        updateDoctor(doc.id, {
                          price: doc.price + 5,
                        })
                      }
                      className="px-2.5 py-1 border border-[var(--mist)] hover:border-[var(--clay)] text-[var(--ink)]"
                    >
                      Fee: €{doc.price} (Edit)
                    </button>
                    <button
                      onClick={() => {
                        setTargetDoctorId(doc.id);
                        setShowAddProcedureModal(true);
                      }}
                      className="px-2.5 py-1 border border-[var(--clay)] text-[var(--clay)] hover:bg-[var(--clay)] hover:text-white transition-colors"
                    >
                      + Procedure
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Procedures Catalog */}
          <div className="border border-[var(--mist)] bg-[var(--surface)] p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--mist)]">
              <div>
                <h3 className="font-bold text-base text-[var(--ink)]">
                  Procedures & Pricing
                </h3>
                <p className="text-xs text-[var(--muted)] font-mono-ledger">
                  Standard consultation durations and transparent fees
                </p>
              </div>

              <button
                onClick={() => setShowAddProcedureModal(true)}
                className="bg-[var(--clay)] text-white px-3.5 py-1.5 font-mono-ledger text-xs font-semibold hover:opacity-95 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Procedure</span>
              </button>
            </div>

            <div className="divide-y divide-[var(--mist)] border border-[var(--mist)]">
              {clinicDoctors[0]?.services.map((svc) => (
                <div key={svc.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[var(--ink)]">
                      {svc.name}
                    </div>
                    {svc.description && (
                      <div className="text-xs text-[var(--muted)] font-sans-ledger mt-0.5">
                        {svc.description}
                      </div>
                    )}
                    <div className="text-[11px] font-mono-ledger text-[var(--muted)]">
                      Duration: {svc.duration}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono-ledger text-sm font-bold text-[var(--ink)]">
                      €{svc.price}.00
                    </span>
                    <button
                      onClick={() => removeProcedure(clinicDoctors[0].id, svc.id)}
                      className="text-[var(--muted)] hover:text-[var(--clay)]"
                      title="Remove procedure"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
        <div className="border border-[var(--mist)] bg-[var(--surface)] p-6 space-y-5 max-w-3xl">
          <div className="pb-2 border-b border-[var(--mist)]">
            <h3 className="font-bold text-base text-[var(--ink)]">
              Practice Profile & Accreditation
            </h3>
            <p className="text-xs text-[var(--muted)] font-mono-ledger">
              Clinic parameters registered with state health authority
            </p>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4 font-sans-ledger text-xs">
            <div>
              <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                Facility Name
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                  Practice Category
                </label>
                <input
                  type="text"
                  value={profileForm.category}
                  onChange={(e) => setProfileForm({ ...profileForm, category: e.target.value })}
                  className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                  License Number
                </label>
                <input
                  type="text"
                  value={profileForm.licenseNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, licenseNumber: e.target.value })}
                  className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] font-mono-ledger text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                Physical Address
              </label>
              <input
                type="text"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                  Clinic Phone Hotline
                </label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] font-mono-ledger text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                Operating Hours
              </label>
              <input
                type="text"
                value={profileForm.operatingHours}
                onChange={(e) => setProfileForm({ ...profileForm, operatingHours: e.target.value })}
                className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] font-mono-ledger text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-[var(--clay)] text-white px-6 py-2.5 font-mono-ledger text-xs font-semibold hover:opacity-95"
              >
                Save Practice Details
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD DOCTOR */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] border border-[var(--mist)] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--mist)]">
              <h3 className="font-bold text-base text-[var(--ink)]">
                Add Doctor to Practice
              </h3>
              <button
                onClick={() => setShowAddDoctorModal(false)}
                className="text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="space-y-3 font-sans-ledger text-xs">
              <div>
                <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ieva Balčiūnaitė"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                  Specialty
                </label>
                <input
                  type="text"
                  required
                  placeholder="Dentist · Periodontology Specialist"
                  value={newDocRole}
                  onChange={(e) => setNewDocRole(e.target.value)}
                  className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                    License ID
                  </label>
                  <input
                    type="text"
                    required
                    value={newDocLicense}
                    onChange={(e) => setNewDocLicense(e.target.value)}
                    className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] font-mono-ledger text-[var(--ink)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                    Starting Fee (€)
                  </label>
                  <input
                    type="number"
                    required
                    value={newDocPrice}
                    onChange={(e) => setNewDocPrice(e.target.value)}
                    className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] font-mono-ledger text-[var(--ink)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                  Bio / Qualifications
                </label>
                <textarea
                  rows={2}
                  placeholder="Specialization background..."
                  value={newDocBio}
                  onChange={(e) => setNewDocBio(e.target.value)}
                  className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)]"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-[var(--mist)] font-mono-ledger text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddDoctorModal(false)}
                  className="flex-1 py-2 border border-[var(--mist)] text-[var(--muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[var(--clay)] text-white font-semibold"
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] border border-[var(--mist)] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--mist)]">
              <h3 className="font-bold text-base text-[var(--ink)]">
                Add Procedure
              </h3>
              <button
                onClick={() => setShowAddProcedureModal(false)}
                className="text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProcedure} className="space-y-3 font-sans-ledger text-xs">
              <div>
                <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                  Procedure Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Composite Veneer Restructuring"
                  value={newProcName}
                  onChange={(e) => setNewProcName(e.target.value)}
                  className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                    Duration
                  </label>
                  <select
                    value={newProcDuration}
                    onChange={(e) => setNewProcDuration(e.target.value)}
                    className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] font-mono-ledger text-[var(--ink)]"
                  >
                    <option value="30 min">30 min</option>
                    <option value="45 min">45 min</option>
                    <option value="60 min">60 min</option>
                    <option value="90 min">90 min</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                    Price (€)
                  </label>
                  <input
                    type="number"
                    required
                    value={newProcPrice}
                    onChange={(e) => setNewProcPrice(e.target.value)}
                    className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] font-mono-ledger text-[var(--ink)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Procedure details..."
                  value={newProcDesc}
                  onChange={(e) => setNewProcDesc(e.target.value)}
                  className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)]"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-[var(--mist)] font-mono-ledger text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddProcedureModal(false)}
                  className="flex-1 py-2 border border-[var(--mist)] text-[var(--muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[var(--clay)] text-white font-semibold"
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] border border-[var(--mist)] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--mist)]">
              <h3 className="font-bold text-base text-[var(--ink)]">
                Decline Booking {declineBookingModal.reference}
              </h3>
              <button
                onClick={() => setDeclineBookingModal(null)}
                className="text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[var(--muted)] font-sans-ledger">
              Patient <span className="font-semibold text-[var(--ink)]">{declineBookingModal.patientName}</span> will receive immediate cancellation notification.
            </div>

            <div>
              <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                Decline Reason
              </label>
              <select
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] text-xs font-sans-ledger text-[var(--ink)]"
              >
                <option value="Practitioner unavailable for emergency">Practitioner unavailable for emergency</option>
                <option value="Slot double-booked offline">Slot double-booked offline</option>
                <option value="Equipment maintenance required">Equipment maintenance required</option>
                <option value="Contacted patient directly to reschedule">Contacted patient directly to reschedule</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[var(--mist)] font-mono-ledger text-xs">
              <button
                onClick={() => setDeclineBookingModal(null)}
                className="flex-1 py-2 border border-[var(--mist)] text-[var(--muted)]"
              >
                Back
              </button>
              <button
                onClick={executeDeclineBooking}
                className="flex-1 py-2 bg-[var(--clay)] text-white font-semibold"
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
