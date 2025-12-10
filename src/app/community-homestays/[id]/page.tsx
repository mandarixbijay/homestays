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
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  Search,
  Star,
  Clock,
  Award,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/navbar/navbar';
import Footer from '@/components/footer/footer';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = parseInt(params.id as string);

  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [filteredHomestays, setFilteredHomestays] = useState<any[]>([]);

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
        <div className="min-h-screen flex items-center justify-center pt-20 bg-background">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading community details...</p>
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
        <div className="min-h-screen flex items-center justify-center pt-20 bg-background">
          <div className="text-center">
            <Home className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-card-foreground mb-2">Community Not Found</h2>
            <p className="text-muted-foreground mb-6">The community you're looking for doesn't exist.</p>
            <Link
              href="/community-homestays"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
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
      <div className="min-h-screen bg-gradient-to-b from-background to-gray-50/50 pt-16">
        {/* Back Button */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-card-foreground transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="font-medium">Back</span>
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Gallery */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative"
              >
                {community.images && community.images.length > 0 ? (
                  <div className="relative h-96 lg:h-[500px] rounded-xl overflow-hidden shadow-lg">
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
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-card/95 hover:bg-card p-2 rounded-full shadow-lg transition-colors"
                        >
                          <ChevronLeft className="h-6 w-6 text-card-foreground" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-card/95 hover:bg-card p-2 rounded-full shadow-lg transition-colors"
                        >
                          <ChevronRight className="h-6 w-6 text-card-foreground" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {community.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                index === currentImageIndex
                                  ? 'bg-primary w-6'
                                  : 'bg-white/60 hover:bg-white/80'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="h-96 lg:h-[500px] bg-muted rounded-xl flex items-center justify-center">
                    <Home className="h-20 w-20 text-muted-foreground" />
                  </div>
                )}
              </motion.div>

              {/* Community Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <h1 className="text-3xl sm:text-4xl font-bold text-card-foreground mb-4">{community.name}</h1>
                <p className="text-muted-foreground text-lg mb-6 leading-relaxed">{community.description}</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { icon: Home, label: 'Homestays', value: community.homestays.length },
                    { icon: Users, label: 'Capacity', value: community.totalCapacity },
                    { icon: Utensils, label: 'Meals', value: community.meals.length },
                    { icon: Activity, label: 'Activities', value: community.activities.length }
                  ].map((stat) => (
                    <div key={stat.label} className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <stat.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                          <p className="text-xl font-bold text-card-foreground">{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="bg-primary text-white p-6 rounded-xl mb-6 shadow-lg">
                  <p className="text-sm opacity-90 mb-1">Starting from</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold">NPR</span>
                    <span className="text-4xl font-bold">{community.pricePerPerson}</span>
                    <span className="text-sm opacity-90">per person</span>
                  </div>
                </div>

                {/* Manager Info */}
                {community.manager && (
                  <div className="bg-muted/50 rounded-xl p-5">
                    <h3 className="font-semibold text-card-foreground mb-3">Managed By</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                          {community.manager.fullName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-card-foreground">{community.manager.fullName}</p>
                        <p className="text-sm text-muted-foreground">Community Manager</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-card shadow-sm border-b border-border sticky top-16 z-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <h2 className="text-xl font-bold text-card-foreground mb-4">Check Availability</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Check-in</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={minDate}
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-card-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Check-out</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || minDate}
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-card-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Adults</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <select
                    value={adults}
                    onChange={(e) => setAdults(parseInt(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-background text-card-foreground"
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
                <label className="block text-sm font-medium text-muted-foreground mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-background text-card-foreground"
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
                <button className="w-full px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold flex items-center justify-center gap-2">
                  <Search className="h-5 w-5" />
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          {/* Meals Section */}
          {community.meals && community.meals.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold text-card-foreground mb-6">Included Meals</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {community.meals.map((meal) => (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Utensils className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-bold text-card-foreground">
                          {meal.mealType.charAt(0) + meal.mealType.slice(1).toLowerCase()}
                        </h3>
                      </div>
                      {meal.isIncluded && (
                        <div className="bg-primary/10 p-1.5 rounded-full">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-4">{meal.description}</p>
                    {!meal.isIncluded && meal.extraCost > 0 && (
                      <div className="text-sm font-semibold text-card-foreground">
                        NPR {meal.extraCost}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Activities Section */}
          {community.activities && community.activities.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold text-card-foreground mb-6">Activities & Experiences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {community.activities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-bold text-card-foreground">{activity.name}</h3>
                        </div>
                        {activity.duration && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{activity.duration} hours</span>
                          </div>
                        )}
                      </div>
                      {activity.isIncluded && (
                        <div className="bg-primary/10 p-1.5 rounded-full">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-4">{activity.description}</p>
                    {!activity.isIncluded && activity.extraCost > 0 && (
                      <div className="text-sm font-semibold text-card-foreground">
                        NPR {activity.extraCost}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Homestays Section */}
          {filteredHomestays.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold text-card-foreground mb-6">
                Partner Homestays ({filteredHomestays.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHomestays.map((homestay) => (
                  <motion.div
                    key={homestay.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-lg font-bold text-card-foreground mb-3">{homestay.name}</h3>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{homestay.address}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Home className="h-4 w-4" />
                          <span>Rooms</span>
                        </div>
                        <p className="text-lg font-bold text-card-foreground">{homestay.totalRooms}</p>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Users className="h-4 w-4" />
                          <span>Capacity</span>
                        </div>
                        <p className="text-lg font-bold text-card-foreground">{homestay.totalCapacity}</p>
                      </div>
                    </div>
                  </motion.div>
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
