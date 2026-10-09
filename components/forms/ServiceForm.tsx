"use client";

import { useState, useEffect } from "react";
import { useBranding } from "@/lib/hooks/useBranding";

const DURATION_OPTIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
  { value: 180, label: "3 hours" },
];

interface Doctor {
  id: string;
  name: string;
  category: string;
}

interface ServiceFormData {
  doctorId: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
}

interface ServiceFormProps {
  initialData?: ServiceFormData & { id?: string };
  onSubmit: (data: ServiceFormData) => Promise<void>;
  onCancel: () => void;
}

export default function ServiceForm({
  initialData,
  onSubmit,
  onCancel,
}: ServiceFormProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    doctorId: initialData?.doctorId || "",
    name: initialData?.name || "",
    duration: initialData?.duration || 30,
    price: initialData?.price || 0,
    description: initialData?.description || "",
  });

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [error, setError] = useState("");
  
  const { currency } = useBranding();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const response = await fetch("/api/doctors");
      if (!response.ok) throw new Error("Failed to fetch doctors");
      const data = await response.json();
      setDoctors(data.doctors || []);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setError("Failed to load doctors");
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.doctorId) {
      setError("Please select a doctor");
      return;
    }
    if (!formData.name.trim()) {
      setError("Service name is required");
      return;
    }
    if (formData.price <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || "Failed to save service");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "duration" ? Number(value) : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="service-form">
      {error && (
        <div className="error-message">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8C1.5 11.59 4.41 14.5 8 14.5C11.59 14.5 14.5 11.59 14.5 8C14.5 4.41 11.59 1.5 8 1.5ZM8 13C5.24 13 3 10.76 3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13Z"
              fill="currentColor"
            />
            <path
              d="M7.25 4.5H8.75V9H7.25V4.5ZM7.25 10H8.75V11.5H7.25V10Z"
              fill="currentColor"
            />
          </svg>
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="doctorId" className="required">
          Doctor
        </label>
        <select
          id="doctorId"
          name="doctorId"
          value={formData.doctorId}
          onChange={handleChange}
          disabled={loadingDoctors || loading}
          required
        >
          <option value="">
            {loadingDoctors ? "Loading doctors..." : "Select a doctor"}
          </option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name} - {doctor.category}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="name" className="required">
          Service Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Consultation, Checkup, Treatment"
          disabled={loading}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="duration" className="required">
            Duration
          </label>
          <select
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            disabled={loading}
            required
          >
            {DURATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="price" className="required">
            Price ({currency.symbol})
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="1"
            placeholder="0"
            disabled={loading}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Optional: Describe what this service includes"
          rows={4}
          disabled={loading}
        />
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving..." : initialData?.id ? "Update Service" : "Add Service"}
        </button>
      </div>

      <style jsx>{`
        .service-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: 0.5rem 0;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          font-size: 0.875rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 0.25rem;
        }

        label.required::after {
          content: " *";
          color: #dc2626;
        }

        input,
        select,
        textarea {
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9375rem;
          color: var(--ink);
          background: var(--paper);
          transition: all 0.2s;
        }

        input:focus,
        select:focus,
        textarea:focus {
          outline: none;
          border-color: #14b8a6;
          box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
        }

        input:disabled,
        select:disabled,
        textarea:disabled {
          background: #f9fafb;
          cursor: not-allowed;
          opacity: 0.6;
        }

        textarea {
          resize: vertical;
          min-height: 100px;
          font-family: inherit;
        }

        .form-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          margin-top: 1rem;
          padding-top: 1.5rem;
          border-top: 2px solid #e5e7eb;
        }

        .btn-primary,
        .btn-secondary {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-primary {
          background: #14b8a6;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0d9488;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: white;
          color: #374151;
          border: 2px solid #e5e7eb;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #f9fafb;
        }

        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </form>
  );
}
