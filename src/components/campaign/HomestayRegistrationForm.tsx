"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, MapPin, Phone, Mail, User, Loader2, CheckCircle2 } from "lucide-react";
import { registerHomestay } from "@/lib/api/campaign";
import { toast } from "sonner";
import type { TrackQRScanResponse } from "@/types/campaign";

interface HomestayRegistrationFormProps {
  qrCode: string;
  scanData: TrackQRScanResponse;
  assignedBy?: string;
}

export function HomestayRegistrationForm({ qrCode, scanData, assignedBy }: HomestayRegistrationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactNumber: "",
    hostEmail: "",
    hostPhone: "",
    fieldNotes: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.address || !formData.contactNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.hostEmail && !formData.hostPhone) {
      toast.error("Please provide either host email or host phone number");
      return;
    }

    try {
      setLoading(true);

      const response = await registerHomestay({
        qrCode,
        campaignId: scanData.campaign.id,
        name: formData.name,
        address: formData.address,
        contactNumber: formData.contactNumber,
        hostEmail: formData.hostEmail || undefined,
        hostPhone: formData.hostPhone || undefined,
        assignedBy: assignedBy,
        fieldNotes: formData.fieldNotes || undefined,
      });

      setSuccess(true);
      toast.success("Homestay registered successfully!", {
        description: `${formData.name} has been linked to this QR code`,
      });

      // Redirect to campaign details after 2 seconds
      setTimeout(() => {
        router.push(`/admin/campaigns/${scanData.campaign.id}`);
      }, 2000);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("Failed to register homestay", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-6">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Homestay Registered!</h2>
          <p className="text-muted-foreground mb-4">
            {formData.name} has been successfully linked to this QR code.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to campaign details...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Campaign Info */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Register Homestay - {scanData.campaign.name}
          </CardTitle>
          <CardDescription>
            Link this QR code to a homestay for campaign tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-muted-foreground">QR Code:</span>
              <span className="ml-2 font-mono">{qrCode.substring(0, 8)}...</span>
            </div>
            {scanData.campaign.discountPercentage && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Discount:</span>
                <Badge variant="secondary">{scanData.campaign.discountPercentage}% off</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Registration Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Homestay Information</CardTitle>
            <CardDescription>
              Enter the homestay details to register it for this campaign
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Homestay Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="required">
                Homestay Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Home className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Mountain View Homestay"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="required">
                Address <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  placeholder="Pokhara, Kaski, Nepal"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <Label htmlFor="contactNumber" className="required">
                Homestay Contact Number <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contactNumber"
                  type="tel"
                  placeholder="+977 98XXXXXXXX"
                  value={formData.contactNumber}
                  onChange={(e) => handleChange("contactNumber", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Host Information */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-semibold mb-3">Host Contact Information</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Provide at least one contact method (email or phone)
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Host Email */}
                <div className="space-y-2">
                  <Label htmlFor="hostEmail">Host Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="hostEmail"
                      type="email"
                      placeholder="host@example.com"
                      value={formData.hostEmail}
                      onChange={(e) => handleChange("hostEmail", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Host Phone */}
                <div className="space-y-2">
                  <Label htmlFor="hostPhone">Host Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="hostPhone"
                      type="tel"
                      placeholder="+977 98XXXXXXXX"
                      value={formData.hostPhone}
                      onChange={(e) => handleChange("hostPhone", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Field Notes */}
            <div className="space-y-2">
              <Label htmlFor="fieldNotes">Field Notes (Optional)</Label>
              <Textarea
                id="fieldNotes"
                placeholder="Any additional observations or notes from your field visit..."
                value={formData.fieldNotes}
                onChange={(e) => handleChange("fieldNotes", e.target.value)}
                rows={3}
              />
            </div>

            {/* Warning Alert */}
            <Alert>
              <AlertDescription className="text-sm">
                <strong>Note:</strong> This QR code will be permanently linked to this homestay.
                Make sure all information is correct before submitting.
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register Homestay"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
