"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Stethoscope,
  Star,
  Edit2,
  Trash2,
  Clock,
  Briefcase,
  Plus,
  Calendar,
  Shield,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { DoctorForm } from "@/components/forms/DoctorForm";
import ServiceForm from "@/components/forms/ServiceForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AlertDialog } from "@/components/ui/AlertDialog";
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
  bio?: string;
  imageUrl?: string;
  centerId: string;
}

interface Service {
  id: string;
  doctorId: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
}

export default function CenterDoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { formatCurrency } = useBranding();
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Dialog states
  const [showDeleteDoctorConfirm, setShowDeleteDoctorConfirm] = useState(false);
  const [showDeleteServiceConfirm, setShowDeleteServiceConfirm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    fetchDoctorData();
  }, [doctorId]);

  async function fetchDoctorData() {
    try {
      setLoading(true);
      
      // Fetch doctor details
      const doctorsRes = await fetch("/api/doctors");
      if (doctorsRes.ok) {
        const data = await doctorsRes.json();
        const foundDoctor = data.doctors?.find((d: Doctor) => d.id === doctorId);
        
        if (foundDoctor) {
          setDoctor(foundDoctor);
          
          // Fetch services for this doctor
          const servicesRes = await fetch(`/api/services?doctorId=${doctorId}`);
          if (servicesRes.ok) {
            const servicesData = await servicesRes.json();
            setServices(servicesData.services || []);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch doctor data:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleEditDoctor = async (data: any) => {
    try {
      const response = await fetch("/api/doctors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: doctorId, ...data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update doctor");
      }

      setShowEditModal(false);
      await fetchDoctorData();
      setAlertMessage("Doctor updated successfully");
      setShowAlert(true);
    } catch (error: any) {
      setAlertMessage(error.message || "Failed to update doctor");
      setShowAlert(true);
    }
  };

  const handleDeleteDoctor = async () => {
    try {
      const response = await fetch("/api/doctors", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: doctorId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete doctor");
      }

      setShowDeleteDoctorConfirm(false);
      setAlertMessage("Doctor deleted successfully");
      setShowAlert(true);
      
      // Redirect back to doctors list after a brief delay
      setTimeout(() => {
        router.push("/center/doctors");
      }, 1500);
    } catch (error: any) {
      setAlertMessage(error.message || "Failed to delete doctor");
      setShowAlert(true);
    }
  };

  const handleAddService = async (data: any) => {
    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, doctorId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add service");
      }

      setShowAddServiceModal(false);
      await fetchDoctorData();
      setAlertMessage("Service added successfully");
      setShowAlert(true);
    } catch (error: any) {
      setAlertMessage(error.message || "Failed to add service");
      setShowAlert(true);
    }
  };

  const handleEditService = async (data: any) => {
    if (!selectedService) return;

    try {
      const response = await fetch("/api/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedService.id, ...data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update service");
      }

      setShowEditServiceModal(false);
      setSelectedService(null);
      await fetchDoctorData();
      setAlertMessage("Service updated successfully");
      setShowAlert(true);
    } catch (error: any) {
      setAlertMessage(error.message || "Failed to update service");
      setShowAlert(true);
    }
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;

    try {
      const response = await fetch("/api/services", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedService.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete service");
      }

      setShowDeleteServiceConfirm(false);
      setSelectedService(null);
      await fetchDoctorData();
      setAlertMessage("Service deleted successfully");
      setShowAlert(true);
    } catch (error: any) {
      setAlertMessage(error.message || "Failed to delete service");
      setShowAlert(true);
    }
  };

  const openEditService = (service: Service) => {
    setSelectedService(service);
    setShowEditServiceModal(true);
  };

  const openDeleteService = (service: Service) => {
    setSelectedService(service);
    setShowDeleteServiceConfirm(true);
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading doctor details...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Doctor not found
        </h2>
        <button
          onClick={() => router.push("/center/doctors")}
          className="text-teal-600 hover:underline"
        >
          Back to Doctors
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/center/doctors")}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Doctors
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition"
          >
            <Edit2 className="h-4 w-4" />
            Edit Doctor
          </button>
          <button
            onClick={() => setShowDeleteDoctorConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Doctor Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center overflow-hidden flex-shrink-0">
              {doctor.imageUrl ? (
                <img
                  src={doctor.imageUrl}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Stethoscope className="h-12 w-12 text-teal-600 dark:text-teal-400" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {doctor.name}
                  </h1>
                  <p className="text-lg text-teal-600 font-semibold mb-3">
                    {doctor.role}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-lg font-medium">
                      {doctor.category}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-lg font-medium ${
                        doctor.active
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      }`}
                    >
                      {doctor.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Consultation Fee
                  </div>
                  <div className="text-3xl font-bold text-teal-600">
                    {formatCurrency(doctor.price)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-1.5">
                  <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-gray-900 dark:text-white">
                    {doctor.rating.toFixed(1)}
                  </span>
                  <span>({doctor.reviewsCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="h-5 w-5" />
                  <span className="font-mono">License: {doctor.licenseNumber}</span>
                </div>
              </div>

              {doctor.bio && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    About
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {doctor.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            Services ({services.length})
          </h2>
          <button
            onClick={() => setShowAddServiceModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            <Plus className="h-4 w-4" />
            Add Service
          </button>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No services added yet</p>
            <button
              onClick={() => setShowAddServiceModal(true)}
              className="text-purple-600 hover:underline mt-2"
            >
              Add your first service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-purple-500 transition-all bg-gray-50 dark:bg-gray-900/50 group relative"
              >
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditService(service)}
                    className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                    title="Edit service"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openDeleteService(service)}
                    className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Delete service"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 pr-16">
                      {service.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatDuration(service.duration)}</span>
                    </div>
                  </div>
                </div>

                {service.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {service.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    per session
                  </span>
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(service.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Doctor Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Doctor"
      >
        <DoctorForm
          initialData={doctor}
          onSubmit={handleEditDoctor}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>

      {/* Add Service Modal */}
      <Modal
        isOpen={showAddServiceModal}
        onClose={() => setShowAddServiceModal(false)}
        title="Add Service"
      >
        <ServiceForm
          onSubmit={handleAddService}
          onCancel={() => setShowAddServiceModal(false)}
        />
      </Modal>

      {/* Edit Service Modal */}
      <Modal
        isOpen={showEditServiceModal}
        onClose={() => {
          setShowEditServiceModal(false);
          setSelectedService(null);
        }}
        title="Edit Service"
      >
        {selectedService && (
          <ServiceForm
            initialData={selectedService}
            onSubmit={handleEditService}
            onCancel={() => {
              setShowEditServiceModal(false);
              setSelectedService(null);
            }}
          />
        )}
      </Modal>

      {/* Delete Doctor Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDoctorConfirm}
        onClose={() => setShowDeleteDoctorConfirm(false)}
        onConfirm={handleDeleteDoctor}
        title="Delete Doctor"
        message={`Are you sure you want to delete Dr. ${doctor.name}? This will also delete all associated services. This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />

      {/* Delete Service Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteServiceConfirm}
        onClose={() => {
          setShowDeleteServiceConfirm(false);
          setSelectedService(null);
        }}
        onConfirm={handleDeleteService}
        title="Delete Service"
        message={`Are you sure you want to delete "${selectedService?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertMessage.includes("success") ? "Success" : "Error"}
        message={alertMessage}
      />
    </div>
  );
}
