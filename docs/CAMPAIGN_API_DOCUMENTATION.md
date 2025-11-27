# Campaign Module - Complete API Documentation

## Overview

The Campaign Module enables QR code-based review collection from unregistered homestays. This system supports three main user journeys:

1. **Admin Journey**: Pre-generate QR codes and manage campaigns
2. **Field Staff Journey**: Register homestays by scanning pre-printed QR codes
3. **Guest Journey**: Scan QR codes, verify identity, and submit reviews

## Base URL

```
Production: https://nepalhomestays.com/api
Development: http://localhost:3000/api
Backend: http://13.61.8.56:3001
```

## Authentication

### Authentication Types

- **Public Endpoints**: No authentication required
- **JWT Protected**: Requires `Authorization: Bearer <token>` header
- **Role-Based**: Admin, Field Staff, Host, or Guest roles

### Getting JWT Token

```typescript
// Login to get JWT token
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { accessToken } = await response.json();
// Use this token in subsequent requests
```

---

## API Endpoints

### 1. Campaign Management (Admin)

#### 1.1 Create Campaign

**Endpoint**: `POST /api/campaign`
**Auth**: Required (Admin)
**Purpose**: Create a new campaign before generating QR codes

**Request Body**:
```typescript
{
  name: string;              // Required, unique
  description?: string;
  qrCodeTemplate?: string;
  startDate: string;         // ISO 8601 format
  endDate?: string;          // ISO 8601 format
  discountPercentage?: number; // 0-100
  discountValidDays?: number;  // Days until discount expires
}
```

**Example Request**:
```typescript
const response = await fetch('/api/campaign', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "Summer 2025 Campaign",
    description: "QR code campaign for unregistered homestays",
    startDate: "2025-06-01T00:00:00Z",
    endDate: "2025-08-31T23:59:59Z",
    discountPercentage: 15,
    discountValidDays: 30
  })
});

const campaign = await response.json();
```

**Response** (201 Created):
```json
{
  "id": 1,
  "name": "Summer 2025 Campaign",
  "description": "QR code campaign for unregistered homestays",
  "qrCodeTemplate": null,
  "isActive": true,
  "startDate": "2025-06-01T00:00:00.000Z",
  "endDate": "2025-08-31T23:59:59.000Z",
  "discountPercentage": 15,
  "discountValidDays": 30,
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `409 Conflict`: Campaign with this name already exists
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User is not an admin

---

#### 1.2 Get All Campaigns

**Endpoint**: `GET /api/campaign?page=1&limit=20`
**Auth**: None (Public)
**Purpose**: List all campaigns with pagination

**Query Parameters**:
```typescript
{
  page?: number;   // Default: 1
  limit?: number;  // Default: 20, Max: 100
}
```

**Example Request**:
```typescript
const response = await fetch('/api/campaign?page=1&limit=20');
const data = await response.json();
```

**Response** (200 OK):
```json
{
  "campaigns": [
    {
      "id": 1,
      "name": "Summer 2025 Campaign",
      "description": "QR code campaign for unregistered homestays",
      "isActive": true,
      "startDate": "2025-06-01T00:00:00.000Z",
      "endDate": "2025-08-31T23:59:59.000Z",
      "discountPercentage": 15,
      "discountValidDays": 30,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "_count": {
        "campaignHomestays": 45,
        "reviews": 123,
        "discounts": 98
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

---

#### 1.3 Get Campaign by ID

**Endpoint**: `GET /api/campaign/:id`
**Auth**: None (Public)
**Purpose**: Get detailed information about a specific campaign

**Example Request**:
```typescript
const response = await fetch('/api/campaign/1');
const campaign = await response.json();
```

**Response** (200 OK):
```json
{
  "id": 1,
  "name": "Summer 2025 Campaign",
  "description": "QR code campaign for unregistered homestays",
  "isActive": true,
  "startDate": "2025-06-01T00:00:00.000Z",
  "endDate": "2025-08-31T23:59:59.000Z",
  "discountPercentage": 15,
  "discountValidDays": 30,
  "createdAt": "2025-01-15T10:30:00.000Z",
  "_count": {
    "campaignHomestays": 45,
    "reviews": 123,
    "discounts": 98
  }
}
```

**Error Responses**:
- `404 Not Found`: Campaign does not exist

---

#### 1.4 Update Campaign

**Endpoint**: `PUT /api/campaign/:id`
**Auth**: Required (Admin)
**Purpose**: Update campaign settings

**Request Body** (all fields optional):
```typescript
{
  name?: string;
  description?: string;
  qrCodeTemplate?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  discountPercentage?: number;
  discountValidDays?: number;
}
```

**Example Request**:
```typescript
const response = await fetch('/api/campaign/1', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    isActive: false,
    discountPercentage: 20
  })
});

const updatedCampaign = await response.json();
```

**Response** (200 OK): Returns updated campaign object

**Error Responses**:
- `404 Not Found`: Campaign does not exist
- `401 Unauthorized`: Missing or invalid JWT token

---

#### 1.5 Delete Campaign

**Endpoint**: `DELETE /api/campaign/:id`
**Auth**: Required (Admin)
**Purpose**: Delete campaign and all related data (cascades)

**Example Request**:
```typescript
const response = await fetch('/api/campaign/1', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const result = await response.json();
```

**Response** (200 OK):
```json
{
  "message": "Campaign deleted successfully"
}
```

**Error Responses**:
- `404 Not Found`: Campaign does not exist
- `401 Unauthorized`: Missing or invalid JWT token

---

#### 1.6 Generate Bulk QR Codes (PRE-PRINTING)

**Endpoint**: `POST /api/campaign/qr-codes/generate`
**Auth**: Required (Admin)
**Purpose**: Pre-generate QR codes for printing BEFORE field distribution

**Request Body**:
```typescript
{
  campaignId: number;  // Required
  count: number;       // Required, 1-1000
}
```

**Example Request**:
```typescript
const response = await fetch('/api/campaign/qr-codes/generate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    campaignId: 1,
    count: 500
  })
});

const qrData = await response.json();
```

**Response** (201 Created):
```json
{
  "campaignId": 1,
  "campaignName": "Summer 2025 Campaign",
  "count": 500,
  "message": "Generated 500 QR codes for printing",
  "qrCodes": [
    {
      "id": 1,
      "qrCode": "550e8400-e29b-41d4-a716-446655440000",
      "qrCodeUrl": "https://s3.amazonaws.com/qr-codes/campaign-1-qr-1.png",
      "reviewUrl": "https://nepalhomestays.com/review/550e8400-e29b-41d4-a716-446655440000"
    },
    // ... 499 more QR codes
  ]
}
```

**Use Case**:
1. Admin generates 500 QR codes
2. Downloads all PNG images from `qrCodeUrl`
3. Prints them as stickers or on A6 paper
4. Distributes to field teams for homestay visits

**Important**: QR codes are inactive (`isActive=false`, `homestayId=null`) until assigned to a homestay

**Error Responses**:
- `404 Not Found`: Campaign not found
- `400 Bad Request`: Count exceeds maximum (1000)

---

### 2. Homestay Registration (Field Staff)

#### 2.1 Register Single Homestay (Scan & Assign QR)

**Endpoint**: `POST /api/campaign/homestay/register`
**Auth**: Required (Field Staff)
**Purpose**: Scan pre-printed QR code and register homestay

**Request Body**:
```typescript
{
  qrCode: string;           // Required, UUID from scanned QR
  campaignId: number;       // Required
  name: string;             // Required, homestay name
  address: string;          // Required
  contactNumber: string;    // Required
  hostEmail?: string;       // Optional (at least one of email/phone required)
  hostPhone?: string;       // Optional
  assignedBy?: string;      // Optional, field staff name
  fieldNotes?: string;      // Optional, notes from field visit
}
```

**Example Request**:
```typescript
const response = await fetch('/api/campaign/homestay/register', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    qrCode: "550e8400-e29b-41d4-a716-446655440000",
    campaignId: 1,
    name: "Mountain View Homestay",
    address: "Pokhara, Kaski, Nepal",
    contactNumber: "+9779841234567",
    hostEmail: "host@example.com",
    assignedBy: "John Doe",
    fieldNotes: "Friendly host, 3 rooms available"
  })
});

const registration = await response.json();
```

**Response** (201 Created):
```json
{
  "id": 1,
  "campaignId": 1,
  "homestayId": 123,
  "qrCode": "550e8400-e29b-41d4-a716-446655440000",
  "qrCodeUrl": "https://s3.amazonaws.com/qr-codes/campaign-1-qr-1.png",
  "isActive": true,
  "assignedBy": "John Doe",
  "fieldNotes": "Friendly host, 3 rooms available",
  "scannedCount": 0,
  "reviewCount": 0,
  "createdAt": "2025-01-15T14:30:00.000Z",
  "homestay": {
    "id": 123,
    "name": "Mountain View Homestay",
    "address": "Pokhara, Kaski, Nepal",
    "contactNumber": "+9779841234567",
    "hostEmail": "host@example.com",
    "hostPhone": null,
    "status": "PENDING"
  },
  "campaign": {
    "id": 1,
    "name": "Summer 2025 Campaign",
    "discountPercentage": 15
  },
  "message": "Homestay registered successfully and linked to QR code"
}
```

**Error Responses**:
- `404 Not Found`: QR code not found (not pre-generated or invalid UUID)
- `409 Conflict`: QR code already assigned to another homestay
- `400 Bad Request`: Campaign not active or missing required contact info

**Use Case**:
1. Field staff opens mobile app
2. Scans pre-printed QR code sticker
3. App extracts UUID from scanned URL
4. Field staff enters homestay details
5. System assigns QR to homestay and activates it
6. Field staff places sticker at homestay

---

#### 2.2 Bulk Register Homestays

**Endpoint**: `POST /api/campaign/homestay/bulk-register`
**Auth**: Required (Field Staff)
**Purpose**: Register multiple homestays at once with pre-scanned QR codes

**Request Body**:
```typescript
{
  campaignId: number;    // Required
  assignedBy: string;    // Required, field staff name
  homestays: Array<{     // Required
    qrCode: string;      // Required, UUID
    name: string;        // Required
    address: string;     // Required
    contactNumber: string; // Required
    hostEmail?: string;
    hostPhone?: string;
  }>;
}
```

**Example Request**:
```typescript
const response = await fetch('/api/campaign/homestay/bulk-register', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    campaignId: 1,
    assignedBy: "Field Team Alpha",
    homestays: [
      {
        qrCode: "550e8400-e29b-41d4-a716-446655440001",
        name: "Sunrise Homestay",
        address: "Kathmandu, Nepal",
        contactNumber: "+9779841111111",
        hostEmail: "sunrise@example.com"
      },
      {
        qrCode: "550e8400-e29b-41d4-a716-446655440002",
        name: "Lake View Homestay",
        address: "Pokhara, Nepal",
        contactNumber: "+9779842222222",
        hostPhone: "+9779842222222"
      }
    ]
  })
});

const result = await response.json();
```

**Response** (201 Created):
```json
{
  "success": 2,
  "failed": 0,
  "message": "Successfully registered 2 out of 2 homestays",
  "results": [
    {
      "id": 1,
      "campaignId": 1,
      "homestayId": 124,
      "qrCode": "550e8400-e29b-41d4-a716-446655440001",
      // ... full homestay object
    },
    {
      "id": 2,
      "campaignId": 1,
      "homestayId": 125,
      "qrCode": "550e8400-e29b-41d4-a716-446655440002",
      // ... full homestay object
    }
  ],
  "errors": []
}
```

**Use Case**: Offline field work - staff collects data, then bulk uploads when online

---

#### 2.3 Get Campaign Homestays

**Endpoint**: `GET /api/campaign/:campaignId/homestays`
**Auth**: None (Public)
**Purpose**: List all homestays in a campaign

**Query Parameters**:
```typescript
{
  page?: number;        // Default: 1
  limit?: number;       // Default: 20, Max: 100
  isActive?: boolean;   // Filter by active status
  search?: string;      // Search homestay name
}
```

**Example Request**:
```typescript
const response = await fetch(
  '/api/campaign/1/homestays?page=1&limit=20&isActive=true&search=mountain'
);
const data = await response.json();
```

**Response** (200 OK):
```json
{
  "campaignHomestays": [
    {
      "id": 1,
      "qrCode": "550e8400-e29b-41d4-a716-446655440000",
      "qrCodeUrl": "https://s3.amazonaws.com/qr-codes/campaign-1-qr-1.png",
      "isActive": true,
      "scannedCount": 5,
      "reviewCount": 3,
      "assignedBy": "John Doe",
      "fieldNotes": "Friendly host, 3 rooms available",
      "homestay": {
        "id": 123,
        "name": "Mountain View Homestay",
        "address": "Pokhara, Nepal",
        "contactNumber": "+9779841234567",
        "rating": 4.5,
        "reviews": 3,
        "status": "ACTIVE"
      },
      "campaign": {
        "id": 1,
        "name": "Summer 2025 Campaign",
        "discountPercentage": 15
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

#### 2.4 Get Homestay by QR Code

**Endpoint**: `GET /api/campaign/qr/:qrCode`
**Auth**: None (Public)
**Purpose**: Get homestay information from QR code UUID

**Example Request**:
```typescript
const response = await fetch(
  '/api/campaign/qr/550e8400-e29b-41d4-a716-446655440000'
);
const homestay = await response.json();
```

**Response** (200 OK):
```json
{
  "id": 1,
  "qrCode": "550e8400-e29b-41d4-a716-446655440000",
  "isActive": true,
  "homestay": {
    "id": 123,
    "name": "Mountain View Homestay",
    "address": "Pokhara, Nepal",
    "contactNumber": "+9779841234567",
    "rating": 4.5,
    "reviews": 3,
    "images": [
      {
        "id": 1,
        "url": "https://s3.amazonaws.com/homestays/main.jpg",
        "isMain": true
      }
    ]
  },
  "campaign": {
    "id": 1,
    "name": "Summer 2025 Campaign",
    "description": "QR code campaign for unregistered homestays",
    "discountPercentage": 15,
    "discountValidDays": 30,
    "isActive": true
  }
}
```

**Error Responses**:
- `404 Not Found`: QR code not found
- `400 Bad Request`: QR code or campaign not active

---

### 3. Guest Review Submission Flow

#### 3.1 Track QR Scan (Initial Entry Point)

**Endpoint**: `POST /api/campaign/scan`
**Auth**: None (Public)
**Purpose**: Track when guest scans QR code and get homestay preview

**Request Body**:
```typescript
{
  qrCode: string;        // Required, UUID from scanned QR
  deviceInfo?: any;      // Optional, device metadata
}
```

**Example Request**:
```typescript
const response = await fetch('/api/campaign/scan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    qrCode: "550e8400-e29b-41d4-a716-446655440000",
    deviceInfo: {
      platform: navigator.platform,
      userAgent: navigator.userAgent
    }
  })
});

const data = await response.json();
```

**Response** (200 OK):
```json
{
  "qrCode": "550e8400-e29b-41d4-a716-446655440000",
  "homestay": {
    "id": 123,
    "name": "Mountain View Homestay",
    "address": "Pokhara, Nepal",
    "rating": 4.5,
    "reviews": 3,
    "images": [
      {
        "url": "https://s3.amazonaws.com/homestays/main.jpg"
      }
    ]
  },
  "campaign": {
    "id": 1,
    "name": "Summer 2025 Campaign",
    "description": "Share your experience and get 15% off your next booking!",
    "discountPercentage": 15,
    "discountValidDays": 30
  },
  "message": "QR code scanned successfully. Please verify your contact to continue."
}
```

**Side Effects**:
- Increments `scannedCount` for the campaign homestay
- Creates `CampaignQRScan` record for analytics
- Captures IP address and user-agent from request headers

**Error Responses**:
- `404 Not Found`: QR code not found
- `400 Bad Request`: Campaign or QR code not active, or campaign expired

---

#### 3.2 Verify User Contact & Send OTP

**Endpoint**: `POST /api/campaign/review/verify-user`
**Auth**: None (Public)
**Purpose**: Check if user exists and send OTP

**Request Body**:
```typescript
{
  qrCode: string;              // Required
  contact: string;             // Required, email or phone
  contactType: 'email' | 'phone'; // Required
}
```

**Example Request**:
```typescript
const response = await fetch('/api/campaign/review/verify-user', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    qrCode: "550e8400-e29b-41d4-a716-446655440000",
    contact: "user@example.com",
    contactType: "email"
  })
});

const result = await response.json();
```

**Response (User Exists)** (200 OK):
```json
{
  "userExists": true,
  "message": "OTP sent to your email",
  "contact": "user@example.com",
  "contactType": "email"
}
```

**Response (User Not Found)** (200 OK):
```json
{
  "userExists": false,
  "message": "User not found. Please sign up first.",
  "contact": "newuser@example.com",
  "contactType": "email"
}
```

**Side Effects (if user exists)**:
- Creates verification record with 6-digit OTP
- Sends OTP via email or SMS based on `contactType`
- OTP expires in 10 minutes

---

#### 3.3 Verify OTP (Existing Users)

**Endpoint**: `POST /api/campaign/review/verify-otp`
**Auth**: None (Public)
**Purpose**: Verify OTP for existing users

**Request Body**:
```typescript
{
  qrCode: string;    // Required
  contact: string;   // Required, email or phone
  code: string;      // Required, 6-digit OTP
}
```

**Example Request**:
```typescript
const response = await fetch('/api/campaign/review/verify-otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    qrCode: "550e8400-e29b-41d4-a716-446655440000",
    contact: "user@example.com",
    code: "123456"
  })
});

const result = await response.json();
```

**Response** (200 OK):
```json
{
  "userId": 42,
  "userName": "John Doe",
  "message": "Verification successful. You can now submit your review."
}
```

**Next Steps**:
- Frontend should prompt for password
- Call `/api/auth/login` to get JWT token
- Proceed to review form

**Error Responses**:
- `401 Unauthorized`: Invalid or expired OTP
- `401 Unauthorized`: User not found

---

#### 3.4 Complete Registration (New Users)

**Endpoint**: `POST /api/campaign/review/complete-registration`
**Auth**: None (Public)
**Purpose**: Register new user without leaving review flow

**Request Body**:
```typescript
{
  qrCode: string;              // Required
  contact: string;             // Required
  contactType: 'email' | 'phone'; // Required
  code: string;                // Required, 6-digit OTP
  name: string;                // Required
  password: string;            // Required, min 8 chars
}
```

**Example Request**:
```typescript
const response = await fetch('/api/campaign/review/complete-registration', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    qrCode: "550e8400-e29b-41d4-a716-446655440000",
    contact: "newuser@example.com",
    contactType: "email",
    code: "123456",
    name: "Jane Smith",
    password: "SecurePass123!"
  })
});

const result = await response.json();
```

**Response** (200 OK):
```json
{
  "userId": 43,
  "userName": "Jane Smith",
  "message": "Registration completed successfully. You can now submit your review.",
  "needsJWT": true
}
```

**Next Steps**:
- Frontend should call `/api/auth/login` with email/password to get JWT token
- Proceed to review form

**Side Effects**:
- Creates GUEST user with verified email or phone
- Deletes used verification token

**Error Responses**:
- `401 Unauthorized`: Invalid or expired OTP
- `409 Conflict`: User already exists (should login instead)

---

#### 3.5 Upload Review Images

**Endpoint**: `POST /api/campaign/review/upload-images`
**Auth**: Required (JWT)
**Purpose**: Upload photos before submitting review

**Request**: Multipart form data

**Example Request**:
```typescript
const formData = new FormData();
formData.append('images', file1);
formData.append('images', file2);
formData.append('images', file3);

const response = await fetch('/api/campaign/review/upload-images', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
```

**File Requirements**:
- Max 5 images
- Max 5MB per image
- Formats: JPEG, PNG, WebP only

**Response** (201 Created):
```json
{
  "message": "3 image(s) uploaded successfully",
  "imageUrls": [
    "https://s3.amazonaws.com/campaign-reviews/img1.jpg",
    "https://s3.amazonaws.com/campaign-reviews/img2.jpg",
    "https://s3.amazonaws.com/campaign-reviews/img3.jpg"
  ]
}
```

**Error Responses**:
- `400 Bad Request`: Files exceed limits or wrong format
- `401 Unauthorized`: Missing or invalid JWT token

---

#### 3.6 Submit Campaign Review

**Endpoint**: `POST /api/campaign/review/submit`
**Auth**: Required (JWT)
**Purpose**: Submit review and receive discount code

**Request Body**:
```typescript
{
  qrCode: string;        // Required, UUID
  rating: number;        // Required, 1-5 (allows decimals)
  description?: string;  // Optional
  checkInDate: string;   // Required, ISO date
  checkOutDate: string;  // Required, ISO date
  images?: string[];     // Optional, S3 URLs from upload-images
  deviceInfo?: any;      // Optional
}
```

**Example Request**:
```typescript
const response = await fetch('/api/campaign/review/submit', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    qrCode: "550e8400-e29b-41d4-a716-446655440000",
    rating: 4.5,
    description: "Wonderful stay! The hosts were incredibly welcoming and the views were breathtaking.",
    checkInDate: "2025-01-10",
    checkOutDate: "2025-01-13",
    images: [
      "https://s3.amazonaws.com/campaign-reviews/img1.jpg",
      "https://s3.amazonaws.com/campaign-reviews/img2.jpg"
    ],
    deviceInfo: {
      platform: navigator.platform
    }
  })
});

const result = await response.json();
```

**Response** (201 Created):
```json
{
  "review": {
    "id": 456,
    "campaignId": 1,
    "homestayId": 123,
    "userId": 42,
    "rating": 4.5,
    "description": "Wonderful stay! The hosts were incredibly welcoming...",
    "checkInDate": "2025-01-10T00:00:00.000Z",
    "checkOutDate": "2025-01-13T00:00:00.000Z",
    "isVerified": false,
    "isPublished": false,
    "createdAt": "2025-01-15T16:30:00.000Z",
    "images": [
      {
        "id": 1,
        "url": "https://s3.amazonaws.com/campaign-reviews/img1.jpg"
      },
      {
        "id": 2,
        "url": "https://s3.amazonaws.com/campaign-reviews/img2.jpg"
      }
    ],
    "user": {
      "id": 42,
      "name": "John Doe"
    }
  },
  "message": "Review submitted successfully! Thank you for your feedback.",
  "discountIssued": true,
  "discountCode": {
    "discountCode": "CAMPAIGN-A1B2C3D4",
    "discountPercent": 15,
    "expiresAt": "2025-02-14T16:30:00.000Z"
  }
}
```

**Side Effects**:
- Creates review (initially `isVerified=false`, `isPublished=false`)
- Increments review count for campaign homestay
- Creates discount code if campaign configured
- Sends discount via EMAIL if user has email
- Sends discount via SMS if user registered with phone only
- Sends thank you email to guest (if email available)
- Sends notification email to host (if host email available)
- Tracks IP address and device fingerprint for spam prevention

**Spam Prevention**:
- Per User: Maximum 1 review per homestay (checked by `userId` + `campaignHomestayId`)
- Per IP: Maximum 3 reviews per homestay per 24 hours

**Error Responses**:
- `409 Conflict`: Already submitted review for this homestay
- `400 Bad Request`: Too many reviews from same IP (max 3 per homestay per 24 hours)
- `400 Bad Request`: Invalid dates (check-out before check-in)
- `401 Unauthorized`: Missing or invalid JWT token

---

### 4. User Discount Management

#### 4.1 Get My Discount Codes

**Endpoint**: `GET /api/campaign/discounts/my`
**Auth**: Required (JWT)
**Purpose**: View user's discount codes

**Query Parameters**:
```typescript
{
  isUsed?: boolean;        // Filter by used/unused
  includeExpired?: boolean; // Default: false
}
```

**Example Request**:
```typescript
const response = await fetch(
  '/api/campaign/discounts/my?isUsed=false&includeExpired=false',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const discounts = await response.json();
```

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "discountCode": "CAMPAIGN-A1B2C3D4",
    "discountPercent": 15,
    "isUsed": false,
    "expiresAt": "2025-02-14T16:30:00.000Z",
    "createdAt": "2025-01-15T16:30:00.000Z",
    "campaign": {
      "id": 1,
      "name": "Summer 2025 Campaign"
    }
  },
  {
    "id": 2,
    "discountCode": "CAMPAIGN-X9Y8Z7W6",
    "discountPercent": 20,
    "isUsed": false,
    "expiresAt": "2025-03-01T10:00:00.000Z",
    "createdAt": "2025-02-01T10:00:00.000Z",
    "campaign": {
      "id": 2,
      "name": "Winter 2025 Campaign"
    }
  }
]
```

---

#### 4.2 Validate Discount Code

**Endpoint**: `POST /api/campaign/discounts/validate`
**Auth**: Required (JWT)
**Purpose**: Validate discount code when user applies it during booking

**Request Body**:
```typescript
{
  discountCode: string; // Required
}
```

**Example Request**:
```typescript
const response = await fetch('/api/campaign/discounts/validate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    discountCode: "CAMPAIGN-A1B2C3D4"
  })
});

const result = await response.json();
```

**Response** (200 OK):
```json
{
  "valid": true,
  "discount": {
    "id": 1,
    "discountCode": "CAMPAIGN-A1B2C3D4",
    "discountPercent": 15,
    "isUsed": false,
    "expiresAt": "2025-02-14T16:30:00.000Z",
    "campaign": {
      "id": 1,
      "name": "Summer 2025 Campaign"
    }
  }
}
```

**Validation Logic**:
- Code must exist
- Code must belong to the authenticated user
- Code must not be used
- Code must not be expired

**Error Responses**:
- `404 Not Found`: Discount code not found
- `401 Unauthorized`: Discount code belongs to another user
- `400 Bad Request`: Discount code already used
- `400 Bad Request`: Discount code expired

---

### 5. Admin Review Verification

#### 5.1 Get All Campaign Reviews

**Endpoint**: `GET /api/campaign/reviews/all`
**Auth**: Required (Admin)
**Purpose**: List all reviews with filters (for moderation)

**Query Parameters**:
```typescript
{
  page?: number;         // Default: 1
  limit?: number;        // Default: 20
  isVerified?: boolean;  // Filter by verification status
  isPublished?: boolean; // Filter by published status
  campaignId?: number;   // Filter by campaign
  homestayId?: number;   // Filter by homestay
}
```

**Example Request**:
```typescript
const response = await fetch(
  '/api/campaign/reviews/all?page=1&limit=20&isVerified=false&isPublished=false',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const data = await response.json();
```

**Response** (200 OK):
```json
{
  "reviews": [
    {
      "id": 456,
      "campaignId": 1,
      "homestayId": 123,
      "rating": 4.5,
      "description": "Wonderful stay! The hosts were incredibly welcoming...",
      "checkInDate": "2025-01-10T00:00:00.000Z",
      "checkOutDate": "2025-01-13T00:00:00.000Z",
      "isVerified": false,
      "isPublished": false,
      "ipAddress": "192.168.1.1",
      "deviceFingerprint": "42_Mozilla/5.0...",
      "createdAt": "2025-01-15T16:30:00.000Z",
      "user": {
        "id": 42,
        "name": "John Doe",
        "email": "user@example.com"
      },
      "campaign": {
        "id": 1,
        "name": "Summer 2025 Campaign"
      },
      "homestay": {
        "id": 123,
        "name": "Mountain View Homestay",
        "address": "Pokhara, Nepal"
      },
      "images": [
        {
          "id": 1,
          "url": "https://s3.amazonaws.com/campaign-reviews/img1.jpg"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

#### 5.2 Verify/Reject Review

**Endpoint**: `PUT /api/campaign/reviews/:reviewId/verify`
**Auth**: Required (Admin)
**Purpose**: Verify or reject review

**Request Body**:
```typescript
{
  isVerified: boolean;   // Required
  isPublished: boolean;  // Required (show publicly)
  adminNotes?: string;   // Optional, internal notes
}
```

**Example Request**:
```typescript
const response = await fetch('/api/campaign/reviews/456/verify', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    isVerified: true,
    isPublished: true,
    adminNotes: "Legitimate review, verified stay dates"
  })
});

const updatedReview = await response.json();
```

**Response** (200 OK):
```json
{
  "id": 456,
  "campaignId": 1,
  "homestayId": 123,
  "rating": 4.5,
  "description": "Wonderful stay!...",
  "isVerified": true,
  "isPublished": true,
  "verifiedAt": "2025-01-16T10:00:00.000Z",
  "verifiedBy": 1,
  "adminNotes": "Legitimate review, verified stay dates",
  // ... rest of review object
}
```

**Side Effects**:
- If verified and published: Updates homestay overall rating
- Sets `verifiedAt` timestamp and `verifiedBy` admin ID

**Error Responses**:
- `404 Not Found`: Review not found
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User is not an admin

---

### 6. Host Review Responses

#### 6.1 Get Reviews for My Homestays

**Endpoint**: `GET /api/campaign/reviews/all?homestayId={myHomestayId}`
**Auth**: None (Public endpoint)
**Purpose**: View reviews for host's homestays

**Note**: Host filters by their homestay ID. Frontend should get homestay IDs from user profile.

**Example Request**:
```typescript
const response = await fetch('/api/campaign/reviews/all?homestayId=123');
const data = await response.json();
```

---

#### 6.2 Respond to Review

**Endpoint**: `PUT /api/campaign/reviews/:reviewId/respond`
**Auth**: Required (Host JWT)
**Purpose**: Host responds to guest review

**Request Body**:
```typescript
{
  response: string; // Required, 10-1000 chars
}
```

**Example Request**:
```typescript
const response = await fetch('/api/campaign/reviews/456/respond', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    response: "Thank you for your wonderful feedback! We're so glad you enjoyed your stay. We hope to welcome you back soon!"
  })
});

const updatedReview = await response.json();
```

**Response** (200 OK):
```json
{
  "id": 456,
  "rating": 4.5,
  "description": "Wonderful stay!...",
  "hostResponse": "Thank you for your wonderful feedback!...",
  "hostResponseAt": "2025-01-16T11:00:00.000Z",
  "user": {
    "id": 42,
    "name": "John Doe"
  }
}
```

**Error Responses**:
- `403 Forbidden`: Not authorized (host doesn't own this homestay)
- `404 Not Found`: Review not found
- `401 Unauthorized`: Missing or invalid JWT token

---

## Complete User Flow Examples

### ADMIN PRE-CAMPAIGN SETUP

```typescript
// 1. Create campaign
const campaign = await fetch('/api/campaign', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "Summer 2025 Campaign",
    startDate: "2025-06-01T00:00:00Z",
    endDate: "2025-08-31T23:59:59Z",
    discountPercentage: 15,
    discountValidDays: 30
  })
}).then(r => r.json());

// 2. Generate 500 QR codes
const qrData = await fetch('/api/campaign/qr-codes/generate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    campaignId: campaign.id,
    count: 500
  })
}).then(r => r.json());

// 3. Download QR code images
qrData.qrCodes.forEach(async (qr, index) => {
  const response = await fetch(qr.qrCodeUrl);
  const blob = await response.blob();
  // Save blob as file for printing
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `qr-${index + 1}.png`;
  a.click();
});

// 4. Print QR stickers
// 5. Distribute to field staff
```

---

### FIELD STAFF REGISTRATION

```typescript
// 1. Scan QR code with device camera
// Camera app opens: https://nepalhomestays.com/review/550e8400-...

// 2. Extract UUID from URL
const url = new URL(scannedUrl);
const qrCode = url.pathname.split('/').pop();

// 3. Register homestay
const registration = await fetch('/api/campaign/homestay/register', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${fieldStaffToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    qrCode,
    campaignId: 1,
    name: "Mountain View Homestay",
    address: "Pokhara, Nepal",
    contactNumber: "+9779841234567",
    hostEmail: "host@example.com",
    assignedBy: "Field Team Alpha",
    fieldNotes: "3 rooms, lake view"
  })
}).then(r => r.json());

// 4. System activates QR code
// 5. Staff places sticker at homestay
```

---

### GUEST REVIEW SUBMISSION

```typescript
// 1. Guest scans QR sticker at homestay
// 2. Camera opens URL, redirects to frontend

// 3. Frontend tracks scan
const scanData = await fetch('/api/campaign/scan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    qrCode: "550e8400-e29b-41d4-a716-446655440000",
    deviceInfo: { platform: navigator.platform }
  })
}).then(r => r.json());

// 4. Show homestay preview and ask for email/phone
const email = prompt("Enter your email");

// 5. Verify user and send OTP
const verification = await fetch('/api/campaign/review/verify-user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    qrCode: "550e8400-e29b-41d4-a716-446655440000",
    contact: email,
    contactType: "email"
  })
}).then(r => r.json());

if (!verification.userExists) {
  // NEW USER FLOW
  const otp = prompt("Enter OTP sent to your email");
  const name = prompt("Enter your name");
  const password = prompt("Create a password");

  await fetch('/api/campaign/review/complete-registration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      qrCode: "550e8400-e29b-41d4-a716-446655440000",
      contact: email,
      contactType: "email",
      code: otp,
      name,
      password
    })
  }).then(r => r.json());

  // Login to get JWT
  const auth = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }).then(r => r.json());

  token = auth.accessToken;
} else {
  // EXISTING USER FLOW
  const otp = prompt("Enter OTP sent to your email");

  await fetch('/api/campaign/review/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      qrCode: "550e8400-e29b-41d4-a716-446655440000",
      contact: email,
      code: otp
    })
  }).then(r => r.json());

  const password = prompt("Enter your password");

  const auth = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }).then(r => r.json());

  token = auth.accessToken;
}

// 6. Upload photos (optional)
const formData = new FormData();
photos.forEach(photo => formData.append('images', photo));

const uploadResult = await fetch('/api/campaign/review/upload-images', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
}).then(r => r.json());

// 7. Submit review
const review = await fetch('/api/campaign/review/submit', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    qrCode: "550e8400-e29b-41d4-a716-446655440000",
    rating: 4.5,
    description: "Amazing stay!",
    checkInDate: "2025-01-10",
    checkOutDate: "2025-01-13",
    images: uploadResult.imageUrls
  })
}).then(r => r.json());

// 8. Show success message with discount code
if (review.discountIssued) {
  console.log(`Your discount code: ${review.discountCode.discountCode}`);
  console.log(`${review.discountCode.discountPercent}% off`);
  console.log(`Expires: ${review.discountCode.expiresAt}`);
}

// 9. Check email/SMS for discount code
// 10. View in profile
const myDiscounts = await fetch('/api/campaign/discounts/my', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());
```

---

## TypeScript Type Definitions

```typescript
// Campaign Types
interface Campaign {
  id: number;
  name: string;
  description: string | null;
  qrCodeTemplate: string | null;
  isActive: boolean;
  startDate: Date;
  endDate: Date | null;
  discountPercentage: number | null;
  discountValidDays: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CampaignHomestay {
  id: number;
  campaignId: number;
  homestayId: number | null;
  qrCode: string;
  qrCodeUrl: string;
  isActive: boolean;
  assignedBy: string | null;
  fieldNotes: string | null;
  scannedCount: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CampaignReview {
  id: number;
  campaignId: number;
  campaignHomestayId: number;
  homestayId: number;
  userId: number;
  rating: number;
  description: string | null;
  checkInDate: Date;
  checkOutDate: Date;
  isVerified: boolean;
  isPublished: boolean;
  verifiedAt: Date | null;
  verifiedBy: number | null;
  adminNotes: string | null;
  hostResponse: string | null;
  hostResponseAt: Date | null;
  ipAddress: string;
  deviceFingerprint: string;
  deviceInfo: any;
  createdAt: Date;
  updatedAt: Date;
}

interface CampaignDiscount {
  id: number;
  userId: number;
  campaignId: number;
  discountCode: string;
  discountPercent: number;
  isUsed: boolean;
  usedAt: Date | null;
  bookingId: number | null;
  expiresAt: Date;
  createdAt: Date;
}

// Request DTOs
interface CreateCampaignRequest {
  name: string;
  description?: string;
  qrCodeTemplate?: string;
  startDate: string;
  endDate?: string;
  discountPercentage?: number;
  discountValidDays?: number;
}

interface RegisterHomestayRequest {
  qrCode: string;
  campaignId: number;
  name: string;
  address: string;
  contactNumber: string;
  hostEmail?: string;
  hostPhone?: string;
  assignedBy?: string;
  fieldNotes?: string;
}

interface SubmitReviewRequest {
  qrCode: string;
  rating: number;
  description?: string;
  checkInDate: string;
  checkOutDate: string;
  images?: string[];
  deviceInfo?: any;
}

// Response DTOs
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

---

## Error Handling

### Standard Error Response Format

```typescript
interface ErrorResponse {
  status: 'error';
  message: string;
  errors?: Array<{
    property: string;
    constraints: Record<string, string>;
  }>;
  statusCode?: number;
}
```

### Common HTTP Status Codes

- `200 OK`: Success
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: User lacks required permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (duplicate, already exists)
- `500 Internal Server Error`: Server error

### Example Error Handling

```typescript
try {
  const response = await fetch('/api/campaign', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(campaignData)
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();

    if (error.errors) {
      // Validation errors
      error.errors.forEach(err => {
        console.error(`${err.property}: ${Object.values(err.constraints).join(', ')}`);
      });
    } else {
      // Generic error
      console.error(error.message);
    }

    throw new Error(error.message);
  }

  const campaign = await response.json();
  return campaign;
} catch (error) {
  console.error('Failed to create campaign:', error);
  throw error;
}
```

---

## Testing Checklist

### Admin Panel
- [ ] Create campaign
- [ ] View campaign list
- [ ] Edit campaign (activate/deactivate, change discount)
- [ ] Delete campaign
- [ ] Generate bulk QR codes
- [ ] Download QR code images from S3
- [ ] View campaign homestays
- [ ] View all reviews (pending moderation)
- [ ] Verify/reject reviews
- [ ] See published reviews update homestay rating

### Field Staff Mobile App
- [ ] QR code scanner functionality
- [ ] Extract UUID from scanned URL
- [ ] Register homestay form
- [ ] Bulk registration upload
- [ ] Offline data collection
- [ ] Auto-sync when online

### Guest Review Flow
- [ ] QR scan tracking
- [ ] Contact entry (email/phone)
- [ ] OTP verification (existing user)
- [ ] New user registration
- [ ] Photo upload (max 5, 5MB each)
- [ ] Review form submission
- [ ] Discount code display
- [ ] Email/SMS discount delivery
- [ ] View discount codes in profile

### Host Dashboard
- [ ] View reviews for my homestays
- [ ] Respond to reviews
- [ ] See review response publicly

### Edge Cases
- [ ] Expired campaign
- [ ] Inactive QR code
- [ ] Duplicate review prevention
- [ ] IP-based spam prevention (max 3 per 24h)
- [ ] Invalid OTP
- [ ] Expired OTP (10 minutes)
- [ ] Invalid discount code
- [ ] Expired discount code
- [ ] Already used discount code
- [ ] Check-out date before check-in date

---

## Security Considerations

1. **Rate Limiting**: Implement rate limiting on all public endpoints
2. **JWT Validation**: Verify JWT tokens on all protected endpoints
3. **Role-Based Access**: Enforce role checks (Admin, Host, Field Staff, Guest)
4. **Input Validation**: Validate all inputs using Zod schemas
5. **XSS Prevention**: Sanitize user-generated content (review descriptions, host responses)
6. **SQL Injection**: Use parameterized queries (handled by Prisma ORM)
7. **File Upload Security**:
   - Validate file types (JPEG, PNG, WebP only)
   - Enforce file size limits (5MB max)
   - Scan for malware before S3 upload
8. **Spam Prevention**:
   - Track IP addresses
   - Device fingerprinting
   - Maximum 3 reviews per IP per homestay per 24 hours
9. **OTP Security**:
   - 10-minute expiration
   - One-time use only
   - Secure random generation

---

## Performance Optimization

1. **Pagination**: All list endpoints support pagination (default 20 items)
2. **Database Indexing**: Index on frequently queried fields (qrCode, userId, campaignId)
3. **Caching**: Consider caching campaign details and public homestay data
4. **CDN**: Serve QR code images and review photos via CDN
5. **Lazy Loading**: Load images progressively in review lists
6. **Background Jobs**:
   - Send emails/SMS asynchronously
   - Generate QR codes in batches
   - Update homestay ratings in background

---

## Notification Templates

### Email: Discount Code
**Subject**: Your 15% Discount Code from Nepal Homestays
**Body**:
```
Dear {guestName},

Thank you for sharing your review! Here's your exclusive discount code:

Discount Code: {discountCode}
Discount: {discountPercent}% off
Valid Until: {expiresAt}

Use this code on your next booking at Nepal Homestays.

Happy travels!
Nepal Homestays Team
```

### Email: Thank You for Review
**Subject**: Thank You for Your Review!
**Body**:
```
Dear {guestName},

Thank you for taking the time to review {homestayName}. Your feedback helps other travelers make informed decisions.

Your review is currently under moderation and will be published within 24 hours.

{if discountIssued}
We've sent your {discountPercent}% discount code in a separate email.
{endif}

Best regards,
Nepal Homestays Team
```

### Email: Host Notification
**Subject**: New Review Received - {homestayName}
**Body**:
```
Dear {hostName},

You've received a new review for {homestayName} via the {campaignName}.

Guest: {guestName}
Rating: {rating}/5
Check-in: {checkInDate}
Check-out: {checkOutDate}

"{description}"

The review is under moderation and will be published once verified.

You can respond to this review once it's published.

Best regards,
Nepal Homestays Team
```

### SMS: Discount Code
**Message**:
```
Nepal Homestays: Thank you for your review! Your discount code: {discountCode} ({discountPercent}% off, valid until {expiresAt}). Book now!
```

### SMS: OTP
**Message**:
```
Your Nepal Homestays verification code is: {otpCode}. Valid for 10 minutes. Do not share this code.
```

---

## Deployment Notes

### Environment Variables Required

```bash
# Backend API
API_BASE_URL=http://13.61.8.56:3001

# S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=nepal-homestays

# Email Configuration (SendGrid/AWS SES)
EMAIL_FROM=noreply@nepalhomestays.com
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=xxx

# SMS Configuration (Twilio/AWS SNS)
SMS_SERVICE=twilio
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1234567890

# Frontend URL
NEXT_PUBLIC_APP_URL=https://nepalhomestays.com

# JWT Secret
JWT_SECRET=xxx
```

### Database Migrations

Ensure all Prisma migrations are run:
```bash
npx prisma migrate deploy
```

### S3 Bucket Structure

```
nepal-homestays/
├── qr-codes/
│   ├── campaign-1-qr-1.png
│   ├── campaign-1-qr-2.png
│   └── ...
├── campaign-reviews/
│   ├── user-42-img-1.jpg
│   ├── user-42-img-2.jpg
│   └── ...
└── homestays/
    └── ...
```

---

## Support

For questions or issues with the Campaign API:
- Email: support@nepalhomestays.com
- Documentation: https://docs.nepalhomestays.com/campaign-api
- GitHub Issues: https://github.com/nepalhomestays/api/issues

---

**Last Updated**: 2025-01-15
**API Version**: 1.0.0
**Maintained By**: Nepal Homestays Development Team
