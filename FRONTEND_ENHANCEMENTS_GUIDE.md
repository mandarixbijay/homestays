# Frontend Enhancements Guide

## Overview
This guide provides the code changes needed to enhance the Last Minute Deals and Top Homestays admin panels with table views and comprehensive details.

## Changes for LastMinuteDealsManagement.tsx

### 1. Update ViewMode Type (Line 20)
```typescript
// Change from:
type ViewMode = 'grid' | 'list';

// To:
type ViewMode = 'grid' | 'list' | 'table';
```

### 2. Add Helper Functions (Add after line 31)
```typescript
// Price calculation helpers
const calculateOriginalPrice = (homestay: any): number | null => {
  if (!homestay?.rooms || homestay.rooms.length === 0) return null;
  const prices = homestay.rooms.map((r: any) => r.price).filter((p: number) => p > 0);
  return prices.length > 0 ? Math.min(...prices) : null;
};

const calculateDiscountedPrice = (original: number, discount: number, discountType: string): number => {
  if (discountType === 'PERCENTAGE') {
    return original * (1 - discount / 100);
  }
  return Math.max(0, original - discount);
};

const calculateSavings = (original: number, discounted: number): number => {
  return original - discounted;
};

const getHomestayImage = (homestay: any) => {
  return homestay?.images?.find((img: any) => img.isMain)?.url || homestay?.images?.[0]?.url;
};
```

### 3. Update DealCard Component (Replace lines 102-249)

Add table view rendering:

```typescript
const DealCard: React.FC<{
  deal: any;
  onEdit: (deal: any) => void;
  onDelete: (id: number) => void;
  viewMode: ViewMode;
}> = ({ deal, onEdit, onDelete, viewMode }) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const isActive = deal.isActive && new Date(deal.endDate) > new Date();
  const isExpired = new Date(deal.endDate) < new Date();

  const originalPrice = calculateOriginalPrice(deal.homestay);
  const discountedPrice = originalPrice ? calculateDiscountedPrice(originalPrice, deal.discount, deal.discountType) : null;
  const savings = originalPrice && discountedPrice ? calculateSavings(originalPrice, discountedPrice) : null;

  // Grid view - keep existing implementation but add price info
  if (viewMode === 'grid') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {/* Status badges */}
        <div className="absolute top-4 right-4 z-10 flex flex-col items-end space-y-2">
          {isActive && !isExpired && (
            <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full">
              <span className="text-xs font-bold text-white">Active</span>
            </div>
          )}
          {isExpired && (
            <div className="px-3 py-1 bg-gray-500 rounded-full">
              <span className="text-xs font-bold text-white">Expired</span>
            </div>
          )}
          {!deal.isActive && (
            <div className="px-3 py-1 bg-red-500 rounded-full">
              <span className="text-xs font-bold text-white">Inactive</span>
            </div>
          )}
        </div>

        {/* Image with discount badge */}
        <div className="relative h-48 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 overflow-hidden">
          {getHomestayImage(deal.homestay) ? (
            <img
              src={getHomestayImage(deal.homestay)}
              alt={deal.homestay?.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Zap className="h-16 w-16 text-yellow-500" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between">
                <div className={`px-4 py-2 rounded-xl ${deal.discountType === 'PERCENTAGE' ? 'bg-yellow-500' : 'bg-orange-500'} shadow-lg`}>
                  <div className="flex items-center space-x-2">
                    {deal.discountType === 'PERCENTAGE' ? <Percent className="h-5 w-5 text-white" /> : <DollarSign className="h-5 w-5 text-white" />}
                    <span className="text-2xl font-bold text-white">{deal.discount}{deal.discountType === 'PERCENTAGE' ? '%' : ''}</span>
                  </div>
                  <p className="text-xs text-white/90 mt-0.5">OFF</p>
                </div>
                {savings && (
                  <div className="px-3 py-1 bg-black/50 backdrop-blur-sm rounded-lg">
                    <p className="text-xs text-white/80">Save NPR</p>
                    <p className="text-lg font-bold text-white">{savings.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
            {deal.homestay?.name || 'Unnamed Homestay'}
          </h3>

          {/* Address and rating */}
          {deal.homestay?.address && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center">
              <Home className="h-3 w-3 mr-1" />
              {deal.homestay.address}
            </p>
          )}
          {deal.homestay?.rating && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center">
              <Star className="h-3 w-3 mr-1 text-yellow-500" />
              {deal.homestay.rating} ({deal.homestay.reviews || 0} reviews)
            </p>
          )}

          {/* Price comparison */}
          {originalPrice && discountedPrice && (
            <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Original Price</p>
                  <p className="text-sm line-through text-gray-600 dark:text-gray-400">
                    NPR {originalPrice.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-600 dark:text-green-400">Deal Price</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    NPR {Math.round(discountedPrice).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {deal.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{deal.description}</p>
          )}

          {/* Facilities */}
          {deal.homestay?.facilities && deal.homestay.facilities.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {deal.homestay.facilities.slice(0, 3).map((f: any, idx: number) => (
                <span key={idx} className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded">
                  {f.facility?.name || f.name}
                </span>
              ))}
              {deal.homestay.facilities.length > 3 && (
                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                  +{deal.homestay.facilities.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4 space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(deal.startDate)}</span>
            </div>
            <span>-</span>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(deal.endDate)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <ActionButton onClick={() => onEdit(deal)} variant="secondary" size="xs" icon={<Edit className="h-3.5 w-3.5" />}>
              Edit
            </ActionButton>
            <ActionButton onClick={() => onDelete(deal.id)} variant="danger" size="xs" icon={<Trash2 className="h-3.5 w-3.5" />}>
              Delete
            </ActionButton>
          </div>
        </div>
      </motion.div>
    );
  }

  // List view - keep similar to grid but horizontal
  if (viewMode === 'list') {
    // ... existing list view code with same enhancements ...
  }

  // Table view - NEW
  return null; // Will be rendered in parent table
};
```

### 4. Add Table View Rendering (In main component, around line 550)

```typescript
// In the main render, where deals are displayed, add:

{viewMode === 'table' ? (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Homestay</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Discount</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Original Price</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Deal Price</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Savings</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Period</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {deals.map((deal: any) => {
            const originalPrice = calculateOriginalPrice(deal.homestay);
            const discountedPrice = originalPrice ? calculateDiscountedPrice(originalPrice, deal.discount, deal.discountType) : null;
            const savings = originalPrice && discountedPrice ? calculateSavings(originalPrice, discountedPrice) : null;
            const isActive = deal.isActive && new Date(deal.endDate) > new Date();
            const isExpired = new Date(deal.endDate) < new Date();
            const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            return (
              <tr key={deal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    {getHomestayImage(deal.homestay) ? (
                      <img src={getHomestayImage(deal.homestay)} alt={deal.homestay?.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-yellow-500" />
                      </div>
                    )}
                    <div className="max-w-xs">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{deal.homestay?.name || 'Unnamed'}</p>
                      {deal.homestay?.address && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{deal.homestay.address}</p>
                      )}
                      {deal.homestay?.rating && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                          <Star className="h-3 w-3 mr-0.5 text-yellow-500" />
                          {deal.homestay.rating} ({deal.homestay.reviews || 0})
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-1">
                    {deal.discountType === 'PERCENTAGE' ? <Percent className="h-4 w-4 text-yellow-600" /> : <DollarSign className="h-4 w-4 text-orange-600" />}
                    <span className="font-bold text-yellow-600 dark:text-yellow-400">
                      {deal.discount}{deal.discountType === 'PERCENTAGE' ? '%' : ''}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {originalPrice ? (
                    <span className="line-through">NPR {originalPrice.toLocaleString()}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-green-600 dark:text-green-400">
                  {discountedPrice ? (
                    `NPR ${Math.round(discountedPrice).toLocaleString()}`
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400">
                  {savings ? (
                    `NPR ${Math.round(savings).toLocaleString()}`
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex flex-col space-y-1">
                    <span>{formatDate(deal.startDate)}</span>
                    <span className="text-gray-400">to</span>
                    <span>{formatDate(deal.endDate)}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${
                    isActive && !isExpired ? 'bg-green-500' : isExpired ? 'bg-gray-500' : 'bg-red-500'
                  }`}>
                    {isActive && !isExpired ? 'Active' : isExpired ? 'Expired' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <ActionButton onClick={() => handleEdit(deal)} variant="secondary" size="xs" icon={<Edit className="h-3.5 w-3.5" />}>
                      Edit
                    </ActionButton>
                    <ActionButton onClick={() => handleDelete(deal.id)} variant="danger" size="xs" icon={<Trash2 className="h-3.5 w-3.5" />}>
                      Delete
                    </ActionButton>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
) : (
  // Existing grid/list rendering
  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
    <AnimatePresence mode="popLayout">
      {deals.map((deal: any) => (
        <DealCard key={deal.id} deal={deal} onEdit={handleEdit} onDelete={handleDelete} viewMode={viewMode} />
      ))}
    </AnimatePresence>
  </div>
)}
```

### 5. Add Table View Button (Around line 520, in the view toggle section)

```typescript
<div className="flex items-center space-x-2">
  <button
    onClick={() => setViewMode('grid')}
    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#224240] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600'}`}
  >
    <Grid className="h-5 w-5" />
  </button>
  <button
    onClick={() => setViewMode('list')}
    className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#224240] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600'}`}
  >
    <List className="h-5 w-5" />
  </button>
  <button
    onClick={() => setViewMode('table')}
    className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-[#224240] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600'}`}
  >
    <BarChart3 className="h-5 w-5" />
  </button>
</div>
```

### 6. Add Missing Imports (Line 6-10)

```typescript
import {
  Zap, Plus, Eye, Edit, Trash2, X, Search, Grid, List, RefreshCw,
  SlidersHorizontal, FileDown, Calendar, Percent, DollarSign, Home,
  Clock, Tag, BarChart3, TrendingUp, AlertCircle, Star, MapPin
} from 'lucide-react';
```

## Changes for TopHomestaysManagement.tsx

### 1. Update ViewMode Type (Line ~21)
```typescript
type ViewMode = 'grid' | 'list' | 'table';
```

### 2. Add Helper Functions
```typescript
const getLowestRoomPrice = (homestay: any): number | null => {
  if (!homestay?.rooms || homestay.rooms.length === 0) return null;
  const prices = homestay.rooms.map((r: any) => r.price).filter((p: number) => p > 0);
  return prices.length > 0 ? Math.min(...prices) : null;
};

const getHighestRoomPrice = (homestay: any): number | null => {
  if (!homestay?.rooms || homestay.rooms.length === 0) return null;
  const prices = homestay.rooms.map((r: any) => r.price).filter((p: number) => p > 0);
  return prices.length > 0 ? Math.max(...prices) : null;
};

const getPriceRange = (homestay: any): string => {
  const lowest = getLowestRoomPrice(homestay);
  const highest = getHighestRoomPrice(homestay);

  if (!lowest) return 'Price not available';
  if (lowest === highest) return `NPR ${lowest.toLocaleString()}`;
  return `NPR ${lowest.toLocaleString()} - ${highest.toLocaleString()}`;
};

const getHomestayImage = (homestay: any) => {
  return homestay?.images?.find((img: any) => img.isMain)?.url || homestay?.images?.[0]?.url;
};
```

### 3. Enhance TopHomestayCard - Grid View

Add address, rating, facilities, price range:

```typescript
{/* After homestay name in grid view */}
{topHomestay.homestay?.address && (
  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mb-1">
    <MapPin className="h-3 w-3 mr-1" />
    {topHomestay.homestay.address}
  </p>
)}
{topHomestay.homestay?.rating && (
  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mb-2">
    <Star className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" />
    {topHomestay.homestay.rating} ({topHomestay.homestay.reviews || 0} reviews)
  </p>
)}

{/* Price range */}
<div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Price Range</p>
  <p className="text-sm font-bold text-[#224240] dark:text-[#2a5350]">
    {getPriceRange(topHomestay.homestay)}
  </p>
</div>

{/* Facilities */}
{topHomestay.homestay?.facilities && topHomestay.homestay.facilities.length > 0 && (
  <div className="flex flex-wrap gap-1 mb-3">
    {topHomestay.homestay.facilities.slice(0, 3).map((f: any, idx: number) => (
      <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
        {f.facility?.name || f.name}
      </span>
    ))}
    {topHomestay.homestay.facilities.length > 3 && (
      <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
        +{topHomestay.homestay.facilities.length - 3}
      </span>
    )}
  </div>
)}
```

### 4. Add Table View (Similar to LastMinuteDeals)

```typescript
{viewMode === 'table' ? (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Homestay</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Strategy</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Priority</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price Range</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rating</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {topHomestays.map((topHomestay: any) => (
            <tr key={topHomestay.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center space-x-3">
                  {getHomestayImage(topHomestay.homestay) ? (
                    <img src={getHomestayImage(topHomestay.homestay)} alt={topHomestay.homestay?.name} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 flex items-center justify-center">
                      <Crown className="h-6 w-6 text-yellow-500" />
                    </div>
                  )}
                  <div className="max-w-xs">
                    <p className="font-medium text-gray-900 dark:text-white truncate flex items-center">
                      <Crown className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" />
                      {topHomestay.homestay?.name || 'Unnamed'}
                    </p>
                    {topHomestay.homestay?.address && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{topHomestay.homestay.address}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                  {topHomestay.strategy === 'MANUAL' ? 'Manual' : 'Insight Based'}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {getCategoryBadge(topHomestay.category)}
              </td>
              <td className="px-4 py-3">
                {topHomestay.priority && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-bold">
                    #{topHomestay.priority}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-[#224240] dark:text-[#2a5350]">
                {getPriceRange(topHomestay.homestay)}
              </td>
              <td className="px-4 py-3">
                {topHomestay.homestay?.rating ? (
                  <div className="flex items-center text-sm">
                    <Star className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{topHomestay.homestay.rating}</span>
                    <span className="text-gray-400 ml-1">({topHomestay.homestay.reviews || 0})</span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">No rating</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${topHomestay.isActive ? 'bg-green-500' : 'bg-gray-500'}`}>
                  {topHomestay.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center space-x-2">
                  <ActionButton onClick={() => onEdit(topHomestay)} variant="secondary" size="xs" icon={<Edit className="h-3.5 w-3.5" />}>
                    Edit
                  </ActionButton>
                  <ActionButton onClick={() => onDelete(topHomestay.id)} variant="danger" size="xs" icon={<Trash2 className="h-3.5 w-3.5" />}>
                    Remove
                  </ActionButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
) : (
  // Existing grid/list rendering
  ...
)}
```

## Summary

### What Works Now (With Current Backend):
✅ Grid and List views enhanced with conditional rendering
✅ Shows price info IF `homestay.rooms` is available
✅ Shows address IF `homestay.address` is available
✅ Shows rating IF `homestay.rating` is available
✅ Shows facilities IF `homestay.facilities` is available
✅ Graceful degradation when data not available

### What Needs Backend Enhancement:
❌ Price calculations (needs `homestay.rooms[].price`)
❌ Address display (needs `homestay.address`)
❌ Facilities display (needs `homestay.facilities`)
❌ Rating display (needs `homestay.rating`, `homestay.reviews`)
❌ Owner info (needs `homestay.owner`)

### Recommendation:
1. **Implement frontend changes first** - They're backward compatible
2. **Then enhance backend API** - Follow BACKEND_API_ENHANCEMENTS.md
3. **Test incrementally** - Features will appear as backend adds data
