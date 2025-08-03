'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { useHomestayDetail } from '@/hooks/useAdminApi';
import { LoadingSpinner, Alert, ActionButton } from '../../../../../components/admin/AdminComponents';

interface HomestayEditPageProps {
  params: {
    id: string;
  };
}

interface Homestay {
  name: string;
  address: string;
  contactNumber: string;
  description: string;
  images?: any[];
  facilities?: { facilityId: number }[];
  status: string;
  discount?: number;
  vipAccess?: boolean;
  // Add other properties as needed
}

export default function HomestayEditPage({ params }: HomestayEditPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const homestayId = parseInt(params.id);
  
  const { homestay, loading, error, loadHomestay, updateHomestay } = useHomestayDetail(homestayId) as {
    homestay: Homestay | null;
    loading: boolean;
    error: string | null;
    loadHomestay: () => void;
    updateHomestay: (data: FormData) => Promise<void>;
  };
  const [formData, setFormData] = useState<any>({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      loadHomestay();
    }
  }, [status, session, router, loadHomestay]);

  useEffect(() => {
    if (homestay) {
      setFormData({
        basicInfo: {
          propertyName: homestay.name,
          propertyAddress: homestay.address,
          contactNumber: homestay.contactNumber,
        },
        descriptionAndImages: {
          description: homestay.description,
          imageMetadata: homestay.images || [],
        },
        facilities: {
          facilityIds: homestay.facilities?.map((f: any) => f.facilityId) || [],
          customFacilities: [],
        },
        status: homestay.status,
        discount: homestay.discount,
        vipAccess: homestay.vipAccess,
      });
    }
  }, [homestay]);

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      setSaveError(null);

      const formDataToSend = new FormData();
      formDataToSend.append('basicInfo', JSON.stringify(formData.basicInfo));
      formDataToSend.append('descriptionAndImages', JSON.stringify(formData.descriptionAndImages));
      formDataToSend.append('facilities', JSON.stringify(formData.facilities));
      formDataToSend.append('status', formData.status);
      formDataToSend.append('discount', formData.discount?.toString() || '0');
      formDataToSend.append('vipAccess', formData.vipAccess?.toString() || 'false');

      await updateHomestay(formDataToSend);
      router.push(`/admin/homestays/${homestayId}`);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save homestay');
    } finally {
      setSaveLoading(false);
    }
  };

  const updateFormField = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert type="error" message={error} />
      </div>
    );
  }

  if (!homestay) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert type="error" message="Homestay not found" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push(`/admin/homestays/${homestayId}`)}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Edit Homestay
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {homestay.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ActionButton
                onClick={() => router.push(`/admin/homestays/${homestayId}`)}
                variant="secondary"
                icon={<X className="h-4 w-4" />}
              >
                Cancel
              </ActionButton>
              <ActionButton
                onClick={handleSave}
                variant="primary"
                loading={saveLoading}
                icon={<Save className="h-4 w-4" />}
              >
                Save Changes
              </ActionButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {saveError && (
          <div className="mb-6">
            <Alert type="error" message={saveError} onClose={() => setSaveError(null)} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Property Name
                </label>
                <input
                  type="text"
                  value={formData.basicInfo?.propertyName || ''}
                  onChange={(e) => updateFormField('basicInfo', 'propertyName', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.basicInfo?.propertyAddress || ''}
                  onChange={(e) => updateFormField('basicInfo', 'propertyAddress', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={formData.basicInfo?.contactNumber || ''}
                  onChange={(e) => updateFormField('basicInfo', 'contactNumber', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Settings</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount || 0}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, discount: parseInt(e.target.value) || 0 }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.vipAccess || false}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, vipAccess: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">VIP Access</span>
                </label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Description</h2>
            </div>
            <div className="p-6">
              <textarea
                value={formData.descriptionAndImages?.description || ''}
                onChange={(e) => updateFormField('descriptionAndImages', 'description', e.target.value)}
                rows={6}
                placeholder="Describe your homestay..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}