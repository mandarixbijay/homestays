'use client';

import React, { useState, useEffect } from 'react';
import { communityAPI, Community } from '@/lib/api/community';
import { generateCommunitySlug } from '@/lib/utils/slug';
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
  Award,
  TrendingUp,
  Sparkles,
  Heart,
  CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Navbar from '@/components/navbar/navbar';
import Footer from '@/components/footer/footer';

// Animation variants matching your site style
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      // use a named easing to satisfy TypeScript typings
      ease: 'easeOut',
    },
  },
};

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
      <div className="min-h-screen bg-gradient-to-b from-background to-gray-50/50 pt-16">
        {/* Hero Section with Background Image */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative h-[500px] md:h-[600px] overflow-hidden"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070"
              alt="Community Homestays Nepal"
              fill
              className="object-cover"
              unoptimized
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
          </div>

          {/* Content */}
          <div className="relative h-full container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/20"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-white">Community Tourism</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight"
              >
                Discover Community Homestays
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-10"
              >
                Experience authentic Nepalese culture while directly supporting local communities through sustainable tourism
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="grid grid-cols-3 gap-6 max-w-2xl mx-auto"
              >
                {[
                  { icon: Home, value: totalHomestays, label: 'Homestays' },
                  { icon: Users, value: totalCapacity, label: 'Capacity' },
                  { icon: CheckCircle, value: communities.length, label: 'Communities' }
                ].map((stat, index) => (
                  <div
                    key={stat.label}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-3">
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-white/80 mt-1">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Search & Filter Section - Modern Design */}
        <div className="bg-card shadow-sm border-b border-border sticky top-16 z-30">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search communities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-card-foreground bg-background"
                />
              </div>
              <div className="md:w-72">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-background transition-all text-card-foreground"
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
            {filteredCommunities.length > 0 && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>
                  <span className="font-semibold text-primary">{filteredCommunities.length}</span> {filteredCommunities.length === 1 ? 'community' : 'communities'} found
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Communities Grid */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Loading communities...</p>
            </div>
          ) : filteredCommunities.length === 0 ? (
            <div className="text-center py-32">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Home className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-2">No Communities Found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your search criteria</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedLocation('');
                }}
                className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredCommunities.map((community, index) => (
                <CommunityCard key={community.id} community={community} index={index} />
              ))}
            </motion.div>
          )}
        </div>

        {/* Benefits Section - Clean Cards */}
        <div className="bg-card border-t border-border py-16">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-card-foreground mb-4">
                Why Choose Community Homestays?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Your stay creates positive impact while offering authentic experiences
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Heart,
                  title: 'Direct Community Impact',
                  description: '100% of proceeds go directly to local families and community development projects'
                },
                {
                  icon: Star,
                  title: 'Authentic Experiences',
                  description: 'Live with local families and experience genuine Nepalese culture and traditions'
                },
                {
                  icon: Award,
                  title: 'Sustainable Tourism',
                  description: 'Eco-friendly practices that preserve natural resources and protect the environment'
                }
              ].map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-background rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-card-foreground mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

// Community Card Component - Professional Design
function CommunityCard({ community, index }: { community: Community; index: number }) {
  const mainImage = community.images && community.images.length > 0
    ? community.images[0]
    : '/images/placeholder-homestay.jpg';

  // Extract location from community address
  let location = 'nepal';
  if (community.address) {
    // Take the first part before comma, or the whole address if no comma
    const addressParts = community.address.split(',');
    location = addressParts[0].trim();
  }

  // Generate SEO-friendly slug
  const communitySlug = generateCommunitySlug(community.name, location, community.id);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/community-homestays/${communitySlug}`}>
        <div className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-border h-full flex flex-col">
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            <Image
              src={mainImage}
              alt={community.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Price Badge */}
            <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md">
              <div className="flex items-center gap-1 text-card-foreground">
                <span className="text-xs font-medium">NPR</span>
                <span className="text-sm font-bold">{community.pricePerPerson}</span>
              </div>
            </div>
            {/* Homestay Count */}
            {community.homestays.length > 0 && (
              <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md">
                <div className="flex items-center gap-1.5">
                  <Home className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-card-foreground">{community.homestays.length}</span>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-5 flex flex-col">
            <h3 className="text-xl font-bold text-card-foreground mb-2 line-clamp-1">
              {community.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
              {community.description}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                <Users className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">Capacity</div>
                  <div className="text-sm font-bold text-card-foreground">{community.totalCapacity}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                <Utensils className="h-4 w-4 text-accent" />
                <div>
                  <div className="text-xs text-muted-foreground">Meals</div>
                  <div className="text-sm font-bold text-card-foreground">{community.meals.length}</div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {community.activities.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-md">
                  <Activity className="h-3 w-3" />
                  {community.activities.length} Activities
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-md">
                <MapPin className="h-3 w-3" />
                Nepal
              </span>
            </div>

            {/* Manager */}
            {community.manager && (
              <div className="border-t border-border pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {community.manager.fullName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Managed by</div>
                    <div className="text-sm font-semibold text-card-foreground line-clamp-1">{community.manager.fullName}</div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
