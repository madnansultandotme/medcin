/**
 * Admin Center Detail Page
 * 
 * Allows admins to manage center commission settings
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Building2, Mail, Phone, MapPin, DollarSign, Percent } from 'lucide-react';
import { authenticatedFetch } from '@/lib/utils/authenticated-fetch';

interface Center {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  status: string;
  commissionType: 'PERCENTAGE' | 'FIXED';
  commissionRate: number | null;
  fixedCommissionAmount: number | null;
}

export default function AdminCenterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const centerId = params.id as string;

  const [center, setCenter] = useState<Center | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [commissionType, setCommissionType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [commissionRate, setCommissionRate] = useState('15');
  const [fixedCommissionAmount, setFixedCommissionAmount] = useState('10');

  useEffect(() => {
    fetchCenter();
  }, [centerId]);

  async function fetchCenter() {
    try {
      const response = await authenticatedFetch(`/api/admin/centers/${centerId}`);
      if (response.ok) {
        const data = await response.json();
        setCenter(data.center);
        
        // Initialize form with existing values
        if (data.center.commissionType) {
          setCommissionType(data.center.commissionType);
        }
        if (data.center.commissionRate !== null) {
          setCommissionRate(data.center.commissionRate.toString());
        }
        if (data.center.fixedCommissionAmount !== null) {
          setFixedCommissionAmount(data.center.fixedCommissionAmount.toString());
        }
      } else {
        setError('Failed to load center details');
      }
    } catch (err) {
      setError('An error occurred while loading center details');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const payload: any = {
        centerId,
        commissionType,
      };

      if (commissionType === 'PERCENTAGE') {
        payload.commissionRate = parseFloat(commissionRate);
      } else {
        payload.fixedCommissionAmount = parseFloat(fixedCommissionAmount);
      }

      const response = await authenticatedFetch('/api/admin/centers/commission', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update commission settings');
        setSaving(false);
        return;
      }

      setSuccess('Commission settings updated successfully');
      await fetchCenter(); // Refresh center data
    } catch (err) {
      setError('An error occurred while updating commission settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-gray-600">Loading center details...</div>
        </div>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Center not found</h3>
          <button
            onClick={() => router.push('/admin/centers')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Centers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.push('/admin/centers')}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
        >
          ← Back to Centers
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{center.name}</h1>
        <p className="mt-2 text-gray-600">Manage center details and commission settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Center Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Center Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Name</p>
                  <p className="text-gray-900">{center.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-gray-900">{center.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone</p>
                  <p className="text-gray-900">{center.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Address</p>
                  <p className="text-gray-900">{center.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 text-gray-400 mt-0.5">📋</div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Category</p>
                  <p className="text-gray-900">{center.category}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 text-gray-400 mt-0.5">📊</div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    center.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    center.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {center.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Commission Settings */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Commission Settings</h2>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Commission Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="commissionType"
                      value="PERCENTAGE"
                      checked={commissionType === 'PERCENTAGE'}
                      onChange={(e) => setCommissionType('PERCENTAGE')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <Percent className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">Percentage</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="commissionType"
                      value="FIXED"
                      checked={commissionType === 'FIXED'}
                      onChange={(e) => setCommissionType('FIXED')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">Fixed Amount</span>
                  </label>
                </div>
              </div>

              {/* Percentage Rate */}
              {commissionType === 'PERCENTAGE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-full mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Platform will take {commissionRate}% from each booking
                  </p>
                </div>
              )}

              {/* Fixed Amount */}
              {commissionType === 'FIXED' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fixed Commission (SGD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={fixedCommissionAmount}
                    onChange={(e) => setFixedCommissionAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Platform will take SGD {fixedCommissionAmount} from each booking
                  </p>
                </div>
              )}

              {/* Current Settings Display */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Current Settings</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-900">
                    {center.commissionType === 'PERCENTAGE' 
                      ? `${center.commissionRate || 0}% per booking`
                      : `SGD ${center.fixedCommissionAmount || 0} per booking`
                    }
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Update Commission Settings'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
