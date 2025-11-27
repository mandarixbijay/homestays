# Campaign API - Quick Reference

## Endpoints at a Glance

### 🔓 Public Endpoints (No Auth)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/campaign` | List all campaigns |
| `GET` | `/api/campaign/:id` | Get campaign details |
| `GET` | `/api/campaign/:campaignId/homestays` | Get campaign homestays |
| `GET` | `/api/campaign/qr/:qrCode` | Get homestay by QR code |
| `POST` | `/api/campaign/scan` | Track QR scan (guest entry point) |
| `POST` | `/api/campaign/review/verify-user` | Verify user & send OTP |
| `POST` | `/api/campaign/review/verify-otp` | Verify OTP code |
| `POST` | `/api/campaign/review/complete-registration` | Register new user |

### 🔒 Protected Endpoints (JWT Required)

#### Admin Only
| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/campaign` | Create campaign |
| `PUT` | `/api/campaign/:id` | Update campaign |
| `DELETE` | `/api/campaign/:id` | Delete campaign |
| `POST` | `/api/campaign/qr-codes/generate` | Generate bulk QR codes |
| `GET` | `/api/campaign/reviews/all` | List all reviews (moderation) |
| `PUT` | `/api/campaign/reviews/:id/verify` | Verify/reject review |

#### Field Staff
| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/campaign/homestay/register` | Register single homestay |
| `POST` | `/api/campaign/homestay/bulk-register` | Bulk register homestays |

#### Guest (Verified User)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/campaign/review/upload-images` | Upload review images |
| `POST` | `/api/campaign/review/submit` | Submit review |
| `GET` | `/api/campaign/discounts/my` | Get my discount codes |
| `POST` | `/api/campaign/discounts/validate` | Validate discount code |

#### Host
| Method | Endpoint | Purpose |
|--------|----------|---------|
| `PUT` | `/api/campaign/reviews/:id/respond` | Respond to review |

---

## User Journey Flows

### 1️⃣ Admin Setup (Pre-Campaign)
```
Create Campaign → Generate QR Codes → Download PNG Images → Print Stickers → Distribute to Field Teams
```

### 2️⃣ Field Staff Registration
```
Scan QR Sticker → Extract UUID → Enter Homestay Details → Submit Registration → Place Sticker at Homestay
```

### 3️⃣ Guest Review Submission

#### New User Flow
```
Scan QR → Track Scan → Enter Email → Verify User (Not Found) → Enter OTP + Name + Password →
Register → Login → Upload Photos → Submit Review → Receive Discount via Email/SMS
```

#### Existing User Flow
```
Scan QR → Track Scan → Enter Email → Verify User (Found) → Enter OTP → Enter Password →
Login → Upload Photos → Submit Review → Receive Discount via Email/SMS
```

---

## Key Constraints & Validations

| Field | Constraint |
|-------|------------|
| QR codes per generation | 1-1000 |
| Review images | Max 5, Max 5MB each, JPEG/PNG/WebP only |
| OTP expiration | 10 minutes |
| Reviews per user per homestay | 1 (no duplicates) |
| Reviews per IP per homestay | Max 3 per 24 hours |
| Discount code validity | Campaign-defined (default 30 days) |
| Host response length | 10-1000 characters |

---

## Response Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| `200` | OK | Successful GET/PUT request |
| `201` | Created | Resource created (POST) |
| `400` | Bad Request | Invalid input, validation failed |
| `401` | Unauthorized | Missing/invalid JWT, invalid OTP |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate review, QR already assigned |
| `500` | Server Error | Backend error |

---

## Discount Code Delivery Logic

```
IF user has email:
  → Send discount via EMAIL
  → Send thank you email
ELSE IF user has phone:
  → Send discount via SMS
  → No thank you email (no email available)
```

---

## Frontend Pages Required

### Admin Portal
- ✅ Campaign List & Create
- ✅ Campaign Details & Edit
- ✅ Generate QR Codes
- ✅ Download QR Images
- ✅ View Campaign Homestays
- ✅ Review Moderation Panel
- ✅ Verify/Reject Reviews

### Field Staff Mobile App
- ✅ QR Scanner
- ✅ Homestay Registration Form
- ✅ Bulk Upload Interface
- ✅ Offline Data Collection

### Guest Public Pages
- ✅ Review Landing Page (`/review/:qrCode`)
- ✅ Contact Entry & OTP Verification
- ✅ New User Registration Form
- ✅ Review Form with Photo Upload
- ✅ Success/Thank You Page
- ✅ My Discount Codes (Profile)

### Host Dashboard
- ✅ My Reviews List
- ✅ Review Response Form

---

## Environment Variables Checklist

```bash
✅ API_BASE_URL
✅ AWS_REGION
✅ AWS_ACCESS_KEY_ID
✅ AWS_SECRET_ACCESS_KEY
✅ AWS_S3_BUCKET
✅ EMAIL_FROM
✅ SENDGRID_API_KEY (or AWS SES credentials)
✅ TWILIO_ACCOUNT_SID
✅ TWILIO_AUTH_TOKEN
✅ TWILIO_PHONE_NUMBER
✅ NEXT_PUBLIC_APP_URL
✅ JWT_SECRET
```

---

## Common Code Snippets

### Authenticated Request
```typescript
const response = await fetch('/api/campaign', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

### Handle Validation Errors
```typescript
if (!response.ok) {
  const error = await response.json();
  if (error.errors) {
    error.errors.forEach(err => {
      console.error(`${err.property}: ${Object.values(err.constraints).join(', ')}`);
    });
  }
  throw new Error(error.message);
}
```

### File Upload
```typescript
const formData = new FormData();
files.forEach(file => formData.append('images', file));

const response = await fetch('/api/campaign/review/upload-images', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

---

## Database Relations

```
Campaign
  ├── CampaignHomestay (many)
  ├── CampaignReview (many)
  └── CampaignDiscount (many)

CampaignHomestay
  ├── belongs to Campaign
  ├── belongs to Homestay (optional, null until registered)
  ├── has many CampaignQRScan
  └── has many CampaignReview

CampaignReview
  ├── belongs to Campaign
  ├── belongs to CampaignHomestay
  ├── belongs to User (guest)
  ├── belongs to Homestay
  └── has many CampaignReviewImage

CampaignDiscount
  ├── belongs to User
  ├── belongs to Campaign
  └── belongs to Booking (optional, null until used)
```

---

## Testing Endpoints

### 1. Create Campaign (Admin)
```bash
curl -X POST http://localhost:3000/api/campaign \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Campaign",
    "startDate": "2025-06-01T00:00:00Z",
    "discountPercentage": 15,
    "discountValidDays": 30
  }'
```

### 2. Generate QR Codes (Admin)
```bash
curl -X POST http://localhost:3000/api/campaign/qr-codes/generate \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": 1,
    "count": 10
  }'
```

### 3. Register Homestay (Field Staff)
```bash
curl -X POST http://localhost:3000/api/campaign/homestay/register \
  -H "Authorization: Bearer YOUR_FIELD_STAFF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrCode": "550e8400-e29b-41d4-a716-446655440000",
    "campaignId": 1,
    "name": "Test Homestay",
    "address": "Pokhara, Nepal",
    "contactNumber": "+9779841234567",
    "hostEmail": "host@example.com",
    "assignedBy": "Test Staff"
  }'
```

### 4. Track QR Scan (Public)
```bash
curl -X POST http://localhost:3000/api/campaign/scan \
  -H "Content-Type: application/json" \
  -d '{
    "qrCode": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### 5. Submit Review (Guest)
```bash
curl -X POST http://localhost:3000/api/campaign/review/submit \
  -H "Authorization: Bearer YOUR_GUEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrCode": "550e8400-e29b-41d4-a716-446655440000",
    "rating": 4.5,
    "description": "Great stay!",
    "checkInDate": "2025-01-10",
    "checkOutDate": "2025-01-13"
  }'
```

---

## Troubleshooting

### Issue: QR Code Not Found
- **Cause**: QR code not pre-generated or invalid UUID
- **Solution**: Ensure QR codes are generated via `/api/campaign/qr-codes/generate` first

### Issue: QR Code Already Assigned
- **Cause**: Attempting to register homestay with already-used QR code
- **Solution**: Generate new QR codes or check campaign homestays list

### Issue: Invalid OTP
- **Cause**: OTP expired (>10 minutes) or incorrect code
- **Solution**: Request new OTP via `/api/campaign/review/verify-user`

### Issue: Review Submission Failed - Duplicate
- **Cause**: User already submitted review for this homestay
- **Solution**: Check existing reviews via `/api/campaign/reviews/all`

### Issue: Too Many Reviews from IP
- **Cause**: More than 3 reviews from same IP in 24 hours
- **Solution**: Wait 24 hours or contact admin to whitelist IP

### Issue: Discount Code Invalid
- **Cause**: Code expired, already used, or doesn't belong to user
- **Solution**: Check discount expiration and usage status via `/api/campaign/discounts/my`

---

## Performance Tips

1. **Pagination**: Always use `page` and `limit` params for large datasets
2. **Image Optimization**: Compress images before upload (target <1MB per image)
3. **Caching**: Cache campaign details on frontend (TTL: 5 minutes)
4. **Lazy Loading**: Load images progressively in review lists
5. **Debounce**: Debounce search inputs (300ms delay)

---

## Security Checklist

- [ ] Validate JWT on all protected endpoints
- [ ] Sanitize user input (XSS prevention)
- [ ] Rate limit public endpoints
- [ ] Verify file types before upload
- [ ] Implement CORS properly
- [ ] Use HTTPS in production
- [ ] Rotate JWT secrets regularly
- [ ] Log suspicious activities (multiple failed OTPs, spam attempts)

---

**Quick Links**:
- [Full Documentation](./CAMPAIGN_API_DOCUMENTATION.md)
- [Backend API](http://13.61.8.56:3001)
- [Frontend](https://nepalhomestays.com)
