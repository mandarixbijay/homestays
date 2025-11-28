"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Edit,
  QrCode,
  Users,
  Star,
  Gift,
  Calendar,
  BarChart3,
  Download,
} from "lucide-react";
import { getCampaignById, getCampaignHomestays, getCampaignReviews } from "@/lib/api/campaign";
import type { Campaign, CampaignHomestay, CampaignReview } from "@/types/campaign";
import { toast } from "sonner";
import { format } from "date-fns";

export default function CampaignDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = parseInt(params.id as string);

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [homestays, setHomestays] = useState<CampaignHomestay[]>([]);
  const [reviews, setReviews] = useState<CampaignReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchCampaignData();
  }, [campaignId]);

  const fetchCampaignData = async () => {
    try {
      setLoading(true);
      const [campaignData, homestaysData, reviewsData] = await Promise.all([
        getCampaignById(campaignId),
        getCampaignHomestays(campaignId, { page: 1, limit: 10 }),
        getCampaignReviews({ campaignId, page: 1, limit: 10 }),
      ]);

      setCampaign(campaignData);
      setHomestays(homestaysData.campaignHomestays || []);
      setReviews(reviewsData.reviews || []);
    } catch (error: any) {
      toast.error("Failed to fetch campaign data", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-1/2" />
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold mb-2">Campaign Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The campaign you&apos;re looking for doesn&apos;t exist
            </p>
            <Button onClick={() => router.push("/admin/campaigns")}>
              Back to Campaigns
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      label: "Homestays",
      value: campaign._count?.campaignHomestays || 0,
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Reviews",
      value: campaign._count?.reviews || 0,
      icon: Star,
      color: "text-yellow-600",
    },
    {
      label: "Discounts",
      value: campaign._count?.discounts || 0,
      icon: Gift,
      color: "text-green-600",
    },
    {
      label: "QR Scans",
      value: homestays.reduce((sum, h) => sum + h.scannedCount, 0),
      icon: QrCode,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
                <Badge variant={campaign.isActive ? "default" : "secondary"}>
                  {campaign.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {campaign.description || "No description"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/campaigns/${campaign.id}/qr-codes`)}
            >
              <QrCode className="mr-2 h-4 w-4" />
              Manage QR Codes
            </Button>
            <Button onClick={() => router.push(`/admin/campaigns/${campaign.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="homestays">Homestays ({homestays.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Campaign Info */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                    <p className="text-base font-medium">
                      {format(new Date(campaign.startDate), "PPP")}
                    </p>
                  </div>
                  {campaign.endDate && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">End Date</p>
                      <p className="text-base font-medium">
                        {format(new Date(campaign.endDate), "PPP")}
                      </p>
                    </div>
                  )}
                  {campaign.discountPercentage && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Discount Percentage
                        </p>
                        <p className="text-base font-medium">{campaign.discountPercentage}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Discount Validity
                        </p>
                        <p className="text-base font-medium">
                          {campaign.discountValidDays} days
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Conversion Rate</span>
                    <span className="font-medium">
                      {homestays.length > 0
                        ? `${((reviews.length / homestays.length) * 100).toFixed(1)}%`
                        : "0%"}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: homestays.length > 0
                          ? `${(reviews.length / homestays.length) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount Redemption</span>
                    <span className="font-medium">
                      {reviews.length > 0
                        ? `${((campaign._count?.discounts || 0) / reviews.length * 100).toFixed(1)}%`
                        : "0%"}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600"
                      style={{
                        width: reviews.length > 0
                          ? `${((campaign._count?.discounts || 0) / reviews.length) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="homestays" className="space-y-4">
            {homestays.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No homestays registered</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Generate QR codes and register homestays to get started
                  </p>
                  <Button
                    onClick={() => router.push(`/admin/campaigns/${campaign.id}/qr-codes`)}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Generate QR Codes
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {homestays.map((homestay) => (
                  <Card key={homestay.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {homestay.homestay?.name || "Unassigned"}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {homestay.homestay?.address || "No address"}
                          </p>
                          <div className="flex gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Scans: </span>
                              <span className="font-medium">{homestay.scannedCount}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Reviews: </span>
                              <span className="font-medium">{homestay.reviewCount}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant={homestay.isActive ? "default" : "secondary"}>
                          {homestay.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            {reviews.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Star className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                  <p className="text-muted-foreground text-center">
                    Reviews will appear here once guests start submitting
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{review.user?.name || "Anonymous"}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(review.createdAt), "PPP")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <Badge variant={review.isVerified ? "default" : "secondary"}>
                            {review.isVerified ? "Verified" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                      {review.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {review.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
