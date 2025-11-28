"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import { createCampaign } from "@/lib/api/campaign";
import { toast } from "sonner";
import type { CreateCampaignRequest } from "@/types/campaign";

export default function CreateCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCampaignRequest>({
    name: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    discountPercentage: 10,
    discountValidDays: 30,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert dates to ISO format
      const payload: CreateCampaignRequest = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      };

      const campaign = await createCampaign(payload);
      toast.success("Campaign created successfully");
      router.push(`/admin/campaigns/${campaign.id}`);
    } catch (error: any) {
      toast.error("Failed to create campaign", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateCampaignRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
            <p className="text-muted-foreground">
              Set up a new QR code campaign for review collection
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
              <CardDescription>
                Configure your campaign settings and discount parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Campaign Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Campaign Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Summer 2025 Review Campaign"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  A unique name to identify this campaign
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter campaign description..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Optional description to help identify the campaign purpose
                </p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">
                    Start Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    min={formData.startDate}
                  />
                </div>
              </div>

              {/* Discount Settings */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Discount Settings</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="discountPercentage">Discount Percentage</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="discountPercentage"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.discountPercentage || ""}
                          onChange={(e) =>
                            handleChange("discountPercentage", parseFloat(e.target.value) || 0)
                          }
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Discount offered to reviewers (0-100%)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discountValidDays">Validity Period</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="discountValidDays"
                          type="number"
                          min="1"
                          value={formData.discountValidDays || ""}
                          onChange={(e) =>
                            handleChange("discountValidDays", parseInt(e.target.value) || 1)
                          }
                        />
                        <span className="text-muted-foreground">days</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        How long the discount code is valid
                      </p>
                    </div>
                  </div>

                  {formData.discountPercentage && formData.discountPercentage > 0 && (
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm font-medium">Discount Preview</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Guests will receive <strong>{formData.discountPercentage}%</strong> off
                        their next booking, valid for{" "}
                        <strong>{formData.discountValidDays}</strong> days
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    "Creating..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Campaign
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
