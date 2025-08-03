import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  MapPin,
  User,
  Calendar,
  Star
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin';

const HomestayManagement = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [homestays, setHomestays] = useState<Homestay[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    ownerId: '',
    address: ''
  });
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  type Homestay = {
    id: number;
    name: string;
    // Add other properties as needed
    [key: string]: any;
  };
  const [selectedHomestay, setSelectedHomestay] = useState<Homestay | null>(null);
  const [approvalData, setApprovalData] = useState({
    status: '',
    rejectionReason: ''
  });

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      loadHomestays();
    }
  }, [status, session, router, currentPage, filters]);

  const loadHomestays = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(filters.search && { name: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.ownerId && { ownerId: parseInt(filters.ownerId) }),
        ...(filters.address && { address: filters.address })
      };

      const data = await adminApi.getHomestays(params);
      setHomestays(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error loading homestays:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this homestay?')) return;

    try {
      await adminApi.deleteHomestay(id);
      loadHomestays();
    } catch (error) {
      console.error('Error deleting homestay:', error);
      alert('Failed to delete homestay');
    }
  };

  const handleApproval = (homestay: any, newStatus: string) => {
    setSelectedHomestay(homestay);
    setApprovalData({
      status: newStatus,
      rejectionReason: ''
    });
    setShowApprovalModal(true);
  };

  const submitApproval = async () => {
    if (!selectedHomestay) return;

    try {
      await adminApi.approveHomestay(selectedHomestay.id, approvalData);
      setShowApprovalModal(false);
      setSelectedHomestay(null);
      setApprovalData({ status: '', rejectionReason: '' });
      loadHomestays();
    } catch (error) {
      console.error('Error updating homestay status:', error);
      alert('Failed to update homestay status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
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
              <Home className="h-6 w-6 text-blue-600" />
              <h1 className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                Homestay Management
              </h1>
            </div>
            <button
              onClick={() => router.push('/admin/homestays/create')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Homestay
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search by name
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search homestays..."
                    className="pl-10 w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Owner ID
                </label>
                <input
                  type="number"
                  value={filters.ownerId}
                  onChange={(e) => handleFilterChange('ownerId', e.target.value)}
                  placeholder="Owner ID"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={filters.address}
                  onChange={(e) => handleFilterChange('address', e.target.value)}
                  placeholder="Address"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Homestays List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            {homestays.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {homestays.map((homestay: any) => (
                  <div key={homestay.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          {/* Homestay Image */}
                          <div className="flex-shrink-0">
                            {homestay.images?.find((img: any) => img.isMain) ? (
                              <img
                                src={homestay.images.find((img: any) => img.isMain).url}
                                alt={homestay.name}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                <Home className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Homestay Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {homestay.name}
                            </h3>
                            <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                              <span className="truncate">{homestay.address}</span>
                            </div>
                            <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <User className="flex-shrink-0 mr-1.5 h-4 w-4" />
                              <span>Owner: {homestay.owner?.name} (ID: {homestay.owner?.id})</span>
                            </div>
                            <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <Home className="flex-shrink-0 mr-1.5 h-4 w-4" />
                              <span>{homestay.rooms?.length || 0} rooms</span>
                              {homestay.rating && (
                                <>
                                  <Star className="flex-shrink-0 ml-4 mr-1.5 h-4 w-4 text-yellow-400" />
                                  <span>{homestay.rating} ({homestay.reviews} reviews)</span>
                                </>
                              )}
                            </div>
                            <div className="mt-2 flex items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(homestay.status)}`}>
                                {homestay.status}
                              </span>
                              {homestay.discount > 0 && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {homestay.discount}% OFF
                                </span>
                              )}
                              {homestay.vipAccess && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                  VIP
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {homestay.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproval(homestay, 'APPROVED')}
                              className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleApproval(homestay, 'REJECTED')}
                              className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => router.push(`/admin/homestays/${homestay.id}`)}
                          className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/homestays/${homestay.id}/edit`)}
                          className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(homestay.id)}
                          className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Home className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No homestays</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by creating a new homestay.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => router.push('/admin/homestays/create')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Homestay
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {approvalData.status === 'APPROVED' ? 'Approve' : 'Reject'} Homestay
              </h3>
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to {approvalData.status.toLowerCase()} &quot;{selectedHomestay?.name}&quot;?
                </p>

                {approvalData.status === 'REJECTED' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rejection Reason *
                    </label>
                    <textarea
                      value={approvalData.rejectionReason}
                      onChange={(e) => setApprovalData(prev => ({ ...prev, rejectionReason: e.target.value }))}
                      placeholder="Please provide a reason for rejection..."
                      rows={3}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowApprovalModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitApproval}
                    disabled={approvalData.status === 'REJECTED' && !approvalData.rejectionReason.trim()}
                    className={`px-4 py-2 text-white text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 ${approvalData.status === 'APPROVED'
                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-300'
                        : 'bg-red-600 hover:bg-red-700 focus:ring-red-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {approvalData.status === 'APPROVED' ? 'Approve' : 'Reject'}
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

export default HomestayManagement;