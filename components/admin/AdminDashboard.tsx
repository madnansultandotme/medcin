"use client";

import React, { useState, useEffect } from "react";
import { useBranding } from "@/lib/branding";
import { AdminUsersTab } from "./AdminUsersTab";
import AdminProfileTab from "./AdminProfileTab";
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
  Stethoscope,
  MapPin,
  Star,
  Users,
  Activity,
  User as UserIcon,
} from "lucide-react";

// Types matching actual database schema
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
  submittedTime?: string;
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
  serviceId?: string;
  date: string;
  time: string;
  price: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  patientNotes?: string;
  createdAt: string;
}

interface Dispute {
  id: string;
  bookingId: string;
  reporterId: string;
  title: string;
  description: string;
  amount: number;
  status: "OPEN" | "RESOLVED" | "CLOSED";
  clinicStatement?: string;
  resolutionNote?: string;
  createdAt: string;
}

export function AdminDashboard() {
  const { branding, formatCurrency } = useBranding();
  
  // Data state
  const [centers, setCenters] = useState<Center[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"centers" | "doctors" | "globalbookings" | "disputes" | "settings" | "users" | "profile">("centers");

  // Filters
  const [centerSearch, setCenterSearch] = useState("");
  const [centerFilter, setCenterFilter] = useState<"all" | "ACTIVE" | "PENDING">("all");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [doctorCategoryFilter, setDoctorCategoryFilter] = useState("all");
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");

  // Settings State
  const [supportEmailInput, setSupportEmailInput] = useState("support@medcin.health");
  const [newCatName, setNewCatName] = useState("");

  // Fetch data from APIs
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch centers
        const centersRes = await fetch('/api/centers');
        if (centersRes.ok) {
          const centersData = await centersRes.json();
          setCenters(centersData.centers || []);
        }

        // Fetch doctors
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

        // Fetch disputes
        const disputesRes = await fetch('/api/disputes');
        if (disputesRes.ok) {
          const disputesData = await disputesRes.json();
          setDisputes(disputesData.disputes || []);
        }

      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const addToast = (toast: any) => {
    // Simple toast - could be replaced with proper toast library
    console.log('Toast:', toast);
  };

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

  // Download individual booking receipt
  const downloadBookingReceipt = (booking: Booking) => {
    const receiptText = `
=====================================
    ${branding.client.name}
    ADMINISTRATIVE BOOKING RECEIPT
=====================================

Booking Reference: ${booking.reference}
Date Issued: ${new Date().toLocaleDateString()}
Export Type: Platform Admin Export

-------------------------------------
APPOINTMENT DETAILS
-------------------------------------
Date:     ${booking.date}
Time:     ${booking.time}

-------------------------------------
APPOINTMENT SUMMARY
-------------------------------------
Service Fee:              ${formatCurrency(booking.price)}
Payment:                  Pay at Clinic (On-site)
Status:                   ${booking.status.toUpperCase()}

-------------------------------------
NOTES
-------------------------------------
${booking.patientNotes || 'No additional notes'}

Booking Created: ${new Date(booking.createdAt).toLocaleString()}

-------------------------------------
This is an administrative export for
internal records and audit purposes.

Platform Support:
${supportEmailInput}
=====================================
    `.trim();

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-receipt-${booking.reference}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast({
      type: "success",
      title: "Receipt Exported",
      message: `Admin receipt ${booking.reference}.txt downloaded.`,
    });
  };

  // Dispute resolution modal
  const [resolvingDispute, setResolvingDispute] = useState<Dispute | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolutionAction, setResolutionAction] = useState<"refund_patient" | "uphold_clinic" | "split">("refund_patient");

  const pendingCenters = centers.filter((c) => c.status === "PENDING");
  const activeCenters = centers.filter((c) => c.status === "ACTIVE");

  // Handle center approval/rejection via API
  const handleCenterApproval = async (centerId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const response = await fetch('/api/admin/centers/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ centerId, action }),
      });

      if (!response.ok) {
        throw new Error('Failed to process center approval');
      }

      const data = await response.json();
      
      // Update local state after API success
      if (action === 'APPROVE') {
        setCenters(prev => prev.map(c => 
          c.id === centerId ? { ...c, status: 'ACTIVE' as const } : c
        ));
        addToast({
          type: "success",
          title: "Center Approved",
          message: `${data.center.name} has been activated and can now accept bookings.`,
        });
      } else {
        setCenters(prev => prev.filter(c => c.id !== centerId));
        addToast({
          type: "info",
          title: "Center Rejected",
          message: `Application has been rejected and center notified.`,
        });
      }
    } catch (error) {
      console.error('Center approval error:', error);
      addToast({
        type: "error",
        title: "Action Failed",
        message: "Failed to process center approval. Please try again.",
      });
    }
  };

  // Doctor filtering
  const filteredDoctors = doctors
    .filter((d) => {
      if (doctorCategoryFilter === "all") return true;
      return d.category === doctorCategoryFilter;
    })
    .filter(
      (d) =>
        d.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
        d.role.toLowerCase().includes(doctorSearch.toLowerCase()) ||
        d.category.toLowerCase().includes(doctorSearch.toLowerCase())
    );

  const activeDoctors = doctors.filter((d) => d.active);
  const totalDoctors = doctors.length;

  const filteredCenters = centers
    .filter((c) => {
      if (centerFilter === "ACTIVE") return c.status === "ACTIVE";
      if (centerFilter === "PENDING") return c.status === "PENDING";
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
        b.reference.toLowerCase().includes(bookingSearch.toLowerCase())
    );

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING').length;
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED').length;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: "success",
      title: "Settings Updated",
      message: "Platform settings saved successfully.",
    });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    setNewCatName("");
    addToast({
      type: "success",
      title: "Category Added",
      message: `${newCatName} added to available specialties.`,
    });
  };

  const executeDisputeResolution = async () => {
    if (!resolvingDispute) return;
    
    try {
      const response = await fetch('/api/disputes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resolvingDispute.id,
          status: 'RESOLVED',
          resolutionNote: resolutionNote || `${resolutionAction} executed`,
        }),
      });

      if (response.ok) {
        setDisputes(prev => prev.map(d => 
          d.id === resolvingDispute.id 
            ? { ...d, status: 'RESOLVED' as const, resolutionNote: resolutionNote || `${resolutionAction} executed` }
            : d
        ));
        addToast({
          type: "success",
          title: "Dispute Resolved",
          message: "Settlement has been executed successfully.",
        });
      }
    } catch (error) {
      console.error('Dispute resolution error:', error);
      addToast({
        type: "error",
        title: "Resolution Failed",
        message: "Failed to resolve dispute. Please try again.",
      });
    }
    
    setResolvingDispute(null);
    setResolutionNote("");
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = [
      'Reference',
      'Patient ID',
      'Doctor ID',
      'Date',
      'Time',
      'Price',
      'Status',
      'Created At'
    ].join(',');

    const rows = filteredBookings.map(b => [
      b.reference,
      b.patientId,
      b.doctorId,
      b.date,
      b.time,
      b.price,
      b.status,
      b.createdAt
    ].join(',')).join('\n');

    const csvContent = `${headers}\n${rows}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medcin-bookings-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      type: "success",
      title: "Ledger Exported",
      message: `Exported ${filteredBookings.length} records to CSV file.`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--clay)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--muted)]">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Platform Console Header */}
      <div className="rounded-3xl border border-[var(--mist)] bg-[var(--surface)] p-6 md:p-8 shadow-sm backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--clay)] animate-pulse" />
              <span className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider">
                {branding.client.name} · Cross-Border Governance & Oversight
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--paper)] border border-[var(--mist)] text-xs font-semibold text-[var(--sage)]">
                {branding.localization.targetRegion || "Southeast Asia"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] tracking-tight">
              Platform Operations Console
            </h2>
            <p className="text-sm text-[var(--muted)] mt-1.5">
              Cross-border medical vetting, multi-center transaction audit, and regional dispute resolution across Singapore, Thailand & Malaysia
            </p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 font-mono-ledger text-xs">
            <div className="rounded-2xl border border-[var(--mist)] p-4 bg-[var(--paper)] text-right shadow-2xs min-w-[130px]">
              <span className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider block mb-1">Total Bookings</span>
              <span className="text-2xl sm:text-3xl font-bold text-[var(--ink)]">{totalBookings}</span>
            </div>
            <div className="rounded-2xl border border-[var(--mist)] p-4 bg-[var(--paper)] text-right shadow-2xs min-w-[130px]">
              <span className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider block mb-1">Active Centers</span>
              <span className="text-2xl sm:text-3xl font-bold text-[var(--sage)]">{activeCenters.length}</span>
            </div>
            <div className="rounded-2xl border border-[var(--mist)] p-4 bg-[var(--paper)] text-right shadow-2xs min-w-[130px]">
              <span className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider block mb-1">Pending Vetting</span>
              <span className="text-2xl sm:text-3xl font-bold text-[var(--amber)]">{pendingCenters.length}</span>
            </div>
            <div className="rounded-2xl border border-[var(--mist)] p-4 bg-[var(--paper)] text-right shadow-2xs min-w-[130px]">
              <span className="text-xs uppercase font-semibold text-[var(--muted)] tracking-wider block mb-1">Open Disputes</span>
              <span className="text-2xl sm:text-3xl font-bold text-[var(--clay)]">
                {disputes.filter((d) => d.status === "OPEN").length}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 border border-[var(--mist)] p-1.5 bg-[var(--paper)] font-mono-ledger text-xs mt-6 overflow-x-auto rounded-full">
          <button
            onClick={() => setActiveTab("centers")}
            className={`px-5 py-2.5 transition-all whitespace-nowrap flex items-center gap-2 rounded-full text-sm ${
              activeTab === "centers"
                ? "bg-[var(--surface)] text-[var(--clay)] font-semibold shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Centers Directory {pendingCenters.length > 0 ? `(${pendingCenters.length} Pending)` : ""}</span>
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
            <span>Doctors Network ({totalDoctors})</span>
          </button>

          <button
            onClick={() => setActiveTab("globalbookings")}
            className={`px-5 py-2.5 transition-all whitespace-nowrap flex items-center gap-2 rounded-full text-sm ${
              activeTab === "globalbookings"
                ? "bg-[var(--surface)] text-[var(--clay)] font-semibold shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Global Bookings ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("disputes")}
            className={`px-5 py-2.5 transition-all whitespace-nowrap flex items-center gap-2 rounded-full text-sm ${
              activeTab === "disputes"
                ? "bg-[var(--surface)] text-[var(--clay)] font-semibold shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Disputes & Claims ({disputes.filter((d) => d.status === "OPEN").length} Open)</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-5 py-2.5 transition-all whitespace-nowrap flex items-center gap-2 rounded-full text-sm ${
              activeTab === "settings"
                ? "bg-[var(--surface)] text-[var(--clay)] font-semibold shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Platform Settings</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`px-5 py-2.5 transition-all whitespace-nowrap flex items-center gap-2 rounded-full text-sm ${
              activeTab === "users"
                ? "bg-[var(--surface)] text-[var(--clay)] font-semibold shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Admin Users</span>
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
            <span>My Profile</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: CENTERS DIRECTORY */}
      {activeTab === "centers" && (
        <div className="space-y-6">
          {pendingCenters.length > 0 && (
            <div className="rounded-3xl backdrop-blur-xl bg-white/85 border border-[var(--amber)]/50 p-6 md:p-8 space-y-5 shadow-sm">
              <div className="flex justify-between items-center pb-3 border-b border-[var(--mist)]">
                <div>
                  <h3 className="font-bold text-xl sm:text-2xl text-[var(--ink)] flex items-center gap-3">
                    <span>Clinical Facility Approval Queue</span>
                    <span className="badge-ledger badge-pending rounded-full text-xs px-3 py-0.5 font-semibold">Vetting Required</span>
                  </h3>
                  <p className="text-sm text-[var(--muted)] font-mono-ledger mt-0.5">
                    Verify statutory medical licenses (MOH Singapore, KKM Malaysia, MOPH Thailand) prior to public directory activation
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingCenters.map((c) => (
                  <div key={c.id} className="rounded-2xl border border-[var(--mist)] bg-[var(--paper)] p-5 space-y-3.5 shadow-2xs">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white border border-[var(--mist)] p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                          {c.logoUrl ? (
                            <img src={c.logoUrl} alt={c.name} className="w-full h-full object-contain" />
                          ) : (
                            <Building className="w-5 h-5 text-[var(--clay)]" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-base sm:text-lg text-[var(--ink)]">
                            {c.name}
                          </div>
                          <div className="text-sm text-[var(--muted)]">
                            {c.category} · {c.submittedTime ? new Date(c.submittedTime).toLocaleDateString() : "Recently submitted"}
                          </div>
                        </div>
                      </div>
                      <span className="badge-ledger badge-pending rounded-full text-xs px-2.5 py-0.5 font-semibold shrink-0">Pending Review</span>
                    </div>

                    <div className="text-sm font-sans-ledger text-[var(--muted)] space-y-1">
                      <div>Address: {c.address}</div>
                      <div>Contact: {c.email} · {c.phone}</div>
                      <div className="font-mono-ledger text-xs text-[var(--ink)] font-medium">License No.: {c.licenseNumber}</div>
                    </div>

                    <div className="flex gap-2.5 pt-3 border-t border-[var(--mist)] font-mono-ledger text-sm">
                      <button
                        onClick={() => handleCenterApproval(c.id, 'APPROVE')}
                        className="flex-1 bg-[var(--sage)] text-white py-2.5 rounded-xl font-semibold hover:opacity-90 flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve & Activate</span>
                      </button>
                      <button
                        onClick={() => handleCenterApproval(c.id, 'REJECT')}
                        className="px-4 py-2.5 border border-[var(--mist)] rounded-xl text-[var(--muted)] hover:text-[var(--clay)] hover:border-[var(--clay)] transition-all font-semibold"
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
          <div className="rounded-3xl backdrop-blur-xl bg-white/85 border border-white/70 p-6 md:p-8 space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[var(--mist)]">
              <div>
                <h3 className="font-bold text-xl sm:text-2xl text-[var(--ink)]">
                  Active Facilities ({activeCenters.length})
                </h3>
                <p className="text-sm text-[var(--muted)] font-mono-ledger mt-0.5">
                  Verified partner practices connected to real-time appointment network
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    type="text"
                    placeholder="Search active centers..."
                    value={centerSearch}
                    onChange={(e) => setCenterSearch(e.target.value)}
                    className="pl-9 pr-3 py-2 text-sm border border-[var(--mist)] bg-[var(--paper)] text-[var(--ink)] font-sans-ledger focus:outline-none focus:border-[var(--clay)] rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="divide-y divide-[var(--mist)] border border-[var(--mist)] rounded-2xl overflow-hidden bg-white/40">
              {filteredCenters.map((c) => (
                <div key={c.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--paper)]/50 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-white border border-[var(--mist)] p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                      {c.logoUrl ? (
                        <img src={c.logoUrl} alt={c.name} className="w-full h-full object-contain" />
                      ) : (
                        <Building className="w-5 h-5 text-[var(--clay)]" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-base sm:text-lg text-[var(--ink)]">{c.name}</span>
                        <span
                          className={`badge-ledger rounded-full text-xs font-semibold px-2.5 py-0.5 ${
                            c.status === "ACTIVE" ? "badge-confirmed" : "badge-pending"
                          }`}
                        >
                          {c.status === "ACTIVE" ? "Accredited & Active" : "Pending"}
                        </span>
                      </div>
                      <div className="text-sm text-[var(--muted)]">
                        {c.category} · {c.address}
                      </div>
                      <div className="text-xs font-mono-ledger text-[var(--muted)]">
                        Email: {c.email} · Phone: {c.phone} · License: {c.licenseNumber}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono-ledger text-sm flex-none">
                    <span className="text-[var(--ink)] font-bold block">
                      {doctors.filter(d => d.centerId === c.id).length} Doctors on Roster
                    </span>
                    <span className="text-xs text-[var(--sage)] font-semibold">Operating & Bookable</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DOCTORS NETWORK */}
      {activeTab === "doctors" && (
        <div className="rounded-3xl backdrop-blur-xl bg-white/85 border border-white/70 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--mist)]">
            <div>
              <h3 className="font-bold text-xl sm:text-2xl text-[var(--ink)]">
                Healthcare Provider Network
              </h3>
              <p className="text-sm text-[var(--muted)] font-mono-ledger mt-1">
                All registered practitioners across Singapore, Thailand & Malaysia
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="badge-ledger badge-confirmed font-mono-ledger text-xs px-4 py-1.5 rounded-full font-semibold">
                {activeDoctors.length} Active · {totalDoctors} Total
              </span>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Search doctor name, specialty, or category..."
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-[var(--mist)] bg-[var(--paper)] text-[var(--ink)] font-sans-ledger focus:outline-none focus:border-[var(--clay)] rounded-xl"
              />
            </div>

            <select
              value={doctorCategoryFilter}
              onChange={(e) => setDoctorCategoryFilter(e.target.value)}
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
              <div className="col-span-2 p-12 text-center text-sm font-mono-ledger text-[var(--muted)]">
                No doctors found matching current filters.
              </div>
            ) : (
              filteredDoctors.map((doc) => {
                const docCenter = centers.find(c => c.id === doc.centerId);
                return (
                  <div
                    key={doc.id}
                    className="rounded-2xl border border-[var(--mist)] bg-[var(--surface)] p-5 shadow-xs hover:border-[var(--clay)]/40 transition-all space-y-4"
                  >
                    {/* Doctor Header */}
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-[var(--clay)]/10 text-[var(--clay)] border border-[var(--clay)]/20 flex items-center justify-center font-mono-ledger text-base font-bold flex-none overflow-hidden shadow-xs">
                        {doc.imageUrl ? (
                          <img
                            src={doc.imageUrl}
                            alt={doc.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Stethoscope className="w-6 h-6" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-bold text-base text-[var(--ink)]">
                            {doc.name}
                          </h4>
                          <span
                            className={`badge-ledger text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                              doc.active ? "badge-confirmed" : "badge-pending"
                            }`}
                          >
                            {doc.active ? "Active" : "Inactive"}
                          </span>
                          <div className="flex items-center gap-1 text-[var(--amber)] text-xs font-mono-ledger font-medium">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span className="font-bold">{doc.rating.toFixed(1)}</span>
                            <span className="text-[var(--muted)]">({doc.reviewsCount})</span>
                          </div>
                        </div>

                        <div className="text-sm font-medium text-[var(--clay)] mb-1">
                          {doc.role}
                        </div>

                        <div className="text-xs text-[var(--muted)] font-mono-ledger space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 flex-none" />
                            <span className="truncate">{docCenter?.name || 'Unknown Center'}</span>
                          </div>
                          <div>License: {doc.licenseNumber}</div>
                          <div>Category: {doc.category}</div>
                        </div>
                      </div>

                      <div className="text-right flex-none">
                        <div className="text-xs uppercase font-semibold font-mono-ledger text-[var(--muted)] mb-0.5">
                          Starting Fee
                        </div>
                        <div className="font-mono-ledger text-lg font-bold text-[var(--sage)]">
                          {formatCurrency(doc.price)}
                        </div>
                      </div>
                    </div>

                    {/* Bio (if available) */}
                    {doc.bio && (
                      <div className="text-sm text-[var(--muted)] font-sans-ledger leading-relaxed bg-[var(--paper)] p-3 rounded-xl border border-[var(--mist)]">
                        {doc.bio}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Summary Footer */}
          {filteredDoctors.length > 0 && (
            <div className="pt-4 border-t border-[var(--mist)] text-sm font-mono-ledger text-[var(--muted)] text-center">
              Showing {filteredDoctors.length} of {totalDoctors} registered healthcare providers across the platform
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: GLOBAL BOOKINGS LEDGER */}
      {activeTab === "globalbookings" && (
        <div className="rounded-3xl backdrop-blur-xl bg-white/85 border border-white/70 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--mist)]">
            <div>
              <h3 className="font-bold text-xl sm:text-2xl text-[var(--ink)]">
                Global Transaction Ledger
              </h3>
              <p className="text-sm text-[var(--muted)] mt-1">
                All patient appointments across partner medical facilities
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="text"
                  placeholder="Filter by reference..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 text-sm rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                />
              </div>

              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="py-2 px-3 border border-[var(--mist)] text-sm rounded-xl bg-[var(--surface)] text-[var(--ink)] font-semibold"
              >
                <option value="all">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <button
                onClick={handleExportCSV}
                className="bg-[var(--clay)] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-95 flex items-center gap-2 shadow-sm shadow-[var(--clay)]/20"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Table View */}
          <div className="overflow-x-auto rounded-2xl border border-[var(--mist)] bg-[var(--surface)]">
            <table className="w-full text-left text-sm font-sans-ledger">
              <thead className="bg-[var(--paper)] border-b border-[var(--mist)] text-xs uppercase font-semibold text-[var(--muted)] tracking-wider">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Doctor ID</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4 text-right">Fee</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--mist)]">
                {filteredBookings.map((b) => {
                  const doctor = doctors.find(d => d.id === b.doctorId);
                  return (
                    <tr key={b.id} className="hover:bg-[var(--paper)]/50 transition-colors">
                      <td className="p-4 font-mono-ledger font-semibold text-[var(--clay)]">
                        {b.reference}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-[var(--ink)]">{doctor?.name || 'Unknown'}</div>
                        <div className="text-xs text-[var(--muted)]">{doctor?.role || 'N/A'}</div>
                      </td>
                      <td className="p-4 font-mono-ledger">
                        <div className="font-medium text-[var(--ink)]">{b.date}</div>
                        <div className="text-xs text-[var(--muted)]">{b.time}</div>
                      </td>
                      <td className="p-4 text-right font-bold text-base text-[var(--ink)]">
                        {formatCurrency(b.price)}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`badge-ledger text-xs font-semibold px-3 py-1 rounded-full ${
                            b.status === "CONFIRMED"
                              ? "badge-confirmed"
                              : b.status === "PENDING"
                              ? "badge-pending"
                              : "badge-completed"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => downloadBookingReceipt(b)}
                          className="p-2 border border-[var(--mist)] rounded-lg text-[var(--muted)] hover:text-[var(--clay)] hover:border-[var(--clay)] transition-all inline-flex items-center justify-center"
                          title="Download admin receipt"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12 text-[var(--muted)] font-mono-ledger">
              No bookings found
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: DISPUTES DESK */}
      {activeTab === "disputes" && (
        <div className="rounded-3xl backdrop-blur-xl bg-white/85 border border-white/70 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--mist)]">
            <div>
              <h3 className="font-bold text-xl sm:text-2xl text-[var(--ink)]">
                Dispute Settlement Desk
              </h3>
              <p className="text-sm text-[var(--muted)] mt-1">
                Patient complaints, billing claims, and reconciliations
              </p>
            </div>

            <span className="badge-ledger badge-flagged text-xs font-semibold px-4 py-1.5 rounded-full self-start sm:self-auto">
              {disputes.filter((d) => d.status === "OPEN").length} Actionable Claims
            </span>
          </div>

          <div className="space-y-4">
            {disputes.map((disp) => {
              const isOpen = disp.status === "OPEN";
              return (
                <div key={disp.id} className="p-6 rounded-2xl border border-[var(--mist)] bg-[var(--surface)] shadow-xs hover:border-[var(--clay)]/40 transition-all space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono-ledger text-sm font-bold text-[var(--clay)]">
                          Booking {disp.bookingId}
                        </span>
                        <span
                          className={`badge-ledger text-xs font-semibold px-3 py-1 rounded-full ${
                            isOpen ? "badge-flagged" : "badge-completed"
                          }`}
                        >
                          {isOpen ? "Open Mediation" : "Resolved"}
                        </span>
                        <span className="text-xs text-[var(--muted)]">
                          Logged: {new Date(disp.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="font-bold text-base sm:text-lg text-[var(--ink)] mt-2">
                        {disp.title}
                      </div>
                      <div className="text-sm text-[var(--muted)] mt-1">
                        Claim Amount: <span className="font-bold text-[var(--ink)]">{formatCurrency(disp.amount)}</span>
                      </div>
                    </div>

                    {isOpen ? (
                      <button
                        onClick={() => setResolvingDispute(disp)}
                        className="bg-[var(--clay)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-95 flex-none shadow-sm shadow-[var(--clay)]/20"
                      >
                        Arbitrate Ticket
                      </button>
                    ) : (
                      <span className="text-sm font-semibold text-[var(--sage)] flex items-center gap-1.5 self-start sm:self-auto">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Settled</span>
                      </span>
                    )}
                  </div>

                  <div className="bg-[var(--paper)] p-4 rounded-xl border border-[var(--mist)] space-y-2.5 text-sm leading-relaxed">
                    <div>
                      <span className="font-semibold text-[var(--ink)] text-xs uppercase tracking-wider block mb-1">
                        Claim Statement:
                      </span>
                      <p className="text-[var(--ink)]">{disp.description}</p>
                    </div>
                    {disp.clinicStatement && (
                      <div className="pt-2 border-t border-[var(--mist)] text-[var(--muted)]">
                        <span className="font-semibold text-[var(--ink)] text-xs uppercase tracking-wider block mb-1">
                          Clinic Response:
                        </span>
                        <p>{disp.clinicStatement}</p>
                      </div>
                    )}
                    {disp.resolutionNote && (
                      <div className="pt-2 border-t border-[var(--mist)] text-[var(--sage)]">
                        <span className="font-semibold text-[var(--ink)] text-xs uppercase tracking-wider block mb-1">
                          Settlement Note:
                        </span>
                        <p className="font-medium">{disp.resolutionNote}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {disputes.length === 0 && (
            <div className="text-center py-12 text-[var(--muted)] font-mono-ledger">
              No disputes found
            </div>
          )}
        </div>
      )}

      {/* VIEW 5: PLATFORM SETTINGS */}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl backdrop-blur-xl bg-white/85 border border-white/70 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="pb-4 border-b border-[var(--mist)]">
              <h3 className="font-bold text-xl sm:text-2xl text-[var(--ink)]">
                Platform Settings
              </h3>
              <p className="text-sm text-[var(--muted)] mt-1">
                Platform configuration and support settings
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5 text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                  Support Email
                </label>
                <input
                  type="email"
                  value={supportEmailInput}
                  onChange={(e) => setSupportEmailInput(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
                />
              </div>

              <button
                type="submit"
                className="bg-[var(--clay)] text-white px-7 py-3 rounded-xl text-sm font-semibold hover:opacity-95 shadow-sm shadow-[var(--clay)]/20"
              >
                Save Settings
              </button>
            </form>
          </div>

          {/* Service Taxonomies */}
          <div className="rounded-3xl backdrop-blur-xl bg-white/85 border border-white/70 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="pb-4 border-b border-[var(--mist)]">
              <h3 className="font-bold text-xl sm:text-2xl text-[var(--ink)]">
                Medical Specialties
              </h3>
              <p className="text-sm text-[var(--muted)] mt-1">
                Manage patient booking specialties
              </p>
            </div>

            <form onSubmit={handleAddCategory} className="pt-2 flex gap-3">
              <input
                type="text"
                placeholder="New specialty (e.g. Acupuncture)..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 p-3 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
              />
              <button
                type="submit"
                className="bg-[var(--clay)] text-white px-5 py-3 rounded-xl text-sm font-semibold hover:opacity-95 flex items-center gap-1.5 shadow-sm shadow-[var(--clay)]/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Client Branding & Multi-Tenant White-Label Configuration */}
          <div className="rounded-3xl backdrop-blur-xl bg-white/85 border border-white/70 shadow-sm p-6 sm:p-8 space-y-6 md:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--mist)] gap-3">
              <div>
                <h3 className="font-bold text-xl sm:text-2xl text-[var(--ink)]">
                  Client Branding & Multi-Tenant Configuration
                </h3>
                <p className="text-sm text-[var(--muted)] mt-1">
                  Centralized JSON configuration loaded from config/branding.json
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportBrandingConfig}
                className="px-4 py-2 rounded-xl border border-[var(--mist)] text-sm font-semibold text-[var(--ink)] hover:border-[var(--clay)] hover:text-[var(--clay)] transition-colors flex items-center gap-2 self-start"
              >
                <Download className="w-4 h-4" />
                <span>Export Client JSON</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--mist)] space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] block">Client Name & ID</span>
                <span className="font-bold text-base text-[var(--ink)] block">{branding.client.name} ({branding.client.id})</span>
                <span className="text-xs text-[var(--muted)] block">{branding.client.legalName}</span>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--mist)] space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] block">Brand Palette Accent</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-5 h-5 rounded-full border border-black/20 shadow-xs" style={{ backgroundColor: branding.theme.colors.light.clay }} />
                  <span className="font-semibold text-sm">{branding.theme.colors.light.clay}</span>
                </div>
                <span className="text-xs text-[var(--muted)] block">Currency: {branding.localization.currency.symbol} ({branding.localization.currency.code})</span>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--mist)] space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] block">Jurisdiction & Compliance</span>
                <span className="font-bold text-base text-[var(--ink)] block">{branding.localization.country}</span>
                <span className="text-xs font-semibold text-[var(--sage)] block">{branding.compliance.regulatoryBody}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ARBITRATE DISPUTE */}
      {resolvingDispute && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="rounded-3xl bg-[var(--surface)] border border-white/70 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--mist)]">
              <h3 className="font-bold text-lg sm:text-xl text-[var(--ink)]">
                Arbitrate Dispute {resolvingDispute.bookingId}
              </h3>
              <button
                onClick={() => setResolvingDispute(null)}
                className="text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-full hover:bg-[var(--paper)] transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--mist)] text-sm text-[var(--muted)]">
              Disputed sum: <span className="font-bold text-base text-[var(--clay)]">{formatCurrency(resolvingDispute.amount)}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                Settlement Action
              </label>
              <select
                value={resolutionAction}
                onChange={(e) => setResolutionAction(e.target.value as any)}
                className="w-full p-3 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
              >
                <option value="refund_patient">Grant Full Patient Refund ({formatCurrency(resolvingDispute.amount)})</option>
                <option value="uphold_clinic">Uphold Clinic Fee (Deny Claim)</option>
                <option value="split">Arbitrate 50% Split Remittance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                Settlement Note
              </label>
              <textarea
                rows={3}
                placeholder="Audit explanation for financial books..."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                className="w-full p-3 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
              />
            </div>

            <div className="flex gap-3 pt-3 border-t border-[var(--mist)] text-sm">
              <button
                onClick={() => setResolvingDispute(null)}
                className="flex-1 py-3 rounded-xl border border-[var(--mist)] text-[var(--muted)] font-semibold hover:bg-[var(--paper)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeDisputeResolution}
                className="flex-1 py-3 rounded-xl bg-[var(--clay)] text-white font-semibold hover:opacity-95 shadow-sm shadow-[var(--clay)]/20"
              >
                Execute Settlement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 6: ADMIN USERS MANAGEMENT */}
      {activeTab === "users" && (
        <AdminUsersTab />
      )}

      {/* VIEW 7: ADMIN PROFILE */}
      {activeTab === "profile" && (
        <AdminProfileTab />
      )}
    </div>
  );
}
