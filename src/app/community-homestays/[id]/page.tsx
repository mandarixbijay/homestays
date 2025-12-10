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
  Wifi,
  Car,
  Coffee,
  Bath,
  Tv,
  Wind,
  Navigation,
  Share2,
  BookOpen,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Facebook,
  Twitter,
  Link as LinkIcon,
  Copy,
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
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

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

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const text = `Check out ${community?.name} on Nepal Homestays`;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
        break;
    }
  };

  // Sample amenities data
  const amenities = [
    { icon: Wifi, name: 'Free WiFi', description: 'High-speed internet access' },
    { icon: Car, name: 'Parking', description: 'Free parking available' },
    { icon: Coffee, name: 'Breakfast', description: 'Traditional Nepali breakfast' },
    { icon: Bath, name: 'Hot Shower', description: 'Hot water available' },
    { icon: Tv, name: 'Common TV', description: 'Shared entertainment area' },
    { icon: Wind, name: 'Garden', description: 'Outdoor relaxation space' },
  ];

  // Sample FAQ data
  const faqs = [
    {
      question: 'What is included in the community homestay package?',
      answer: 'The package includes accommodation, meals as specified, community activities, and cultural experiences. All proceeds directly support the local community.'
    },
    {
      question: 'How do I book a homestay?',
      answer: 'You can book directly through our website by selecting your dates and preferred homestay. Our team will confirm availability and send you booking details.'
    },
    {
      question: 'What should I bring?',
      answer: 'Bring comfortable walking shoes, weather-appropriate clothing, personal toiletries, and any medications you need. Don\'t forget your camera to capture memories!'
    },
    {
      question: 'Is the area safe for tourists?',
      answer: 'Yes, our community homestays are in safe, welcoming areas. Local hosts are experienced in hosting international guests and ensuring their comfort and safety.'
    },
    {
      question: 'Can I communicate with hosts before arrival?',
      answer: 'Yes, after booking confirmation, we\'ll connect you with your host family so you can communicate directly and plan your arrival.'
    },
  ];

  // Sample related blogs
  const relatedBlogs = [
    {
      id: 1,
      title: 'A Complete Guide to Community Tourism in Nepal',
      excerpt: 'Discover how community-based tourism is transforming rural Nepal...',
      image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=400',
      date: '2024-01-15'
    },
    {
      id: 2,
      title: 'Traditional Nepali Cuisine: What to Expect',
      excerpt: 'From dal bhat to local delicacies, explore the flavors of Nepal...',
      image: 'https://images.unsplash.com/photo-1596040033229-a0b8d1e0e939?w=400',
      date: '2024-01-10'
    },
    {
      id: 3,
      title: 'Cultural Experiences in Madi Community',
      excerpt: 'Immerse yourself in authentic cultural traditions and daily life...',
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400',
      date: '2024-01-05'
    },
  ];

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
        {/* Back Button & Share */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-card-foreground transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="font-medium">Back</span>
              </button>

              {/* Share Button */}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>

                {/* Share Menu */}
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg p-3 min-w-[200px] z-50"
                  >
                    <button
                      onClick={() => handleShare('facebook')}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg transition-colors text-left"
                    >
                      <Facebook className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-card-foreground">Facebook</span>
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg transition-colors text-left"
                    >
                      <Twitter className="h-5 w-5 text-sky-500" />
                      <span className="text-sm font-medium text-card-foreground">Twitter</span>
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg transition-colors text-left"
                    >
                      {copySuccess ? (
                        <>
                          <Check className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm font-medium text-card-foreground">Copy Link</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
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
          {/* Meals Section - Enhanced */}
          {community.meals && community.meals.length > 0 && (
            <section>
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-card-foreground mb-3">Included Meals</h2>
                <p className="text-muted-foreground">Enjoy authentic Nepali cuisine prepared with fresh, local ingredients</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {community.meals.map((meal, index) => {
                  const mealImages = [
                    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
                    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
                    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
                  ];
                  return (
                    <motion.div
                      key={meal.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -8 }}
                      className="bg-gradient-to-br from-card to-primary/5 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border"
                    >
                      {/* Meal Image */}
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={mealImages[index % mealImages.length]}
                          alt={meal.mealType}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        {meal.isIncluded && (
                          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                            <Check className="h-3 w-3" />
                            Included
                          </div>
                        )}
                        <div className="absolute bottom-4 left-4">
                          <h3 className="text-xl font-bold text-white">
                            {meal.mealType.charAt(0) + meal.mealType.slice(1).toLowerCase()}
                          </h3>
                        </div>
                      </div>

                      {/* Meal Content */}
                      <div className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <Utensils className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground leading-relaxed">{meal.description}</p>
                          </div>
                        </div>

                        {!meal.isIncluded && meal.extraCost > 0 && (
                          <div className="flex items-center justify-between pt-4 border-t border-border">
                            <span className="text-sm text-muted-foreground">Extra Cost</span>
                            <span className="text-lg font-bold text-primary">NPR {meal.extraCost}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Activities Section - Enhanced */}
          {community.activities && community.activities.length > 0 && (
            <section>
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-card-foreground mb-3">Activities & Experiences</h2>
                <p className="text-muted-foreground">Immerse yourself in local culture through engaging activities</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {community.activities.map((activity, index) => {
                  const activityImages = [
                    'https://images.unsplash.com/photo-1533093818801-37d5bc1e1ea2?w=600&h=400&fit=crop',
                    'https://images.unsplash.com/photo-1604079681992-ca5c952a6b98?w=600&h=400&fit=crop',
                    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&h=400&fit=crop',
                  ];
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="group bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-border"
                    >
                      <div className="grid md:grid-cols-5">
                        {/* Activity Image */}
                        <div className="relative h-48 md:h-auto md:col-span-2 overflow-hidden">
                          <Image
                            src={activityImages[index % activityImages.length]}
                            alt={activity.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20"></div>
                          {activity.isIncluded && (
                            <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                              <Check className="h-3 w-3" />
                              Included
                            </div>
                          )}
                        </div>

                        {/* Activity Content */}
                        <div className="md:col-span-3 p-6 flex flex-col">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="bg-primary/10 p-2.5 rounded-xl">
                                <Activity className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-card-foreground">{activity.name}</h3>
                                {activity.duration && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{activity.duration} hours</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <p className="text-muted-foreground leading-relaxed mb-4 flex-grow">{activity.description}</p>

                          {!activity.isIncluded && activity.extraCost > 0 && (
                            <div className="flex items-center justify-between pt-4 border-t border-border">
                              <span className="text-sm font-medium text-muted-foreground">Price for group</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-xs font-semibold text-primary">NPR</span>
                                <span className="text-2xl font-bold text-primary">{activity.extraCost}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Homestays Section - Enhanced */}
          {filteredHomestays.length > 0 && (
            <section>
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-card-foreground mb-3">
                  Partner Homestays ({filteredHomestays.length})
                </h2>
                <p className="text-muted-foreground">Collaborative community approach - Choose from our network of welcoming family homes</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHomestays.map((homestay, index) => {
                  const homestayImages = [
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
                    'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400&h=300&fit=crop',
                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop',
                    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
                    'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=400&h=300&fit=crop',
                    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop',
                    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&h=300&fit=crop',
                  ];
                  return (
                    <motion.div
                      key={homestay.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -6 }}
                      className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border"
                    >
                      {/* Homestay Image */}
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={homestayImages[index % homestayImages.length]}
                          alt={homestay.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-base font-bold text-white line-clamp-2">{homestay.name}</h3>
                        </div>
                      </div>

                      {/* Homestay Content */}
                      <div className="p-5">
                        <div className="flex items-start gap-2 text-sm text-muted-foreground mb-4">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                          <span className="line-clamp-2">{homestay.address}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-3 rounded-lg border border-primary/20">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <Home className="h-4 w-4 text-primary" />
                              <span className="font-medium">Rooms</span>
                            </div>
                            <p className="text-xl font-bold text-card-foreground">{homestay.totalRooms}</p>
                          </div>
                          <div className="bg-gradient-to-br from-accent/5 to-accent/10 p-3 rounded-lg border border-accent/20">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <Users className="h-4 w-4 text-accent" />
                              <span className="font-medium">Capacity</span>
                            </div>
                            <p className="text-xl font-bold text-card-foreground">{homestay.totalCapacity}</p>
                          </div>
                        </div>

                        {/* Partner Badge */}
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="flex items-center gap-2 text-xs text-primary">
                            <Award className="h-4 w-4" />
                            <span className="font-semibold">Community Partner</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Amenities Section */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-card-foreground mb-3">Amenities</h2>
              <p className="text-muted-foreground">Comfortable facilities for a pleasant stay</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {amenities.map((amenity, index) => (
                <motion.div
                  key={amenity.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="bg-gradient-to-br from-card to-primary/5 rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-all border border-border"
                >
                  <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                    <amenity.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h4 className="font-semibold text-card-foreground text-sm mb-1">{amenity.name}</h4>
                  <p className="text-xs text-muted-foreground">{amenity.description}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* How to Get Here Section */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-card-foreground mb-3">How to Get Here</h2>
              <p className="text-muted-foreground">Easy access from major cities</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Directions */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-card rounded-2xl p-6 shadow-md border border-border"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <Navigation className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-card-foreground">Directions</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-card-foreground mb-1">From Kathmandu</h4>
                      <p className="text-sm text-muted-foreground">Take a bus from Ratna Park to Chitwan (5-6 hours). From Chitwan, local transport to Madi village (30 minutes).</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-card-foreground mb-1">From Pokhara</h4>
                      <p className="text-sm text-muted-foreground">Direct bus service available (4-5 hours). Request pickup service from our community team.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-card-foreground mb-1">Airport Pickup</h4>
                      <p className="text-sm text-muted-foreground">We offer pickup service from Bharatpur Airport. Contact us in advance to arrange.</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Map Placeholder */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-card rounded-2xl overflow-hidden shadow-md border border-border"
              >
                <div className="relative h-full min-h-[400px]">
                  <Image
                    src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&h=600&fit=crop"
                    alt="Map location"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-6 w-full">
                      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-bold text-card-foreground">{community?.name}</p>
                            <p className="text-sm text-muted-foreground">Madi, Chitwan, Nepal</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-card-foreground mb-3">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Everything you need to know about your stay</p>
            </div>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="bg-primary/10 p-2 rounded-lg mt-0.5">
                        <HelpCircle className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-card-foreground pr-4">{faq.question}</h3>
                    </div>
                    {openFaqIndex === index ? (
                      <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                  {openFaqIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5"
                    >
                      <div className="pl-11 pr-8">
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </section>

          {/* Related Blogs Section */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-card-foreground mb-3">Related Blogs</h2>
              <p className="text-muted-foreground">Learn more about community tourism in Nepal</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((blog, index) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -6 }}
                >
                  <Link href={`/blogs/${blog.id}`} className="block">
                    <div className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border h-full">
                      {/* Blog Image */}
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={blog.image}
                          alt={blog.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      </div>

                      {/* Blog Content */}
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <BookOpen className="h-4 w-4" />
                          <span>{new Date(blog.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <h3 className="text-lg font-bold text-card-foreground mb-2 line-clamp-2">{blog.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{blog.excerpt}</p>
                        <div className="mt-4 flex items-center gap-2 text-primary font-semibold text-sm">
                          <span>Read More</span>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
