"use client";

import React, { useState, useEffect } from "react";
import { AlertOctagon, Search } from "lucide-react";

interface Dispute {
  id: string;
  bookingId: string;
  reporterId: string;
  title: string;
  description: string;
  amount: number;
  status: "OPEN" | "RESOLVED" | "CLOSED";
  createdAt: string;
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchDisputes() {
      try {
        const response = await fetch('/api/disputes');
        if (response.ok) {
          const data = await response.json();
          setDisputes(data.disputes || []);
        }
      } catch (error) {
        console.error('Failed to fetch disputes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDisputes();
  }, []);

  const filteredDisputes = disputes.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.bookingId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Disputes & Claims</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage patient-center disputes and resolutions
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search disputes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
        {filteredDisputes.map((dispute) => (
          <div key={dispute.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <AlertOctagon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{dispute.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    dispute.status === 'OPEN' 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      : dispute.status === 'RESOLVED'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {dispute.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {dispute.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                  <span>Booking: {dispute.bookingId}</span>
                  <span>Amount: ${dispute.amount}</span>
                  <span>{new Date(dispute.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredDisputes.length === 0 && (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No disputes found
          </div>
        )}
      </div>
    </div>
  );
}
