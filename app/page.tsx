"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  ChevronLeft,
  Award,
  Sparkles,
  Globe2,
} from "lucide-react";

interface HeroSlide {
  id: string;
  image: string;
  country: string;
  flag: string;
  cities: string;
  tag: string;
  title: string;
  subtitle: string;
  priceNote: string;
  badge: string;
  accentSpecialty: string;
}

export default function LandingPage() {
  const router = useRouter();
  const { branding, formatCurrency } = useBranding();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedCountryTab, setSelectedCountryTab] = useState("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedCity, setSelectedCity] = useState("Singapore");

  // Hero Slider Data for Thailand, Singapore, Malaysia
  const heroSlides: HeroSlide[] = [
    {
      id: "thailand",
      image: "/images/hero-bangkok.jpg",
      country: "Thailand",
      flag: "🇹🇭",
      cities: "Bangkok · Phuket · Chiang Mai",
      tag: "Thailand · Medical Hub & Longevity",
      title: "World-Class Aesthetic Medicine & Clinical Longevity in Bangkok",
      subtitle:
        "Direct access to JCI-accredited clinics in Sukhumvit and Phuket with transparent treatment packages, preventive longevity, and verified English-speaking specialists.",
      priceNote: "From ฿1,800 (~S$70)",
      badge: "JCI & MOPH Thailand Certified",
      accentSpecialty: "Longevity & Medical Aesthetics",
    },
    {
      id: "singapore",
      image: "/images/hero-singapore.jpg",
      country: "Singapore",
      flag: "🇸🇬",
      cities: "Novena · Orchard · Marina Bay",
      tag: "Singapore · Precision Medicine & Specialist Hub",
      title: "Novena & Orchard Premier Specialist Practices & Diagnostics",
      subtitle:
        "Instant calendar reservations with Ministry of Health (MOH) licensed specialists across dermatology, precision cardiology, and executive health screenings.",
      priceNote: "From S$95 (~฿2,500)",
      badge: "MOH Singapore Accredited",
      accentSpecialty: "Specialist Diagnostics & Aesthetics",
    },
    {
      id: "malaysia",
      image: "/images/hero-malaysia.jpg",
      country: "Malaysia",
      flag: "🇲🇾",
      cities: "Kuala Lumpur · Penang · Johor Bahru",
      tag: "Malaysia · Sports & Orthopedic Recovery",
      title: "Sports Medicine & Kinetic Orthopedic Rehabilitation in KL",
      subtitle:
        "Comprehensive biomechanical gait analysis, spinal recovery, and athletic rehabilitation overlooking the vibrant Kuala Lumpur skyline.",
      priceNote: "From RM140 (~S$42)",
      badge: "MOH Malaysia Certified",
      accentSpecialty: "Kinetic Sports Rehab & Spine",
    },
  ];

  // Auto-advance slider
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, heroSlides.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/patient");
  };

  // Southeast Asia Specialties
  const specialties = [
    {
      name: "Medical Aesthetics & Longevity",
      desc: "Preventive cellular therapy, laser skin rejuvenation, anti-aging protocols",
      price: "From S$120 / ฿3,200",
      count: "84 Doctors",
      region: "Bangkok & Singapore",
    },
    {
      name: "Kinetic Physiotherapy & Sports",
      desc: "Biomechanical recovery, spinal alignment, post-operative athletic restoration",
      price: "From S$85 / RM160",
      count: "68 Specialists",
      region: "Kuala Lumpur & Novena",
    },
    {
      name: "Digital Smile Design & Implants",
      desc: "Guided 3D implantology, ceramic veneers, airflow prophylaxis hygiene",
      price: "From S$90 / ฿2,400",
      count: "92 Clinicians",
      region: "Bangkok & Singapore",
    },
    {
      name: "Integrative Somatic Recovery",
      desc: "Deep tissue myofascial release, therapeutic acupuncture, herbal somatic care",
      price: "From S$75 / ฿1,800",
      count: "56 Therapists",
      region: "Phuket & Penang",
    },
  ];

  // Verified Regional Centers
  const accreditedCenters = [
    {
      name: "Novena Premier Specialist Medical",
      category: "Specialist Diagnostics & Aesthetics",
      location: "Novena Medical Hub, Singapore",
      country: "Singapore",
      rating: 4.98,
      doctors: 8,
      image: "/images/hero-singapore.jpg",
      accreditation: "MOH Singapore Accredited",
    },
    {
      name: "Aisana Longevity & Aesthetic Wellness",
      category: "Anti-Aging & Cellular Longevity",
      location: "Sukhumvit 24, Bangkok, Thailand",
      country: "Thailand",
      rating: 4.96,
      doctors: 12,
      image: "/images/hero-bangkok.jpg",
      accreditation: "JCI & MOPH Certified",
    },
    {
      name: "Kinetica Sports & Spine Rehabilitation",
      category: "Kinetic Physiotherapy & Orthopedic",
      location: "KLCC Twin Towers Corridor, Kuala Lumpur",
      country: "Malaysia",
      rating: 4.94,
      doctors: 9,
      image: "/images/hero-malaysia.jpg",
      accreditation: "MOH Malaysia Certified",
    },
    {
      name: "Andaman Somatic Recovery Lounge",
      category: "Therapeutic Somatic Wellness",
      location: "Laguna Phuket, Thailand",
      country: "Thailand",
      rating: 4.95,
      doctors: 6,
      image: "/images/hero-bangkok.jpg",
      accreditation: "Thai Traditional Health Certified",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans-ledger">
      {/* 1. HERO SLIDER SECTION WITH GLASSMORPHISM & ROUNDED CONTOURS */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-6 sm:pb-10">
        <section
          className="relative overflow-hidden rounded-3xl border border-[var(--mist)] shadow-2xl min-h-[640px] md:min-h-[720px] flex items-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Background Slider Images with Smooth Cross-Fade */}
          <div className="absolute inset-0 z-0">
            {heroSlides.map((slide, idx) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  idx === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
                }`}
                style={{
                  transitionProperty: "opacity, transform",
                  transitionDuration: "1200ms",
                }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
                {/* Gradient Dark/Light Mask to preserve legibility */}
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--paper)]/95 via-[var(--paper)]/85 to-[var(--paper)]/40 dark:from-[var(--paper)]/95 dark:via-[var(--paper)]/90 dark:to-[var(--paper)]/60" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--paper)] via-transparent to-transparent" />
              </div>
            ))}
          </div>

          {/* Ambient Glow Orbs */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[var(--clay)]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[var(--sage)]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Hero Content Layer */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Glassmorphism Text Card */}
              <div className="lg:col-span-7 space-y-6">
                {/* Slide Pill Indicator */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 backdrop-blur-xl bg-white/70/70 border border-white/60 rounded-full shadow-sm">
                  <span className="text-base">{heroSlides[currentSlide].flag}</span>
                  <span className="w-2 h-2 rounded-full bg-[var(--clay)] animate-pulse" />
                  <span className="font-mono-ledger text-xs font-semibold uppercase tracking-wider text-[var(--clay)]">
                    {heroSlides[currentSlide].tag}
                  </span>
                </div>

                {/* Dynamic Slide Heading */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--ink)] leading-[1.12]">
                  {heroSlides[currentSlide].title}
                </h1>

                {/* Dynamic Slide Description */}
                <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed max-w-2xl font-sans-ledger">
                  {heroSlides[currentSlide].subtitle}
                </p>

                {/* Slide Highlights Glass Banner */}
                <div className="backdrop-blur-xl bg-white/50/60 border border-white/60 p-3.5 max-w-xl rounded-2xl flex items-center justify-between text-xs font-mono-ledger shadow-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[var(--sage)]" />
                    <span className="text-[var(--ink)] font-semibold">
                      {heroSlides[currentSlide].badge}
                    </span>
                  </div>
                  <div className="text-[var(--clay)] font-bold">
                    {heroSlides[currentSlide].priceNote}
                  </div>
                </div>

                {/* Hero Action CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-2 font-mono-ledger text-xs">
                  <Link
                    href="/patient"
                    className="bg-[var(--clay)] text-white px-6 py-3.5 font-bold hover:opacity-95 transition-all shadow-md hover:shadow-lg flex items-center gap-2 rounded-xl"
                  >
                    <span>Find Care in {heroSlides[currentSlide].country}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/signup"
                    className="backdrop-blur-xl bg-white/70/70 border border-white/80 text-[var(--ink)] px-6 py-3.5 font-semibold hover:border-[var(--clay)] hover:text-[var(--clay)] transition-all shadow-xs rounded-xl"
                  >
                    Register Your Practice
                  </Link>
                </div>

                {/* Slider Controls & Navigation */}
                <div className="flex items-center gap-4 pt-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevSlide}
                      aria-label="Previous slide"
                      className="w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-xl bg-white/70/70 border border-white/70 hover:border-[var(--clay)] text-[var(--ink)] transition-colors shadow-xs"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNextSlide}
                      aria-label="Next slide"
                      className="w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-xl bg-white/70/70 border border-white/70 hover:border-[var(--clay)] text-[var(--ink)] transition-colors shadow-xs"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Dots / Tabs */}
                  <div className="flex items-center gap-2">
                    {heroSlides.map((s, idx) => (
                      <button
                        key={s.id}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-2 transition-all rounded-full ${
                          idx === currentSlide
                            ? "w-8 bg-[var(--clay)]"
                            : "w-2 bg-[var(--mist)] hover:bg-[var(--muted)]"
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <span className="font-mono-ledger text-xs text-[var(--muted)]">
                    0{currentSlide + 1} / 0{heroSlides.length}
                  </span>
                </div>
              </div>

              {/* Right Floating Glassmorphism Search Console */}
              <div className="lg:col-span-5">
                <div className="backdrop-blur-2xl bg-white/85/85 border border-white/80 p-6 sm:p-7 shadow-[0_16px_40px_rgba(0,0,0,0.12)] space-y-5 rounded-3xl">
                  {/* Header */}
                  <div className="border-b border-[var(--mist)]/70 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono-ledger text-[11px] font-bold text-[var(--clay)] uppercase tracking-wider flex items-center gap-1.5">
                        <Globe2 className="w-3.5 h-3.5" />
                        <span>ASEAN Clinical Search</span>
                      </span>
                      <span className="badge-ledger badge-confirmed font-mono-ledger text-[10px] rounded-full">
                        Live Calendars
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-[var(--ink)] mt-1">
                      Book Across Singapore, Thailand & Malaysia
                    </h3>
                  </div>

                  {/* Country Filter Pills */}
                  <div>
                    <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1.5">
                      Target Geography
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 font-mono-ledger text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCountryTab("SG");
                          setSelectedCity("Singapore");
                        }}
                        className={`py-2 px-2 border text-center transition-all flex items-center justify-center gap-1 rounded-xl ${
                          selectedCountryTab === "SG"
                            ? "border-[var(--clay)] bg-[var(--clay)] text-white font-bold"
                            : "border-[var(--mist)] bg-white/50 text-[var(--ink)] hover:border-[var(--clay)]"
                        }`}
                      >
                        <span>🇸🇬</span>
                        <span>Singapore</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCountryTab("TH");
                          setSelectedCity("Bangkok");
                        }}
                        className={`py-2 px-2 border text-center transition-all flex items-center justify-center gap-1 rounded-xl ${
                          selectedCountryTab === "TH"
                            ? "border-[var(--clay)] bg-[var(--clay)] text-white font-bold"
                            : "border-[var(--mist)] bg-white/50 text-[var(--ink)] hover:border-[var(--clay)]"
                        }`}
                      >
                        <span>🇹🇭</span>
                        <span>Thailand</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCountryTab("MY");
                          setSelectedCity("Kuala Lumpur");
                        }}
                        className={`py-2 px-2 border text-center transition-all flex items-center justify-center gap-1 rounded-xl ${
                          selectedCountryTab === "MY"
                            ? "border-[var(--clay)] bg-[var(--clay)] text-white font-bold"
                            : "border-[var(--mist)] bg-white/50 text-[var(--ink)] hover:border-[var(--clay)]"
                        }`}
                      >
                        <span>🇲🇾</span>
                        <span>Malaysia</span>
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSearchSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                        Clinical Specialty
                      </label>
                      <select
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="w-full p-2.5 border border-[var(--mist)] bg-white/80/80 text-xs font-mono-ledger text-[var(--ink)] focus:outline-none focus:border-[var(--clay)] backdrop-blur-md rounded-xl"
                      >
                        <option value="All">All Specialties (ASEAN Directory)</option>
                        <option value="Aesthetics">Medical Aesthetics & Longevity</option>
                        <option value="Physio">Kinetic Physiotherapy & Sports Spine</option>
                        <option value="Dental">Digital Smile Design & Implants</option>
                        <option value="Dermatology">Clinical Dermatology & Lasers</option>
                        <option value="Somatic">Integrative Somatic Bodywork</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono-ledger uppercase text-[var(--muted)] mb-1">
                        City Hub
                      </label>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full p-2.5 border border-[var(--mist)] bg-white/80/80 text-xs font-mono-ledger text-[var(--ink)] focus:outline-none focus:border-[var(--clay)] backdrop-blur-md rounded-xl"
                      >
                        <option value="Singapore">Singapore (Novena · Orchard)</option>
                        <option value="Bangkok">Bangkok (Sukhumvit · Sathorn)</option>
                        <option value="Kuala Lumpur">Kuala Lumpur (KLCC · Bangsar)</option>
                        <option value="Phuket">Phuket (Laguna · Patong)</option>
                        <option value="Penang">Penang (George Town)</option>
                        <option value="Chiang Mai">Chiang Mai (Nimman)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[var(--clay)] text-white p-3 font-mono-ledger text-xs font-bold hover:opacity-95 transition-opacity flex items-center justify-center gap-2 shadow-sm rounded-xl"
                    >
                      <Search className="w-4 h-4" />
                      <span>Search Available Practitioners</span>
                    </button>
                  </form>

                  {/* Trust Micro-Metrics */}
                  <div className="pt-3 border-t border-[var(--mist)]/70 grid grid-cols-2 gap-2 text-[11px] font-mono-ledger text-[var(--muted)]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--sage)]" />
                      <span>JCI & MOH Verified</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--clay)]" />
                      <span>Zero Surcharge Standard</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Regional Floating Stats Ribbon */}
            <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="backdrop-blur-xl bg-white/60/70 border border-white/60 p-4 shadow-sm rounded-2xl">
                <div className="text-[10px] font-mono-ledger uppercase text-[var(--muted)]">
                  Accredited Clinics
                </div>
                <div className="font-mono-ledger text-2xl font-bold text-[var(--ink)] mt-1">
                  280+
                </div>
                <div className="text-[11px] font-mono-ledger text-[var(--sage)] mt-1">
                  Singapore · Thailand · Malaysia
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/60/70 border border-white/60 p-4 shadow-sm rounded-2xl">
                <div className="text-[10px] font-mono-ledger uppercase text-[var(--muted)]">
                  Booking Transparency
                </div>
                <div className="font-mono-ledger text-2xl font-bold text-[var(--clay)] mt-1">
                  S$0.00
                </div>
                <div className="text-[11px] font-mono-ledger text-[var(--muted)] mt-1">
                  No hidden cross-border fees
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/60/70 border border-white/60 p-4 shadow-sm rounded-2xl">
                <div className="text-[10px] font-mono-ledger uppercase text-[var(--muted)]">
                  Calendar Confirmation
                </div>
                <div className="font-mono-ledger text-2xl font-bold text-[var(--sage)] mt-1">
                  &lt; 30 sec
                </div>
                <div className="text-[11px] font-mono-ledger text-[var(--muted)] mt-1">
                  SGT & ICT Real-time lock
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/60/70 border border-white/60 p-4 shadow-sm rounded-2xl">
                <div className="text-[10px] font-mono-ledger uppercase text-[var(--muted)]">
                  Patient Satisfaction
                </div>
                <div className="font-mono-ledger text-2xl font-bold text-[var(--amber)] mt-1">
                  4.96 / 5
                </div>
                <div className="text-[11px] font-mono-ledger text-[var(--muted)] mt-1">
                  From 9,400+ verified visits
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 2. REGIONAL NETWORK VALUE PROPOSITION */}
      <section id="about" className="py-16 md:py-24 bg-[var(--surface)] border-b border-[var(--mist)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--paper)] border border-[var(--mist)] rounded-full font-mono-ledger text-xs font-semibold text-[var(--clay)] uppercase tracking-wider">
              About the ASEAN Healthcare Ledger
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-[var(--ink)] tracking-tight">
              A unified booking architecture for Southeast Asia’s medical leaders.
            </h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Cross-border healthcare across Singapore, Thailand, and Malaysia has traditionally suffered from opaque broker commissions, currency confusion, and manual WhatsApp confirmations. Medcin provides a unified clinical standard with verified pricing and instant schedule dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-[var(--mist)] bg-[var(--paper)] p-7 space-y-3 rounded-2xl shadow-xs hover:border-[var(--clay)] transition-colors">
              <div className="w-10 h-10 bg-[var(--surface)] border border-[var(--mist)] rounded-xl flex items-center justify-center text-[var(--clay)] font-mono-ledger font-bold text-sm shadow-xs">
                01
              </div>
              <h3 className="font-bold text-base text-[var(--ink)]">
                Guaranteed Upfront Pricing in S$, ฿ & RM
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Know exact consultation, procedure, and therapy package fees before you travel. No hidden facility surcharges or tourist markups.
              </p>
            </div>

            <div className="border border-[var(--mist)] bg-[var(--paper)] p-7 space-y-3 rounded-2xl shadow-xs hover:border-[var(--clay)] transition-colors">
              <div className="w-10 h-10 bg-[var(--surface)] border border-[var(--mist)] rounded-xl flex items-center justify-center text-[var(--clay)] font-mono-ledger font-bold text-sm shadow-xs">
                02
              </div>
              <h3 className="font-bold text-base text-[var(--ink)]">
                Direct Synchronized Availability
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Direct integration with clinic calendars in Novena, Sukhumvit, and KLCC ensures open 30-to-60 minute consultation slots with zero double-booking.
              </p>
            </div>

            <div className="border border-[var(--mist)] bg-[var(--paper)] p-7 space-y-3 rounded-2xl shadow-xs hover:border-[var(--clay)] transition-colors">
              <div className="w-10 h-10 bg-[var(--surface)] border border-[var(--mist)] rounded-xl flex items-center justify-center text-[var(--clay)] font-mono-ledger font-bold text-sm shadow-xs">
                03
              </div>
              <h3 className="font-bold text-base text-[var(--ink)]">
                JCI & Ministry Accreditation
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Every facility and practitioner is vetted with official credentials from MOH Singapore, MOPH Thailand, and MOH Malaysia with strict PDPA data isolation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="py-16 md:py-24 bg-[var(--paper)] border-b border-[var(--mist)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--surface)] border border-[var(--mist)] rounded-full font-mono-ledger text-xs font-semibold text-[var(--clay)] uppercase tracking-wider">
              Booking Workflow
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] tracking-tight">
              Three Steps to Confirmed Clinical Care
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)]">
              Secure an appointment with an accredited specialist across Singapore, Thailand, or Malaysia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-[var(--mist)] bg-[var(--surface)] p-7 space-y-3 rounded-2xl shadow-xs">
              <div className="font-mono-ledger text-xs font-bold text-[var(--clay)]">
                STEP 01
              </div>
              <h3 className="font-bold text-base text-[var(--ink)]">
                Select Country, Hub & Specialty
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Browse licensed practitioners across Singapore Novena, Bangkok, or Kuala Lumpur. Inspect verified ratings, clinical credentials, and transparent package costs.
              </p>
            </div>

            <div className="border border-[var(--mist)] bg-[var(--surface)] p-7 space-y-3 rounded-2xl shadow-xs">
              <div className="font-mono-ledger text-xs font-bold text-[var(--clay)]">
                STEP 02
              </div>
              <h3 className="font-bold text-base text-[var(--ink)]">
                Select Real-Time Calendar Slot
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Choose a morning or afternoon appointment that coordinates with your schedule. Enter optional clinical intake notes or previous diagnostic summaries.
              </p>
            </div>

            <div className="border border-[var(--mist)] bg-[var(--surface)] p-7 space-y-3 rounded-2xl shadow-xs">
              <div className="font-mono-ledger text-xs font-bold text-[var(--clay)]">
                STEP 03
              </div>
              <h3 className="font-bold text-base text-[var(--ink)]">
                Instant Confirmation & Calendar Sync
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Receive an encrypted booking reference, direct .ics calendar export with clinic coordinates, and WhatsApp / SMS confirmation with directions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED ACCREDITED CLINICS WITH REAL IMAGERY */}
      <section className="py-16 md:py-24 bg-[var(--surface)] border-b border-[var(--mist)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--paper)] border border-[var(--mist)] rounded-full font-mono-ledger text-xs font-semibold text-[var(--clay)] uppercase tracking-wider mb-2">
                ASEAN Directory Showcase
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] tracking-tight">
                Featured Accredited Centers & Practices
              </h2>
              <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
                Premier partner facilities across Singapore, Thailand, and Malaysia with active practitioner calendars.
              </p>
            </div>

            <Link
              href="/patient"
              className="text-xs font-mono-ledger text-[var(--clay)] font-semibold hover:underline flex items-center gap-1"
            >
              <span>Explore All 280+ Facilities</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {accreditedCenters.map((c) => (
              <div
                key={c.name}
                className="group border border-[var(--mist)] bg-[var(--paper)] overflow-hidden flex flex-col justify-between transition-all hover:border-[var(--clay)] hover:shadow-xl rounded-2xl"
              >
                <div>
                  {/* Clinic Real Thumbnail Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-black/5 rounded-t-2xl">
                    <Image
                      src={c.image}
                      alt={c.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3 backdrop-blur-md bg-white/90 px-2.5 py-1 rounded-full font-mono-ledger text-[10px] font-bold text-[var(--amber)] flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{c.rating}</span>
                    </div>
                    <div className="absolute bottom-3 left-3 backdrop-blur-md bg-black/60 text-white px-2.5 py-1 rounded-full font-mono-ledger text-[10px] uppercase tracking-wider">
                      {c.country}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="text-[10px] font-mono-ledger text-[var(--sage)] font-semibold uppercase">
                      {c.accreditation}
                    </div>
                    <h4 className="font-bold text-sm text-[var(--ink)] leading-snug">
                      {c.name}
                    </h4>
                    <div className="text-xs text-[var(--clay)] font-medium">
                      {c.category}
                    </div>
                    <div className="text-[11px] font-mono-ledger text-[var(--muted)] flex items-center gap-1">
                      <MapPin className="w-3 h-3 flex-none text-[var(--muted)]" />
                      <span className="truncate">{c.location}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-3 border-t border-[var(--mist)] flex justify-between items-center font-mono-ledger text-xs">
                  <span className="text-[var(--muted)]">{c.doctors} Specialists</span>
                  <Link
                    href="/patient"
                    className="text-[var(--clay)] font-bold hover:underline flex items-center gap-0.5"
                  >
                    <span>Book Visit</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SEPARATE SOLUTIONS: PATIENTS & CLINICS (WITH BACKGROUND SANCTUARY IMAGE) */}
      <section id="for-clinics" className="py-20 md:py-28 relative overflow-hidden border-b border-[var(--mist)]">
        {/* Background Sanctuary Image & Gradient Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/images/bg-sanctuary.jpg')` }}
        />
        <div className="absolute inset-0 bg-[var(--paper)]/90 backdrop-blur-md" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--surface)] border border-[var(--mist)] rounded-full font-mono-ledger text-xs font-semibold text-[var(--clay)] uppercase tracking-wider">
              Role Workspaces
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-[var(--ink)] tracking-tight">
              Dedicated Portals for Patients & Medical Practices
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Whether you are scheduling cross-border care or directing clinic operations, Medcin provides tailored workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Patients */}
            <div className="backdrop-blur-2xl bg-white/80/85 border border-white/80 p-8 sm:p-10 flex flex-col justify-between space-y-6 shadow-xl rounded-3xl hover:shadow-2xl transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="badge-ledger badge-confirmed font-mono-ledger">Patient Workspace</span>
                  <User className="w-5 h-5 text-[var(--clay)]" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-[var(--ink)]">
                  For Patients
                </h3>

                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                  Book clinical consultations and wellness therapies across Singapore, Thailand, and Malaysia. Modify or reschedule visits up to 24 hours prior with guaranteed zero cancellation fees.
                </p>

                <ul className="space-y-2.5 text-xs font-mono-ledger text-[var(--ink)] pt-3 border-t border-[var(--mist)]/70">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[var(--sage)]" />
                    <span>Search verified doctors across Singapore, Bangkok & KL</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[var(--sage)]" />
                    <span>Multi-currency upfront pricing in S$, ฿, and RM</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[var(--sage)]" />
                    <span>One-click consultation reschedule and .ics calendar sync</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-[var(--mist)]/70 flex gap-3 font-mono-ledger text-xs">
                <Link
                  href="/patient"
                  className="bg-[var(--clay)] text-white px-6 py-3 font-bold hover:opacity-95 transition-opacity rounded-xl shadow-md"
                >
                  Enter Patient Portal
                </Link>
                <Link
                  href="/login?role=patient"
                  className="border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)] px-5 py-3 hover:border-[var(--clay)] transition-colors rounded-xl font-medium"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* For Medical Centers */}
            <div className="backdrop-blur-2xl bg-white/80/85 border border-white/80 p-8 sm:p-10 flex flex-col justify-between space-y-6 shadow-xl rounded-3xl hover:shadow-2xl transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="badge-ledger badge-flagged font-mono-ledger">Clinic Operations</span>
                  <Building2 className="w-5 h-5 text-[var(--clay)]" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-[var(--ink)]">
                  For Medical Centers
                </h3>

                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                  Connect your practice to Southeast Asia’s clinical ledger network. Automate appointment intake, manage practitioner schedules, and eliminate telephone booking errors.
                </p>

                <ul className="space-y-2.5 text-xs font-mono-ledger text-[var(--ink)] pt-3 border-t border-[var(--mist)]/70">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[var(--sage)]" />
                    <span>Real-time dispatch inbox to triage incoming appointments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[var(--sage)]" />
                    <span>Interactive 30-minute calendar availability matrix & clone tool</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[var(--sage)]" />
                    <span>Doctor credentials, license management & procedure catalog control</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-[var(--mist)]/70 flex gap-3 font-mono-ledger text-xs">
                <Link
                  href="/center"
                  className="bg-[var(--clay)] text-white px-6 py-3 font-bold hover:opacity-95 transition-opacity rounded-xl shadow-md"
                >
                  Enter Clinic Portal
                </Link>
                <Link
                  href="/signup"
                  className="border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)] px-5 py-3 hover:border-[var(--clay)] transition-colors rounded-xl font-medium"
                >
                  Register Practice
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CALL TO ACTION (WITH PANORAMIC PAVILION BACKGROUND) */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        {/* Background Pavilion Panoramic Photo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/images/bg-pavilion.jpg')` }}
        />
        {/* Ambient Darkened Gradient Mask for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/70 backdrop-blur-xs" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="backdrop-blur-2xl bg-white/90/92 border border-white/60 p-10 sm:p-14 rounded-3xl shadow-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[var(--paper)] border border-[var(--mist)] rounded-full font-mono-ledger text-xs text-[var(--clay)] font-semibold shadow-xs">
              <span>🇸🇬 🇹🇭 🇲🇾</span>
              <span>Singapore · Thailand · Malaysia</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--ink)]">
              Experience modern healthcare booking across Southeast Asia.
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)] max-w-xl mx-auto leading-relaxed font-sans-ledger">
              Connect with certified medical specialists in Bangkok, Novena, or Kuala Lumpur. Guaranteed upfront pricing, direct calendar booking, and strict clinical bioethics.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3 font-mono-ledger text-xs">
              <Link
                href="/patient"
                className="bg-[var(--clay)] text-white px-7 py-3.5 font-bold hover:opacity-95 transition-all rounded-xl shadow-lg hover:shadow-xl"
              >
                Book an Appointment
              </Link>
              <Link
                href="/signup"
                className="border border-[var(--mist)] bg-[var(--surface)] text-[var(--ink)] px-7 py-3.5 font-semibold hover:border-[var(--clay)] transition-all rounded-xl shadow-xs"
              >
                Register Medical Center
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

