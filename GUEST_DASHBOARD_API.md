# Guest Dashboard API Integration

This document describes the integration between the frontend guest dashboard and the backend API.

## Architecture

The guest dashboard uses a proxy pattern to communicate with the backend:

```
Frontend (Client) → Next.js API Proxy → Backend API
```

### Components

1. **Frontend UI**: `/src/app/guest/dashboard/**/*.tsx`
2. **API Client**: `/src/lib/api/guest-dashboard-api.ts`
3. **API Proxy**: `/src/app/api/backend/[...path]/route.ts`
4. **Types**: `/src/types/guest-dashboard.ts`

## API Endpoints

All guest dashboard endpoints are proxied through `/api/backend/guest-dashboard/*`

### Dashboard Overview
- **GET** `/api/backend/guest-dashboard`
  - Returns dashboard overview with stats, recent bookings, and upcoming bookings

### Bookings
- **GET** `/api/backend/guest-dashboard/bookings`
  - Query params: `page`, `limit`, `status`, `startDate`, `endDate`
  - Returns paginated list of bookings

- **GET** `/api/backend/guest-dashboard/bookings/:id`
  - Returns detailed booking information

- **POST** `/api/backend/guest-dashboard/bookings/:id/cancel`
  - Cancels a booking

- **GET** `/api/backend/guest-dashboard/bookings/:id/receipt`
  - Returns booking receipt/invoice

### Reviews
- **POST** `/api/backend/guest-dashboard/bookings/:id/review`
  - Submit a review for a booking
  - Body: `{ rating: number, comment?: string }`

- **GET** `/api/backend/guest-dashboard/reviews`
  - Get all reviews written by the guest

### Favorites
- **POST** `/api/backend/guest-dashboard/favorites/:homestayId`
  - Add homestay to favorites

- **GET** `/api/backend/guest-dashboard/favorites`
  - Get all favorite homestays

- **DELETE** `/api/backend/guest-dashboard/favorites/:homestayId`
  - Remove homestay from favorites

### Refunds
- **POST** `/api/backend/guest-dashboard/bookings/:id/refund`
  - Request refund for a cancelled booking
  - Body: `{ amount: number, currency?: string, reason: string }`

- **GET** `/api/backend/guest-dashboard/refunds`
  - Query params: `page`, `limit`
  - Get all refund requests

## Authentication

All requests require a valid JWT access token from NextAuth session. The proxy automatically:
1. Retrieves the session using `getServerSession()`
2. Extracts the `accessToken`
3. Adds `Authorization: Bearer <token>` header to backend requests

## Usage Example

```typescript
import { guestDashboardApi } from '@/lib/api/guest-dashboard-api';

// Get dashboard data
const dashboard = await guestDashboardApi.getDashboard();

// Get bookings with filters
const bookings = await guestDashboardApi.getBookings({
  page: 1,
  limit: 10,
  status: 'CONFIRMED'
});

// Cancel a booking
const result = await guestDashboardApi.cancelBooking(bookingId);
```

## Error Handling

The API client throws errors with descriptive messages. Errors should be caught and handled in the UI:

```typescript
try {
  const dashboard = await guestDashboardApi.getDashboard();
  setDashboard(dashboard);
} catch (error: any) {
  toast({
    title: "Error",
    description: error.message || "Failed to load dashboard",
    variant: "destructive",
  });
}
```

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_BACKEND_URL=http://13.61.8.56:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## Development

To test the API integration:

1. Ensure the backend is running at `http://13.61.8.56:3001`
2. Sign in as a guest user
3. Navigate to `/guest/dashboard`
4. Check browser console for API calls and responses

## Backend API Documentation

The backend API is documented with Swagger/OpenAPI at:
```
http://13.61.8.56:3001/api-docs
```

## Type Safety

All API responses are typed using TypeScript interfaces defined in:
- `/src/types/guest-dashboard.ts`

Types are automatically validated by TypeScript compiler to ensure type safety between frontend and backend.
