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
  Save,
  X,
  Lock,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { userApi, UserProfile, UpdateUserProfileDto, ChangePasswordDto } from "@/lib/api/user-api";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    dateOfBirth: "",
    address: "",
    emergencyContact: "",
    alternativePhone: "",
  });

  const [passwordData, setPasswordData] = useState<ChangePasswordDto>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await userApi.getProfile();
      setProfile(data);
      setFormData({
        name: data.name || "",
        mobileNumber: data.mobileNumber || "",
        dateOfBirth: data.dateOfBirth || "",
        address: data.address || "",
        emergencyContact: data.emergencyContact || "",
        alternativePhone: data.alternativePhone || "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (section: string) => {
    try {
      setSaving(true);

      const updateData: UpdateUserProfileDto = {};

      if (section === "basic") {
        updateData.name = formData.name;
        updateData.dateOfBirth = formData.dateOfBirth;
      } else if (section === "contact") {
        updateData.mobileNumber = formData.mobileNumber;
        updateData.alternativePhone = formData.alternativePhone;
        updateData.address = formData.address;
        updateData.emergencyContact = formData.emergencyContact;
      }

      const updated = await userApi.updateProfile(updateData);
      setProfile(updated);
      setEditingSection(null);

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      // Update session if name changed
      if (updateData.name) {
        await update({ name: updateData.name });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await userApi.changePassword(passwordData);

      toast({
        title: "Success",
        description: "Password changed successfully",
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getMemberSince = () => {
    if (profile?.createdAt) {
      return formatDate(profile.createdAt);
    }
    return "Recently joined";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#214B3F] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/guest/dashboard"
            className="text-sm text-[#214B3F] hover:text-[#214B3F]/80 flex items-center gap-1 mb-4 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-muted-foreground mt-1">
                Manage your account information and preferences
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-[#214B3F] to-[#2d6b57] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {profile?.name?.[0]?.toUpperCase() || "G"}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {profile?.name || "Guest User"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {profile?.email}
                </p>
                {profile?.isEmailVerified && (
                  <div className="mt-4 inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
                    <Shield className="h-3 w-3" />
                    Verified Account
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-4">
                  Member since {getMemberSince()}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Account Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Role</span>
                  <span className="font-medium text-gray-900">
                    {profile?.role || "GUEST"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Email Status</span>
                  <span className={`font-medium ${profile?.isEmailVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {profile?.isEmailVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Mobile Status</span>
                  <span className={`font-medium ${profile?.isMobileVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {profile?.isMobileVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Basic Information
                  </h3>
                  {editingSection !== "basic" ? (
                    <button
                      onClick={() => setEditingSection("basic")}
                      className="text-sm text-[#214B3F] hover:text-[#214B3F]/80 font-medium flex items-center gap-1 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateProfile("basic")}
                        disabled={saving}
                        className="text-sm text-[#214B3F] hover:text-[#214B3F]/80 font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save
                      </button>
                      <button
                        onClick={() => setEditingSection(null)}
                        className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </label>
                    {editingSection === "basic" ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214B3F] focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {profile?.name || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </label>
                    <p className="text-gray-900 font-medium">
                      {profile?.email || "Not provided"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Email cannot be changed
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4" />
                      Date of Birth
                    </label>
                    {editingSection === "basic" ? (
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214B3F] focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {profile?.dateOfBirth ? formatDate(profile.dateOfBirth) : "Not provided"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Contact Information
                  </h3>
                  {editingSection !== "contact" ? (
                    <button
                      onClick={() => setEditingSection("contact")}
                      className="text-sm text-[#214B3F] hover:text-[#214B3F]/80 font-medium flex items-center gap-1 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateProfile("contact")}
                        disabled={saving}
                        className="text-sm text-[#214B3F] hover:text-[#214B3F]/80 font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save
                      </button>
                      <button
                        onClick={() => setEditingSection(null)}
                        className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <Phone className="h-4 w-4" />
                      Primary Phone
                    </label>
                    {editingSection === "contact" ? (
                      <input
                        type="tel"
                        value={formData.mobileNumber}
                        onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214B3F] focus:border-transparent"
                        placeholder="+977-9841234567"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {profile?.mobileNumber || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <Phone className="h-4 w-4" />
                      Alternative Phone
                    </label>
                    {editingSection === "contact" ? (
                      <input
                        type="tel"
                        value={formData.alternativePhone}
                        onChange={(e) => setFormData({ ...formData, alternativePhone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214B3F] focus:border-transparent"
                        placeholder="+977-9841234567"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {profile?.alternativePhone || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </label>
                    {editingSection === "contact" ? (
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214B3F] focus:border-transparent"
                        placeholder="Enter your full address"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {profile?.address || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <User className="h-4 w-4" />
                      Emergency Contact
                    </label>
                    {editingSection === "contact" ? (
                      <input
                        type="text"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214B3F] focus:border-transparent"
                        placeholder="Name and phone number"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {profile?.emergencyContact || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                <h3 className="text-lg font-semibold text-gray-900">
                  Account Security
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50/70 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900 flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Password
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Keep your account secure with a strong password
                      </p>
                    </div>
                    <button
                      onClick={() => setShowPasswordChange(!showPasswordChange)}
                      className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
                    >
                      {showPasswordChange ? 'Cancel' : 'Change Password'}
                    </button>
                  </div>

                  {showPasswordChange && (
                    <div className="p-4 bg-gray-50/70 rounded-lg border border-gray-200 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214B3F] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214B3F] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214B3F] focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={handleChangePassword}
                        disabled={saving}
                        className="w-full px-4 py-2 bg-[#214B3F] text-white rounded-lg hover:bg-[#214B3F]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                        Update Password
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
