"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, MapPin, Clock, Award, ArrowLeft, Heart, Share2, CheckCircle2, Users, Shield, Building2, Phone, Mail, ChevronRight, Globe, Stethoscope } from "lucide-react";
import { useMedcinStore } from "@/lib/store";

interface Center {
  id: string;
  name: string;
  category: string;
  address: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: string;
  logo: string | null;
  coverImage: string | null;
  doctorCount: number;
  operatingHours: string;
  amenities: string[];
  submittedTime: string;
  rating?: number;
  reviewsCount?: number;
}

export default function CenterProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { centers, doctors } = useMedcinStore();
  const [center, setCenter] = useState<Center | null>(null);
  const [centerDoctors, setCenterDoctors] = useState<any[]>([]);

  useEffect(() => {
    if (centers.length > 0) {
      const found = centers.find((c) => c.id === params.id);
      if (found) {
        // Calculate rating from doctors at this center
        const docsAtCenter = doctors.filter((d) => d.clinic === found.name);
        const avgRating = docsAtCenter.length > 0
          ? docsAtCenter.reduce((sum, d) => sum + d.rating, 0) / docsAtCenter.length
          : 0;
        const totalReviews = docsAtCenter.reduce((sum, d) => sum + d.reviewsCount, 0);

        setCenter({
          ...found,
          rating: Math.round(avgRating * 10) / 10,
          reviewsCount: totalReviews,
        } as Center);
        setCenterDoctors(docsAtCenter);
      }
    }
  }, [centers, doctors, params.id]);

  if (!center) {
    return (
      <div className="min-h-screen bg-[var(--canvas)]">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <p className="text-[var(--muted)] font-sans-ledger">Loading center profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--canvas)]">
      {/* Cover Photo Section (if available) */}
      {center.coverImage && (
        <div className="container-ledger pt-6 pb-0">
          <div className="relative h-64 sm:h-80 overflow-hidden rounded-3xl shadow-lg">
            <img
              src={center.coverImage}
              alt={center.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/80 via-[var(--ink)]/20 to-transparent" />
          </div>
        </div>
      )}

      {/* Back Button - Positioned below cover or at top */}
      <div className={`container-ledger pt-6 pb-4 ${!center.coverImage ? 'bg-gradient-to-br from-[var(--sage-light)] via-[var(--canvas)] to-[var(--paper)]' : ''}`}>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[var(--clay)] hover:text-[var(--ink)] font-sans-ledger text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </button>
      </div>

      {/* Center Profile Header */}
      <div className="bg-gradient-to-br from-[var(--sage-light)] via-[var(--canvas)] to-[var(--paper)] border-b border-[var(--mist)]">
        <div className="container-ledger py-8 sm:py-12">
          <div className="card-ledger p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left: Logo & Quick Actions */}
              <div className="flex flex-col items-center lg:items-start gap-4">
                {/* Center Logo */}
                {center.logo ? (
                  <img
                    src={center.logo}
                    alt={center.name}
                    className="w-40 h-40 rounded-3xl object-cover border-2 border-[var(--mist)] shadow-lg bg-white"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-[var(--sage-light)] to-[var(--sage)] border-2 border-[var(--mist)] flex items-center justify-center shadow-lg">
                    <Building2 className="w-20 h-20 text-white" />
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2 w-full">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--mist)] bg-[var(--paper)] hover:bg-[var(--canvas)] text-[var(--clay)] font-sans-ledger text-sm transition-all">
                    <Heart className="w-4 h-4" />
                    Save
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--mist)] bg-[var(--paper)] hover:bg-[var(--canvas)] text-[var(--clay)] font-sans-ledger text-sm transition-all">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>

              {/* Right: Center Details */}
              <div className="flex-1 space-y-6">
                {/* Name & Status */}
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h1 className="font-bold text-3xl sm:text-4xl text-[var(--ink)]">
                      {center.name}
                    </h1>
                    {center.status === "active" && (
                      <span className="badge-ledger badge-confirmed font-mono-ledger text-xs px-3 py-1.5 rounded-full font-semibold inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    )}
                    {center.status === "pending" && (
                      <span className="badge-ledger badge-pending font-mono-ledger text-xs px-3 py-1.5 rounded-full font-semibold">
                        Pending Review
                      </span>
                    )}
                  </div>
                  <span className="badge-ledger badge-category px-3 py-1.5 rounded-full font-mono-ledger text-xs font-semibold inline-block mb-4">
                    {center.category}
                  </span>

                  {/* Rating & Doctors */}
                  <div className="flex flex-wrap items-center gap-4">
                    {center.rating && center.rating > 0 && (
                      <div className="flex items-center gap-1.5 text-[var(--amber)] font-mono-ledger font-medium">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="font-bold text-lg">{center.rating}</span>
                        <span className="text-[var(--muted)] text-sm">
                          ({center.reviewsCount} reviews)
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--clay)]">
                      <Stethoscope className="w-4 h-4" />
                      {center.doctorCount} Healthcare Professional{center.doctorCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                {/* Location & Hours */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--paper)] border border-[var(--mist)]">
                    <MapPin className="w-5 h-5 text-[var(--clay)] flex-none mt-0.5" />
                    <div>
                      <div className="text-xs text-[var(--muted)] font-sans-ledger mb-0.5">Address</div>
                      <div className="font-medium text-[var(--ink)]">{center.address}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--paper)] border border-[var(--mist)]">
                    <Clock className="w-5 h-5 text-[var(--clay)] flex-none" />
                    <div>
                      <div className="text-xs text-[var(--muted)] font-sans-ledger mb-0.5">Operating Hours</div>
                      <div className="font-medium text-[var(--ink)]">{center.operatingHours}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--paper)] border border-[var(--mist)]">
                    <Shield className="w-5 h-5 text-[var(--sage)] flex-none" />
                    <div>
                      <div className="text-xs text-[var(--muted)] font-sans-ledger mb-0.5">License Number</div>
                      <div className="font-mono-ledger font-semibold text-[var(--ink)]">{center.licenseNumber}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-ledger pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Amenities & Doctors */}
          <div className="lg:col-span-2 space-y-6">
            {/* Amenities Section */}
            {center.amenities && center.amenities.length > 0 && (
              <div className="card-ledger p-6 sm:p-8">
                <h2 className="font-bold text-2xl text-[var(--ink)] mb-6 flex items-center gap-3">
                  <Award className="w-6 h-6 text-[var(--sage)]" />
                  Amenities & Services
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {center.amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-4 rounded-xl bg-[var(--paper)] border border-[var(--mist)] hover:border-[var(--sage)] transition-all"
                    >
                      <CheckCircle2 className="w-5 h-5 text-[var(--sage)] flex-none" />
                      <span className="text-sm font-medium text-[var(--clay)]">
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Doctors at this Center */}
            {centerDoctors.length > 0 && (
              <div className="card-ledger p-6 sm:p-8">
                <h2 className="font-bold text-2xl text-[var(--ink)] mb-6 flex items-center gap-3">
                  <Users className="w-6 h-6 text-[var(--sage)]" />
                  Healthcare Professionals ({centerDoctors.length})
                </h2>
                <div className="space-y-4">
                  {centerDoctors.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => router.push(`/doctors/${doc.id}`)}
                      className="p-5 rounded-2xl border border-[var(--mist)] bg-[var(--paper)] hover:border-[var(--sage)] hover:bg-[var(--sage-light)] transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        {doc.image ? (
                          <img
                            src={doc.image}
                            alt={doc.name}
                            className="w-20 h-20 rounded-2xl object-cover border border-[var(--mist)] flex-none"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-[var(--paper)] border border-[var(--mist)] flex items-center justify-center font-mono-ledger text-xl font-bold text-[var(--clay)] flex-none">
                            {doc.initials}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg text-[var(--ink)] truncate">
                              {doc.name}
                            </h3>
                            <ChevronRight className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--sage)] transition-colors flex-none" />
                          </div>
                          <p className="text-sm text-[var(--clay)] font-medium mb-2 truncate">
                            {doc.role}
                          </p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-1 text-[var(--amber)] text-sm font-mono-ledger font-medium">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="font-bold">{doc.rating}</span>
                              <span className="text-[var(--muted)]">({doc.reviewsCount})</span>
                            </div>
                            <span className="text-sm font-mono-ledger font-bold text-[var(--ink)]">
                              from ${doc.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Contact Card (Sticky) */}
          <div className="lg:col-span-1">
            <div className="card-ledger p-6 sticky top-24 space-y-6">
              <h3 className="font-bold text-lg text-[var(--ink)]">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[var(--sage-light)] border-2 border-[var(--sage)]/30">
                  <div className="flex items-center gap-2 text-xs text-[var(--clay)] font-sans-ledger font-semibold mb-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </div>
                  <a
                    href={`tel:${center.phone}`}
                    className="text-[var(--sage)] text-base font-bold hover:underline"
                  >
                    {center.phone}
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-[var(--sage-light)] border-2 border-[var(--sage)]/30">
                  <div className="flex items-center gap-2 text-xs text-[var(--clay)] font-sans-ledger font-semibold mb-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </div>
                  <a
                    href={`mailto:${center.email}`}
                    className="text-[var(--sage)] text-sm font-semibold hover:underline break-all"
                  >
                    {center.email}
                  </a>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full bg-[var(--sage)] hover:bg-[var(--clay)] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl">
                  <MapPin className="w-5 h-5" />
                  <span>Get Directions</span>
                </button>

                {/* Social Media Links */}
                <div className="pt-2">
                  <div className="text-xs text-[var(--muted)] font-sans-ledger font-semibold mb-3 uppercase tracking-wide text-center">
                    Connect With Us
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <a
                      href="#"
                      className="w-12 h-12 rounded-xl bg-white border-2 border-[var(--sage)] text-[var(--sage)] hover:bg-[var(--sage)] hover:text-white flex items-center justify-center transition-all"
                      title="Facebook"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="w-12 h-12 rounded-xl bg-white border-2 border-[var(--sage)] text-[var(--sage)] hover:bg-[var(--sage)] hover:text-white flex items-center justify-center transition-all"
                      title="Instagram"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="w-12 h-12 rounded-xl bg-white border-2 border-[var(--sage)] text-[var(--sage)] hover:bg-[var(--sage)] hover:text-white flex items-center justify-center transition-all"
                      title="LinkedIn"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="w-12 h-12 rounded-xl bg-white border-2 border-[var(--sage)] text-[var(--sage)] hover:bg-[var(--sage)] hover:text-white flex items-center justify-center transition-all"
                      title="Twitter"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="pt-4 border-t border-[var(--mist)] space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)] font-sans-ledger">Status</span>
                  <span className={`font-semibold ${center.status === "active" ? "text-[var(--sage)]" : "text-[var(--amber)]"}`}>
                    {center.status === "active" ? "Active" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)] font-sans-ledger">Category</span>
                  <span className="font-semibold text-[var(--ink)]">{center.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)] font-sans-ledger">Professionals</span>
                  <span className="font-semibold text-[var(--ink)]">{center.doctorCount}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-[var(--mist)] space-y-2">
                <div className="flex items-center gap-2 text-xs text-[var(--sage)] font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>MOH Licensed Facility</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--sage)] font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified Credentials</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--sage)] font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Multiple Specialists</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
