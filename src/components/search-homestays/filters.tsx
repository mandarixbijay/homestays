// src/components/search-homestays/filters.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Wifi,
  Car,
  Eye,
  Star,
  MapPin,
  Home,
  Users,
  Award,
  Filter,
  X,
  PrinterCheckIcon,
  RectangleEllipsisIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterState {
  minPrice: number;
  maxPrice: number;
  minRating: number;
  cities: string[];
  amenities: string[];
  vipOnly: boolean;
  availableRoomsMin: number;
}

interface FilterCardProps {
  onFilterChange?: (filters: FilterState) => void;
  availableData?: {
    cities: string[];
    amenities: string[];
    priceRange: { min: number; max: number };
    ratingRange: { min: number; max: number };
  };
  isMobile?: boolean;
}

const getAmenityIcon = (amenity: string) => {
  const lower = amenity.toLowerCase();
  if (lower.includes('wifi')) return Wifi;
  if (lower.includes('parking')) return Car;
  if (lower.includes('view')) return Eye;
  return Home;
};

const FilterCard = ({ onFilterChange, availableData, isMobile = false }: FilterCardProps) => {
  const [filters, setFilters] = useState<FilterState>({
    minPrice: availableData?.priceRange.min || 0,
    maxPrice: availableData?.priceRange.max || 50000,
    minRating: 0,
    cities: [],
    amenities: [],
    vipOnly: false,
    availableRoomsMin: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Update filters when available data changes
  useEffect(() => {
    if (availableData) {
      setFilters(prev => ({
        ...prev,
        minPrice: availableData.priceRange.min,
        maxPrice: availableData.priceRange.max,
      }));
    }
  }, [availableData]);

  // Notify parent when filters change
  useEffect(() => {
    onFilterChange?.(filters);
  }, [filters, onFilterChange]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: 'cities' | 'amenities', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      minPrice: availableData?.priceRange.min || 0,
      maxPrice: availableData?.priceRange.max || 50000,
      minRating: 0,
      cities: [],
      amenities: [],
      vipOnly: false,
      availableRoomsMin: 0,
    });
  };

  const activeFiltersCount =
    filters.cities.length +
    filters.amenities.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.vipOnly ? 1 : 0) +
    (filters.availableRoomsMin > 0 ? 1 : 0);

  // Mobile Filter Button
  if (isMobile) {
    return (
      <>
        {/* Filter Button */}
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#1A403D] hover:bg-[#1A403D]/90 text-white px-4 py-2 rounded-lg"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="bg-white text-[#1A403D] px-2 py-0.5 rounded-full text-xs font-medium">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        {/* Mobile Filter Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setIsModalOpen(false)}
            />

            {/* Modal Content */}
            <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl max-h-[85vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
                <div className="flex items-center gap-3">
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-[#1A403D] hover:text-[#1A403D]/80 font-medium"
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto p-4 space-y-6" style={{ maxHeight: 'calc(85vh - 140px)' }}>
                <FilterContent
                  filters={filters}
                  updateFilter={updateFilter}
                  toggleArrayFilter={toggleArrayFilter}
                  availableData={availableData}
                  activeFiltersCount={activeFiltersCount}
                  clearAllFilters={clearAllFilters}
                />
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <Button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full bg-[#1A403D] hover:bg-[#1A403D]/90 text-white py-3 rounded-lg font-medium"
                >
                  View {activeFiltersCount > 0 ? 'Filtered ' : ''}Results
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop Filter Sidebar
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm w-full max-w-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-[#1A403D] hover:text-[#1A403D]/80 font-medium"
          >
            Clear all ({activeFiltersCount})
          </button>
        )}
      </div>

      <FilterContent
        filters={filters}
        updateFilter={updateFilter}
        toggleArrayFilter={toggleArrayFilter}
        availableData={availableData}
        activeFiltersCount={activeFiltersCount}
        clearAllFilters={clearAllFilters}
      />
    </div>
  );
};

// Shared Filter Content Component
const FilterContent = ({
  filters,
  updateFilter,
  toggleArrayFilter,
  availableData,
  activeFiltersCount,
  clearAllFilters
}: {
  filters: FilterState;
  updateFilter: (key: keyof FilterState, value: any) => void;
  toggleArrayFilter: (key: 'cities' | 'amenities', value: string) => void;
  availableData?: {
    cities: string[];
    amenities: string[];
    priceRange: { min: number; max: number };
    ratingRange: { min: number; max: number };
  };
  activeFiltersCount: number;
  clearAllFilters: () => void;
}) => {
  return (
    <>
      {/* Price Range */}
      <div className="mb-6">
        <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center gap-2">
          <span>            <RectangleEllipsisIcon className="h-4 w-4 text-[#1A403D]" />
          </span> Price Range (NPR)
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Min</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A403D] focus:border-[#1A403D] outline-none"
                min="0"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Max</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A403D] focus:border-[#1A403D] outline-none"
                min={filters.minPrice}
              />
            </div>
          </div>
          <div className="text-xs text-gray-500 text-center">
            NPR {filters.minPrice.toLocaleString()} - NPR {filters.maxPrice.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="mb-6">
        <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500" />
          Minimum Rating
        </h3>
        <div className="flex gap-2 flex-wrap">
          {[0, 3, 4, 4.5].map((rating) => (
            <button
              key={rating}
              onClick={() => updateFilter('minRating', rating)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-sm transition-colors ${filters.minRating === rating
                  ? 'bg-[#1A403D] text-white border-[#1A403D]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#1A403D]'
                }`}
            >
              <Star className="h-3 w-3 fill-current" />
              {rating === 0 ? 'Any' : `${rating}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Location Filter */}
      {availableData?.cities && availableData.cities.length > 0 && (
        <div className="mb-6">
          <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#1A403D]" />
            Locations
          </h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {availableData.cities.map((city) => (
              <label key={city} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                <input
                  type="checkbox"
                  checked={filters.cities.includes(city)}
                  onChange={() => toggleArrayFilter('cities', city)}
                  className="w-4 h-4 text-[#1A403D] border-gray-300 rounded focus:ring-[#1A403D] focus:ring-2"
                />
                <span className="text-sm text-gray-700">{city}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Amenities Filter */}
      {availableData?.amenities && availableData.amenities.length > 0 && (
        <div className="mb-6">
          <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center gap-2">
            <Home className="h-4 w-4 text-[#1A403D]" />
            Amenities
          </h3>
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
            {availableData.amenities.slice(0, 10).map((amenity) => {
              const IconComponent = getAmenityIcon(amenity);
              return (
                <button
                  key={amenity}
                  onClick={() => toggleArrayFilter('amenities', amenity)}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-sm transition-colors text-left ${filters.amenities.includes(amenity)
                      ? 'bg-[#1A403D]/10 border-[#1A403D] text-[#1A403D]'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <IconComponent className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{amenity}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Special Filters */}
      <div className="mb-6">
        <h3 className="text-base font-medium text-gray-800 mb-4">Special Options</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
            <input
              type="checkbox"
              checked={filters.vipOnly}
              onChange={(e) => updateFilter('vipOnly', e.target.checked)}
              className="w-4 h-4 text-[#1A403D] border-gray-300 rounded focus:ring-[#1A403D] focus:ring-2"
            />
            <Award className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-gray-700">VIP Access Only</span>
          </label>

          <div>
            <label className="block text-sm text-gray-600 mb-2 flex items-center gap-2">
              <Users className="h-4 w-4 text-[#1A403D]" />
              Minimum Available Rooms
            </label>
            <select
              value={filters.availableRoomsMin}
              onChange={(e) => updateFilter('availableRoomsMin', Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A403D] focus:border-[#1A403D] outline-none"
            >
              <option value={0}>Any</option>
              <option value={1}>1+ rooms</option>
              <option value={3}>3+ rooms</option>
              <option value={5}>5+ rooms</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Active filters:</div>
          <div className="flex flex-wrap gap-2">
            {filters.cities.map(city => (
              <span key={city} className="inline-flex items-center gap-1 px-2 py-1 bg-[#1A403D]/10 text-[#1A403D] rounded text-xs">
                {city}
                <button
                  onClick={() => toggleArrayFilter('cities', city)}
                  className="ml-1 hover:bg-[#1A403D]/20 rounded"
                >
                  ×
                </button>
              </span>
            ))}
            {filters.amenities.map(amenity => (
              <span key={amenity} className="inline-flex items-center gap-1 px-2 py-1 bg-[#1A403D]/10 text-[#1A403D] rounded text-xs">
                {amenity}
                <button
                  onClick={() => toggleArrayFilter('amenities', amenity)}
                  className="ml-1 hover:bg-[#1A403D]/20 rounded"
                >
                  ×
                </button>
              </span>
            ))}
            {filters.minRating > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#1A403D]/10 text-[#1A403D] rounded text-xs">
                {filters.minRating}+ ⭐
                <button
                  onClick={() => updateFilter('minRating', 0)}
                  className="ml-1 hover:bg-[#1A403D]/20 rounded"
                >
                  ×
                </button>
              </span>
            )}
            {filters.vipOnly && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#1A403D]/10 text-[#1A403D] rounded text-xs">
                VIP Only
                <button
                  onClick={() => updateFilter('vipOnly', false)}
                  className="ml-1 hover:bg-[#1A403D]/20 rounded"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FilterCard;