"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBranding } from "@/lib/branding";
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  Building2,
  User,
  Star,
  MapPin,
  Check,
  Lock,
  ChevronRight,
  Award,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { branding, formatCurrency } = useBranding();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedCity, setSelectedCity] = useState(branding.localization.defaultCity || "Vilnius");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/patient");
  };

  const specialties = [
    {
      name: "Dentistry & Oral Care",
      desc: "Preventive hygiene, airflow polishing, root canal, teeth whitening",
      price: "From €35",
      count: "48 Doctors",
    },
    {
      name: "Physiotherapy & Spine",
      desc: "Postural rehabilitation, spinal mobility, kinetic gait correction",
      price: "From €38",
      count: "36 Doctors",
    },
    {
      name: "Neuromuscular Massage",
      desc: "Deep tissue release, athletic recovery, myofascial trigger therapy",
      price: "From €32",
      count: "42 Therapists",
    },
    {
      name: "Clinical Dermatology",
      desc: "Dermoscopy mole mapping, skin barrier therapy, diagnostic scans",
      price: "From €55",
      count: "24 Specialists",
    },
  ];

  const accreditedCenters = [
    {
      name: "Vilnius Dental Studio",
      category: "Oral Surgery & Cosmetic Dentistry",
      location: "Gedimino pr. 12, Vilnius",
      rating: 4.95,
      doctors: 4,
    },
    {
      name: "Kaunas Physio Center",
      category: "Kinetic Rehabilitation & Sports Medicine",
      location: "Laisvės al. 58, Kaunas",
      rating: 4.91,
      doctors: 6,
    },
    {
      name: "Baltic Skin Institute",
      category: "Dermatological Diagnostics & Aesthetics",
      location: "Jogailos g. 9, Vilnius",
      rating: 4.98,
      doctors: 3,
    },
    {
      name: "Zen Somatic Lounge",
      category: "Therapeutic Massage & Neuromuscular Recovery",
      location: "Subačiaus g. 14, Vilnius",
      rating: 4.94,
      doctors: 5,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans-ledger">
      {/* 1. HERO SECTION */}
      <section className="border-b border-[var(--mist)] pt-14 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-[var(--surface)] to-[var(--paper)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--paper)] border border-[var(--mist)] font-mono-ledger text-xs text-[var(--clay)]">
              <span className="w-2 h-2 rounded-full bg-[var(--clay)]" />
              <span className="font-semibold uppercase tracking-wider">
                {branding.client.tagline}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--ink)] leading-[1.12]">
              {branding.client.mission}
            </h1>

            <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed max-w-2xl">
              {branding.client.description}
            </p>

            {/* Quick Hero CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2 font-mono-ledger text-xs">
              <Link
                href="/patient"
                className="bg-[var(--clay)] text-white px-6 py-3 font-bold hover:opacity-95 transition-opacity flex items-center gap-2"
              >
                <span>Find Care & Book</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/signup"
                className="border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)] px-6 py-3 font-semibold hover:border-[var(--clay)] hover:text-[var(--clay)] transition-colors"
              >
                Register Your Practice
              </Link>
            </div>
          </div>

          {/* HEALTHCARE SEARCH CONSOLE */}
          <div className="border border-[var(--mist)] bg-[var(--surface)] p-4 sm:p-6 shadow-sm max-w-4xl">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                    Medical Specialty
                  </label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full p-2.5 border border-[var(--mist)] bg-[var(--paper)] text-xs font-mono-ledger text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
                  >
                    <option value="All">All Specialties</option>
                    <option value="Dental">Dentistry & Oral Hygiene</option>
                    <option value="Physio">Physiotherapy & Spine</option>
                    <option value="Massage">Therapeutic Massage</option>
                    <option value="Dermatology">Clinical Dermatology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                    City / Location
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full p-2.5 border border-[var(--mist)] bg-[var(--paper)] text-xs font-mono-ledger text-[var(--ink)] focus:outline-none focus:border-[var(--clay)]"
                  >
                    {branding.localization.supportedCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-[var(--clay)] text-white p-2.5 font-mono-ledger text-xs font-bold hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Available Care</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* TRUST STATS */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-[var(--mist)] p-4 bg-[var(--surface)]">
              <div className="text-[10px] font-mono-ledger uppercase text-[var(--muted)]">
                Accredited Clinics
              </div>
              <div className="font-mono-ledger text-2xl font-bold text-[var(--ink)] mt-1">
                142
              </div>
              <div className="text-[11px] font-mono-ledger text-[var(--sage)] mt-1">
                Verified Health Licenses
              </div>
            </div>

            <div className="border border-[var(--mist)] p-4 bg-[var(--surface)]">
              <div className="text-[10px] font-mono-ledger uppercase text-[var(--muted)]">
                Booking Surcharges
              </div>
              <div className="font-mono-ledger text-2xl font-bold text-[var(--clay)] mt-1">
                €0.00
              </div>
              <div className="text-[11px] font-mono-ledger text-[var(--muted)] mt-1">
                No hidden patient markups
              </div>
            </div>

            <div className="border border-[var(--mist)] p-4 bg-[var(--surface)]">
              <div className="text-[10px] font-mono-ledger uppercase text-[var(--muted)]">
                Slot Reservation
              </div>
              <div className="font-mono-ledger text-2xl font-bold text-[var(--sage)] mt-1">
                &lt; 30 sec
              </div>
              <div className="text-[11px] font-mono-ledger text-[var(--muted)] mt-1">
                Direct calendar lock
              </div>
            </div>

            <div className="border border-[var(--mist)] p-4 bg-[var(--surface)]">
              <div className="text-[10px] font-mono-ledger uppercase text-[var(--muted)]">
                Patient Rating
              </div>
              <div className="font-mono-ledger text-2xl font-bold text-[var(--amber)] mt-1">
                4.95 / 5
              </div>
              <div className="text-[11px] font-mono-ledger text-[var(--muted)] mt-1">
                From 4,200+ verified visits
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHAT IS MEDCIN? PLATFORM MISSION */}
      <section id="about" className="py-16 md:py-24 bg-[var(--surface)] border-b border-[var(--mist)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <div className="font-mono-ledger text-xs font-semibold text-[var(--clay)] uppercase tracking-wider">
              About the Platform
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-[var(--ink)] tracking-tight">
              Healthcare booking designed around clarity.
            </h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Traditional healthcare booking is broken: patients struggle to find transparent prices, clinics waste hours managing manual telephone schedules, and appointment double-bookings cause frustration. Medcin unites both sides on a single transparent platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-[var(--mist)] bg-[var(--paper)] p-6 space-y-3">
              <div className="w-10 h-10 bg-[var(--surface)] border border-[var(--mist)] flex items-center justify-center text-[var(--clay)] font-mono-ledger font-bold text-sm">
                01
              </div>
              <h3 className="font-bold text-base text-[var(--ink)]">
                Guaranteed Upfront Pricing
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Know exact consultation and procedure fees before you step foot in the clinic. No surprise bills or hidden facility surcharges.
              </p>
            </div>

            <div className="border border-[var(--mist)] bg-[var(--paper)] p-6 space-y-3">
              <div className="w-10 h-10 bg-[var(--surface)] border border-[var(--mist)] flex items-center justify-center text-[var(--clay)] font-mono-ledger font-bold text-sm">
                02
              </div>
              <h3 className="font-bold text-base text-[var(--ink)]">
                Live Physician Availability
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Direct integration with clinical schedules ensures you only see genuine, open 30-to-60 minute consultation slots.
              </p>
            </div>

            <div className="border border-[var(--mist)] bg-[var(--paper)] p-6 space-y-3">
              <div className="w-10 h-10 bg-[var(--surface)] border border-[var(--mist)] flex items-center justify-center text-[var(--clay)] font-mono-ledger font-bold text-sm">
                03
              </div>
              <h3 className="font-bold text-base text-[var(--ink)]">
                Verified Medical Standards
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Every clinic and medical professional is verified with official state healthcare board licenses and national bioethics compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="py-16 md:py-24 bg-[var(--paper)] border-b border-[var(--mist)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="font-mono-ledger text-xs font-semibold text-[var(--clay)] uppercase tracking-wider">
              Simple Workflow
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] tracking-tight">
              How Booking with Medcin Works
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)]">
              Secure an appointment with a verified healthcare professional in three steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-[var(--mist)] bg-[var(--surface)] p-6 space-y-3">
              <div className="font-mono-ledger text-xs font-bold text-[var(--clay)]">
                STEP 01
              </div>
              <h3 className="font-bold text-base text-[var(--ink)]">
                Choose Provider & Procedure
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Browse licensed dentists, physiotherapists, and recovery therapists. Inspect ratings, clinic locations, and transparent prices.
              </p>
            </div>

            <div className="border border-[var(--mist)] bg-[var(--surface)] p-6 space-y-3">
              <div className="font-mono-ledger text-xs font-bold text-[var(--clay)]">
                STEP 02
              </div>
              <h3 className="font-bold text-base text-[var(--ink)]">
                Select Open Date & Time
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Pick a slot that fits your schedule from real-time morning or afternoon clinic calendars. Enter optional intake notes.
              </p>
            </div>

            <div className="border border-[var(--mist)] bg-[var(--surface)] p-6 space-y-3">
              <div className="font-mono-ledger text-xs font-bold text-[var(--clay)]">
                STEP 03
              </div>
              <h3 className="font-bold text-base text-[var(--ink)]">
                Receive Instant Confirmation
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Get an encrypted booking reference, direct calendar export (.ics), and SMS reminders. Pay seamlessly upon visit completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SEPARATE SOLUTIONS: PATIENTS & CLINICS */}
      <section id="for-clinics" className="py-16 md:py-24 bg-[var(--surface)] border-b border-[var(--mist)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-2">
            <div className="font-mono-ledger text-xs font-semibold text-[var(--clay)] uppercase tracking-wider">
              Tailored Portals
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-[var(--ink)] tracking-tight">
              Dedicated Solutions for Every Healthcare Role
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Whether you are seeking personal care or managing a busy clinical practice, Medcin provides dedicated tools for your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Patients */}
            <div className="border border-[var(--mist)] bg-[var(--paper)] p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="badge-ledger badge-confirmed font-mono-ledger">Patient Workspace</span>
                  <User className="w-5 h-5 text-[var(--clay)]" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-[var(--ink)]">
                  For Patients
                </h3>

                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                  Book medical and wellness appointments with peace of mind. Easily modify or cancel visits up to 24 hours prior with zero fees.
                </p>

                <ul className="space-y-2 text-xs font-mono-ledger text-[var(--ink)] pt-2 border-t border-[var(--mist)]">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[var(--sage)]" />
                    <span>Search verified doctors across Lithuania</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[var(--sage)]" />
                    <span>Fixed upfront pricing with no booking fees</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[var(--sage)]" />
                    <span>Manage consultations with one-click rescheduling</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-[var(--mist)] flex gap-3 font-mono-ledger text-xs">
                <Link
                  href="/patient"
                  className="bg-[var(--clay)] text-white px-5 py-2.5 font-bold hover:opacity-95 transition-opacity"
                >
                  Enter Patient Portal
                </Link>
                <Link
                  href="/login?role=patient"
                  className="border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)] px-4 py-2.5 hover:border-[var(--clay)] transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* For Medical Centers */}
            <div className="border border-[var(--mist)] bg-[var(--paper)] p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="badge-ledger badge-flagged font-mono-ledger">Clinic Operations</span>
                  <Building2 className="w-5 h-5 text-[var(--clay)]" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-[var(--ink)]">
                  For Medical Centers
                </h3>

                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                  Connect your practice to Lithuania's health network. Automate patient booking intake, manage physician rosters, and reduce no-shows.
                </p>

                <ul className="space-y-2 text-xs font-mono-ledger text-[var(--ink)] pt-2 border-t border-[var(--mist)]">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[var(--sage)]" />
                    <span>Real-time dispatch inbox to accept or decline requests</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[var(--sage)]" />
                    <span>Interactive 30-minute slot matrix availability management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[var(--sage)]" />
                    <span>Physician credentials and procedure catalog control</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-[var(--mist)] flex gap-3 font-mono-ledger text-xs">
                <Link
                  href="/center"
                  className="bg-[var(--clay)] text-white px-5 py-2.5 font-bold hover:opacity-95 transition-opacity"
                >
                  Enter Clinic Portal
                </Link>
                <Link
                  href="/signup"
                  className="border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)] px-4 py-2.5 hover:border-[var(--clay)] transition-colors"
                >
                  Register Practice
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ACCREDITED MEDICAL CENTERS */}
      <section className="py-16 md:py-24 bg-[var(--paper)] border-b border-[var(--mist)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="font-mono-ledger text-xs font-semibold text-[var(--clay)] uppercase tracking-wider mb-1">
                Featured Network
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] tracking-tight">
                Accredited Medical Centers
              </h2>
              <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
                Partner facilities with active doctor availability and fixed pricing schedules.
              </p>
            </div>

            <Link
              href="/patient"
              className="text-xs font-mono-ledger text-[var(--clay)] font-semibold hover:underline flex items-center gap-1"
            >
              <span>Browse All Facilities</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {accreditedCenters.map((c) => (
              <div
                key={c.name}
                className="border border-[var(--mist)] bg-[var(--surface)] p-5 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--mist)]">
                    <span className="font-mono-ledger text-xs font-bold text-[var(--clay)]">
                      Verified
                    </span>
                    <span className="font-mono-ledger text-xs text-[var(--amber)] flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {c.rating}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[var(--ink)] mt-2">
                    {c.name}
                  </h4>
                  <div className="text-xs text-[var(--clay)] font-medium mt-0.5">
                    {c.category}
                  </div>
                  <div className="text-[11px] font-mono-ledger text-[var(--muted)] flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-[var(--muted)]" />
                    <span>{c.location}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--mist)] flex justify-between items-center font-mono-ledger text-xs">
                  <span className="text-[var(--muted)]">{c.doctors} Doctors</span>
                  <Link
                    href="/patient"
                    className="text-[var(--clay)] font-bold hover:underline flex items-center gap-0.5"
                  >
                    <span>Book</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CALL TO ACTION */}
      <section className="py-16 md:py-20 bg-[var(--surface)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--ink)]">
            Experience modern healthcare booking today.
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted)] max-w-lg mx-auto leading-relaxed">
            Find the right medical specialist, view upfront consultation pricing, and reserve appointments with guaranteed real-time scheduling.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 font-mono-ledger text-xs">
            <Link
              href="/patient"
              className="bg-[var(--clay)] text-white px-6 py-3 font-bold hover:opacity-95 transition-opacity"
            >
              Book an Appointment
            </Link>
            <Link
              href="/signup"
              className="border border-[var(--mist)] bg-[var(--paper)] text-[var(--ink)] px-6 py-3 font-semibold hover:border-[var(--clay)] transition-colors"
            >
              Register Medical Center
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
