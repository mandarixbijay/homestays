"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  QrCode,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  getCampaignById,
  generateBulkQRCodes,
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
  const [count, setCount] = useState(100);
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

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

      setQrCodes(result.qrCodes);
      toast.success(`Generated ${result.count} QR codes successfully`, {
        description: "You can now download the QR code images",
      });
    } catch (error: any) {
      toast.error("Failed to generate QR codes", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setGenerating(false);
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {qrCodes.map((qr, index) => (
                  <Card key={qr.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-white rounded-lg mb-2 overflow-hidden">
                        <img
                          src={qr.qrCodeUrl}
                          alt={`QR Code ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground text-center font-mono truncate">
                          {qr.qrCode}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleDownloadSingle(qr, index)}
                          disabled={downloading}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

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
