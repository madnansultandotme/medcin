"use client";

import React, { useState, useEffect } from "react";
import { Briefcase, Plus, Search, Edit2, Trash2, Clock } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import ServiceForm from "@/components/forms/ServiceForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AlertDialog } from "@/components/ui/AlertDialog";
import { useBranding } from "@/lib/branding";

interface Service {
  id: string;
  doctorId: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
}

export default function CenterServicesPage() {
  const { formatCurrency } = useBranding();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      setLoading(true);
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddService = async (data: any) => {
    const response = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add service');
    }

    setShowAddModal(false);
    await fetchServices();
    setAlertMessage('Service added successfully');
    setShowAlert(true);
  };

  const handleEditService = async (data: any) => {
    if (!selectedService) return;

    const response = await fetch('/api/services', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedService.id, ...data }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update service');
    }

    setShowEditModal(false);
    setSelectedService(null);
    await fetchServices();
    setAlertMessage('Service updated successfully');
    setShowAlert(true);
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;

    try {
      const response = await fetch('/api/services', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedService.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete service');
      }

      setShowDeleteConfirm(false);
      setSelectedService(null);
      await fetchServices();
      setAlertMessage('Service deleted successfully');
      setShowAlert(true);
    } catch (error: any) {
      setAlertMessage(error.message || 'Failed to delete service');
      setShowAlert(true);
    }
  };

  const openEditModal = (service: Service) => {
    setSelectedService(service);
    setShowEditModal(true);
  };

  const openDeleteConfirm = (service: Service) => {
    setSelectedService(service);
    setShowDeleteConfirm(true);
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Services & Pricing</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your medical services and pricing
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Service
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => (
          <div key={service.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-500 transition-all group relative">
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => openEditModal(service)}
                className="p-1.5 text-gray-600 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors"
                title="Edit service"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => openDeleteConfirm(service)}
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
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 pr-16">{service.name}</h3>
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
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(service.price)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500">
                per session
              </span>
            </div>
          </div>
        ))}
        
        {filteredServices.length === 0 && (
          <div className="col-span-full p-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            No services found. Click "Add Service" to get started.
          </div>
        )}
      </div>

      {/* Add Service Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Service"
      >
        <ServiceForm
          onSubmit={handleAddService}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Service Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedService(null);
        }}
        title="Edit Service"
      >
        {selectedService && (
          <ServiceForm
            initialData={selectedService}
            onSubmit={handleEditService}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedService(null);
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
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
        title={alertMessage.includes('success') ? 'Success' : 'Error'}
        message={alertMessage}
      />
    </div>
  );
}
