'use client';

import Link from 'next/link';
import { User, Building2, ArrowRight } from 'lucide-react';

export default function SignupLandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#102A43] dark:text-[#EAF5FF] mb-4">
            Join Medcin
          </h1>
          <p className="text-lg text-[#5C7185] dark:text-[#A1B8CB]">
            Choose how you want to get started
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Patient Signup */}
          <Link
            href="/signup/patient"
            className="group relative overflow-hidden rounded-2xl border-2 border-[#D7E7F5] dark:border-[#244766] bg-[#D7E7F5] dark:bg-[#244766]/20 p-8 transition-all hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#1769AA]/50"
          >
            <div className="relative z-10">
              {/* Icon */}
              <div className="mb-6 inline-flex rounded-xl bg-white/50 dark:bg-gray-900/50 p-4 backdrop-blur-sm">
                <User className="h-12 w-12 text-[#1769AA] dark:text-[#55A9E6]" />
              </div>

              {/* Content */}
              <h2 className="text-3xl font-bold text-[#102A43] dark:text-[#EAF5FF] mb-3">
                I'm a Patient
              </h2>
              <p className="text-[#5C7185] dark:text-[#A1B8CB] mb-6">
                Book appointments with healthcare providers, manage your health records, and access quality medical care.
              </p>

              {/* Features List */}
              <ul className="space-y-2 mb-6 text-sm text-[#5C7185] dark:text-[#A1B8CB]">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1769AA]" />
                  Search and book appointments instantly
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1769AA]" />
                  View doctor profiles and reviews
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1769AA]" />
                  Manage your medical appointments
                </li>
              </ul>

              {/* CTA */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#1769AA] dark:text-[#55A9E6]">
                  Sign up as Patient
                </span>
                <ArrowRight className="h-5 w-5 text-[#1769AA] dark:text-[#55A9E6] transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-white/10" />
          </Link>

          {/* Center Signup */}
          <Link
            href="/signup/center"
            className="group relative overflow-hidden rounded-2xl border-2 border-[#D7E7F5] dark:border-[#244766] bg-[#D7E7F5] dark:bg-[#244766]/20 p-8 transition-all hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#1769AA]/50"
          >
            <div className="relative z-10">
              {/* Icon */}
              <div className="mb-6 inline-flex rounded-xl bg-white/50 dark:bg-gray-900/50 p-4 backdrop-blur-sm">
                <Building2 className="h-12 w-12 text-[#2F80B7] dark:text-[#72BCE8]" />
              </div>

              {/* Content */}
              <h2 className="text-3xl font-bold text-[#102A43] dark:text-[#EAF5FF] mb-3">
                I'm a Healthcare Provider
              </h2>
              <p className="text-[#5C7185] dark:text-[#A1B8CB] mb-6">
                Register your medical center or clinic, manage appointments, and reach more patients.
              </p>

              {/* Features List */}
              <ul className="space-y-2 mb-6 text-sm text-[#5C7185] dark:text-[#A1B8CB]">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2F80B7]" />
                  Manage doctors and services
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2F80B7]" />
                  Control appointment availability
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2F80B7]" />
                  Grow your practice online
                </li>
              </ul>

              {/* CTA */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#2F80B7] dark:text-[#72BCE8]">
                  Register Your Center
                </span>
                <ArrowRight className="h-5 w-5 text-[#2F80B7] dark:text-[#72BCE8] transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-white/10" />
          </Link>
        </div>

        {/* Login Link */}
        <p className="mt-8 text-center text-sm text-[#5C7185] dark:text-[#A1B8CB]">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-[#1769AA] dark:text-[#55A9E6] hover:text-[#2F80B7] dark:hover:text-[#72BCE8] font-semibold"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
