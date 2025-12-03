# Host Dashboard API Integration

Comprehensive integration of the host dashboard backend APIs into the Nepal Homestays frontend.

## 📁 Files Created

### 1. Type Definitions
**File:** `src/types/host-dashboard.ts`

Complete TypeScript type definitions for all host dashboard DTOs including:
- Dashboard overview types (revenue stats, booking stats, homestay stats)
- Booking management types (bookings, pagination, filters, cancellation)
- Review management types
- Refund types
- Homestay and room management types
- Master data types (facilities, bed types, currencies, area units)

### 2. API Client
**File:** `src/lib/api/host-dashboard-api.ts`

Comprehensive API client with methods for all backend endpoints:

#### Dashboard Endpoints
- `getDashboard()` - Get host dashboard overview with stats

#### Booking Management
- `getBookings(query)` - Get paginated bookings with filters
- `getBookingDetails(id)` - Get detailed booking information
- `cancelBooking(id, dto)` - Cancel a booking (host-initiated)
- `updateBookingStatus(id, dto)` - Update booking status
- `confirmBooking(id)` - Confirm a pending booking

#### Review Management
- `getReviews(query)` - Get all reviews with filtering
- `getHomestayReviews(homestayId)` - Get reviews for specific homestay
- `respondToReview(reviewId, response)` - Respond to a guest review

#### Refund Management
- `getRefunds(page, limit)` - Get all refunds for host's bookings

#### Homestay Management
- `getHomestays()` - Get all homestays owned by host
- `getHomestayDetails(id)` - Get detailed homestay information
- `updateHomestay(id, dto, files)` - Update homestay with file upload

#### Room Management
- `getHomestayRooms(homestayId)` - Get all rooms for a homestay
- `getRoomDetails(roomId)` - Get room details
- `createRoom(homestayId, dto, files)` - Create new room with images
- `updateRoom(roomId, dto, files)` - Update room details
- `deleteRoom(roomId)` - Delete a room

#### Master Data
- `getFacilities()` - Get available facilities
- `getBedTypes()` - Get available bed types
- `getCurrencies()` - Get available currencies
- `getAreaUnits()` - Get available area units

### 3. Dashboard Layout
**File:** `src/app/host/new-dashboard/layout.tsx`

Features:
- ✅ Responsive sidebar navigation
- ✅ Mobile-friendly with hamburger menu
- ✅ Active route highlighting
- ✅ Quick access to all dashboard sections
- ✅ Link to old dashboard
- ✅ Nepal Homestays branding

### 4. Dashboard Pages

#### Main Dashboard
**File:** `src/app/host/new-dashboard/page.tsx`

Features:
- ✅ Revenue statistics with growth percentage
- ✅ Booking statistics (total, pending, confirmed, cancelled)
- ✅ Property cards with occupancy rates and ratings
- ✅ Pending bookings alert
- ✅ Recent bookings table
- ✅ Responsive design with Tailwind CSS
- ✅ Real-time data loading with error handling

#### Bookings List Page
**File:** `src/app/host/new-dashboard/bookings/page.tsx`

Features:
- ✅ Paginated bookings list with 10 items per page
- ✅ Status filters (All, Pending, Confirmed, Cancelled)
- ✅ Quick confirm action for pending bookings
- ✅ View booking details link
- ✅ Guest information display
- ✅ Check-in/check-out dates
- ✅ Amount and payment status
- ✅ Responsive table design
- ✅ Previous/Next pagination

#### Booking Details Page
**File:** `src/app/host/new-dashboard/bookings/[id]/page.tsx`

Features:
- ✅ Complete booking information
- ✅ Guest contact details (email, phone)
- ✅ Property and room details
- ✅ Stay duration and dates
- ✅ Payment history with transaction IDs
- ✅ Price summary with remaining balance
- ✅ Booking timeline (created, updated)
- ✅ Confirm pending bookings
- ✅ Cancel booking with reason (modal)
- ✅ Auto-refund on cancellation
- ✅ Cancellation restrictions display
- ✅ Status-based action buttons

#### Reviews Management Page
**File:** `src/app/host/new-dashboard/reviews/page.tsx`

Features:
- ✅ Paginated reviews list
- ✅ Filter by minimum rating (All, 5+, 4+, 3+)
- ✅ Star rating display
- ✅ Guest names and stay dates
- ✅ Review comments
- ✅ Property and room information
- ✅ Respond to reviews inline
- ✅ Response text validation (min 10 chars)
- ✅ Guest notification on response
- ✅ Stay period information

#### Homestays List Page
**File:** `src/app/host/new-dashboard/homestays/page.tsx`

Features:
- ✅ Grid view of all properties
- ✅ Property images (main image display)
- ✅ Status badges (Approved, Pending, Rejected)
- ✅ Property address with map pin icon
- ✅ Room count and review count
- ✅ Star ratings display
- ✅ Created date
- ✅ View details button
- ✅ Quick edit link
- ✅ Add new property button
- ✅ Empty state for no properties

#### Refunds View Page
**File:** `src/app/host/new-dashboard/refunds/page.tsx`

Features:
- ✅ Paginated refunds table
- ✅ Refund ID and booking reference
- ✅ Property name display
- ✅ Amount and currency
- ✅ Refund reason (guest/host initiated)
- ✅ Admin notes display
- ✅ Status with color-coded badges
- ✅ Status icons (pending, approved, processed, rejected)
- ✅ Processed by admin name
- ✅ Created and updated dates
- ✅ Link to original booking
- ✅ Information about refund process

## 🎨 Design Features

### Color Scheme
- Primary: `#214B3F` (Dark green - consistent with brand)
- Success: Green variants
- Warning: Yellow variants
- Error: Red variants
- Info: Blue variants

### Components
- Stats cards with icons and trend indicators
- Property cards with status badges
- Responsive tables with hover effects
- Filter buttons with active states
- Loading states with spinners
- Empty states with helpful messages
- Pagination controls

## 🚀 Usage

### Accessing the New Dashboard

```typescript
// Navigate to the new dashboard
router.push('/host/new-dashboard');

// Navigate to bookings
router.push('/host/new-dashboard/bookings');

// Navigate to bookings with status filter
router.push('/host/new-dashboard/bookings?status=PENDING');
```

### Using the API Client

```typescript
import { hostDashboardApi } from '@/lib/api/host-dashboard-api';

// Get dashboard data
const dashboard = await hostDashboardApi.getDashboard();

// Get bookings with filters
const bookings = await hostDashboardApi.getBookings({
  page: 1,
  limit: 10,
  status: 'PENDING',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
});

// Confirm a booking
const result = await hostDashboardApi.confirmBooking(123);

// Cancel a booking
const cancellation = await hostDashboardApi.cancelBooking(123, {
  reason: 'Property maintenance required',
});

// Get homestays
const homestays = await hostDashboardApi.getHomestays();

// Update homestay
const updated = await hostDashboardApi.updateHomestay(1, {
  name: 'Updated Name',
  description: 'New description',
  facilityIds: [1, 2, 3],
}, imageFiles);
```

## 📊 API Endpoints Integrated

### Dashboard
- `GET /host-dashboard` - Dashboard overview

### Bookings
- `GET /host-dashboard/bookings` - List bookings
- `GET /host-dashboard/bookings/{id}` - Booking details
- `POST /host-dashboard/bookings/{id}/cancel` - Cancel booking
- `PATCH /host-dashboard/bookings/{id}/status` - Update status
- `POST /host-dashboard/bookings/{id}/confirm` - Confirm booking

### Reviews
- `GET /host-dashboard/reviews` - List reviews
- `GET /host-dashboard/homestays/{id}/reviews` - Homestay reviews
- `POST /host-dashboard/reviews/{id}/response` - Respond to review

### Refunds
- `GET /host-dashboard/refunds` - List refunds

### Homestays
- `GET /host-dashboard/homestays` - List homestays
- `GET /host-dashboard/homestays/{id}` - Homestay details
- `PATCH /host-dashboard/homestays/{id}` - Update homestay

### Rooms
- `GET /host-dashboard/homestays/{id}/rooms` - List rooms
- `GET /host-dashboard/rooms/{id}` - Room details
- `POST /host-dashboard/homestays/{id}/rooms` - Create room
- `PATCH /host-dashboard/rooms/{id}` - Update room
- `DELETE /host-dashboard/rooms/{id}` - Delete room

### Master Data
- `GET /host-dashboard/master-data/facilities` - List facilities
- `GET /host-dashboard/master-data/bed-types` - List bed types
- `GET /host-dashboard/master-data/currencies` - List currencies
- `GET /host-dashboard/master-data/area-units` - List area units

## 🔐 Authentication

All API calls automatically include JWT authentication using `next-auth`:
- Retrieves access token from session
- Adds `Authorization: Bearer {token}` header
- Handles authentication errors
- Shows appropriate error messages to users

## 🎯 Implementation Status

### ✅ Completed Pages

1. **✅ Main Dashboard** - Overview with stats and recent activity
2. **✅ Bookings List** - Paginated list with filters
3. **✅ Booking Details** - Full details with cancel/confirm actions
4. **✅ Reviews Management** - View and respond to reviews
5. **✅ Homestays List** - Grid view of all properties
6. **✅ Refunds View** - Track all refund requests
7. **✅ Navigation Layout** - Sidebar with responsive mobile menu

### 🔜 Optional Enhancements (Can Be Added Later)

1. **Homestay Details Page** (`/host/new-dashboard/homestays/[id]/page.tsx`)
   - Full homestay information with analytics
   - Edit form with validation
   - Room management interface
   - Reviews for this specific homestay
   - Booking history and calendar
   - Revenue analytics

2. **Rooms Management** (`/host/new-dashboard/rooms/page.tsx`)
   - List all rooms across properties
   - Quick edit capabilities
   - Add new room with image upload
   - Delete room with confirmation
   - Room availability calendar

3. **Analytics Dashboard**
   - Revenue charts and trends
   - Occupancy rate graphs
   - Booking conversion rates
   - Guest demographics
   - Peak seasons analysis

## 🛠️ Technical Implementation

### Error Handling
- Try-catch blocks for all API calls
- User-friendly error messages via toast notifications
- Loading states during API calls
- Fallback UI for empty states

### Data Fetching
- Client-side fetching with `useEffect`
- Automatic refetch after mutations
- Session-based authentication
- Redirect to login if unauthenticated

### Type Safety
- Full TypeScript type definitions
- Type-safe API client methods
- Proper typing for all components
- Enum usage for status values

### Performance
- Pagination for large lists (10 items per page)
- Lazy loading with loading states
- Optimistic UI updates where possible
- Efficient re-renders

## 📱 Responsive Design

All pages are fully responsive:
- Mobile: Single column layout, simplified tables
- Tablet: 2-column grid for cards
- Desktop: 3-4 column grid for optimal space usage
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

## 🎨 UI Components Used

- Tailwind CSS for styling
- Lucide React for icons
- Custom StatsCard component
- Filter buttons with active states
- Table with hover effects
- Pagination controls
- Status badges with color coding
- Loading spinners
- Empty state illustrations

## 🔄 State Management

- React hooks (`useState`, `useEffect`)
- URL search params for filters
- Local state for UI interactions
- Toast notifications for user feedback

## ✅ Validation

- Client-side validation before API calls
- Server-side error handling
- Type checking with TypeScript
- Form validation (when forms are added)

## 📝 Code Quality

- ✅ Consistent naming conventions
- ✅ Proper code organization
- ✅ Comments where needed
- ✅ Reusable components
- ✅ Type-safe throughout
- ✅ Error boundaries
- ✅ Loading states
- ✅ Empty states

## 🌟 Features Highlights

1. **Real-time Dashboard** - Live stats with growth indicators
2. **Quick Actions** - Confirm bookings directly from list
3. **Smart Filters** - Filter bookings by status easily
4. **Responsive Tables** - Works on all screen sizes
5. **Property Overview** - See all properties at a glance
6. **Occupancy Tracking** - Monitor property performance
7. **Revenue Analytics** - Track earnings and growth
8. **Guest Management** - View and manage guest information

## 🔜 Future Enhancements

- [ ] Advanced filters (date range, guest name search)
- [ ] Export bookings to CSV/Excel
- [ ] Calendar view for bookings
- [ ] Revenue charts and analytics
- [ ] Email templates for guest communication
- [ ] Bulk operations on bookings
- [ ] Mobile app support
- [ ] Push notifications for new bookings
- [ ] Multi-language support
- [ ] Dark mode

## 📞 Support

For issues or questions about the host dashboard integration:
1. Check the API documentation in the backend code
2. Review the type definitions for expected data structures
3. Test API endpoints directly if issues persist
4. Check network tab for failed requests

---

**Created:** December 3, 2024
**Version:** 1.0.0
**Author:** Nepal Homestays Development Team
