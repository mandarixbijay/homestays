"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Eye, Edit, Trash2, QrCode, Users, Star, Gift } from "lucide-react";
import { getCampaigns, deleteCampaign } from "@/lib/api/campaign";
import type { Campaign } from "@/types/campaign";
import { toast } from "sonner";
import { format } from "date-fns";

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCampaigns();
  }, [currentPage]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await getCampaigns({ page: currentPage, limit: 10 });
      setCampaigns(response.campaigns || []);
      setTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      toast.error("Failed to fetch campaigns", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will remove all related data.`)) {
      return;
    }

    try {
      await deleteCampaign(id);
      toast.success("Campaign deleted successfully");
      fetchCampaigns();
    } catch (error: any) {
      toast.error("Failed to delete campaign", {
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
            <p className="text-muted-foreground">
              Manage QR code campaigns for review collection
            </p>
          </div>
          <Button onClick={() => router.push("/admin/campaigns/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Campaigns Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Get started by creating your first campaign"}
              </p>
              {!searchQuery && (
                <Button onClick={() => router.push("/admin/campaigns/create")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Campaign
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCampaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{campaign.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {campaign.description || "No description"}
                      </CardDescription>
                    </div>
                    <Badge variant={campaign.isActive ? "default" : "secondary"}>
                      {campaign.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center text-muted-foreground mb-1">
                        <QrCode className="h-4 w-4 mr-1" />
                      </div>
                      <div className="text-2xl font-bold">
                        {campaign._count?.campaignHomestays || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Homestays</div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center text-muted-foreground mb-1">
                        <Star className="h-4 w-4 mr-1" />
                      </div>
                      <div className="text-2xl font-bold">
                        {campaign._count?.reviews || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Reviews</div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center text-muted-foreground mb-1">
                        <Gift className="h-4 w-4 mr-1" />
                      </div>
                      <div className="text-2xl font-bold">
                        {campaign._count?.discounts || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Discounts</div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date:</span>
                      <span className="font-medium">
                        {format(new Date(campaign.startDate), "MMM dd, yyyy")}
                      </span>
                    </div>
                    {campaign.endDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">End Date:</span>
                        <span className="font-medium">
                          {format(new Date(campaign.endDate), "MMM dd, yyyy")}
                        </span>
                      </div>
                    )}
                    {campaign.discountPercentage && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Discount:</span>
                        <span className="font-medium">{campaign.discountPercentage}%</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/admin/campaigns/${campaign.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/admin/campaigns/${campaign.id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(campaign.id, campaign.name)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredCampaigns.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
