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
  TrendingUp,
  Mountain,
  Smile,
  Coffee,
  Leaf,
  Shield,
  Clock,
  Calendar,
  ArrowRight,
  Check,
  Zap,
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
      <div className="min-h-screen bg-gradient-to-b from-white to-teal-50/30 pt-16">
        {/* Hero Section with Background Image */}
        <div className="relative min-h-[75vh] flex items-center justify-center overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/tophomestay/ghandruk_homestay.jpg"
              alt="Community Homestays Nepal"
              fill
              className="object-cover"
              priority
            />
            {/* Dark Green/Teal Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-900/95 via-emerald-900/90 to-teal-800/95"></div>
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500/20 backdrop-blur-md border border-teal-400/30 rounded-full mb-6">
                <Leaf className="h-4 w-4 text-teal-300" />
                <span className="text-sm font-semibold text-teal-100">Authentic Community Tourism</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 text-white leading-tight">
                Discover Nepal Through
                <span className="block mt-2 bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                  Community Homestays
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl sm:text-2xl text-teal-100 max-w-3xl mx-auto mb-10 leading-relaxed">
                Experience authentic cultural immersion with local families. Support sustainable tourism while creating unforgettable memories.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <button
                  onClick={() => document.getElementById('communities')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl shadow-2xl hover:shadow-teal-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  Explore Communities
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Learn More
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl mx-auto mb-3 shadow-lg">
                    <Home className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-1">
                    {totalHomestays}+
                  </div>
                  <div className="text-sm text-teal-200 font-medium">Homestays Available</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl mx-auto mb-3 shadow-lg">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-1">
                    {totalCapacity}+
                  </div>
                  <div className="text-sm text-teal-200 font-medium">Guest Capacity</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-xl mx-auto mb-3 shadow-lg">
                    <MapPin className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-1">
                    {communities.length}+
                  </div>
                  <div className="text-sm text-teal-200 font-medium">Active Communities</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* What is Community Homestay - Informative Section */}
        <div className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-full mb-4">
                <Target className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-semibold text-teal-700">Understanding Community Tourism</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
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
                  color: 'from-rose-500 to-pink-600'
                },
                {
                  icon: Leaf,
                  title: 'Sustainable Tourism',
                  description: 'Eco-friendly practices that preserve natural resources and protect the environment for future generations.',
                  color: 'from-emerald-500 to-teal-600'
                },
                {
                  icon: Users,
                  title: 'Cultural Exchange',
                  description: 'Genuine interactions with host families, learning traditions, language, and local ways of life.',
                  color: 'from-blue-500 to-indigo-600'
                },
                {
                  icon: Zap,
                  title: 'Community Development',
                  description: 'Revenue directly funds local infrastructure, education, and community improvement projects.',
                  color: 'from-amber-500 to-orange-600'
                }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-200"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                    <item.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Search Bar - Sticky */}
        <div id="communities" className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-teal-600" />
                <input
                  type="text"
                  placeholder="Search communities by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 placeholder:text-gray-500"
                />
              </div>
              <div className="sm:w-72">
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-teal-600" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full pl-12 pr-10 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none bg-white transition-all text-gray-900"
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
              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              <span className="text-gray-700">
                <span className="font-bold text-teal-600">{filteredCommunities.length}</span> {filteredCommunities.length === 1 ? 'community' : 'communities'} found
              </span>
            </div>
          </div>
        </div>

        {/* Communities Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="h-16 w-16 text-teal-600 animate-spin mb-4" />
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
                className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
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

        {/* Why Choose Section - Enhanced */}
        <div className="bg-gradient-to-br from-teal-900 via-emerald-900 to-teal-800 py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
                Your Community Homestay Experience
              </h2>
              <p className="text-xl text-teal-100 max-w-2xl mx-auto">
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
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <item.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-teal-100 mb-4 leading-relaxed">{item.description}</p>
                  <ul className="space-y-2">
                    {item.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-teal-200">
                        <Check className="h-4 w-4 text-teal-400 flex-shrink-0" />
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
        <div className="bg-gradient-to-b from-teal-50 to-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                Trusted by Travelers Worldwide
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join thousands of guests who have experienced authentic Nepal through our community homestays
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Award, value: '100%', label: 'Verified Hosts', color: 'from-teal-500 to-emerald-600' },
                { icon: Star, value: '4.8/5', label: 'Average Rating', color: 'from-amber-500 to-orange-600' },
                { icon: Smile, value: '5000+', label: 'Happy Guests', color: 'from-rose-500 to-pink-600' },
                { icon: Globe, value: '50+', label: 'Countries', color: 'from-blue-500 to-indigo-600' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className={`w-20 h-20 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
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
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Ready to Start Your Adventure?
              </h2>
              <p className="text-xl text-teal-100 mb-8">
                Book your community homestay today and experience the real Nepal
              </p>
              <button
                onClick={() => document.getElementById('communities')?.scrollIntoView({ behavior: 'smooth' })}
                className="group px-8 py-4 bg-white text-teal-700 font-bold rounded-xl shadow-2xl hover:shadow-white/50 transition-all duration-300 hover:scale-105 inline-flex items-center gap-2"
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
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link href={`/community-homestays/${community.id}`}>
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200 h-full flex flex-col">
          {/* Image Section */}
          <div className="relative h-64 overflow-hidden">
            <Image
              src={mainImage}
              alt={community.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

            {/* Price Badge */}
            <div className="absolute top-4 right-4 bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-2.5 rounded-xl shadow-lg">
              <div className="flex items-center gap-1.5 text-white">
                <DollarSign className="h-5 w-5" />
                <span className="text-lg font-bold">{community.pricePerPerson}</span>
                <span className="text-xs opacity-90">/person</span>
              </div>
            </div>

            {/* Homestay Count Badge */}
            {community.homestays.length > 0 && (
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-md">
                <div className="flex items-center gap-1.5">
                  <Home className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-bold text-gray-900">{community.homestays.length}</span>
                </div>
              </div>
            )}

            {/* Title Overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-2xl font-bold text-white line-clamp-2 drop-shadow-lg">
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
              <div className="flex items-center gap-2 px-3 py-2.5 bg-teal-50 rounded-xl border border-teal-100">
                <div className="flex items-center justify-center w-9 h-9 bg-teal-100 rounded-lg">
                  <Users className="h-4 w-4 text-teal-600" />
                </div>
                <div>
                  <div className="text-xs text-teal-600 font-medium">Capacity</div>
                  <div className="text-sm font-bold text-gray-900">{community.totalCapacity}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="flex items-center justify-center w-9 h-9 bg-emerald-100 rounded-lg">
                  <Utensils className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs text-emerald-600 font-medium">Meals</div>
                  <div className="text-sm font-bold text-gray-900">{community.meals.length}</div>
                </div>
              </div>
            </div>

            {/* Features Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {community.activities.length > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 text-xs font-semibold rounded-lg border border-teal-200">
                  <Activity className="h-3 w-3" />
                  {community.activities.length} Activities
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-xs font-semibold rounded-lg border border-amber-200">
                <MapPin className="h-3 w-3" />
                Nepal
              </span>
            </div>

            {/* Manager & CTA */}
            {community.manager && (
              <div className="border-t border-gray-200 pt-4 mt-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white text-sm font-bold">
                        {community.manager.fullName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Managed by</div>
                      <div className="text-sm font-bold text-gray-900">{community.manager.fullName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-teal-600 group-hover:gap-2 transition-all">
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
