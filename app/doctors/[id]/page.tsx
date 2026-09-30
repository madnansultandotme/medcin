"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, MapPin, Calendar, Clock, Award, ArrowLeft, Heart, Share2, CheckCircle2, BadgeCheck, Phone, Mail, Building2, ChevronRight, X } from "lucide-react";
import { useMedcinStore } from "@/lib/store";

interface Doctor {
  id: string;
  name: string;
  role: string;
  category: string;
  clinic: string;
  location: string;
  price: number;
  rating: number;
  reviewsCount: number;
  initials: string;
  licenseNumber: string;
  active: boolean;
  bio: string;
  image: string | null;
  services: {
    id: string;
    name: string;
    duration: string;
    price: number;
    description: string;
  }[];
}

export default function DoctorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { doctors, setActiveBookingDraft, createBooking, patientProfile } = useMedcinStore();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    patientName: patientProfile?.name || "",
    patientEmail: patientProfile?.email || "",
    patientPhone: patientProfile?.phone || "",
    patientNotes: "",
  });

  useEffect(() => {
    if (doctors.length > 0) {
      const found = doctors.find((d) => d.id === params.id);
      if (found) {
        setDoctor(found as Doctor);
        // Pre-select first service
        if (found.services && found.services.length > 0) {
          setSelectedService(found.services[0].id);
        }
      }
    }
  }, [doctors, params.id]);

  const handleBookAppointment = () => {
    if (!doctor || !selectedService) return;
    
    // Start booking flow on this page
    setShowBookingFlow(true);
    setBookingStep(1);
  };

  const handleConfirmBooking = () => {
    if (!doctor || !selectedService) return;
    
    const selectedServiceData = doctor.services.find(s => s.id === selectedService);
    if (!selectedServiceData) return;

    // Create the booking
    createBooking({
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorRole: doctor.role,
      serviceName: selectedServiceData.name,
      duration: selectedServiceData.duration,
      price: selectedServiceData.price,
      clinicName: doctor.clinic,
      clinicAddress: doctor.location,
      date: bookingData.date,
      time: bookingData.time,
      patientName: bookingData.patientName,
      patientEmail: bookingData.patientEmail,
      patientPhone: bookingData.patientPhone,
      patientNotes: bookingData.patientNotes,
      status: "confirmed",
      paymentMethod: "Pay at Clinic",
    });

    // Show success and redirect
    alert("Booking confirmed! Redirecting to your bookings...");
    router.push("/patient?tab=mybookings");
  };

  if (!doctor) {
    return (
      <div className="min-h-screen bg-[var(--canvas)]">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <p className="text-[var(--muted)] font-sans-ledger">Loading doctor profile...</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedServiceData = doctor.services.find(s => s.id === selectedService) || doctor.services[0];

  return (
    <div className="min-h-screen bg-[var(--canvas)]">
      {/* Booking Flow Modal */}
      {showBookingFlow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[var(--ink)]">Book Appointment</h2>
                <button
                  onClick={() => setShowBookingFlow(false)}
                  className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center justify-between mb-8">
                {[
                  { num: 1, label: "Date & Time" },
                  { num: 2, label: "Your Details" },
                  { num: 3, label: "Confirm" },
                ].map((step) => (
                  <div key={step.num} className="flex items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        bookingStep >= step.num
                          ? "bg-[var(--sage)] text-white"
                          : "bg-[var(--mist)] text-[var(--muted)]"
                      }`}
                    >
                      {step.num}
                    </div>
                    <div className="ml-2 text-sm font-medium text-[var(--ink)]">{step.label}</div>
                    {step.num < 3 && <div className="flex-1 h-0.5 bg-[var(--mist)] mx-4" />}
                  </div>
                ))}
              </div>

              {/* Step 1: Date & Time */}
              {bookingStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--ink)] mb-2">
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={bookingData.date}
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                      className="w-full p-3 border-2 border-[var(--mist)] rounded-xl focus:border-[var(--sage)] focus:outline-none"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--ink)] mb-2">
                      Select Time
                    </label>
                    <select
                      value={bookingData.time}
                      onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                      className="w-full p-3 border-2 border-[var(--mist)] rounded-xl focus:border-[var(--sage)] focus:outline-none"
                    >
                      <option value="">Choose a time slot</option>
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="15:00">03:00 PM</option>
                      <option value="16:00">04:00 PM</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setBookingStep(2)}
                    disabled={!bookingData.date || !bookingData.time}
                    className="w-full bg-[var(--sage)] hover:bg-[var(--clay)] disabled:bg-[var(--mist)] disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all"
                  >
                    Continue to Details
                  </button>
                </div>
              )}

              {/* Step 2: Patient Details */}
              {bookingStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--ink)] mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={bookingData.patientName}
                      onChange={(e) => setBookingData({ ...bookingData, patientName: e.target.value })}
                      className="w-full p-3 border-2 border-[var(--mist)] rounded-xl focus:border-[var(--sage)] focus:outline-none"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--ink)] mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={bookingData.patientEmail}
                      onChange={(e) => setBookingData({ ...bookingData, patientEmail: e.target.value })}
                      className="w-full p-3 border-2 border-[var(--mist)] rounded-xl focus:border-[var(--sage)] focus:outline-none"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--ink)] mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={bookingData.patientPhone}
                      onChange={(e) => setBookingData({ ...bookingData, patientPhone: e.target.value })}
                      className="w-full p-3 border-2 border-[var(--mist)] rounded-xl focus:border-[var(--sage)] focus:outline-none"
                      placeholder="+65 1234 5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--ink)] mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={bookingData.patientNotes}
                      onChange={(e) => setBookingData({ ...bookingData, patientNotes: e.target.value })}
                      className="w-full p-3 border-2 border-[var(--mist)] rounded-xl focus:border-[var(--sage)] focus:outline-none"
                      rows={3}
                      placeholder="Any special requests or medical concerns..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setBookingStep(1)}
                      className="flex-1 bg-white border-2 border-[var(--sage)] text-[var(--sage)] font-semibold py-3 px-6 rounded-xl transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setBookingStep(3)}
                      disabled={!bookingData.patientName || !bookingData.patientEmail || !bookingData.patientPhone}
                      className="flex-1 bg-[var(--sage)] hover:bg-[var(--clay)] disabled:bg-[var(--mist)] disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all"
                    >
                      Review Booking
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {bookingStep === 3 && selectedServiceData && (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-[var(--sage-light)] border-2 border-[var(--sage)]/30">
                    <h3 className="font-bold text-lg text-[var(--ink)] mb-4">Booking Summary</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--muted)]">Doctor</span>
                        <span className="font-semibold text-[var(--ink)]">{doctor.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted)]">Service</span>
                        <span className="font-semibold text-[var(--ink)]">{selectedServiceData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted)]">Date</span>
                        <span className="font-semibold text-[var(--ink)]">{bookingData.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted)]">Time</span>
                        <span className="font-semibold text-[var(--ink)]">{bookingData.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted)]">Duration</span>
                        <span className="font-semibold text-[var(--ink)]">{selectedServiceData.duration}</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t-2 border-[var(--sage)]/30">
                        <span className="font-bold text-[var(--ink)]">Total</span>
                        <span className="font-bold text-2xl text-[var(--ink)] font-mono-ledger">${selectedServiceData.price}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setBookingStep(2)}
                      className="flex-1 bg-white border-2 border-[var(--sage)] text-[var(--sage)] font-semibold py-3 px-6 rounded-xl transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleConfirmBooking}
                      className="flex-1 bg-[var(--sage)] hover:bg-[var(--clay)] text-white font-bold py-3 px-6 rounded-xl transition-all"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="container-ledger pt-6 pb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[var(--clay)] hover:text-[var(--ink)] font-sans-ledger text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </button>
      </div>

      {/* Doctor Profile Header */}
      <div className="bg-gradient-to-br from-[var(--sage-light)] via-[var(--canvas)] to-[var(--paper)] border-b border-[var(--mist)]">
        <div className="container-ledger py-8 sm:py-12">
          <div className="card-ledger p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left: Doctor Photo & Quick Info */}
              <div className="flex flex-col items-center lg:items-start gap-4">
                {/* Doctor Photo */}
                {doctor.image ? (
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-40 h-40 rounded-3xl object-cover border-2 border-[var(--mist)] shadow-lg"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-3xl bg-[var(--paper)] border-2 border-[var(--mist)] flex items-center justify-center font-mono-ledger text-5xl font-bold text-[var(--clay)] shadow-lg">
                    {doctor.initials}
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

              {/* Right: Doctor Details */}
              <div className="flex-1 space-y-6">
                {/* Name & Title */}
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h1 className="font-bold text-3xl sm:text-4xl text-[var(--ink)]">
                      {doctor.name}
                    </h1>
                    <span className="badge-ledger badge-confirmed font-mono-ledger text-xs px-3 py-1.5 rounded-full font-semibold inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-[var(--clay)] mb-4">
                    {doctor.role}
                  </p>
                  
                  {/* Rating & Category */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[var(--amber)] font-mono-ledger font-medium">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-bold text-lg">{doctor.rating}</span>
                      <span className="text-[var(--muted)] text-sm">({doctor.reviewsCount} reviews)</span>
                    </div>
                    <span className="badge-ledger badge-category px-3 py-1.5 rounded-full font-mono-ledger text-xs font-semibold">
                      {doctor.category}
                    </span>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${doctor.active ? "text-[var(--sage)]" : "text-[var(--muted)]"}`}>
                      <div className={`w-2 h-2 rounded-full ${doctor.active ? "bg-[var(--sage)]" : "bg-[var(--muted)]"}`} />
                      {doctor.active ? "Available Now" : "Unavailable"}
                    </div>
                  </div>
                </div>

                {/* Location & License */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--paper)] border border-[var(--mist)]">
                    <Building2 className="w-5 h-5 text-[var(--clay)] flex-none mt-0.5" />
                    <div>
                      <div className="font-semibold text-[var(--ink)] mb-0.5">{doctor.clinic}</div>
                      <div className="text-[var(--muted)] font-sans-ledger flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {doctor.location}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--paper)] border border-[var(--mist)]">
                    <BadgeCheck className="w-5 h-5 text-[var(--sage)] flex-none" />
                    <div>
                      <div className="text-xs text-[var(--muted)] font-sans-ledger">License Number</div>
                      <div className="font-mono-ledger font-semibold text-[var(--ink)]">{doctor.licenseNumber}</div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="p-4 rounded-xl bg-[var(--sage-light)] border border-[var(--mist)]">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-[var(--sage)]" />
                    <span className="font-semibold text-sm text-[var(--ink)]">About</span>
                  </div>
                  <p className="text-[var(--clay)] font-sans-ledger leading-relaxed text-sm">
                    {doctor.bio}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services & Booking Section */}
      <div className="container-ledger py-8 sm:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Services */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card-ledger p-6 sm:p-8">
              <h2 className="font-bold text-2xl text-[var(--ink)] mb-6 flex items-center gap-3">
                <Calendar className="w-6 h-6 text-[var(--sage)]" />
                Services & Consultations
              </h2>
              <div className="space-y-4">
                {doctor.services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedService === service.id
                        ? "border-[var(--sage)] bg-[var(--sage-light)] shadow-md"
                        : "border-[var(--mist)] bg-[var(--paper)] hover:border-[var(--sage)] hover:bg-[var(--sage-light)]"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-[var(--ink)] text-lg">
                            {service.name}
                          </h3>
                          {selectedService === service.id && (
                            <CheckCircle2 className="w-5 h-5 text-[var(--sage)] flex-none" />
                          )}
                        </div>
                        <p className="text-sm text-[var(--muted)] font-sans-ledger mb-3 leading-relaxed">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-[var(--clay)] font-medium">
                            <Clock className="w-4 h-4" />
                            {service.duration}
                          </div>
                          <div className="text-2xl font-bold text-[var(--ink)] font-mono-ledger">
                            ${service.price}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card (Sticky) */}
          <div className="lg:col-span-1">
            <div className="card-ledger p-6 sticky top-24 space-y-6">
              <div>
                <h3 className="font-bold text-xl text-[var(--ink)] mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[var(--sage)]" />
                  Book Appointment
                </h3>
                
                {/* Selected Service Summary */}
                {selectedServiceData && (
                  <div className="p-4 rounded-xl bg-[var(--sage-light)] border-2 border-[var(--sage)]/30 mb-4">
                    <div className="text-xs text-[var(--clay)] font-sans-ledger font-semibold mb-2">Selected Service</div>
                    <div className="font-bold text-[var(--ink)] mb-3 text-base">{selectedServiceData.name}</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm text-[var(--clay)] font-medium">
                        <Clock className="w-4 h-4" />
                        {selectedServiceData.duration}
                      </div>
                      <div className="text-3xl font-bold text-[var(--ink)] font-mono-ledger">
                        ${selectedServiceData.price}
                      </div>
                    </div>
                  </div>
                )}

                {/* Pricing Info */}
                <div className="text-center py-5 border-y-2 border-[var(--mist)] mb-6">
                  <div className="text-xs text-[var(--muted)] font-sans-ledger font-semibold mb-2 uppercase tracking-wide">
                    Starting from
                  </div>
                  <div className="text-4xl font-bold text-[var(--ink)] font-mono-ledger mb-1">
                    ${doctor.price}
                  </div>
                  <div className="text-sm text-[var(--muted)] font-sans-ledger">
                    per consultation
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <button 
                    onClick={handleBookAppointment}
                    className="w-full bg-[var(--sage)] hover:bg-[var(--clay)] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl text-base"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Book Appointment</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <button className="w-full bg-white hover:bg-[var(--paper)] border-2 border-[var(--sage)] text-[var(--sage)] hover:text-[var(--clay)] hover:border-[var(--clay)] font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all">
                    <Phone className="w-4 h-4" />
                    <span>Contact Clinic</span>
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="pt-6 border-t-2 border-[var(--mist)] space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--paper)]">
                  <span className="text-[var(--clay)] font-sans-ledger font-medium text-sm">Response time</span>
                  <span className="font-bold text-[var(--ink)] text-sm">Within 2 hours</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--paper)]">
                  <span className="text-[var(--clay)] font-sans-ledger font-medium text-sm">Availability</span>
                  <span className={`font-bold text-sm ${doctor.active ? "text-[var(--sage)]" : "text-[var(--muted)]"}`}>
                    {doctor.active ? "Available" : "Unavailable"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--paper)]">
                  <span className="text-[var(--clay)] font-sans-ledger font-medium text-sm">Total bookings</span>
                  <span className="font-bold text-[var(--ink)] text-sm">{doctor.reviewsCount}+</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--paper)]">
                  <span className="text-[var(--clay)] font-sans-ledger font-medium text-sm">Accepts</span>
                  <span className="font-bold text-[var(--ink)] text-sm">Pay at Clinic</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t-2 border-[var(--mist)] space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--sage-light)] border border-[var(--sage)]/20">
                  <CheckCircle2 className="w-5 h-5 text-[var(--sage)] flex-none" />
                  <span className="text-sm font-semibold text-[var(--ink)]">MOH Licensed Professional</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--sage-light)] border border-[var(--sage)]/20">
                  <CheckCircle2 className="w-5 h-5 text-[var(--sage)] flex-none" />
                  <span className="text-sm font-semibold text-[var(--ink)]">Verified Credentials</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--sage-light)] border border-[var(--sage)]/20">
                  <CheckCircle2 className="w-5 h-5 text-[var(--sage)] flex-none" />
                  <span className="text-sm font-semibold text-[var(--ink)]">Same-day Availability</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
