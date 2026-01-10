'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Search,
  Edit,
  Shield,
  User,
  Mail,
  Phone,
  Calendar,
  Filter
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { LoadingSpinner, Alert, StatusBadge, SearchInput, Card, Modal, ActionButton } from '@/components/admin/AdminComponents';

export default function UsersManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  type User = {
    id: number;
    name: string;
    email: string;
    mobileNumber: string;
    role: string;
    permissions: string[];
    isEmailVerified: boolean;
    isMobileVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      loadUsers();
    }
  }, [status, session, router]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Note: You'll need to implement a getUsers endpoint in your backend
      // For now, this is a placeholder
      const mockUsers = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          mobileNumber: '+1234567890',
          role: 'HOST',
          permissions: ['CREATE_HOMESTAY', 'UPDATE_HOMESTAY'],
          isEmailVerified: true,
          isMobileVerified: false,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-20T14:45:00Z',
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          mobileNumber: '+1234567891',
          role: 'GUEST',
          permissions: ['VIEW_OWN_PROFILE'],
          isEmailVerified: true,
          isMobileVerified: true,
          createdAt: '2024-01-10T08:15:00Z',
          updatedAt: '2024-01-18T16:20:00Z',
        },
        {
          id: 3,
          name: 'Admin User',
          email: 'admin@example.com',
          mobileNumber: '+1234567892',
          role: 'ADMIN',
          permissions: ['VIEW_OWN_PROFILE', 'MANAGE_USERS', 'MANAGE_HOMESTAYS'],
          isEmailVerified: true,
          isMobileVerified: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-25T12:00:00Z',
        },
      ];
      setUsers(mockUsers);
    } catch (error) {
      setError('Failed to load users');
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter((user: any) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobileNumber?.includes(searchTerm)
      );
    }

    if (roleFilter) {
      filtered = filtered.filter((user: any) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (updatedUserData: any) => {
    if (!editingUser) return;

    try {
      setUpdateLoading(true);
      // Replace with the correct API method for updating a user
      // await adminApi.updateUser(editingUser.id, updatedUserData);
      
      // Update local state
      setUsers(prev => prev.map((user: any) => 
        user.id === editingUser.id 
          ? { ...user, ...updatedUserData }
          : user
      ));
      
      setShowEditModal(false);
      setEditingUser(null);
    } catch (error) {
      setError('Failed to update user');
      console.error('Error updating user:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'HOST':
        return 'bg-blue-100 text-blue-800';
      case 'GUEST':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/admin')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <Shield className="h-6 w-6 text-[#1A403D]" />
              <h1 className="ml-3 text-xl font-bold text-gray-900">
                User Management
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} onClose={() => setError(null)} />
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search by name, email, or phone..."
              />
            </div>
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1A403D]/20"
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="HOST">Host</option>
                <option value="GUEST">Guest</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Users List */}
        <Card title={`Users (${filteredUsers.length})`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {user.email}
                        </div>
                        {user.mobileNumber && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {user.mobileNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeVariant(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            user.isEmailVerified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            Email {user.isEmailVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            user.isMobileVerified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            Mobile {user.isMobileVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-[#1A403D] hover:text-[#214B3F]"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <User className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || roleFilter ? 'Try adjusting your search filters.' : 'No users have been created yet.'}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
          onSave={handleUpdateUser}
          loading={updateLoading}
        />
      )}
    </div>
  );
}

// Edit User Modal Component
interface EditUserModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => void;
  loading: boolean;
}

function EditUserModal({ user, isOpen, onClose, onSave, loading }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    role: user.role,
    permissions: user.permissions || [],
  });

  const availablePermissions = [
    'VIEW_OWN_PROFILE',
    'CREATE_HOMESTAY',
    'UPDATE_HOMESTAY',
    'DELETE_HOMESTAY',
    'VIEW_HOMESTAY',
    'CREATE_ROOM',
    'UPDATE_ROOM',
    'DELETE_ROOM',
    'APPROVE_HOMESTAY',
    'MANAGE_USERS',
    'MANAGE_MASTER_DATA',
  ];

  const handleSave = () => {
    onSave(formData);
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p: string) => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit User: ${user.name}`}
      size="lg"
      footer={
        <>
          <ActionButton onClick={onClose} variant="secondary" disabled={loading}>
            Cancel
          </ActionButton>
          <ActionButton onClick={handleSave} variant="primary" loading={loading}>
            Save Changes
          </ActionButton>
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1A403D]/20"
          >
            <option value="GUEST">Guest</option>
            <option value="HOST">Host</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Permissions
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {availablePermissions.map(permission => (
              <label key={permission} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.permissions.includes(permission)}
                  onChange={() => togglePermission(permission)}
                  className="rounded border-gray-300 text-[#1A403D] shadow-sm focus:border-[#1A403D] focus:ring focus:ring-[#1A403D]/20 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {permission.replace(/_/g, ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}