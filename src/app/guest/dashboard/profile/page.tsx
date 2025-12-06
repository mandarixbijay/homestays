"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ChevronLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit,
  Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getMemberSince = () => {
    if (session?.user?.createdAt) {
      return formatDate(session.user.createdAt);
    }
    return "Recently joined";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/guest/dashboard"
            className="text-sm text-[#214B3F] hover:underline flex items-center gap-1 mb-4"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600 mt-1">
                Manage your account information and preferences
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {session?.user?.name?.[0]?.toUpperCase() || "G"}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {session?.user?.name || "Guest User"}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {session?.user?.email}
                </p>
                <div className="mt-4 inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                  <Shield className="h-3 w-3" />
                  Verified Account
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Member since {getMemberSince()}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Account Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Role</span>
                  <span className="font-medium text-gray-900">
                    {session?.user?.role || "GUEST"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Account Type</span>
                  <span className="font-medium text-gray-900">Standard</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Basic Information
                  </h3>
                  <button className="text-sm text-[#214B3F] hover:underline flex items-center gap-1">
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </label>
                    <p className="text-gray-900">
                      {session?.user?.name || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </label>
                    <p className="text-gray-900">
                      {session?.user?.email || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </label>
                    <p className="text-gray-900">
                      {session?.user?.mobileNumber || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                      <Calendar className="h-4 w-4" />
                      Date of Birth
                    </label>
                    <p className="text-gray-900">Not provided</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Contact Information
                  </h3>
                  <button className="text-sm text-[#214B3F] hover:underline flex items-center gap-1">
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                      <Phone className="h-4 w-4" />
                      Primary Phone
                    </label>
                    <p className="text-gray-900">
                      {session?.user?.mobileNumber || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                      <Phone className="h-4 w-4" />
                      Alternative Phone
                    </label>
                    <p className="text-gray-900">Not provided</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </label>
                    <p className="text-gray-900">Not provided</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                      <User className="h-4 w-4" />
                      Emergency Contact
                    </label>
                    <p className="text-gray-900">Not provided</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Account Security
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Password</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Last changed 3 months ago
                      </p>
                    </div>
                    <button className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors">
                      Change Password
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        Two-Factor Authentication
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Add an extra layer of security
                      </p>
                    </div>
                    <button className="px-4 py-2 text-sm bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors">
                      Enable
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Preferences
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Email Notifications
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Receive booking confirmations and updates
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-700"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Marketing Emails
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Receive special offers and promotions
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-700"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">SMS Notifications</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Get booking reminders via SMS
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-700"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-lg shadow-sm border border-red-200">
              <div className="p-6 border-b border-red-200">
                <h3 className="text-lg font-semibold text-red-900">
                  Danger Zone
                </h3>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Delete Account</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <button className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
