"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Trash2,
  Clock,
  Stethoscope,
  Filter,
  Copy,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AlertDialog } from "@/components/ui/AlertDialog";

interface Doctor {
  id: string;
  name: string;
  category: string;
}

interface Slot {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "AVAILABLE" | "BOOKED" | "BLOCKED";
}

interface BulkSlotFormData {
  doctorId: string;
  startDate: string;
  endDate: string;
  daysOfWeek: string[];
  timeSlots: { startTime: string; endTime: string }[];
}

const DAYS_OF_WEEK = [
  { value: "0", label: "Sun" },
  { value: "1", label: "Mon" },
  { value: "2", label: "Tue" },
  { value: "3", label: "Wed" },
  { value: "4", label: "Thu" },
  { value: "5", label: "Fri" },
  { value: "6", label: "Sat" },
];

const COMMON_TIME_SLOTS = [
  { start: "09:00", end: "10:00", label: "9:00 AM" },
  { start: "10:00", end: "11:00", label: "10:00 AM" },
  { start: "11:00", end: "12:00", label: "11:00 AM" },
  { start: "12:00", end: "13:00", label: "12:00 PM" },
  { start: "14:00", end: "15:00", label: "2:00 PM" },
  { start: "15:00", end: "16:00", label: "3:00 PM" },
  { start: "16:00", end: "17:00", label: "4:00 PM" },
  { start: "17:00", end: "18:00", label: "5:00 PM" },
];

export default function CenterSlotsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  // Modal states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Alert states
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [processing, setProcessing] = useState(false);

  // Bulk form state
  const [bulkForm, setBulkForm] = useState<BulkSlotFormData>({
    doctorId: "",
    startDate: "",
    endDate: "",
    daysOfWeek: ["1", "2", "3", "4", "5"], // Mon-Fri by default
    timeSlots: [],
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [doctorsRes, slotsRes] = await Promise.all([
        fetch("/api/doctors"),
        fetch("/api/slots"),
      ]);

      if (doctorsRes.ok) {
        const data = await doctorsRes.json();
        setDoctors(data.doctors || []);
      }

      if (slotsRes.ok) {
        const data = await slotsRes.json();
        setSlots(data.slots || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }

  const toggleTimeSlot = (startTime: string, endTime: string) => {
    const exists = bulkForm.timeSlots.some(
      (slot) => slot.startTime === startTime && slot.endTime === endTime
    );

    if (exists) {
      setBulkForm({
        ...bulkForm,
        timeSlots: bulkForm.timeSlots.filter(
          (slot) => !(slot.startTime === startTime && slot.endTime === endTime)
        ),
      });
    } else {
      setBulkForm({
        ...bulkForm,
        timeSlots: [...bulkForm.timeSlots, { startTime, endTime }],
      });
    }
  };

  const toggleDayOfWeek = (day: string) => {
    if (bulkForm.daysOfWeek.includes(day)) {
      setBulkForm({
        ...bulkForm,
        daysOfWeek: bulkForm.daysOfWeek.filter((d) => d !== day),
      });
    } else {
      setBulkForm({
        ...bulkForm,
        daysOfWeek: [...bulkForm.daysOfWeek, day].sort(),
      });
    }
  };

  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!bulkForm.doctorId || !bulkForm.startDate || !bulkForm.endDate) {
      setFormError("Please select doctor and date range");
      return;
    }

    if (bulkForm.daysOfWeek.length === 0) {
      setFormError("Please select at least one day of the week");
      return;
    }

    if (bulkForm.timeSlots.length === 0) {
      setFormError("Please select at least one time slot");
      return;
    }

    try {
      setProcessing(true);

      // Generate all dates between start and end that match selected days
      const startDate = new Date(bulkForm.startDate);
      const endDate = new Date(bulkForm.endDate);
      const slots = [];

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay().toString();
        if (bulkForm.daysOfWeek.includes(dayOfWeek)) {
          const dateStr = d.toISOString().split("T")[0];
          for (const timeSlot of bulkForm.timeSlots) {
            slots.push({
              doctorId: bulkForm.doctorId,
              date: dateStr,
              startTime: timeSlot.startTime,
              endTime: timeSlot.endTime,
            });
          }
        }
      }

      // Create slots
      const response = await fetch("/api/slots/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create slots");
      }

      const result = await response.json();
      setShowBulkModal(false);
      setBulkForm({
        doctorId: "",
        startDate: "",
        endDate: "",
        daysOfWeek: ["1", "2", "3", "4", "5"],
        timeSlots: [],
      });
      await fetchData();
      setAlertMessage(
        `Successfully created ${result.created || slots.length} slots!`
      );
      setShowAlert(true);
    } catch (error: any) {
      setFormError(error.message || "Failed to create slots");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteSlot = async () => {
    if (!selectedSlot) return;

    try {
      const response = await fetch("/api/slots", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedSlot.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete slot");
      }

      setShowDeleteConfirm(false);
      setSelectedSlot(null);
      await fetchData();
      setAlertMessage("Slot deleted successfully");
      setShowAlert(true);
    } catch (error: any) {
      setAlertMessage(error.message || "Failed to delete slot");
      setShowAlert(true);
    }
  };

  const openDeleteConfirm = (slot: Slot) => {
    setSelectedSlot(slot);
    setShowDeleteConfirm(true);
  };

  // Filter slots
  const filteredSlots = slots.filter((slot) => {
    if (selectedDoctorFilter !== "all" && slot.doctorId !== selectedDoctorFilter) {
      return false;
    }
    if (selectedDate && slot.date !== selectedDate) {
      return false;
    }
    return true;
  });

  // Group slots by date
  const slotsByDate = filteredSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, Slot[]>);

  const sortedDates = Object.keys(slotsByDate).sort();

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    return doctor ? doctor.name : "Unknown Doctor";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
      case "BOOKED":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "BLOCKED":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    }
  };

  const isTimeSlotSelected = (startTime: string, endTime: string) => {
    return bulkForm.timeSlots.some(
      (slot) => slot.startTime === startTime && slot.endTime === endTime
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading slots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Doctor Availability & Slots
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Set up appointment schedules for your doctors
          </p>
        </div>
        <button
          onClick={() => setShowBulkModal(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-lg"
        >
          <CalendarDays className="h-5 w-5" />
          Create Schedule
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Slots</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {slots.length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Available</div>
          <div className="text-3xl font-bold text-green-600">
            {slots.filter((s) => s.status === "AVAILABLE").length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Booked</div>
          <div className="text-3xl font-bold text-blue-600">
            {slots.filter((s) => s.status === "BOOKED").length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Doctor
            </label>
            <select
              value={selectedDoctorFilter}
              onChange={(e) => setSelectedDoctorFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
            >
              <option value="all">All Doctors</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
            />
          </div>
        </div>
      </div>

      {/* Slots List */}
      {sortedDates.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No slots scheduled yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Create a schedule to manage doctor availability and let patients book appointments
          </p>
          <button
            onClick={() => setShowBulkModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors font-medium"
          >
            <CalendarDays className="h-5 w-5" />
            Create Your First Schedule
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => {
            const dateSlots = slotsByDate[date];
            const dateObj = new Date(date + "T00:00:00");
            const formattedDate = dateObj.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            return (
              <div
                key={date}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
              >
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-teal-600" />
                    {formattedDate}
                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-auto">
                      {dateSlots.length} slots
                    </span>
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {dateSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`border-2 rounded-xl p-4 transition-all ${getStatusColor(
                          slot.status
                        )} ${
                          slot.status === "AVAILABLE"
                            ? "hover:shadow-lg cursor-pointer"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Stethoscope className="h-4 w-4 flex-shrink-0 opacity-60" />
                            <span className="font-medium text-sm truncate">
                              {getDoctorName(slot.doctorId)}
                            </span>
                          </div>
                          {slot.status === "AVAILABLE" && (
                            <button
                              onClick={() => openDeleteConfirm(slot)}
                              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors flex-shrink-0"
                              title="Delete slot"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="h-4 w-4 opacity-60" />
                          <span className="text-sm font-mono font-semibold">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wide">
                            {slot.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bulk Create Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => {
          setShowBulkModal(false);
          setBulkForm({
            doctorId: "",
            startDate: "",
            endDate: "",
            daysOfWeek: ["1", "2", "3", "4", "5"],
            timeSlots: [],
          });
          setFormError("");
        }}
        title="Create Availability Schedule"
        size="lg"
      >
        <form onSubmit={handleBulkCreate} className="space-y-6">
          {formError && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 dark:text-red-300 text-sm font-medium">{formError}</p>
            </div>
          )}

          {/* Step 1: Select Doctor */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              1. Select Doctor
            </label>
            <select
              value={bulkForm.doctorId}
              onChange={(e) => setBulkForm({ ...bulkForm, doctorId: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition font-medium"
              required
            >
              <option value="">Choose a doctor...</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.category}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Date Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              2. Select Date Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={bulkForm.startDate}
                  onChange={(e) => setBulkForm({ ...bulkForm, startDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={bulkForm.endDate}
                  onChange={(e) => setBulkForm({ ...bulkForm, endDate: e.target.value })}
                  min={bulkForm.startDate || new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition font-medium"
                  required
                />
              </div>
            </div>
          </div>

          {/* Step 3: Days of Week */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              3. Select Days of Week
            </label>
            <div className="flex flex-wrap gap-2.5">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDayOfWeek(day.value)}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                    bulkForm.daysOfWeek.includes(day.value)
                      ? "bg-teal-600 text-white shadow-md ring-2 ring-teal-400"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
            {bulkForm.daysOfWeek.length > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 font-medium">
                ✓ {bulkForm.daysOfWeek.length} day(s) selected
              </p>
            )}
          </div>

          {/* Step 4: Time Slots */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              4. Select Time Slots
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {COMMON_TIME_SLOTS.map((slot) => (
                <button
                  key={`${slot.start}-${slot.end}`}
                  type="button"
                  onClick={() => toggleTimeSlot(slot.start, slot.end)}
                  className={`px-4 py-3.5 rounded-xl font-semibold text-sm transition-all ${
                    isTimeSlotSelected(slot.start, slot.end)
                      ? "bg-teal-600 text-white shadow-md ring-2 ring-teal-400"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
            {bulkForm.timeSlots.length > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 font-medium">
                ✓ {bulkForm.timeSlots.length} time slot(s) selected
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => {
                setShowBulkModal(false);
                setBulkForm({
                  doctorId: "",
                  startDate: "",
                  endDate: "",
                  daysOfWeek: ["1", "2", "3", "4", "5"],
                  timeSlots: [],
                });
                setFormError("");
              }}
              className="flex-1 px-6 py-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 px-6 py-3.5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-colors shadow-lg disabled:cursor-not-allowed"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </span>
              ) : (
                "Create Schedule"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedSlot(null);
        }}
        onConfirm={handleDeleteSlot}
        title="Delete Slot"
        message="Are you sure you want to delete this slot? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
      />

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertMessage.includes("success") || alertMessage.includes("Successfully") ? "Success" : "Error"}
        message={alertMessage}
      />
    </div>
  );
}
