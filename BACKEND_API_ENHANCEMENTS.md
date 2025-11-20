# Backend API Enhancements for Admin Panels

## Current Issue
The Last Minute Deals and Top Homestays admin endpoints return minimal homestay data, making it difficult to display comprehensive information in the admin panel.

## Required Backend Changes

### 1. Last Minute Deals API Enhancement

**Endpoint:** `GET /admin/last-minute-deals`

**Current Response (Assumed):**
```json
{
  "data": [
    {
      "id": 1,
      "discount": 20,
      "discountType": "PERCENTAGE",
      "startDate": "2025-11-20T00:00:00.000Z",
      "endDate": "2025-11-30T00:00:00.000Z",
      "isActive": true,
      "description": "Holiday special",
      "homestayId": 406,
      "homestay": {
        "name": "Mount Fuji Homestay",
        "images": [{"url": "...", "isMain": true}]
      }
    }
  ]
}
```

**Required Enhanced Response:**
```json
{
  "data": [
    {
      "id": 1,
      "discount": 20,
      "discountType": "PERCENTAGE",
      "startDate": "2025-11-20T00:00:00.000Z",
      "endDate": "2025-11-30T00:00:00.000Z",
      "isActive": true,
      "description": "Holiday special",
      "homestayId": 406,
      "homestay": {
        "id": 406,
        "name": "Mount Fuji Homestay",
        "address": "Pokhara, Nepal",
        "description": "Enjoy quiet mornings with mountain views...",
        "status": "APPROVED",
        "rating": 4.5,
        "reviews": 12,
        "images": [
          {
            "id": 466,
            "url": "https://...",
            "isMain": true
          }
        ],
        "rooms": [
          {
            "id": 420,
            "name": "Deluxe room",
            "price": 2600,
            "currency": "NPR",
            "maxOccupancy": 2,
            "minOccupancy": 1
          }
        ],
        "facilities": [
          {
            "homestayId": 406,
            "facilityId": 18,
            "facility": {
              "id": 18,
              "name": "Geyser"
            }
          }
        ],
        "owner": {
          "id": 5,
          "name": "Dipesh Rai",
          "email": "sardulb91@gmail.com"
        }
      }
    }
  ]
}
```

**Backend Implementation (Example - NestJS/Prisma):**
```typescript
// In your last-minute-deals service
async findAll(params: any) {
  return await this.prisma.lastMinuteDeal.findMany({
    where: { /* your filters */ },
    include: {
      homestay: {
        include: {
          images: {
            where: { isMain: true },
            take: 5
          },
          rooms: {
            select: {
              id: true,
              name: true,
              price: true,
              currency: true,
              maxOccupancy: true,
              minOccupancy: true
            }
          },
          facilities: {
            include: {
              facility: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            take: 5
          },
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}
```

### 2. Top Homestays API Enhancement

**Endpoint:** `GET /admin/top-homestays`

**Current Response (Assumed):**
```json
{
  "data": [
    {
      "id": 1,
      "strategy": "MANUAL",
      "category": "editor_choice",
      "priority": 1,
      "isActive": true,
      "homestayId": 406,
      "homestay": {
        "name": "Mount Fuji Homestay",
        "images": [{"url": "...", "isMain": true}]
      }
    }
  ]
}
```

**Required Enhanced Response:**
```json
{
  "data": [
    {
      "id": 1,
      "strategy": "MANUAL",
      "category": "editor_choice",
      "priority": 1,
      "isActive": true,
      "homestayId": 406,
      "homestay": {
        "id": 406,
        "name": "Mount Fuji Homestay",
        "address": "Pokhara, Nepal",
        "description": "Enjoy quiet mornings with mountain views...",
        "status": "APPROVED",
        "rating": 4.5,
        "reviews": 12,
        "images": [
          {
            "id": 466,
            "url": "https://...",
            "isMain": true
          }
        ],
        "rooms": [
          {
            "id": 420,
            "name": "Deluxe room",
            "price": 2600,
            "currency": "NPR",
            "maxOccupancy": 2,
            "minOccupancy": 1
          }
        ],
        "facilities": [
          {
            "homestayId": 406,
            "facilityId": 18,
            "facility": {
              "id": 18,
              "name": "Geyser"
            }
          }
        ],
        "owner": {
          "id": 5,
          "name": "Dipesh Rai",
          "email": "sardulb91@gmail.com"
        }
      }
    }
  ]
}
```

**Backend Implementation (Example - NestJS/Prisma):**
```typescript
// In your top-homestays service
async findAll(params: any) {
  return await this.prisma.topHomestay.findMany({
    where: { /* your filters */ },
    include: {
      homestay: {
        include: {
          images: {
            where: { isMain: true },
            take: 5
          },
          rooms: {
            select: {
              id: true,
              name: true,
              price: true,
              currency: true,
              maxOccupancy: true,
              minOccupancy: true
            }
          },
          facilities: {
            include: {
              facility: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            take: 5
          },
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    },
    orderBy: { priority: 'asc' }
  });
}
```

## Benefits of These Changes

### For Last Minute Deals:
1. **Show Original vs Discounted Price**: Calculate from `homestay.rooms[].price`
2. **Display Address**: Show where the homestay is located
3. **Show Facilities**: Display amenities available
4. **Show Rating**: Display star rating and review count
5. **Show Owner Info**: Helpful for admin reference
6. **Calculate Savings**: Show exact NPR amount saved with percentage/flat discounts

### For Top Homestays:
1. **Display Comprehensive Details**: Address, description, facilities
2. **Show Price Range**: Calculate from room prices (min-max)
3. **Show Rating**: Display star rating and review count
4. **Show Owner Info**: Helpful for admin management
5. **Better Decision Making**: Admins can see full context when managing featured homestays

## Performance Considerations

- **Pagination**: Already implemented (page, limit parameters)
- **Selective Loading**: Only load images where `isMain: true` or limit to 5
- **Limit Facilities**: Take only top 5 facilities to avoid large payloads
- **Index Optimization**: Ensure proper indexes on:
  - `homestay.id`
  - `images.isMain`
  - `lastMinuteDeal.isActive`
  - `topHomestay.priority`

## Alternative Approach (If Backend Changes Are Difficult)

If modifying the main listing endpoints is challenging, consider:

### Option A: Add Detail Endpoints
```
GET /admin/last-minute-deals/:id/detailed
GET /admin/top-homestays/:id/detailed
```

These would return the enhanced data structure for a single record when viewing details.

### Option B: Query Parameter for Includes
```
GET /admin/last-minute-deals?include=rooms,facilities,owner
GET /admin/top-homestays?include=rooms,facilities,owner
```

This allows the frontend to request additional data when needed without changing the default response.

## Implementation Priority

1. **High Priority**: Add `rooms` to response (needed for price calculations)
2. **High Priority**: Add `address`, `rating`, `reviews` (essential info)
3. **Medium Priority**: Add `facilities`, `owner` (nice to have)
4. **Low Priority**: Add full `description` (can be truncated in list view)

## Testing Recommendations

After implementing these changes, test:
1. Response time with included relations
2. Payload size (should be reasonable)
3. Database query performance
4. Memory usage with pagination

## Migration Path

1. **Phase 1**: Add new fields without breaking existing frontend
2. **Phase 2**: Update frontend to use new fields
3. **Phase 3**: Monitor performance and adjust indexes
4. **Phase 4**: Consider caching if needed (Redis)
