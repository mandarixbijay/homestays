import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  Wifi,
  Bed,
  DollarSign,
  Square
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin';


const MasterDataManagement = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('facilities');
  const [loading, setLoading] = useState(true);
  
  // Data states
  type Facility = { id: number; name: string };
  type BedType = { id: number; name: string; size?: number; sizeUnit?: string };
  type Currency = { id: number; code: string; name: string; isDefault: boolean };
  type AreaUnit = { id: number; name: string; isDefault: boolean };

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [bedTypes, setBedTypes] = useState<BedType[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [areaUnits, setAreaUnits] = useState<AreaUnit[]>([]);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'edit'
  const [editingItem, setEditingItem] = useState<Facility | BedType | Currency | AreaUnit | null>(null);
  const [formData, setFormData] = useState<Partial<Facility & BedType & Currency & AreaUnit>>({});

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      loadAllData();
    }
  }, [status, session, router]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [facilitiesData, bedTypesData, currenciesData, areaUnitsData] = await Promise.all([
        adminApi.getFacilities(),
        adminApi.getBedTypes(),
        adminApi.getCurrencies(),
        adminApi.getAreaUnits()
      ]);

      setFacilities(facilitiesData);
      setBedTypes(bedTypesData);
      setCurrencies(currenciesData);
      setAreaUnits(areaUnitsData);
    } catch (error) {
      console.error('Error loading master data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = (type: string) => {
    setModalType('create');
    setEditingItem(null);
    setFormData({});
    setShowModal(true);
  };

  const openEditModal = (type: string, item: any) => {
    setModalType('edit');
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (modalType === 'create') {
        switch (activeTab) {
          case 'facilities': {
            const { name } = formData as { name?: string };
            if (!name) {
              alert('Facility name is required.');
              return;
            }
            await adminApi.createFacility({ name });
            break;
          }
          case 'bedTypes': {
            const { name, size, sizeUnit } = formData as { name?: string; size?: number; sizeUnit?: string };
            if (!name) {
              alert('Bed type name is required.');
              return;
            }
            await adminApi.createBedType({ name, size, sizeUnit });
            break;
          }
          case 'currencies': {
            const { code, name, isDefault } = formData as { code?: string; name?: string; isDefault?: boolean };
            if (!code || !name) {
              alert('Currency code and name are required.');
              return;
            }
            await adminApi.createCurrency({ code, name, isDefault });
            break;
          }
          case 'areaUnits': {
            const { name, isDefault } = formData as { name?: string; isDefault?: boolean };
            if (!name) {
              alert('Area unit name is required.');
              return;
            }
            await adminApi.createAreaUnit({ name, isDefault });
            break;
          }
        }
      } else {
        if (!editingItem) {
          alert('No item selected for editing.');
          return;
        }
        switch (activeTab) {
          case 'facilities': {
            const { name } = formData as { name?: string };
            if (!name) {
              alert('Facility name is required.');
              return;
            }
            await adminApi.updateFacility(editingItem.id, { name });
            break;
          }
          case 'bedTypes': {
            const { name, size, sizeUnit } = formData as { name?: string; size?: number; sizeUnit?: string };
            if (!name) {
              alert('Bed type name is required.');
              return;
            }
            await adminApi.updateBedType(editingItem.id, { name, size, sizeUnit });
            break;
          }
          case 'currencies': {
            const { code, name, isDefault } = formData as { code?: string; name?: string; isDefault?: boolean };
            if (!code || !name) {
              alert('Currency code and name are required.');
              return;
            }
            await adminApi.updateCurrency(editingItem.id, { code, name, isDefault });
            break;
          }
          case 'areaUnits': {
            const { name, isDefault } = formData as { name?: string; isDefault?: boolean };
            if (!name) {
              alert('Area unit name is required.');
              return;
            }
            await adminApi.updateAreaUnit(editingItem.id, { name, isDefault });
            break;
          }
        }
      }

      setShowModal(false);
      loadAllData();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form');
    }
  };

  const handleDelete = async (type: string, id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      switch (type) {
        case 'facilities':
          await adminApi.deleteFacility(id);
          break;
        case 'bedTypes':
          await adminApi.deleteBedType(id);
          break;
        case 'currencies':
          await adminApi.deleteCurrency(id);
          break;
        case 'areaUnits':
          await adminApi.deleteAreaUnit(id);
          break;
      }
      
      loadAllData();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item');
    }
  };

  const renderFormFields = () => {
    switch (activeTab) {
      case 'facilities':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Facility Name *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Free Wi-Fi"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        );

      case 'bedTypes':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bed Type Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Queen Bed"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Size
                </label>
                <input
                  type="number"
                  value={formData.size || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  placeholder="60"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Size Unit
                </label>
                <input
                  type="text"
                  value={formData.sizeUnit || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, sizeUnit: e.target.value }))}
                  placeholder="inches"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </>
        );

      case 'currencies':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Currency Code *
                </label>
                <input
                  type="text"
                  value={formData.code || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="USD"
                  maxLength={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Currency Name *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="US Dollar"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isDefault || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Set as default currency</span>
              </label>
            </div>
          </>
        );

      case 'areaUnits':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Area Unit Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="sqft"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isDefault || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Set as default area unit</span>
              </label>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const renderTabContent = () => {
    let data, type, icon;
    
    switch (activeTab) {
      case 'facilities':
        data = facilities;
        type = 'facilities';
        icon = <Wifi className="h-4 w-4" />;
        break;
      case 'bedTypes':
        data = bedTypes;
        type = 'bedTypes';
        icon = <Bed className="h-4 w-4" />;
        break;
      case 'currencies':
        data = currencies;
        type = 'currencies';
        icon = <DollarSign className="h-4 w-4" />;
        break;
      case 'areaUnits':
        data = areaUnits;
        type = 'areaUnits';
        icon = <Square className="h-4 w-4" />;
        break;
      default:
        return null;
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center">
            {icon}
            <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h3>
          </div>
          <button
            onClick={() => openCreateModal(type)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add New
          </button>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.length > 0 ? (
            data.map((item: any) => (
              <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {activeTab === 'currencies' ? `${item.code} - ${item.name}` : item.name}
                  </h4>
                  {activeTab === 'bedTypes' && (item.size || item.sizeUnit) && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.size} {item.sizeUnit}
                    </p>
                  )}
                  {(activeTab === 'currencies' || activeTab === 'areaUnits') && item.isDefault && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(type, item)}
                    className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(type, item.id)}
                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              {icon}
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No {activeTab} found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by creating a new {activeTab.slice(0, -1)}.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => openCreateModal(type)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add {activeTab.slice(0, -1)}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  const tabs = [
    { id: 'facilities', name: 'Facilities', icon: Wifi },
    { id: 'bedTypes', name: 'Bed Types', icon: Bed },
    { id: 'currencies', name: 'Currencies', icon: DollarSign },
    { id: 'areaUnits', name: 'Area Units', icon: Square },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/admin')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <Settings className="h-6 w-6 text-blue-600" />
              <h1 className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                Master Data Management
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {modalType === 'create' ? 'Create' : 'Edit'} {activeTab.slice(0, -1)}
              </h3>
              <div className="space-y-4">
                {renderFormFields()}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {modalType === 'create' ? 'Create' : 'Update'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterDataManagement;