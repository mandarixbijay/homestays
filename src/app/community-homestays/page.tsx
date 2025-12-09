'use client';

import React, { useState, useEffect } from 'react';
import { communityAPI, Community } from '@/lib/api/community';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Users,
  Home,
  Utensils,
  Activity,
  ChevronRight,
  Loader2,
  Filter,
  DollarSign,
  Star,
  Heart,
  Award,
  Globe,
  Sparkles,
  TrendingUp,
  Mountain,
  Smile,
  Coffee,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Navbar from '@/components/navbar/navbar';
import Footer from '@/components/footer/footer';

export default function CommunityHomestaysPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    fetchCommunities();
  }, []);

  useEffect(() => {
    filterCommunities();
  }, [searchTerm, selectedLocation, communities]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const data = await communityAPI.getCommunities();
      setCommunities(data.filter(c => c.isActive));
      setFilteredCommunities(data.filter(c => c.isActive));
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCommunities = () => {
    let filtered = communities;

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLocation) {
      filtered = filtered.filter((c) =>
        c.homestays.some((h) => h.address.includes(selectedLocation))
      );
    }

    setFilteredCommunities(filtered);
  };

  const uniqueLocations = Array.from(
    new Set(
      communities.flatMap((c) => c.homestays.map((h) => {
        const parts = h.address.split(',');
        return parts[parts.length - 2]?.trim() || parts[0]?.trim() || h.address;
      }))
    )
  ).filter(Boolean);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-20">
        {/* Hero Section - Modern & Bold */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-6">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-semibold text-gray-700">Discover Authentic Nepal</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
                Community Homestays
              </h1>

              <p className="text-xl sm:text-2xl text-gray-700 max-w-3xl mx-auto mb-12 leading-relaxed">
                Immerse yourself in <span className="font-semibold text-emerald-600">authentic cultural experiences</span> with local families across Nepal
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl p-6 shadow-lg"
                >
                  <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl mx-auto mb-3">
                    <Home className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {communities.reduce((sum, c) => sum + c.homestays.length, 0)}+
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Homestays Available</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl p-6 shadow-lg"
                >
                  <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl mx-auto mb-3">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {communities.reduce((sum, c) => sum + c.totalCapacity, 0)}+
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Guest Capacity</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-2xl p-6 shadow-lg"
                >
                  <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl mx-auto mb-3">
                    <MapPin className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {uniqueLocations.length}+
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Unique Locations</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Search Bar - Floating */}
        <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-600" />
                <input
                  type="text"
                  placeholder="Search for your perfect community..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
              <div className="sm:w-64">
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-600" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white transition-all"
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
            </div>
            <div className="mt-2 text-sm text-gray-600 font-medium">
              <span className="text-emerald-600">{filteredCommunities.length}</span> communities found
            </div>
          </div>
        </div>

        {/* Communities Grid - Tall Rectangle Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="h-16 w-16 text-emerald-600 animate-spin mb-4" />
              <p className="text-gray-600 text-lg">Loading amazing communities...</p>
            </div>
          ) : filteredCommunities.length === 0 ? (
            <div className="text-center py-32">
              <Home className="h-20 w-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Communities Found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCommunities.map((community, index) => (
                <TallCommunityCard key={community.id} community={community} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* Middle Info Section - Creative 3 Column Layout */}
        <div className="bg-gradient-to-br from-gray-900 via-emerald-900 to-teal-900 py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/patterns/topography.svg')] opacity-10"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
                Why Choose Our Communities?
              </h2>
              <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
                Experience Nepal like never before through our carefully curated community homestays
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 - Cultural Immersion */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="relative group"
              >
                <div className="h-[500px] bg-gradient-to-br from-rose-400 to-pink-600 rounded-3xl p-8 flex flex-col justify-between overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24"></div>

                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                      <Heart className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">
                      Cultural Immersion
                    </h3>
                    <div className="h-1 w-20 bg-white/40 rounded-full mb-6"></div>
                  </div>

                  <div className="relative z-10 space-y-4">
                    <p className="text-white/90 text-lg leading-relaxed">
                      Live with local families and experience authentic Nepalese traditions, customs, and daily life
                    </p>
                    <ul className="space-y-3 text-white/80">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Traditional ceremonies</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Local festivals</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Cultural workshops</span>
                      </li>
                    </ul>
                  </div>

                  <div className="relative z-10 mt-6">
                    <div className="flex items-center gap-2 text-white/90 font-semibold">
                      <span>Explore More</span>
                      <ChevronRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 2 - Authentic Cuisine */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="relative group"
              >
                <div className="h-[500px] bg-gradient-to-br from-amber-400 to-orange-600 rounded-3xl p-8 flex flex-col justify-between overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24"></div>

                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                      <Coffee className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">
                      Authentic Cuisine
                    </h3>
                    <div className="h-1 w-20 bg-white/40 rounded-full mb-6"></div>
                  </div>

                  <div className="relative z-10 space-y-4">
                    <p className="text-white/90 text-lg leading-relaxed">
                      Savor home-cooked traditional meals prepared with fresh local ingredients and generations-old recipes
                    </p>
                    <ul className="space-y-3 text-white/80">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Traditional Dal Bhat</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Cooking classes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Organic ingredients</span>
                      </li>
                    </ul>
                  </div>

                  <div className="relative z-10 mt-6">
                    <div className="flex items-center gap-2 text-white/90 font-semibold">
                      <span>Taste the Culture</span>
                      <ChevronRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 3 - Adventure & Nature */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="relative group"
              >
                <div className="h-[500px] bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl p-8 flex flex-col justify-between overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24"></div>

                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                      <Mountain className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">
                      Nature & Adventure
                    </h3>
                    <div className="h-1 w-20 bg-white/40 rounded-full mb-6"></div>
                  </div>

                  <div className="relative z-10 space-y-4">
                    <p className="text-white/90 text-lg leading-relaxed">
                      Explore breathtaking landscapes and engage in exciting outdoor activities with local guides
                    </p>
                    <ul className="space-y-3 text-white/80">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Himalayan trekking</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Village tours</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Wildlife experiences</span>
                      </li>
                    </ul>
                  </div>

                  <div className="relative z-10 mt-6">
                    <div className="flex items-center gap-2 text-white/90 font-semibold">
                      <span>Start Adventure</span>
                      <ChevronRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-emerald-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-4">
                  <Award className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">100%</div>
                <div className="text-sm text-gray-600">Verified Hosts</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-4">
                  <Star className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">4.8/5</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-4">
                  <Smile className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">5000+</div>
                <div className="text-sm text-gray-600">Happy Guests</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-4">
                  <Globe className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">50+</div>
                <div className="text-sm text-gray-600">Countries Served</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

// Tall Rectangle Community Card Component
function TallCommunityCard({ community, index }: { community: Community; index: number }) {
  const mainImage = community.images && community.images.length > 0
    ? community.images[0]
    : '/images/placeholder-homestay.jpg';

  const colors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-pink-500 to-rose-600',
    'from-cyan-500 to-blue-600',
  ];

  const gradientColor = colors[index % colors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link href={`/community-homestays/${community.id}`}>
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-[580px] flex flex-col">
          {/* Image Section - Larger */}
          <div className="relative h-72 overflow-hidden">
            <Image
              src={mainImage}
              alt={community.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

            {/* Price Badge - Prominent */}
            <div className={`absolute top-4 right-4 bg-gradient-to-r ${gradientColor} px-4 py-2.5 rounded-full shadow-lg`}>
              <div className="flex items-center gap-1.5 text-white">
                <DollarSign className="h-5 w-5" />
                <span className="text-lg font-bold">{community.pricePerPerson}</span>
                <span className="text-xs opacity-90">/{community.currency}</span>
              </div>
            </div>

            {/* Homestay Count Badge */}
            {community.homestays.length > 0 && (
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-md">
                <div className="flex items-center gap-1.5">
                  <Home className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-gray-900">{community.homestays.length} Stays</span>
                </div>
              </div>
            )}

            {/* Title Overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-2xl font-bold text-white mb-1 line-clamp-2 drop-shadow-lg">
                {community.name}
              </h3>
            </div>
          </div>

          {/* Content Section - Vertical Info */}
          <div className="flex-1 p-6 flex flex-col">
            <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
              {community.description}
            </p>

            {/* Stats Grid - Compact */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-blue-600 font-medium">Capacity</div>
                  <div className="text-sm font-bold text-gray-900">{community.totalCapacity}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
                  <Utensils className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <div className="text-xs text-purple-600 font-medium">Meals</div>
                  <div className="text-sm font-bold text-gray-900">{community.meals.length}</div>
                </div>
              </div>
            </div>

            {/* Features Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {community.activities.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                  <Activity className="h-3 w-3" />
                  {community.activities.length} Activities
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full">
                <MapPin className="h-3 w-3" />
                Nepal
              </span>
            </div>

            {/* Manager & CTA */}
            {community.manager && (
              <div className="border-t border-gray-200 pt-4 mt-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {community.manager.fullName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Managed by</div>
                      <div className="text-sm font-semibold text-gray-900">{community.manager.fullName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 group-hover:gap-2 transition-all">
                    <span className="text-sm font-semibold">View</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
