"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Shield,
  Save,
  X,
  Lock,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  mobileNumber: string | null;
  role: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  createdAt?: string;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const { toast } = useToast();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
      return;
    }

    if (session?.user) {
      const userData: UserProfile = {
        id: session.user.id || "",
        name: session.user.name || null,
        email: session.user.email || null,
        mobileNumber: session.user.mobileNumber || null,
        role: session.user.role || "GUEST",
        isEmailVerified: session.user.isEmailVerified || false,
        isMobileVerified: session.user.isMobileVerified || false,
      };

      setProfile(userData);
      setFormData({
        name: userData.name || "",
      });
      setLoading(false);
    }
  }, [session, status]);

  const handleUpdateProfile = async (section: string) => {
    try {
      setSaving(true);

      if (section === "basic") {
        await update({ name: formData.name });

        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      }

      setEditingSection(null);
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

  const handleChangePassword = () => {
    // Redirect to forgot password page to use existing flow
    router.push("/forgot-password");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently joined";
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

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#214B3F] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600">Unable to load profile</p>
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
                  {profile?.email || "No email"}
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
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <Phone className="h-4 w-4" />
                      Primary Phone
                    </label>
                    <p className="text-gray-900 font-medium">
                      {profile?.mobileNumber || "Not provided"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Contact support to change your phone number
                    </p>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <Phone className="h-4 w-4" />
                      Alternative Phone
                    </label>
                    <p className="text-gray-900 font-medium">Not available</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Feature coming soon
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </label>
                    <p className="text-gray-900 font-medium">Not available</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Feature coming soon
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <User className="h-4 w-4" />
                      Emergency Contact
                    </label>
                    <p className="text-gray-900 font-medium">Not available</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Feature coming soon
                    </p>
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
                    onClick={handleChangePassword}
                    className="px-4 py-2 text-sm bg-[#214B3F] text-white rounded-lg hover:bg-[#214B3F]/90 transition-colors"
                  >
                    Change Password
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
