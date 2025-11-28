"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  QrCode,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import {
  getCampaignById,
  generateBulkQRCodes,
  getCampaignQRCodes,
  deleteQRCode,
  downloadQRCodeImage,
  downloadAllQRCodes,
} from "@/lib/api/campaign";
import type { Campaign, QRCodeData } from "@/types/campaign";
import { toast } from "sonner";

export default function QRCodesPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = parseInt(params.id as string);

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [count, setCount] = useState(100);
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [selectedQRCodes, setSelectedQRCodes] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchCampaign();
    fetchQRCodes();
  }, [campaignId, pagination.page]);

  // Reset selection when QR codes change or page changes
  useEffect(() => {
    setSelectedQRCodes(new Set());
    setSelectAll(false);
  }, [qrCodes]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const data = await getCampaignById(campaignId);
      setCampaign(data);
    } catch (error: any) {
      toast.error("Failed to fetch campaign", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchQRCodes = async () => {
    try {
      const data = await getCampaignQRCodes(campaignId, pagination.page, 50);
      setQrCodes(data.qrCodes || []);
      setPagination({
        page: data.pagination.page,
        totalPages: data.pagination.totalPages,
        total: data.pagination.total,
      });
    } catch (error: any) {
      console.error("Failed to fetch QR codes:", error);
      // Don't show error toast if it's the first time loading (might not exist yet)
    }
  };

  const handleGenerate = async () => {
    if (count < 1 || count > 1000) {
      toast.error("Invalid count", {
        description: "Please enter a number between 1 and 1000",
      });
      return;
    }

    try {
      setGenerating(true);
      const result = await generateBulkQRCodes({
        campaignId,
        count,
      });

      toast.success(`Generated ${result.count} QR codes successfully`, {
        description: "Refreshing QR codes list...",
      });

      // Refresh the QR codes list
      await fetchQRCodes();
    } catch (error: any) {
      toast.error("Failed to generate QR codes", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (qrCodeId: number, qrCode: string) => {
    if (!confirm(`Are you sure you want to delete QR code ${qrCode.substring(0, 8)}...?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(qrCodeId);
      await deleteQRCode(qrCodeId);
      toast.success("QR code deleted successfully");

      // Refresh the list
      await fetchQRCodes();
    } catch (error: any) {
      toast.error("Failed to delete QR code", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      // Only select unassigned QR codes
      const unassignedIds = qrCodes
        .filter(qr => !qr.homestayId)
        .map(qr => qr.id);
      setSelectedQRCodes(new Set(unassignedIds));
    } else {
      setSelectedQRCodes(new Set());
    }
  };

  const handleSelectQRCode = (qrCodeId: number, checked: boolean) => {
    const newSelected = new Set(selectedQRCodes);
    if (checked) {
      newSelected.add(qrCodeId);
    } else {
      newSelected.delete(qrCodeId);
    }
    setSelectedQRCodes(newSelected);

    // Update select all state
    const unassignedCount = qrCodes.filter(qr => !qr.homestayId).length;
    setSelectAll(newSelected.size === unassignedCount && unassignedCount > 0);
  };

  const handleBulkDelete = async () => {
    const count = selectedQRCodes.size;
    if (count === 0) return;

    if (!confirm(`Are you sure you want to delete ${count} QR code${count > 1 ? 's' : ''}?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      setBulkDeleting(true);

      // Delete all selected QR codes
      const deletePromises = Array.from(selectedQRCodes).map(id => deleteQRCode(id));
      await Promise.all(deletePromises);

      toast.success(`${count} QR code${count > 1 ? 's' : ''} deleted successfully`);

      // Clear selection and refresh list
      setSelectedQRCodes(new Set());
      setSelectAll(false);
      await fetchQRCodes();
    } catch (error: any) {
      toast.error("Failed to delete some QR codes", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleDownloadAll = async () => {
    if (qrCodes.length === 0) return;

    try {
      setDownloading(true);
      setDownloadProgress(0);

      for (let i = 0; i < qrCodes.length; i++) {
        const qr = qrCodes[i];
        await downloadQRCodeImage(qr.qrCodeUrl, `qr-code-${campaign?.name}-${i + 1}.png`);
        setDownloadProgress(((i + 1) / qrCodes.length) * 100);

        // Add small delay to avoid overwhelming the browser
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      toast.success("All QR codes downloaded successfully");
    } catch (error: any) {
      toast.error("Failed to download QR codes", {
        description: error.message,
      });
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleDownloadSingle = async (qr: QRCodeData, index: number) => {
    try {
      await downloadQRCodeImage(qr.qrCodeUrl, `qr-code-${campaign?.name}-${index + 1}.png`);
      toast.success(`QR code ${index + 1} downloaded`);
    } catch (error: any) {
      toast.error("Failed to download QR code", {
        description: error.message,
      });
    }
  };

  if (loading || !campaign) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Generate QR Codes</h1>
            <p className="text-muted-foreground">
              Campaign: {campaign.name}
            </p>
          </div>
        </div>

        {/* Instructions */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Pre-Printing Workflow:</strong> Generate QR codes, download the PNG images,
            print them as stickers or on A6 paper, then distribute to field teams for homestay
            visits.
          </AlertDescription>
        </Alert>

        {/* Generation Form */}
        <Card>
          <CardHeader>
            <CardTitle>Generate QR Codes</CardTitle>
            <CardDescription>
              Create QR codes for printing before field distribution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="count">
                Number of QR Codes (1-1000)
              </Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="1000"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 0)}
                disabled={generating}
              />
              <p className="text-sm text-muted-foreground">
                Generate up to 1000 QR codes at once
              </p>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generating || count < 1 || count > 1000}
              className="w-full"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" />
                  Generate {count} QR Codes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated QR Codes */}
        {qrCodes.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated QR Codes ({qrCodes.length})</CardTitle>
                  <CardDescription>
                    Download individual QR codes or all at once
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleDownloadAll}
                    disabled={downloading}
                    variant="default"
                  >
                    {downloading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download All
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Bulk Actions */}
              {qrCodes.some(qr => !qr.homestayId) && (
                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all"
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                      Select All Unassigned ({qrCodes.filter(qr => !qr.homestayId).length})
                    </Label>
                  </div>
                  {selectedQRCodes.size > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={bulkDeleting}
                    >
                      {bulkDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-3 w-3" />
                          Delete Selected ({selectedQRCodes.size})
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Download Progress */}
              {downloading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Download Progress</span>
                    <span className="font-medium">{Math.round(downloadProgress)}%</span>
                  </div>
                  <Progress value={downloadProgress} />
                </div>
              )}

              {/* Success Message */}
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <strong>QR codes generated successfully!</strong> These QR codes are inactive
                  until assigned to a homestay by field staff.
                </AlertDescription>
              </Alert>

              {/* QR Code Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto">
                {qrCodes.map((qr, index) => (
                  <Card key={qr.id} className={`overflow-hidden ${qr.homestayId ? 'border-green-200 bg-green-50/50' : ''} ${selectedQRCodes.has(qr.id) ? 'ring-2 ring-primary' : ''}`}>
                    <CardContent className="p-4">
                      {/* Status Badge and Checkbox */}
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          {qr.homestayId ? (
                            <Badge variant="default" className="text-xs">
                              Assigned
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Unassigned
                            </Badge>
                          )}
                        </div>
                        {!qr.homestayId && (
                          <Checkbox
                            checked={selectedQRCodes.has(qr.id)}
                            onCheckedChange={(checked) => handleSelectQRCode(qr.id, checked as boolean)}
                          />
                        )}
                      </div>

                      {/* QR Code Image */}
                      <div className="aspect-square bg-white rounded-lg mb-2 overflow-hidden border">
                        <img
                          src={qr.qrCodeUrl}
                          alt={`QR Code ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* QR Code Info */}
                      <div className="space-y-2">
                        <div className="text-xs space-y-1">
                          <p className="text-muted-foreground font-mono truncate" title={qr.qrCode}>
                            {qr.qrCode.substring(0, 12)}...
                          </p>
                          {qr.homestay && (
                            <p className="font-medium truncate text-green-700" title={qr.homestay.name}>
                              {qr.homestay.name}
                            </p>
                          )}
                          {qr.scannedCount > 0 && (
                            <p className="text-muted-foreground">
                              Scans: {qr.scannedCount}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDownloadSingle(qr, index)}
                            disabled={downloading}
                            title="Download QR code"
                          >
                            <Download className="h-3 w-3" />
                          </Button>

                          {qr.reviewUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(qr.reviewUrl, '_blank')}
                              title="Open review page"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}

                          {!qr.homestayId && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(qr.id, qr.qrCode)}
                              disabled={deleting === qr.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete QR code"
                            >
                              {deleting === qr.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {qrCodes.length} of {pagination.total} QR codes
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center px-3 text-sm">
                      Page {pagination.page} of {pagination.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Next Steps:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                    <li>Download all QR code PNG images</li>
                    <li>Print them as stickers or on A6 paper</li>
                    <li>Distribute to field teams</li>
                    <li>Field staff will scan and assign QR codes to homestays</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
