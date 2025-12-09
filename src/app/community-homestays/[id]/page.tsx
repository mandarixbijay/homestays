'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { communityAPI, Community } from '@/lib/api/community';
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
  Star,
  Info,
  Search,
  Award,
  Clock,
  Leaf,
  Heart,
  Shield,
  Target,
  TrendingUp,
  Handshake,
  Building2,
  MapPinned,
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
        <div className="min-h-screen flex items-center justify-center pt-20 bg-[#102c14]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-[#fbbf04] animate-spin mx-auto mb-4" />
            <p className="text-gray-200">Loading community details...</p>
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#295d34] text-white rounded-lg hover:bg-[#102c14] transition-colors"
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
      <div className="bg-[#102c14] border-b border-[#295d34]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-200 hover:text-[#fbbf04] transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Hero Section with Image Gallery */}
      <div className="bg-gradient-to-br from-[#102c14] via-[#132f11] to-[#295d34] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="relative">
              {community.images && community.images.length > 0 ? (
                <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden bg-gray-900 shadow-2xl">
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
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#fbbf04] hover:bg-[#132f11] p-2 rounded-full shadow-lg transition-colors"
                      >
                        <ChevronLeft className="h-6 w-6 text-[#102c14]" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#fbbf04] hover:bg-[#132f11] p-2 rounded-full shadow-lg transition-colors"
                      >
                        <ChevronRight className="h-6 w-6 text-[#102c14]" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {community.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentImageIndex
                                ? 'bg-[#fbbf04] w-6'
                                : 'bg-white/60 hover:bg-white/80'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="h-96 lg:h-[500px] bg-[#132f11] rounded-2xl flex items-center justify-center">
                  <Home className="h-20 w-20 text-[#295d34]" />
                </div>
              )}
            </div>

            {/* Community Info */}
            <div className="flex flex-col text-white">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-[#fbbf04]">{community.name}</h1>
              <p className="text-gray-200 text-lg mb-6 leading-relaxed">{community.description}</p>

              {/* Key Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#fbbf04] p-2 rounded-lg">
                      <Home className="h-6 w-6 text-[#102c14]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300 font-medium">Homestays</p>
                      <p className="text-2xl font-bold text-white">{community.homestays.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#fbbf04] p-2 rounded-lg">
                      <Users className="h-6 w-6 text-[#102c14]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300 font-medium">Capacity</p>
                      <p className="text-2xl font-bold text-white">{community.totalCapacity}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#fbbf04] p-2 rounded-lg">
                      <Utensils className="h-6 w-6 text-[#102c14]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300 font-medium">Meals</p>
                      <p className="text-2xl font-bold text-white">{community.meals.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#fbbf04] p-2 rounded-lg">
                      <Activity className="h-6 w-6 text-[#102c14]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300 font-medium">Activities</p>
                      <p className="text-2xl font-bold text-white">{community.activities.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-[#fbbf04] text-[#102c14] p-6 rounded-xl mb-6 shadow-xl">
                <div>
                  <p className="text-sm font-semibold mb-1 opacity-80">Starting from</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold">NPR</span>
                    <span className="text-5xl font-bold">{community.pricePerPerson}</span>
                    <span className="text-sm font-semibold opacity-80">per person</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manager Profile Section */}
      {community.manager && (
        <div className="bg-white py-12 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-[#102c14] to-[#295d34] rounded-2xl p-8 text-white">
              <div className="flex items-center gap-2 mb-6">
                <Award className="h-6 w-6 text-[#fbbf04]" />
                <h2 className="text-3xl font-bold">Community Manager</h2>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Profile Image/Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 bg-[#fbbf04] rounded-full flex items-center justify-center text-[#102c14] text-5xl font-bold shadow-xl">
                    {community.manager.fullName.charAt(0)}
                  </div>
                </div>

                {/* Manager Info */}
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-[#fbbf04] mb-2">{community.manager.fullName}</h3>
                  <p className="text-xl text-gray-300 mb-6">Community Tourism Leader</p>

                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-6">
                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Info className="h-5 w-5 text-[#fbbf04]" />
                      About
                    </h4>
                    <p className="text-gray-200 leading-relaxed">
                      With years of experience in community-based tourism, {community.manager.fullName} is dedicated to preserving local culture while creating sustainable economic opportunities. Their leadership ensures that every guest experience contributes directly to community development and empowers local families through responsible tourism practices.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-[#fbbf04]" />
                        <span className="font-semibold">Role</span>
                      </div>
                      <p className="text-sm text-gray-300">Community Development Coordinator</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-5 w-5 text-[#fbbf04]" />
                        <span className="font-semibold">Experience</span>
                      </div>
                      <p className="text-sm text-gray-300">10+ Years in Tourism</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-5 w-5 text-[#fbbf04]" />
                        <span className="font-semibold">Focus</span>
                      </div>
                      <p className="text-sm text-gray-300">Sustainable Development</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* What Makes Us Special Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#102c14] mb-4">What Makes Us Special</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the unique features that set our community homestay apart
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Leaf,
                title: 'Eco-Friendly Practices',
                description: 'We prioritize sustainable tourism with locally-sourced materials, renewable energy, and waste reduction programs that protect our environment.'
              },
              {
                icon: Handshake,
                title: 'Direct Community Impact',
                description: '100% of proceeds go directly to local families, funding education, healthcare, and infrastructure improvements in our village.'
              },
              {
                icon: Shield,
                title: 'Authentic Experiences',
                description: 'Live like a local with genuine cultural immersion, traditional cooking classes, and participation in daily community activities.'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-md border-2 border-[#295d34]"
              >
                <div className="w-16 h-16 bg-[#fbbf04] rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-8 w-8 text-[#102c14]" />
                </div>
                <h3 className="text-xl font-bold text-[#102c14] mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Availability Search Section */}
      <div className="bg-[#102c14] shadow-xl sticky top-20 z-20 border-b-4 border-[#fbbf04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-xl font-bold text-[#fbbf04] mb-4">Check Availability</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Check-in</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#fbbf04]" />
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={minDate}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-[#295d34] bg-white rounded-lg focus:ring-2 focus:ring-[#fbbf04] focus:border-[#fbbf04] text-[#102c14]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Check-out</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#fbbf04]" />
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || minDate}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-[#295d34] bg-white rounded-lg focus:ring-2 focus:ring-[#fbbf04] focus:border-[#fbbf04] text-[#102c14]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Adults</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#fbbf04]" />
                <select
                  value={adults}
                  onChange={(e) => setAdults(parseInt(e.target.value))}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-[#295d34] bg-white rounded-lg focus:ring-2 focus:ring-[#fbbf04] focus:border-[#fbbf04] appearance-none text-[#102c14]"
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
              <label className="block text-sm font-medium text-gray-200 mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#fbbf04]" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-[#295d34] bg-white rounded-lg focus:ring-2 focus:ring-[#fbbf04] focus:border-[#fbbf04] appearance-none text-[#102c14]"
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
                className="w-full px-6 py-2.5 bg-[#fbbf04] text-[#102c14] rounded-lg hover:bg-[#295d34] hover:text-white transition-colors font-bold flex items-center justify-center gap-2"
              >
                <Search className="h-5 w-5" />
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Meals Section */}
        {community.meals && community.meals.length > 0 && (
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#102c14] mb-4">Included Meals</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Savor authentic Nepali cuisine prepared with fresh, local ingredients
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {community.meals.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </div>
          </section>
        )}

        {/* Activities Section */}
        {community.activities && community.activities.length > 0 && (
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#102c14] mb-4">Activities & Experiences</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Immerse yourself in local culture with these carefully curated activities
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {community.activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </section>
        )}

        {/* Partner Homestays Section */}
        {filteredHomestays.length > 0 && (
          <section className="mb-16">
            <div className="bg-gradient-to-br from-[#102c14] to-[#295d34] rounded-2xl p-8 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Handshake className="h-8 w-8 text-[#fbbf04]" />
                <h2 className="text-4xl font-bold text-white">Our Partner Homestays</h2>
              </div>
              <p className="text-xl text-gray-200 max-w-4xl">
                We work in collaboration with these wonderful local families who open their homes and hearts to guests. Each homestay is carefully selected and supported to ensure authentic experiences and fair economic benefits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredHomestays.map((homestay) => (
                <PartnerHomestayCard
                  key={homestay.id}
                  homestay={homestay}
                  communityPrice={community.pricePerPerson}
                />
              ))}
            </div>
          </section>
        )}

        {/* Community Impact Section */}
        <section className="mb-16">
          <div className="bg-[#fbbf04] rounded-2xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#102c14] mb-4">Community Impact</h2>
              <p className="text-xl text-[#102c14] max-w-3xl mx-auto opacity-90">
                Your stay creates lasting positive change in our community
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: TrendingUp,
                  value: '100%',
                  label: 'Direct to Families',
                  description: 'All revenue goes directly to host families'
                },
                {
                  icon: Users,
                  value: `${community.totalCapacity}`,
                  label: 'Jobs Created',
                  description: 'Local employment opportunities'
                },
                {
                  icon: Building2,
                  value: '12+',
                  label: 'Projects Funded',
                  description: 'Schools, clinics, and infrastructure'
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/20 backdrop-blur-sm border-2 border-[#102c14] rounded-xl p-6 text-center"
                >
                  <div className="w-16 h-16 bg-[#102c14] rounded-full flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="h-8 w-8 text-[#fbbf04]" />
                  </div>
                  <div className="text-4xl font-bold text-[#102c14] mb-2">{stat.value}</div>
                  <div className="text-lg font-bold text-[#102c14] mb-2">{stat.label}</div>
                  <p className="text-sm text-[#102c14] opacity-80">{stat.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
      </div>
      <Footer />
    </>
  );
}

// Enhanced Meal Card Component
function MealCard({ meal }: { meal: any }) {
  const mealIcons = {
    BREAKFAST: '🌅',
    LUNCH: '☀️',
    DINNER: '🌙'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border-2 border-[#295d34] group"
    >
      <div className="bg-gradient-to-br from-[#102c14] to-[#295d34] p-6 relative overflow-hidden">
        <div className="text-6xl mb-3 relative z-10">{mealIcons[meal.mealType as keyof typeof mealIcons]}</div>
        <h3 className="text-2xl font-bold text-white mb-2 relative z-10">
          {meal.mealType.charAt(0) + meal.mealType.slice(1).toLowerCase()}
        </h3>
        {meal.isIncluded && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#fbbf04] text-[#102c14] rounded-full text-sm font-bold">
            <Check className="h-4 w-4" />
            Included
          </div>
        )}
      </div>

      <div className="p-6">
        <p className="text-gray-700 mb-4 leading-relaxed text-base">{meal.description}</p>

        <div className="flex items-center gap-2 text-sm text-[#295d34] font-semibold">
          <Utensils className="h-4 w-4" />
          <span>Traditional Nepali Cuisine</span>
        </div>

        {!meal.isIncluded && meal.extraCost > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Additional Cost</span>
              <span className="text-lg font-bold text-[#102c14]">NPR {meal.extraCost}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Enhanced Activity Card Component
function ActivityCard({ activity }: { activity: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border-2 border-[#295d34] group"
    >
      {/* Activity Header */}
      <div className="bg-gradient-to-br from-[#fbbf04] to-[#295d34] p-6 relative overflow-hidden">
        <div className="flex items-start justify-between mb-3 relative z-10">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-[#102c14] mb-2">{activity.name}</h3>
            {activity.duration && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold text-[#102c14]">
                <Clock className="h-4 w-4" />
                {activity.duration} hours
              </div>
            )}
          </div>
          {activity.isIncluded && (
            <div className="bg-[#102c14] p-2 rounded-full">
              <Check className="h-6 w-6 text-[#fbbf04]" />
            </div>
          )}
        </div>
      </div>

      {/* Activity Content */}
      <div className="p-6">
        <p className="text-gray-700 mb-6 leading-relaxed text-base">{activity.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 bg-[#102c14] rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-[#fbbf04]" />
            </div>
            <span className="text-gray-700 font-medium">Group Activity</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 bg-[#102c14] rounded-lg flex items-center justify-center">
              <Star className="h-4 w-4 text-[#fbbf04]" />
            </div>
            <span className="text-gray-700 font-medium">Popular Choice</span>
          </div>
        </div>

        {!activity.isIncluded && activity.extraCost > 0 && (
          <div className="mt-4 pt-4 border-t-2 border-[#295d34]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600">Additional Cost</span>
              <span className="text-xl font-bold text-[#102c14]">NPR {activity.extraCost}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Partner Homestay Card Component
function PartnerHomestayCard({
  homestay,
  communityPrice,
}: {
  homestay: any;
  communityPrice: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl overflow-hidden shadow-lg border-2 border-[#295d34] hover:shadow-2xl transition-all"
    >
      {/* Homestay Image Placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-[#102c14] to-[#295d34] flex items-center justify-center">
        <Home className="h-20 w-20 text-[#fbbf04] opacity-50" />
        <div className="absolute top-4 right-4 bg-[#fbbf04] px-3 py-1 rounded-full">
          <span className="text-xs font-bold text-[#102c14]">Partner</span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-[#102c14] mb-3">{homestay.name}</h3>

        <div className="flex items-start gap-2 text-gray-600 text-sm mb-4">
          <MapPinned className="h-4 w-4 mt-1 flex-shrink-0 text-[#295d34]" />
          <span>{homestay.address}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#102c14] bg-opacity-5 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Home className="h-4 w-4 text-[#295d34]" />
              <span className="font-medium">Rooms</span>
            </div>
            <p className="text-lg font-bold text-[#102c14]">{homestay.totalRooms}</p>
          </div>
          <div className="bg-[#102c14] bg-opacity-5 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Users className="h-4 w-4 text-[#295d34]" />
              <span className="font-medium">Capacity</span>
            </div>
            <p className="text-lg font-bold text-[#102c14]">{homestay.totalCapacity}</p>
          </div>
        </div>

        <div className="bg-[#fbbf04] bg-opacity-10 border-2 border-[#fbbf04] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Handshake className="h-5 w-5 text-[#102c14]" />
            <span className="text-sm font-bold text-[#102c14]">Community Partner</span>
          </div>
          <p className="text-xs text-gray-700">
            Part of our collaborative network supporting sustainable tourism and local development
          </p>
        </div>
      </div>
    </motion.div>
  );
}
