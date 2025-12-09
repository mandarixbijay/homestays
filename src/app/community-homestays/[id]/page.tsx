'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { communityAPI, Community, Homestay } from '@/lib/api/community';
import {
  MapPin,
  Users,
  Home,
  Utensils,
  Activity,
  Phone,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  X,
  DollarSign,
  Star,
  Info,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/navbar/navbar';
import Footer from '@/components/footer/footer';

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = parseInt(params.id as string);

  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Availability search params
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [filteredHomestays, setFilteredHomestays] = useState<any[]>([]);
  const [showAvailabilityResults, setShowAvailabilityResults] = useState(false);

  useEffect(() => {
    fetchCommunity();
  }, [communityId]);

  useEffect(() => {
    if (community) {
      filterHomestays();
    }
  }, [selectedLocation, community]);

  const fetchCommunity = async () => {
    try {
      setLoading(true);
      const data = await communityAPI.getCommunity(communityId);
      setCommunity(data);
      setFilteredHomestays(data.homestays || []);
    } catch (error) {
      console.error('Error fetching community:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterHomestays = () => {
    if (!community) return;

    let filtered = community.homestays || [];

    if (selectedLocation) {
      filtered = filtered.filter((h) => h.address.includes(selectedLocation));
    }

    setFilteredHomestays(filtered);
  };

  const handleCheckAvailability = () => {
    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }

    if (adults < 1) {
      alert('Please select at least 1 adult');
      return;
    }

    setShowAvailabilityResults(true);
  };

  const nextImage = () => {
    if (community && community.images) {
      setCurrentImageIndex((prev) => (prev + 1) % community.images.length);
    }
  };

  const prevImage = () => {
    if (community && community.images) {
      setCurrentImageIndex((prev) => (prev - 1 + community.images.length) % community.images.length);
    }
  };

  const uniqueLocations = community
    ? Array.from(new Set(community.homestays.map((h) => {
        const parts = h.address.split(',');
        return parts[parts.length - 2]?.trim() || parts[0]?.trim() || h.address;
      }))).filter(Boolean)
    : [];

  const minDate = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading community details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!community) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center">
            <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Community Not Found</h2>
            <p className="text-gray-600 mb-6">The community you're looking for doesn't exist.</p>
            <Link
              href="/community-homestays"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              Back to Communities
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#224240] transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Hero Section with Image Gallery */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="relative">
              {community.images && community.images.length > 0 ? (
                <div className="relative h-96 lg:h-full min-h-[400px] rounded-2xl overflow-hidden bg-gray-200">
                  <Image
                    src={community.images[currentImageIndex]}
                    alt={community.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {community.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                      >
                        <ChevronLeft className="h-6 w-6 text-gray-800" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                      >
                        <ChevronRight className="h-6 w-6 text-gray-800" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {community.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentImageIndex
                                ? 'bg-white w-6'
                                : 'bg-white/60 hover:bg-white/80'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="h-96 lg:h-full min-h-[400px] bg-gray-200 rounded-2xl flex items-center justify-center">
                  <Home className="h-20 w-20 text-gray-400" />
                </div>
              )}
            </div>

            {/* Community Info */}
            <div className="flex flex-col">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{community.name}</h1>
              <p className="text-gray-600 text-lg mb-6">{community.description}</p>

              {/* Key Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <Home className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Homestays</p>
                      <p className="text-2xl font-bold text-blue-900">{community.homestays.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 p-2 rounded-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600 font-medium">Capacity</p>
                      <p className="text-2xl font-bold text-green-900">{community.totalCapacity}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-500 p-2 rounded-lg">
                      <Utensils className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Meals</p>
                      <p className="text-2xl font-bold text-purple-900">{community.meals.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500 p-2 rounded-lg">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-orange-600 font-medium">Activities</p>
                      <p className="text-2xl font-bold text-orange-900">{community.activities.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-xl mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-100 mb-1">Starting from</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium">NPR</span>
                      <span className="text-4xl font-bold">{community.pricePerPerson}</span>
                      <span className="text-sm text-emerald-100">per person</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manager Info */}
              {community.manager && (
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Managed By</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-600 p-2 rounded-lg">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{community.manager.fullName}</p>
                        <p className="text-sm text-gray-600">Community Manager</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{community.manager.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{community.manager.email}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Availability Search Section */}
      <div className="bg-white shadow-md sticky top-20 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Check Availability</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={minDate}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || minDate}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adults</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={adults}
                  onChange={(e) => setAdults(parseInt(e.target.value))}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Adult' : 'Adults'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">All Locations</option>
                  {uniqueLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleCheckAvailability}
                className="w-full px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Search className="h-5 w-5" />
                Check Availability
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Meals Section */}
        {community.meals && community.meals.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Included Meals</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {community.meals.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </div>
          </section>
        )}

        {/* Activities Section */}
        {community.activities && community.activities.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Activities & Experiences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {community.activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </section>
        )}

        {/* Homestays Section */}
        {filteredHomestays.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Available Homestays</h2>
              <span className="text-gray-600">
                {filteredHomestays.length} homestay{filteredHomestays.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHomestays.map((homestay) => (
                <HomestayCard
                  key={homestay.id}
                  homestay={homestay}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  adults={adults}
                  communityPrice={community.pricePerPerson}
                  currency={community.currency}
                />
              ))}
            </div>
          </section>
        )}
      </div>
      </div>
      <Footer />
    </>
  );
}

// Meal Card Component
function MealCard({ meal }: { meal: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-2">
            <Utensils className="h-4 w-4" />
            {meal.mealType}
          </div>
          <h3 className="text-xl font-semibold text-gray-900">{meal.mealType.toLowerCase().replace('_', ' ')}</h3>
        </div>
        {meal.isIncluded && (
          <div className="bg-green-100 p-2 rounded-full">
            <Check className="h-5 w-5 text-green-600" />
          </div>
        )}
      </div>
      <p className="text-gray-600 mb-4">{meal.description}</p>
      {!meal.isIncluded && meal.extraCost > 0 && (
        <div className="text-sm text-gray-500">
          Extra cost: NPR {meal.extraCost}
        </div>
      )}
    </motion.div>
  );
}

// Activity Card Component
function ActivityCard({ activity }: { activity: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium mb-2">
            <Activity className="h-4 w-4" />
            {activity.duration && `${activity.duration} hours`}
          </div>
          <h3 className="text-xl font-semibold text-gray-900">{activity.name}</h3>
        </div>
        {activity.isIncluded && (
          <div className="bg-green-100 p-2 rounded-full">
            <Check className="h-5 w-5 text-green-600" />
          </div>
        )}
      </div>
      <p className="text-gray-600 mb-4">{activity.description}</p>
      {!activity.isIncluded && activity.extraCost > 0 && (
        <div className="text-sm font-medium text-purple-600">
          + NPR {activity.extraCost}
        </div>
      )}
    </motion.div>
  );
}

// Homestay Card Component
function HomestayCard({
  homestay,
  checkIn,
  checkOut,
  adults,
  communityPrice,
  currency,
}: {
  homestay: any;
  checkIn: string;
  checkOut: string;
  adults: number;
  communityPrice: number;
  currency: string;
}) {
  const [homestayDetails, setHomestayDetails] = useState<Homestay | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const fetchHomestayDetails = async () => {
    if (homestayDetails) {
      setShowDetails(true);
      return;
    }

    try {
      setLoadingDetails(true);
      const data = await communityAPI.getHomestay(homestay.id);
      setHomestayDetails(data);
      setShowDetails(true);
    } catch (error) {
      console.error('Error fetching homestay details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-200"
      >
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{homestay.name}</h3>
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
            <MapPin className="h-4 w-4" />
            <span>{homestay.address}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Home className="h-4 w-4" />
              <span>Rooms</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{homestay.totalRooms}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Users className="h-4 w-4" />
              <span>Capacity</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{homestay.totalCapacity}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Phone className="h-4 w-4" />
          <span>{homestay.contactNumber}</span>
        </div>

        <button
          onClick={fetchHomestayDetails}
          disabled={loadingDetails}
          className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2"
        >
          {loadingDetails ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              View Details & Book
              <ChevronRight className="h-5 w-5" />
            </>
          )}
        </button>
      </motion.div>

      {/* Homestay Details Modal */}
      <AnimatePresence>
        {showDetails && homestayDetails && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetails(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <HomestayDetailsModal
                  homestay={homestayDetails}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  adults={adults}
                  communityPrice={communityPrice}
                  currency={currency}
                  onClose={() => setShowDetails(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Homestay Details Modal Component
function HomestayDetailsModal({
  homestay,
  checkIn,
  checkOut,
  adults,
  communityPrice,
  currency,
  onClose,
}: {
  homestay: Homestay;
  checkIn: string;
  checkOut: string;
  adults: number;
  communityPrice: number;
  currency: string;
  onClose: () => void;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();

  const images = homestay.images?.length > 0 ? homestay.images : [];
  const mainImage = images.find((img) => img.isMain) || images[0];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut) return 0;
    const nights = Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    );
    return nights * adults * communityPrice;
  };

  const handleBookNow = (room: any) => {
    // Navigate to booking page with query params
    const params = new URLSearchParams({
      homestayId: homestay.id.toString(),
      roomId: room.id.toString(),
      checkIn: checkIn || '',
      checkOut: checkOut || '',
      adults: adults.toString(),
      price: communityPrice.toString(),
      currency: currency,
    });
    router.push(`/booking?${params.toString()}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{homestay.name}</h2>
          <div className="flex items-center gap-2 text-gray-600 mt-1">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{homestay.address}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-6 w-6 text-gray-500" />
        </button>
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="relative h-80 bg-gray-200">
          <Image
            src={images[currentImageIndex].url}
            alt={homestay.name}
            fill
            className="object-cover"
            unoptimized
          />
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
              >
                <ChevronLeft className="h-6 w-6 text-gray-800" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
              >
                <ChevronRight className="h-6 w-6 text-gray-800" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Description */}
        {homestay.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">About this Homestay</h3>
            <p className="text-gray-600">{homestay.description}</p>
          </div>
        )}

        {/* Pricing Info */}
        {checkIn && checkOut && (
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-xl mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-100 mb-1">Total for your stay</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">NPR</span>
                  <span className="text-3xl font-bold">{calculateTotalPrice()}</span>
                </div>
                <p className="text-sm text-emerald-100 mt-1">
                  {Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights × {adults} adults
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rooms */}
        {homestay.rooms && homestay.rooms.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Rooms</h3>
            <div className="space-y-4">
              {homestay.rooms.map((room) => (
                <div
                  key={room.id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-emerald-500 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">{room.name}</h4>
                      {room.description && (
                        <p className="text-sm text-gray-600 mb-3">{room.description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{room.minOccupancy}-{room.maxOccupancy} guests</span>
                        </div>
                        {room.totalArea && (
                          <div className="flex items-center gap-1">
                            <Home className="h-4 w-4" />
                            <span>{room.totalArea} {room.areaUnit}</span>
                          </div>
                        )}
                        {room.includeBreakfast && (
                          <div className="flex items-center gap-1">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>Breakfast included</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">Room price</p>
                        <p className="text-xl font-bold text-gray-900">
                          NPR {room.price}
                          <span className="text-sm font-normal text-gray-600">/night</span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleBookNow(room)}
                        disabled={!checkIn || !checkOut}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
