"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBranding } from "@/lib/branding";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Save,
  Percent,
  DollarSign,
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
  commissionRate: number | null;
  commissionType: "PERCENTAGE" | "FIXED";
  fixedCommissionAmount: number | null;
}

export default function AdminCenterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const centerId = params.id as string;
  const { branding } = useBranding();

  const [center, setCenter] = useState<Center | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Commission form state
  const [commissionType, setCommissionType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [commissionRate, setCommissionRate] = useState<string>("");
  const [fixedCommissionAmount, setFixedCommissionAmount] = useState<string>("");

  useEffect(() => {
    async function fetchCenter() {
      try {
        const response = await fetch(`/api/centers/${centerId}`);
        if (response.ok) {
          const data = await response.json();
          setCenter(data.center);
          
          // Initialize commission form with existing values
          if (data.center) {
            setCommissionType(data.center.commissionType || "PERCENTAGE");
            setCommissionRate(data.center.commissionRate?.toString() || "");
            setFixedCommissionAmount(data.center.fixedCommissionAmount?.toString() || "");
          }
        } else {
          setError("Failed to fetch center details");
        }
      } catch (err) {
        console.error("Failed to fetch center:", err);
        setError("Failed to load center details");
      } finally {
        setLoading(false);
      }
    }

    if (centerId) {
      fetchCenter();
    }
  }, [centerId]);

  const handleSaveCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const payload: any = {
        centerId,
        commissionType,
      };

      if (commissionType === "PERCENTAGE") {
        const rate = parseFloat(commissionRate);
        if (isNaN(rate) || rate < 0 || rate > 100) {
          setError("Commission rate must be between 0 and 100");
          setSaving(false);
          return;
        }
        payload.commissionRate = rate;
      } else {
        const amount = parseFloat(fixedCommissionAmount);
        if (isNaN(amount) || amount <= 0) {
          setError("Fixed commission amount must be greater than 0");
          setSaving(false);
          return;
        }
        payload.fixedCommissionAmount = amount;
      }

      const response = await fetch("/api/admin/centers/commission", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Commission settings updated successfully");
        setCenter(data.center);
      } else {
        setError(data.error || "Failed to update commission settings");
      }
    } catch (err) {
      console.error("Failed to update commission:", err);
      setError("Failed to update commission settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading center details...</p>
        </div>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Center not found
        </h2>
        <Link
          href="/admin/centers"
          className="text-teal-600 hover:text-teal-700 dark:text-teal-400"
        >
          Back to Centers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/centers"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Center Details
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage center information and commission settings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Center Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Center Information
          </h2>

          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
              {center.logoUrl ? (
                <img
                  src={center.logoUrl}
                  alt={center.name}
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <Building2 className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                {center.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {center.category}
              </p>
              <span
                className={`inline-block mt-2 text-xs px-2.5 py-1 rounded-full ${
                  center.status === "APPROVED"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : center.status === "PENDING"
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400"
                }`}
              >
                {center.status}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">
                {center.address}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">
                {center.email}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">
                {center.phone}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                License Number
              </p>
              <p className="font-mono text-gray-900 dark:text-white mt-1">
                {center.licenseNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Commission Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Commission Settings
          </h2>

          <form onSubmit={handleSaveCommission} className="space-y-4">
            {/* Commission Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Commission Type
              </label>
              <select
                value={commissionType}
                onChange={(e) => setCommissionType(e.target.value as "PERCENTAGE" | "FIXED")}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed Amount</option>
              </select>
            </div>

            {/* Percentage Rate */}
            {commissionType === "PERCENTAGE" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Commission Rate (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    placeholder="e.g., 15.00"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Enter a value between 0 and 100
                </p>
              </div>
            )}

            {/* Fixed Amount */}
            {commissionType === "FIXED" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fixed Commission Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={fixedCommissionAmount}
                    onChange={(e) => setFixedCommissionAmount(e.target.value)}
                    placeholder="e.g., 50.00"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Enter a fixed amount per booking
                </p>
              </div>
            )}

            {/* Current Settings Display */}
            {center.commissionRate !== null || center.fixedCommissionAmount !== null ? (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                  Current Commission
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {center.commissionType === "PERCENTAGE"
                    ? `${center.commissionRate}%`
                    : `$${center.fixedCommissionAmount?.toFixed(2)}`}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Type: {center.commissionType}
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  No commission settings configured yet
                </p>
              </div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
              </div>
            )}

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[var(--sage)] hover:opacity-90 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Commission Settings
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
