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
  Star,
  Heart,
  Award,
  Globe,
  Mountain,
  Smile,
  Coffee,
  Leaf,
  Shield,
  Calendar,
  ArrowRight,
  Check,
  Target,
  BookOpen,
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

  const totalHomestays = communities.reduce((sum, c) => sum + c.homestays.length, 0);
  const totalCapacity = communities.reduce((sum, c) => sum + c.totalCapacity, 0);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-16">
        {/* Hero Section - Clean Dark Design */}
        <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          {/* Background Image with Dark Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/tophomestay/ghandruk_homestay.jpg"
              alt="Community Homestays Nepal"
              fill
              className="object-cover"
              priority
            />
            {/* Darker Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-teal-900/80 to-slate-900/85"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
                <Leaf className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-white">Authentic Community Tourism</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
                Discover Nepal Through
                <span className="block mt-2 text-emerald-400">
                  Community Homestays
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl sm:text-2xl text-gray-200 max-w-3xl mx-auto mb-10 leading-relaxed">
                Experience authentic cultural immersion with local families. Support sustainable tourism while creating unforgettable memories.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                <button
                  onClick={() => document.getElementById('communities')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all duration-300 flex items-center gap-2"
                >
                  Explore Communities
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Learn More
                </button>
              </div>

              {/* Stats Grid - Clean & Minimal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
                >
                  <div className="text-4xl font-bold text-white mb-2">
                    {totalHomestays}
                  </div>
                  <div className="text-sm text-gray-300 font-medium">Homestays Available</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
                >
                  <div className="text-4xl font-bold text-white mb-2">
                    {totalCapacity}
                  </div>
                  <div className="text-sm text-gray-300 font-medium">Guest Capacity</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
                >
                  <div className="text-4xl font-bold text-white mb-2">
                    {communities.length}
                  </div>
                  <div className="text-sm text-gray-300 font-medium">Active Communities</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* What is Community Homestay - Clean Section */}
        <div className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full mb-4">
                <Target className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">Understanding Community Tourism</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                What is a Community Homestay?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Community homestays are locally-managed accommodations that offer authentic cultural experiences while directly supporting rural communities.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Heart,
                  title: 'Local Ownership',
                  description: 'Managed and operated by local community members, ensuring direct economic benefits to families.',
                  color: 'bg-rose-50',
                  iconColor: 'bg-rose-500',
                  textColor: 'text-rose-900'
                },
                {
                  icon: Leaf,
                  title: 'Sustainable Tourism',
                  description: 'Eco-friendly practices that preserve natural resources and protect the environment for future generations.',
                  color: 'bg-emerald-50',
                  iconColor: 'bg-emerald-600',
                  textColor: 'text-emerald-900'
                },
                {
                  icon: Users,
                  title: 'Cultural Exchange',
                  description: 'Genuine interactions with host families, learning traditions, language, and local ways of life.',
                  color: 'bg-blue-50',
                  iconColor: 'bg-blue-600',
                  textColor: 'text-blue-900'
                },
                {
                  icon: Award,
                  title: 'Community Development',
                  description: 'Revenue directly funds local infrastructure, education, and community improvement projects.',
                  color: 'bg-amber-50',
                  iconColor: 'bg-amber-600',
                  textColor: 'text-amber-900'
                }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`${item.color} rounded-2xl p-6 border border-gray-200`}
                >
                  <div className={`w-14 h-14 ${item.iconColor} rounded-xl flex items-center justify-center mb-4`}>
                    <item.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className={`text-xl font-bold ${item.textColor} mb-3`}>{item.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Search Bar - Sticky */}
        <div id="communities" className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search communities by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 placeholder:text-gray-500"
                />
              </div>
              <div className="sm:w-72">
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full pl-12 pr-10 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white transition-all text-gray-900"
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
            <div className="mt-3 flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-gray-700">
                <span className="font-bold text-emerald-600">{filteredCommunities.length}</span> {filteredCommunities.length === 1 ? 'community' : 'communities'} found
              </span>
            </div>
          </div>
        </div>

        {/* Communities Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="h-16 w-16 text-emerald-600 animate-spin mb-4" />
              <p className="text-gray-600 text-lg font-medium">Loading communities...</p>
            </div>
          ) : filteredCommunities.length === 0 ? (
            <div className="text-center py-32">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Home className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Communities Found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedLocation('');
                }}
                className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCommunities.map((community, index) => (
                <CommunityCard key={community.id} community={community} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* Experience Section - Dark Elegant */}
        <div className="bg-slate-900 py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-teal-900/20 to-slate-900"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Your Community Homestay Experience
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Every stay includes these carefully curated benefits and experiences
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Utensils,
                  title: 'Traditional Meals',
                  description: 'Enjoy authentic homemade Nepali cuisine prepared with organic local ingredients',
                  features: ['Dal Bhat experience', 'Cooking workshops', 'Seasonal specialties']
                },
                {
                  icon: Mountain,
                  title: 'Guided Activities',
                  description: 'Explore the region with knowledgeable local guides who share their stories',
                  features: ['Village walks', 'Cultural tours', 'Nature hikes']
                },
                {
                  icon: Coffee,
                  title: 'Cultural Immersion',
                  description: 'Participate in daily life and learn traditional crafts and customs',
                  features: ['Local festivals', 'Traditional arts', 'Language lessons']
                },
                {
                  icon: Shield,
                  title: 'Safety & Comfort',
                  description: 'Verified hosts provide clean, comfortable accommodations with modern amenities',
                  features: ['Clean facilities', 'Safe environment', 'Wi-Fi available']
                },
                {
                  icon: Calendar,
                  title: 'Flexible Stays',
                  description: 'Choose from short visits to extended immersion experiences',
                  features: ['Daily bookings', 'Weekly packages', 'Custom duration']
                },
                {
                  icon: Award,
                  title: 'Direct Impact',
                  description: 'Your stay directly supports education, healthcare, and infrastructure',
                  features: ['Community funds', 'Local employment', 'Sustainable growth']
                }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
                >
                  <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center mb-4">
                    <item.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">{item.description}</p>
                  <ul className="space-y-2">
                    {item.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-gray-400">
                        <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust & Stats Section */}
        <div className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Trusted by Travelers Worldwide
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join thousands of guests who have experienced authentic Nepal through our community homestays
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Award, value: '100%', label: 'Verified Hosts', color: 'bg-emerald-600' },
                { icon: Star, value: '4.8/5', label: 'Average Rating', color: 'bg-amber-600' },
                { icon: Smile, value: '5000', label: 'Happy Guests', color: 'bg-rose-600' },
                { icon: Globe, value: '50', label: 'Countries', color: 'bg-blue-600' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className={`w-20 h-20 ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <stat.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-emerald-600 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Start Your Adventure?
              </h2>
              <p className="text-xl text-emerald-100 mb-8">
                Book your community homestay today and experience the real Nepal
              </p>
              <button
                onClick={() => document.getElementById('communities')?.scrollIntoView({ behavior: 'smooth' })}
                className="group px-8 py-4 bg-white text-emerald-700 font-bold rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-2"
              >
                Browse All Communities
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

// Modern Community Card Component
function CommunityCard({ community, index }: { community: Community; index: number }) {
  const mainImage = community.images && community.images.length > 0
    ? community.images[0]
    : '/images/placeholder-homestay.jpg';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/community-homestays/${community.id}`}>
        <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 h-full flex flex-col">
          {/* Image Section */}
          <div className="relative h-64 overflow-hidden">
            <Image
              src={mainImage}
              alt={community.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

            {/* Price Badge */}
            <div className="absolute top-4 right-4 bg-emerald-600 px-4 py-2 rounded-lg shadow-lg">
              <div className="flex items-center gap-1 text-white">
                <span className="text-sm font-medium">NPR</span>
                <span className="text-lg font-bold">{community.pricePerPerson}</span>
              </div>
            </div>

            {/* Homestay Count Badge */}
            {community.homestays.length > 0 && (
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
                <div className="flex items-center gap-1.5">
                  <Home className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-bold text-gray-900">{community.homestays.length}</span>
                </div>
              </div>
            )}

            {/* Title Overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-2xl font-bold text-white line-clamp-2">
                {community.name}
              </h3>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6 flex flex-col">
            <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow leading-relaxed">
              {community.description}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-center w-9 h-9 bg-emerald-100 rounded-lg">
                  <Users className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-medium">Capacity</div>
                  <div className="text-sm font-bold text-gray-900">{community.totalCapacity}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-center w-9 h-9 bg-amber-100 rounded-lg">
                  <Utensils className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-medium">Meals</div>
                  <div className="text-sm font-bold text-gray-900">{community.meals.length}</div>
                </div>
              </div>
            </div>

            {/* Features Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {community.activities.length > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200">
                  <Activity className="h-3 w-3" />
                  {community.activities.length} Activities
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200">
                <MapPin className="h-3 w-3" />
                Nepal
              </span>
            </div>

            {/* Manager & CTA */}
            {community.manager && (
              <div className="border-t border-gray-200 pt-4 mt-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {community.manager.fullName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Managed by</div>
                      <div className="text-sm font-bold text-gray-900">{community.manager.fullName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 group-hover:gap-2 transition-all">
                    <span className="text-sm font-bold">View</span>
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
