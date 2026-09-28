"use client";

import React, { useState } from "react";
import { useMedcinStore, Center, Dispute, Booking } from "@/lib/store";
import { useBranding } from "@/lib/branding";
import {
  ShieldCheck,
  Building,
  Calendar,
  AlertOctagon,
  Sliders,
  Check,
  CheckCircle2,
  XCircle,
  Search,
  Download,
  Plus,
} from "lucide-react";

export function AdminDashboard() {
  const {
    centers,
    approveCenter,
    rejectCenter,
    bookings,
    disputes,
    resolveDispute,
    settings,
    updateSettings,
    toggleCategorySetting,
    addCategorySetting,
    addToast,
  } = useMedcinStore();

  const [activeTab, setActiveTab] = useState<"centers" | "globalbookings" | "disputes" | "settings">("centers");

  // Center Directory Search
  const [centerSearch, setCenterSearch] = useState("");
  const [centerFilter, setCenterFilter] = useState<"all" | "active" | "pending">("all");

  // Global Bookings Search & Filter
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");

  // Settings State
  const { branding, formatCurrency } = useBranding();
  const [commissionInput, setCommissionInput] = useState(settings.commission);
  const [supportEmailInput, setSupportEmailInput] = useState(settings.supportEmail);
  const [payoutScheduleInput, setPayoutScheduleInput] = useState(settings.payoutSchedule);
  const [newCatName, setNewCatName] = useState("");

  const handleExportBrandingConfig = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(branding, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${branding.client.id}-branding.config.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast({
      type: "info",
      title: "Configuration Exported",
      message: `Exported ${branding.client.name} branding configuration JSON.`,
    });
  };

  // Dispute resolution modal
  const [resolvingDispute, setResolvingDispute] = useState<Dispute | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolutionAction, setResolutionAction] = useState<"refund_patient" | "uphold_clinic" | "split">("refund_patient");

  const pendingCenters = centers.filter((c) => c.status === "pending");
  const activeCenters = centers.filter((c) => c.status === "active");

  const filteredCenters = centers
    .filter((c) => {
      if (centerFilter === "active") return c.status === "active";
      if (centerFilter === "pending") return c.status === "pending";
      return true;
    })
    .filter(
      (c) =>
        c.name.toLowerCase().includes(centerSearch.toLowerCase()) ||
        c.category.toLowerCase().includes(centerSearch.toLowerCase()) ||
        c.address.toLowerCase().includes(centerSearch.toLowerCase())
    );

  const filteredBookings = bookings
    .filter((b) => {
      if (bookingStatusFilter === "all") return true;
      return b.status === bookingStatusFilter;
    })
    .filter(
      (b) =>
        b.reference.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.patientName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.clinicName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.serviceName.toLowerCase().includes(bookingSearch.toLowerCase())
    );

  const totalGBV = bookings.reduce((sum, b) => sum + b.price, 0) + 14200;
  const commissionPercentage = parseInt(settings.commission, 10) || 8;
  const platformRevenue = ((totalGBV * commissionPercentage) / 100).toFixed(2);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      commission: commissionInput,
      supportEmail: supportEmailInput,
      payoutSchedule: payoutScheduleInput,
    });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    addCategorySetting(newCatName);
    setNewCatName("");
  };

  const executeDisputeResolution = () => {
    if (!resolvingDispute) return;
    const note =
      resolutionAction === "refund_patient"
        ? `Patient full refund granted (${formatCurrency(resolvingDispute.amount)}). Note: ${resolutionNote || "Claim validated."}`
        : resolutionAction === "uphold_clinic"
        ? `Claim dismissed; clinic no-show surcharge upheld. Note: ${resolutionNote || "Policy terms verified."}`
        : `50/50 split settlement arbitrated. Note: ${resolutionNote || "Mutual agreement."}`;

    resolveDispute(resolvingDispute.id, note);
    setResolvingDispute(null);
    setResolutionNote("");
  };

  const handleExportCSV = () => {
    addToast({
      type: "success",
      title: "Ledger Exported",
      message: `Exported ${filteredBookings.length} records to audit CSV.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Platform Console Header */}
      <div className="rounded-3xl border border-[var(--mist)] bg-[var(--surface)] p-6 md:p-8 shadow-sm backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--clay)] animate-pulse" />
              <span className="font-mono-ledger text-xs uppercase text-[var(--muted)] tracking-wider">
                {branding.client.name} · Cross-Border Governance & Oversight
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[var(--paper)] border border-[var(--mist)] text-[10px] font-mono-ledger text-[var(--sage)]">
                {branding.localization.targetRegion || "Southeast Asia"}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-[var(--ink)] tracking-tight">
              Platform Operations Console
            </h2>
            <p className="text-xs text-[var(--muted)] font-mono-ledger mt-1">
              Cross-border medical vetting, multi-center transaction audit, and regional dispute resolution across Singapore, Thailand & Malaysia
            </p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-ledger text-xs">
            <div className="rounded-2xl border border-[var(--mist)] p-3 bg-[var(--paper)] text-right shadow-2xs">
              <span className="text-[10px] text-[var(--muted)] block uppercase">Gross Booking Vol.</span>
              <span className="text-base font-bold text-[var(--ink)]">{formatCurrency(totalGBV)}</span>
            </div>
            <div className="rounded-2xl border border-[var(--mist)] p-3 bg-[var(--paper)] text-right shadow-2xs">
              <span className="text-[10px] text-[var(--muted)] block uppercase">Network Comm. ({settings.commission})</span>
              <span className="text-base font-bold text-[var(--sage)]">{formatCurrency(Number(platformRevenue))}</span>
            </div>
            <div className="rounded-2xl border border-[var(--mist)] p-3 bg-[var(--paper)] text-right shadow-2xs">
              <span className="text-[10px] text-[var(--muted)] block uppercase">Pending Vetting</span>
              <span className="text-base font-bold text-[var(--amber)]">{pendingCenters.length}</span>
            </div>
            <div className="rounded-2xl border border-[var(--mist)] p-3 bg-[var(--paper)] text-right shadow-2xs">
              <span className="text-[10px] text-[var(--muted)] block uppercase">Open Disputes</span>
              <span className="text-base font-bold text-[var(--clay)]">
                {disputes.filter((d) => d.status === "open").length}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 border border-[var(--mist)] p-1.5 bg-[var(--paper)] font-mono-ledger text-xs mt-6 overflow-x-auto rounded-full">
          <button
            onClick={() => setActiveTab("centers")}
            className={`px-4 py-2 transition-all whitespace-nowrap flex items-center gap-2 rounded-full ${
              activeTab === "centers"
                ? "bg-[var(--surface)] text-[var(--clay)] font-semibold shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Centers Directory {pendingCenters.length > 0 ? `(${pendingCenters.length} Pending)` : ""}</span>
          </button>

          <button
            onClick={() => setActiveTab("globalbookings")}
            className={`px-4 py-2 transition-all whitespace-nowrap flex items-center gap-2 rounded-full ${
              activeTab === "globalbookings"
                ? "bg-[var(--surface)] text-[var(--clay)] font-semibold shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Global Bookings ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("disputes")}
            className={`px-4 py-2 transition-all whitespace-nowrap flex items-center gap-2 rounded-full ${
              activeTab === "disputes"
                ? "bg-[var(--surface)] text-[var(--clay)] font-semibold shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Disputes & Claims ({disputes.filter((d) => d.status === "open").length} Open)</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 transition-all whitespace-nowrap flex items-center gap-2 rounded-full ${
              activeTab === "settings"
                ? "bg-[var(--surface)] text-[var(--clay)] font-semibold shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Platform Settings</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: CENTERS DIRECTORY */}
      {activeTab === "centers" && (
        <div className="space-y-6">
          {pendingCenters.length > 0 && (
            <div className="border border-[var(--amber)] bg-[var(--surface)] p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--mist)]">
                <div>
                  <h3 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
                    <span>Clinical Facility Approval Queue</span>
                    <span className="badge-ledger badge-pending">Vetting Required</span>
                  </h3>
                  <p className="text-xs text-[var(--muted)] font-mono-ledger">
                    Verify statutory medical licenses prior to public directory activation
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingCenters.map((c) => (
                  <div key={c.id} className="border border-[var(--mist)] bg-[var(--paper)] p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm text-[var(--ink)]">
                          {c.name}
                        </div>
                        <div className="text-xs text-[var(--muted)]">
                          {c.category} · {c.submittedTime || "Submitted recently"}
                        </div>
                      </div>
                      <span className="badge-ledger badge-pending">Pending Review</span>
                    </div>

                    <div className="text-xs font-mono-ledger text-[var(--muted)] space-y-1">
                      <div>Address: {c.address}</div>
                      <div>Contact: {c.email} · {c.phone}</div>
                      <div>License No.: {c.licenseNumber}</div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-[var(--mist)] font-mono-ledger text-xs">
                      <button
                        onClick={() => approveCenter(c.id)}
                        className="flex-1 bg-[var(--sage)] text-white py-1.5 font-semibold hover:opacity-90 flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Activate</span>
                      </button>
                      <button
                        onClick={() => rejectCenter(c.id)}
                        className="px-3 py-1.5 border border-[var(--mist)] text-[var(--muted)] hover:text-[var(--clay)] hover:border-[var(--clay)]"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Network Directory */}
          <div className="border border-[var(--mist)] bg-[var(--surface)] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--mist)]">
              <div>
                <h3 className="font-bold text-base text-[var(--ink)]">
                  Active Facilities ({activeCenters.length})
                </h3>
                <p className="text-xs text-[var(--muted)] font-mono-ledger">
                  Verified partner practices connected to real-time appointment network
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    type="text"
                    placeholder="Search active centers..."
                    value={centerSearch}
                    onChange={(e) => setCenterSearch(e.target.value)}
                    className="pl-8 pr-2 py-1 text-xs border border-[var(--mist)] bg-[var(--paper)] text-[var(--ink)] font-sans-ledger focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="divide-y divide-[var(--mist)] border border-[var(--mist)]">
              {filteredCenters.map((c) => (
                <div key={c.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[var(--ink)]">{c.name}</span>
                      <span
                        className={`badge-ledger ${
                          c.status === "active" ? "badge-confirmed" : "badge-pending"
                        }`}
                      >
                        {c.status === "active" ? "Active" : "Pending"}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--muted)]">
                      {c.category} · {c.address}
                    </div>
                    <div className="text-[11px] font-mono-ledger text-[var(--muted)]">
                      Email: {c.email} · Phone: {c.phone} · License: {c.licenseNumber}
                    </div>
                  </div>

                  <div className="text-right font-mono-ledger text-xs flex-none">
                    <span className="text-[var(--ink)] font-semibold block">
                      {c.doctorCount} Doctors on Roster
                    </span>
                    <span className="text-[10px] text-[var(--sage)]">Operating & Bookable</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: GLOBAL BOOKINGS LEDGER */}
      {activeTab === "globalbookings" && (
        <div className="border border-[var(--mist)] bg-[var(--surface)] p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--mist)]">
            <div>
              <h3 className="font-bold text-base text-[var(--ink)]">
                Global Transaction Ledger
              </h3>
              <p className="text-xs text-[var(--muted)] font-mono-ledger">
                All patient appointments across partner medical facilities
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="text"
                  placeholder="Filter reference, patient, clinic..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="pl-8 pr-2 py-1 text-xs border border-[var(--mist)] bg-[var(--paper)] text-[var(--ink)] font-sans-ledger focus:outline-none"
                />
              </div>

              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="py-1 px-2 border border-[var(--mist)] text-xs font-mono-ledger bg-[var(--surface)] text-[var(--ink)]"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                onClick={handleExportCSV}
                className="bg-[var(--clay)] text-white px-3 py-1 font-mono-ledger text-xs font-semibold hover:opacity-95 flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Table View */}
          <div className="overflow-x-auto border border-[var(--mist)]">
            <table className="w-full text-left text-xs font-sans-ledger">
              <thead className="bg-[var(--paper)] border-b border-[var(--mist)] font-mono-ledger text-[10px] uppercase text-[var(--muted)]">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Facility & Doctor</th>
                  <th className="p-3">Procedure</th>
                  <th className="p-3">Date & Slot</th>
                  <th className="p-3 text-right">Fee</th>
                  <th className="p-3 text-right">Commission ({settings.commission})</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--mist)]">
                {filteredBookings.map((b) => {
                  const comm = ((b.price * commissionPercentage) / 100).toFixed(2);
                  return (
                    <tr key={b.id} className="hover:bg-[var(--paper)]/50 transition-colors">
                      <td className="p-3 font-mono-ledger font-semibold text-[var(--clay)]">
                        {b.reference}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-[var(--ink)]">{b.patientName}</div>
                        <div className="text-[10px] font-mono-ledger text-[var(--muted)]">{b.patientPhone}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-[var(--ink)]">{b.clinicName}</div>
                        <div className="text-[10px] text-[var(--muted)]">{b.doctorName}</div>
                      </td>
                      <td className="p-3">
                        <div>{b.serviceName}</div>
                        <div className="text-[10px] font-mono-ledger text-[var(--muted)]">{b.duration}</div>
                      </td>
                      <td className="p-3 font-mono-ledger">
                        <div>{b.date}</div>
                        <div className="text-[10px] text-[var(--muted)]">{b.time}</div>
                      </td>
                      <td className="p-3 text-right font-mono-ledger font-bold text-[var(--ink)]">
                        {formatCurrency(b.price)}
                      </td>
                      <td className="p-3 text-right font-mono-ledger text-[var(--sage)] font-semibold">
                        {formatCurrency(Number(comm))}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`badge-ledger ${
                            b.status === "confirmed"
                              ? "badge-confirmed"
                              : b.status === "pending"
                              ? "badge-pending"
                              : "badge-completed"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: DISPUTES DESK */}
      {activeTab === "disputes" && (
        <div className="border border-[var(--mist)] bg-[var(--surface)] p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[var(--mist)]">
            <div>
              <h3 className="font-bold text-base text-[var(--ink)]">
                Dispute Settlement Desk
              </h3>
              <p className="text-xs text-[var(--muted)] font-mono-ledger">
                Patient complaints, billing claims, and no-show reconciliations
              </p>
            </div>

            <span className="badge-ledger badge-flagged font-mono-ledger">
              {disputes.filter((d) => d.status === "open").length} Actionable Claims
            </span>
          </div>

          <div className="divide-y divide-[var(--mist)] border border-[var(--mist)]">
            {disputes.map((disp) => {
              const isOpen = disp.status === "open";
              return (
                <div key={disp.id} className="p-4 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono-ledger text-xs font-bold text-[var(--clay)]">
                          Booking {disp.bookingRef}
                        </span>
                        <span
                          className={`badge-ledger ${
                            isOpen ? "badge-flagged" : "badge-completed"
                          }`}
                        >
                          {isOpen ? "Open Mediation" : "Resolved"}
                        </span>
                        <span className="text-[11px] font-mono-ledger text-[var(--muted)]">
                          Logged: {disp.date}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-[var(--ink)] mt-1">
                        {disp.title}
                      </div>
                      <div className="text-xs text-[var(--muted)] font-mono-ledger">
                        Reported by: <span className="font-semibold text-[var(--ink)]">{disp.reporter}</span> · Claim Amount: {formatCurrency(disp.amount)}
                      </div>
                    </div>

                    {isOpen ? (
                      <button
                        onClick={() => setResolvingDispute(disp)}
                        className="bg-[var(--clay)] text-white px-3.5 py-1.5 font-mono-ledger text-xs font-semibold hover:opacity-95 flex-none"
                      >
                        Arbitrate Ticket
                      </button>
                    ) : (
                      <span className="text-xs font-mono-ledger text-[var(--sage)] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Settled</span>
                      </span>
                    )}
                  </div>

                  <div className="bg-[var(--paper)] p-3 border border-[var(--mist)] space-y-1.5 text-xs font-sans-ledger">
                    <div>
                      <span className="font-semibold text-[var(--ink)] font-mono-ledger text-[10px] uppercase block">
                        Claim Statement:
                      </span>
                      {disp.description}
                    </div>
                    {disp.clinicStatement && (
                      <div className="pt-1 text-[var(--muted)]">
                        <span className="font-semibold text-[var(--ink)] font-mono-ledger text-[10px] uppercase block">
                          Clinic Response:
                        </span>
                        {disp.clinicStatement}
                      </div>
                    )}
                    {disp.resolutionNote && (
                      <div className="pt-1 text-[var(--sage)] font-mono-ledger">
                        <span className="font-semibold text-[var(--ink)] font-mono-ledger text-[10px] uppercase block">
                          Settlement Note:
                        </span>
                        {disp.resolutionNote}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 4: PLATFORM SETTINGS */}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-[var(--mist)] bg-[var(--surface)] p-6 space-y-4">
            <div className="pb-2 border-b border-[var(--mist)]">
              <h3 className="font-bold text-base text-[var(--ink)]">
                Financial Settings
              </h3>
              <p className="text-xs text-[var(--muted)] font-mono-ledger">
                Commission take-rate and remittance schedules
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 font-sans-ledger text-xs">
              <div>
                <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                  Commission Per Booking (%)
                </label>
                <input
                  type="text"
                  value={commissionInput}
                  onChange={(e) => setCommissionInput(e.target.value)}
                  className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] font-mono-ledger text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                  Remittance Payout Schedule
                </label>
                <select
                  value={payoutScheduleInput}
                  onChange={(e) => setPayoutScheduleInput(e.target.value)}
                  className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] font-mono-ledger text-[var(--ink)]"
                >
                  <option value="Weekly (Every Monday)">Weekly (Every Monday)</option>
                  <option value="Bi-weekly (1st & 15th)">Bi-weekly (1st & 15th)</option>
                  <option value="Monthly Close">Monthly Close</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  value={supportEmailInput}
                  onChange={(e) => setSupportEmailInput(e.target.value)}
                  className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
                />
              </div>

              <button
                type="submit"
                className="bg-[var(--clay)] text-white px-5 py-2.5 font-mono-ledger text-xs font-semibold hover:opacity-95"
              >
                Save Settings
              </button>
            </form>
          </div>

          {/* Service Taxonomies */}
          <div className="border border-[var(--mist)] bg-[var(--surface)] p-6 space-y-4">
            <div className="pb-2 border-b border-[var(--mist)]">
              <h3 className="font-bold text-base text-[var(--ink)]">
                Medical Specialties
              </h3>
              <p className="text-xs text-[var(--muted)] font-mono-ledger">
                Toggle patient booking specialties and register new categories
              </p>
            </div>

            <div className="divide-y divide-[var(--mist)] border border-[var(--mist)]">
              {settings.categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => toggleCategorySetting(cat.id)}
                  className="p-3 flex justify-between items-center cursor-pointer hover:bg-[var(--paper)]/50 transition-colors text-xs"
                >
                  <span className="font-medium text-[var(--ink)]">{cat.name}</span>
                  <span
                    className={`badge-ledger ${
                      cat.active ? "badge-confirmed" : "badge-completed"
                    }`}
                  >
                    {cat.active ? "Active" : "Disabled"}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddCategory} className="pt-2 flex gap-2">
              <input
                type="text"
                placeholder="New specialty (e.g. Acupuncture)..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 p-2 border border-[var(--mist)] bg-[var(--surface)] text-xs text-[var(--ink)] focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[var(--clay)] text-white px-3 py-2 font-mono-ledger text-xs font-semibold hover:opacity-95 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Client Branding & Multi-Tenant White-Label Configuration */}
          <div className="border border-[var(--mist)] bg-[var(--surface)] p-6 space-y-4 md:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[var(--mist)] gap-2">
              <div>
                <h3 className="font-bold text-base text-[var(--ink)]">
                  Client Branding & Multi-Tenant Configuration
                </h3>
                <p className="text-xs text-[var(--muted)] font-mono-ledger">
                  Centralized JSON configuration loaded from config/branding.json
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportBrandingConfig}
                className="px-3 py-1.5 border border-[var(--mist)] font-mono-ledger text-xs text-[var(--ink)] hover:border-[var(--clay)] hover:text-[var(--clay)] transition-colors flex items-center gap-1.5 self-start"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Client JSON</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono-ledger">
              <div className="p-3 bg-[var(--paper)] border border-[var(--mist)] space-y-1">
                <span className="text-[10px] text-[var(--muted)] uppercase block">Client Name & ID</span>
                <span className="font-bold text-[var(--ink)] block">{branding.client.name} ({branding.client.id})</span>
                <span className="text-[11px] text-[var(--muted)] block">{branding.client.legalName}</span>
              </div>

              <div className="p-3 bg-[var(--paper)] border border-[var(--mist)] space-y-1">
                <span className="text-[10px] text-[var(--muted)] uppercase block">Brand Palette Accent</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: branding.theme.colors.light.clay }} />
                  <span className="font-semibold">{branding.theme.colors.light.clay}</span>
                </div>
                <span className="text-[11px] text-[var(--muted)] block">Currency: {branding.localization.currency.symbol} ({branding.localization.currency.code})</span>
              </div>

              <div className="p-3 bg-[var(--paper)] border border-[var(--mist)] space-y-1">
                <span className="text-[10px] text-[var(--muted)] uppercase block">Jurisdiction & Compliance</span>
                <span className="font-bold text-[var(--ink)] block">{branding.localization.country}</span>
                <span className="text-[11px] text-[var(--sage)] block">{branding.compliance.regulatoryBody}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ARBITRATE DISPUTE */}
      {resolvingDispute && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] border border-[var(--mist)] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--mist)]">
              <h3 className="font-bold text-base text-[var(--ink)]">
                Arbitrate Dispute {resolvingDispute.bookingRef}
              </h3>
              <button
                onClick={() => setResolvingDispute(null)}
                className="text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[var(--paper)] border border-[var(--mist)] text-xs font-mono-ledger text-[var(--muted)]">
              Disputed sum: <span className="font-bold text-[var(--clay)]">{formatCurrency(resolvingDispute.amount)}</span> · Reporter: {resolvingDispute.reporter}
            </div>

            <div>
              <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                Settlement Action
              </label>
              <select
                value={resolutionAction}
                onChange={(e) => setResolutionAction(e.target.value as any)}
                className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] text-xs font-mono-ledger text-[var(--ink)]"
              >
                <option value="refund_patient">Grant Full Patient Refund ({formatCurrency(resolvingDispute.amount)})</option>
                <option value="uphold_clinic">Uphold Clinic Fee (Deny Claim)</option>
                <option value="split">Arbitrate 50% Split Remittance</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                Settlement Note
              </label>
              <textarea
                rows={2}
                placeholder="Audit explanation for financial books..."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                className="w-full p-2 border border-[var(--mist)] bg-[var(--surface)] text-xs text-[var(--ink)]"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-[var(--mist)] font-mono-ledger text-xs">
              <button
                onClick={() => setResolvingDispute(null)}
                className="flex-1 py-2 border border-[var(--mist)] text-[var(--muted)]"
              >
                Cancel
              </button>
              <button
                onClick={executeDisputeResolution}
                className="flex-1 py-2 bg-[var(--clay)] text-white font-semibold"
              >
                Execute Settlement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
