# Backend QR Code Updates Needed

## Issue 1: QR Code URL Points to Production

**Problem**: QR codes are hardcoded to `https://nepalhomestays.com` even in development

**File**: `src/campaign/campaign.service.ts`

**Current Code** (line ~450):
```typescript
async generateQRCodeImage(qrCodeUUID: string, size: number = 800): Promise<Buffer> {
  try {
    const reviewUrl = `https://nepalhomestays.com/review/${qrCodeUUID}`;
    // ...
  }
}
```

**Fix Needed**:
```typescript
async generateQRCodeImage(qrCodeUUID: string, size: number = 800): Promise<Buffer> {
  try {
    // Use environment variable for base URL
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const reviewUrl = `${baseUrl}/review/${qrCodeUUID}`;
    // ...
  }
}
```

**Also update in** `generateBulkQRCodes` method (line ~250):
```typescript
qrCodes.push({
  id: campaignHomestay.id,
  qrCode: qrCodeUUID,
  qrCodeUrl,
  reviewUrl: `${baseUrl}/review/${qrCodeUUID}`, // Use environment variable
});
```

## Issue 2: Missing Endpoints to Fetch and Delete QR Codes

### Add to `campaign.controller.ts`:

```typescript
// GET /campaign/:id/qr-codes - Get all QR codes for a campaign
@Get(':id/qr-codes')
@ApiOperation({
  summary: 'Get all QR codes for a campaign',
  description: 'Get list of all generated QR codes for a specific campaign',
})
@ApiParam({ name: 'id', description: 'Campaign ID' })
@ApiQuery({ name: 'page', required: false, example: 1 })
@ApiQuery({ name: 'limit', required: false, example: 50 })
@ApiResponse({ status: 200, description: 'QR codes retrieved successfully' })
async getCampaignQRCodes(
  @Param('id', ParseIntPipe) id: number,
  @Query('page', ParseIntPipe) page: number = 1,
  @Query('limit', ParseIntPipe) limit: number = 50,
) {
  return this.campaignService.getCampaignQRCodes(id, page, limit);
}

// DELETE /campaign/qr-codes/:id - Delete a QR code
@Delete('qr-codes/:id')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiOperation({
  summary: 'Delete a QR code',
  description: 'Admin endpoint to delete a QR code (only if not yet assigned to homestay)',
})
@ApiParam({ name: 'id', description: 'Campaign Homestay ID (QR code record)' })
@ApiResponse({ status: 200, description: 'QR code deleted successfully' })
@ApiResponse({ status: 400, description: 'Cannot delete QR code already assigned to homestay' })
async deleteQRCode(@Param('id', ParseIntPipe) id: number) {
  return this.campaignService.deleteQRCode(id);
}
```

### Add to `campaign.service.ts`:

```typescript
async getCampaignQRCodes(campaignId: number, page: number = 1, limit: number = 50) {
  const skip = (page - 1) * limit;

  const [qrCodes, total] = await Promise.all([
    this.prisma.campaignHomestay.findMany({
      where: { campaignId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        qrCode: true,
        qrCodeUrl: true,
        homestayId: true,
        isActive: true,
        scannedCount: true,
        reviewCount: true,
        assignedBy: true,
        createdAt: true,
        homestay: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    }),
    this.prisma.campaignHomestay.count({ where: { campaignId } }),
  ]);

  // Add review URL to each QR code
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const enrichedQRCodes = qrCodes.map((qr) => ({
    ...qr,
    reviewUrl: `${baseUrl}/review/${qr.qrCode}`,
  }));

  return {
    qrCodes: enrichedQRCodes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async deleteQRCode(id: number) {
  // Check if QR code exists
  const qrCode = await this.prisma.campaignHomestay.findUnique({
    where: { id },
  });

  if (!qrCode) {
    throw new NotFoundException('QR code not found');
  }

  // Prevent deletion if already assigned to homestay
  if (qrCode.homestayId) {
    throw new BadRequestException(
      'Cannot delete QR code that is already assigned to a homestay'
    );
  }

  // Delete the QR code record
  await this.prisma.campaignHomestay.delete({
    where: { id },
  });

  // Optionally: Delete the QR code image from S3
  if (qrCode.qrCodeUrl) {
    try {
      await this.s3Service.deleteFile(qrCode.qrCodeUrl);
    } catch (error) {
      console.error('Failed to delete QR code image from S3:', error);
      // Don't fail the request if S3 deletion fails
    }
  }

  return {
    message: 'QR code deleted successfully',
  };
}
```

## Environment Variables Needed

Add to `.env`:
```bash
# Frontend URL for QR code generation
FRONTEND_URL=http://localhost:3000  # Development
# FRONTEND_URL=https://nepalhomestays.com  # Production
```

## Summary of Changes

1. ✅ Make QR code URL dynamic based on environment
2. ✅ Add endpoint to fetch all QR codes for a campaign
3. ✅ Add endpoint to delete QR code (only if not assigned)
4. ✅ Add environment variable for frontend URL
