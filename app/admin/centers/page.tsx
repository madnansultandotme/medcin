"use client";

import React, { useState, useEffect } from "react";
import { useBranding } from "@/lib/branding";
import Link from "next/link";
import {
  Building2,
  Search,
  Check,
  MapPin,
  Phone,
  Mail,
  Eye,
} from "lucide-react";

interface Center {
  id: string;
  name: string;
  category: string;
  address: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "SUSPENDED";
  logoUrl?: string;
  submittedTime?: string;
  userId: string;
}

export default function AdminCentersPage() {
  const { branding } = useBranding();
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "PENDING" | "UNDER_REVIEW" | "APPROVED">("all");

  useEffect(() => {
    async function fetchCenters() {
      try {
        const response = await fetch('/api/centers');
        if (response.ok) {
          const data = await response.json();
          setCenters(data.centers || []);
        }
      } catch (error) {
        console.error('Failed to fetch centers:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCenters();
  }, []);

  const filteredCenters = centers
    .filter(c => statusFilter === "all" || c.status === statusFilter)
    .filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const pendingCenters = filteredCenters.filter(c => c.status === "PENDING" || c.status === "UNDER_REVIEW");
  const activeCenters = filteredCenters.filter(c => c.status === "APPROVED");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading centers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Centers Directory</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage healthcare centers and facility approvals
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search centers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
        </select>
      </div>

      {/* Pending/Under Review Centers */}
      {pendingCenters.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>Pending Approvals</span>
            <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-sm px-2.5 py-0.5 rounded-full">
              {pendingCenters.length}
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingCenters.map((center) => (
              <div key={center.id} className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    {center.logoUrl ? (
                      <img src={center.logoUrl} alt={center.name} className="w-full h-full object-contain rounded-lg" />
                    ) : (
                      <Building2 className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{center.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{center.category}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{center.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span>{center.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{center.phone}</span>
                  </div>
                  <div className="text-xs font-mono text-gray-500 dark:text-gray-500">
                    License: {center.licenseNumber}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/centers/${center.id}`}
                    className="flex-1 bg-[var(--sage)] hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Centers */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Approved Centers ({activeCenters.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {activeCenters.map((center) => (
            <div key={center.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  {center.logoUrl ? (
                    <img src={center.logoUrl} alt={center.name} className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <Building2 className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{center.name}</h3>
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-0.5 rounded-full">
                        Approved
                      </span>
                    </div>
                    <Link
                      href={`/admin/centers/${center.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--sage)] text-white rounded-lg hover:opacity-90 transition text-sm font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Link>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{center.category}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-500">
                    <span>{center.address}</span>
                    <span>{center.email}</span>
                    <span>{center.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {activeCenters.length === 0 && (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              No approved centers found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
