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
        // Extract city/region from address
        const parts = h.address.split(',');
        return parts[parts.length - 2]?.trim() || parts[0]?.trim() || h.address;
      }))
    )
  ).filter(Boolean);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
        {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#224240] to-[#2a5350] text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Experience Community Homestays
            </h1>
            <p className="text-lg sm:text-xl text-gray-100 max-w-3xl mx-auto mb-8">
              Discover authentic Nepalese culture through immersive community-based homestay experiences.
              Connect with local families, enjoy traditional meals, and participate in cultural activities.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                <span>{communities.reduce((sum, c) => sum + c.homestays.length, 0)} Homestays</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>{communities.reduce((sum, c) => sum + c.totalCapacity, 0)} Guests Capacity</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{uniqueLocations.length} Locations</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="sticky top-20 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search communities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#224240] focus:border-transparent"
              />
            </div>
            <div className="sm:w-64">
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#224240] focus:border-transparent appearance-none bg-white"
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
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredCommunities.length} of {communities.length} communities
          </div>
        </div>
      </div>

      {/* Communities Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-[#224240] animate-spin mb-4" />
            <p className="text-gray-600">Loading communities...</p>
          </div>
        ) : filteredCommunities.length === 0 ? (
          <div className="text-center py-20">
            <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Communities Found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCommunities.map((community, index) => (
              <CommunityCard key={community.id} community={community} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-b from-white to-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Why Choose Community Homestays?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="h-8 w-8 text-[#224240]" />}
              title="Authentic Experience"
              description="Live with local families and experience genuine Nepalese culture and hospitality"
            />
            <FeatureCard
              icon={<Utensils className="h-8 w-8 text-[#224240]" />}
              title="Traditional Meals"
              description="Enjoy home-cooked traditional meals prepared with love and local ingredients"
            />
            <FeatureCard
              icon={<Activity className="h-8 w-8 text-[#224240]" />}
              title="Cultural Activities"
              description="Participate in local activities, festivals, and learn traditional crafts"
            />
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
}

function CommunityCard({ community, index }: { community: Community; index: number }) {
  const mainImage = community.images && community.images.length > 0
    ? community.images[0]
    : '/images/placeholder-homestay.jpg';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/community-homestays/${community.id}`}>
        <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 group cursor-pointer h-full flex flex-col">
          {/* Image */}
          <div className="relative h-56 overflow-hidden">
            <Image
              src={mainImage}
              alt={community.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-full shadow-lg">
              <div className="flex items-center gap-1 text-sm font-semibold text-[#224240]">
                <DollarSign className="h-4 w-4" />
                {community.pricePerPerson} {community.currency}
                <span className="text-xs text-gray-600">/person</span>
              </div>
            </div>
            {community.homestays.length > 0 && (
              <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1.5 rounded-full shadow-lg text-sm font-semibold">
                {community.homestays.length} Homestays
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#224240] transition-colors">
              {community.name}
            </h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
              {community.description}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Home className="h-4 w-4 text-[#224240]" />
                <span>{community.totalRooms} Rooms</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4 text-[#224240]" />
                <span>{community.totalCapacity} Guests</span>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-2 mb-4">
              {community.meals.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                  <Utensils className="h-3 w-3" />
                  {community.meals.length} Meals
                </span>
              )}
              {community.activities.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                  <Activity className="h-3 w-3" />
                  {community.activities.length} Activities
                </span>
              )}
            </div>

            {/* Manager */}
            {community.manager && (
              <div className="border-t border-gray-200 pt-4 mt-auto">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <p className="text-gray-500">Managed by</p>
                    <p className="font-medium text-gray-900">{community.manager.fullName}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[#224240] group-hover:gap-2 transition-all">
                    <span className="text-sm font-medium">View Details</span>
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

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
