"use client";

import React, { useState, useEffect } from "react";
import { Stethoscope, Plus, Search, Star, Edit2, Trash2, Eye } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { DoctorForm } from "@/components/forms/DoctorForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AlertDialog } from "@/components/ui/AlertDialog";
import { useRouter } from "next/navigation";
import { useBranding } from "@/lib/branding";

interface Doctor {
  id: string;
  name: string;
  role: string;
  category: string;
  price: number;
  rating: number;
  reviewsCount: number;
  licenseNumber: string;
  active: boolean;
  centerId: string;
}

export default function CenterDoctorsPage() {
  const router = useRouter();
  const { formatCurrency } = useBranding();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, []);

  async function fetchDoctors() {
    try {
      setLoading(true);
      const response = await fetch('/api/doctors');
      if (response.ok) {
        const data = await response.json();
        // Filter to show only doctors from this center
        setDoctors(data.doctors || []);
      }
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddDoctor = async (data: any) => {
    const response = await fetch('/api/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add doctor');
    }

    setShowAddModal(false);
    await fetchDoctors();
    setAlertMessage('Doctor added successfully');
    setShowAlert(true);
  };

  const handleEditDoctor = async (data: any) => {
    if (!selectedDoctor) return;

    const response = await fetch('/api/doctors', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedDoctor.id, ...data }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update doctor');
    }

    setShowEditModal(false);
    setSelectedDoctor(null);
    await fetchDoctors();
    setAlertMessage('Doctor updated successfully');
    setShowAlert(true);
  };

  const handleDeleteDoctor = async () => {
    if (!selectedDoctor) return;

    try {
      const response = await fetch('/api/doctors', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedDoctor.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete doctor');
      }

      setShowDeleteConfirm(false);
      setSelectedDoctor(null);
      await fetchDoctors();
      setAlertMessage('Doctor deleted successfully');
      setShowAlert(true);
    } catch (error: any) {
      setAlertMessage(error.message || 'Failed to delete doctor');
      setShowAlert(true);
    }
  };

  const openEditModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowEditModal(true);
  };

  const openDeleteConfirm = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowDeleteConfirm(true);
  };

  const viewDoctorProfile = (doctorId: string) => {
    router.push(`/center/doctors/${doctorId}`);
  };

  const filteredDoctors = doctors.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.role.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Doctors</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your medical team
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Doctor
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search doctors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{doctor.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    doctor.active 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {doctor.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {doctor.role} • {doctor.category}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span>{doctor.rating.toFixed(1)}</span>
                    <span>({doctor.reviewsCount} reviews)</span>
                  </div>
                  <span className="font-mono">License: {doctor.licenseNumber}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right mr-3">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(doctor.price)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">per session</div>
                </div>
                <button
                  onClick={() => viewDoctorProfile(doctor.id)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="View public profile"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => openEditModal(doctor)}
                  className="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors"
                  title="Edit doctor"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => openDeleteConfirm(doctor)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="Delete doctor"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredDoctors.length === 0 && (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No doctors found. Click "Add Doctor" to get started.
          </div>
        )}
      </div>

      {/* Add Doctor Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Doctor"
      >
        <DoctorForm
          onSubmit={handleAddDoctor}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Doctor Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDoctor(null);
        }}
        title="Edit Doctor"
      >
        {selectedDoctor && (
          <DoctorForm
            initialData={selectedDoctor}
            onSubmit={handleEditDoctor}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedDoctor(null);
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedDoctor(null);
        }}
        onConfirm={handleDeleteDoctor}
        title="Delete Doctor"
        message={`Are you sure you want to delete Dr. ${selectedDoctor?.name}? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertMessage.includes('success') ? 'Success' : 'Error'}
        message={alertMessage}
      />
    </div>
  );
}
