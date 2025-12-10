'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { communityAPI, Community, Homestay } from '@/lib/api/community';
import { publicBlogApi } from '@/lib/api/public-blog-api';
import { extractCommunityId } from '@/lib/utils/slug';
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
  ExternalLink,
  Sparkles,
  Heart,
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

// SVG Meal Icons
const MealIcons = {
  BREAKFAST: () => (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M32 8C18.745 8 8 18.745 8 32s10.745 24 24 24 24-10.745 24-24S45.255 8 32 8z" fill="#FFF3E0"/>
      <circle cx="32" cy="28" r="12" fill="#FFB74D"/>
      <path d="M32 16v12M38 22h-12" stroke="#F57C00" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 40h32" stroke="#FF9800" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M20 44c0 2 1 4 3 5M44 44c0 2-1 4-3 5" stroke="#FF9800" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  LUNCH: () => (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M32 6C17.088 6 5 18.088 5 33s12.088 27 27 27 27-12.088 27-27S46.912 6 32 6z" fill="#F1F8E9"/>
      <ellipse cx="32" cy="30" rx="18" ry="16" fill="#AED581"/>
      <path d="M20 22c2-2 5-3 12-3s10 1 12 3" stroke="#689F38" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="26" cy="26" r="2" fill="#558B2F"/>
      <circle cx="38" cy="26" r="2" fill="#558B2F"/>
      <circle cx="32" cy="32" r="2" fill="#558B2F"/>
      <path d="M20 40h24M24 44h16M26 48h12" stroke="#7CB342" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  DINNER: () => (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <circle cx="32" cy="32" r="26" fill="#E8EAF6"/>
      <path d="M18 24h28v20H18z" fill="#9FA8DA" rx="2"/>
      <path d="M18 24c0-2 2-4 6-4h12c4 0 6 2 6 4" stroke="#5C6BC0" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="24" cy="30" r="1.5" fill="#3F51B5"/>
      <circle cx="32" cy="32" r="1.5" fill="#3F51B5"/>
      <circle cx="40" cy="30" r="1.5" fill="#3F51B5"/>
      <path d="M22 38h20M24 42h16" stroke="#7986CB" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 48h32" stroke="#5C6BC0" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
};


export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();

  // Extract ID from slug (supports both slug and numeric ID formats)
  const communityId = extractCommunityId(params.id as string);

  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [homestayDetails, setHomestayDetails] = useState<Homestay[]>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [relatedBlogs, setRelatedBlogs] = useState<any[]>([]);
  const [isCheckAvailabilityVisible, setIsCheckAvailabilityVisible] = useState(false);

  useEffect(() => {
    fetchCommunity();
    fetchBlogs();
  }, [communityId]);

  useEffect(() => {
    if (community && community.homestays.length > 0) {
      fetchHomestayDetails();
    }
  }, [community]);

  // Update meta tags for social media sharing
  useEffect(() => {
    if (!community) return;

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const ogImage = community.images && community.images.length > 0
      ? community.images[0]
      : 'https://www.nepalhomestays.com/images/og-default.jpg';

    const description = `${community.description.slice(0, 155)}... Experience authentic Nepali hospitality with ${community.homestays.length} partner homestays.`;

    // Update document title
    document.title = `${community.name} - Community Homestays | Nepal Homestays`;

    // Update or create meta tags
    const updateMetaTag = (property: string, content: string, isName = false) => {
      const attribute = isName ? 'name' : 'property';
      let meta = document.querySelector(`meta[${attribute}="${property}"]`);

      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, property);
        document.head.appendChild(meta);
      }

      meta.setAttribute('content', content);
    };

    // Open Graph tags
    updateMetaTag('og:title', `${community.name} - Community Homestays`);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', ogImage);
    updateMetaTag('og:url', currentUrl);
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:site_name', 'Nepal Homestays');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', true);
    updateMetaTag('twitter:title', `${community.name} - Community Homestays`, true);
    updateMetaTag('twitter:description', description, true);
    updateMetaTag('twitter:image', ogImage, true);

    // Standard meta tags
    updateMetaTag('description', description, true);
    updateMetaTag('keywords', `${community.name}, community homestays, Nepal, authentic travel, cultural tourism, ${community.homestays.length} homestays`, true);

    return () => {
      // Cleanup: reset to default title on unmount
      document.title = 'Nepal Homestays';
    };
  }, [community]);

  const fetchCommunity = async () => {
    if (!communityId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await communityAPI.getCommunity(communityId);
      setCommunity(data);
    } catch (error) {
      console.error('Error fetching community:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHomestayDetails = async () => {
    if (!community) return;

    try {
      const detailsPromises = community.homestays.map(h =>
        communityAPI.getHomestay(h.id).catch(err => {
          console.error(`Error fetching homestay ${h.id}:`, err);
          return null;
        })
      );
      const details = await Promise.all(detailsPromises);
      setHomestayDetails(details.filter(d => d !== null) as Homestay[]);
    } catch (error) {
      console.error('Error fetching homestay details:', error);
    }
  };

  const fetchBlogs = async () => {
    try {
      // Try to get featured blogs directly (most reliable)
      // Skip search functionality since the search API endpoint may not be available
      let blogs = [];

      try {
        blogs = await publicBlogApi.getFeaturedBlogs(3);
      } catch (featuredError) {
        // Silently fail if featured blogs are not available
        // This prevents console errors from showing
      }

      setRelatedBlogs(blogs || []);
    } catch (error) {
      // Silently set empty array if all methods fail
      setRelatedBlogs([]);
    }
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

  // Extract unique amenities from all homestays
  const getUniqueAmenities = () => {
    const iconMap: Record<string, any> = {
      'wifi': Wifi,
      'wi-fi': Wifi,
      'parking': Car,
      'breakfast': Coffee,
      'hot': Bath,
      'shower': Bath,
      'tv': Tv,
      'television': Tv,
      'garden': Wind,
      'yard': Wind,
    };

    const amenitiesSet = new Set<string>();
    const amenitiesList: Array<{ icon: any; name: string; description: string }> = [];

    homestayDetails.forEach(homestay => {
      homestay?.facilities?.forEach((facility: any) => {
        const facilityName = facility.name || facility;
        const lowerName = String(facilityName).toLowerCase();

        if (!amenitiesSet.has(lowerName)) {
          amenitiesSet.add(lowerName);

          // Find matching icon
          let icon = Award; // Default icon
          Object.keys(iconMap).forEach(key => {
            if (lowerName.includes(key)) {
              icon = iconMap[key];
            }
          });

          amenitiesList.push({
            icon,
            name: String(facilityName),
            description: facility.description || 'Available at community homestays'
          });
        }
      });
    });

    return amenitiesList.length > 0 ? amenitiesList : [
      { icon: Wifi, name: 'Free WiFi', description: 'High-speed internet access' },
      { icon: Car, name: 'Parking', description: 'Free parking available' },
      { icon: Coffee, name: 'Breakfast', description: 'Traditional Nepali breakfast' },
      { icon: Bath, name: 'Hot Shower', description: 'Hot water available' },
      { icon: Tv, name: 'Common TV', description: 'Shared entertainment area' },
      { icon: Wind, name: 'Garden', description: 'Outdoor relaxation space' },
    ];
  };

  const amenities = getUniqueAmenities();

  // FAQ data
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

  const minDate = new Date().toISOString().split('T')[0];

  const getGoogleMapsDirectionUrl = () => {
    if (!community) return '';
    const address = `${community.name}, Madi, Chitwan, Nepal`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

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

        {/* Check Availability Section - Sticky bottom on mobile, sticky top on desktop */}
        <div className="fixed bottom-0 left-0 right-0 md:sticky md:top-16 bg-card shadow-lg md:shadow-sm border-t md:border-b border-border z-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 md:py-6">
            <h2 className="text-lg md:text-xl font-bold text-card-foreground mb-3 md:mb-4">Check Availability</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-muted-foreground mb-1 md:mb-2">Check-in</label>
                <div className="relative">
                  <Calendar className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 h-4 md:h-5 w-4 md:w-5 text-muted-foreground" />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={minDate}
                    className="w-full pl-8 md:pl-10 pr-2 md:pr-4 py-2 md:py-2.5 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-card-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-muted-foreground mb-1 md:mb-2">Check-out</label>
                <div className="relative">
                  <Calendar className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 h-4 md:h-5 w-4 md:w-5 text-muted-foreground" />
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || minDate}
                    className="w-full pl-8 md:pl-10 pr-2 md:pr-4 py-2 md:py-2.5 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-card-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-muted-foreground mb-1 md:mb-2">
                  Adults (Max: {community.totalCapacity})
                </label>
                <div className="relative">
                  <Users className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 h-4 md:h-5 w-4 md:w-5 text-muted-foreground" />
                  <input
                    type="number"
                    min="1"
                    max={community.totalCapacity}
                    value={adults}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      if (value >= 1 && value <= community.totalCapacity) {
                        setAdults(value);
                      }
                    }}
                    className="w-full pl-8 md:pl-10 pr-2 md:pr-4 py-2 md:py-2.5 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-card-foreground"
                    placeholder={`1-${community.totalCapacity}`}
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button className="w-full px-4 md:px-6 py-2 md:py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold flex items-center justify-center gap-2 text-sm md:text-base">
                  <Search className="h-4 md:h-5 w-4 md:w-5" />
                  <span className="hidden sm:inline">Search</span>
                  <span className="sm:hidden">Go</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer for fixed bottom bar on mobile */}
        <div className="h-32 md:h-0"></div>

        {/* Main Content */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          {/* Meals Section - Compact */}
          {community.meals && community.meals.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-card-foreground mb-4 flex items-center gap-2">
                <Utensils className="h-6 w-6 text-primary" />
                Included Meals
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {community.meals.map((meal, index) => {
                  const MealIcon = MealIcons[meal.mealType] || MealIcons.BREAKFAST;
                  return (
                    <motion.div
                      key={meal.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex-shrink-0 w-64 bg-gradient-to-br from-card to-primary/5 rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-border"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 flex-shrink-0">
                          <MealIcon />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-card-foreground text-sm">
                            {meal.mealType.charAt(0) + meal.mealType.slice(1).toLowerCase()}
                          </h3>
                          {meal.isIncluded && (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                              <Check className="h-3 w-3" />
                              Included
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{meal.description}</p>
                      {!meal.isIncluded && meal.extraCost > 0 && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <span className="text-sm font-bold text-primary">NPR {meal.extraCost}</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Activities Section - Horizontal Scroll with Real Images */}
          {community.activities && community.activities.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-card-foreground mb-6 flex items-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                Activities & Experiences
              </h2>
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {community.activities.map((activity, index) => {
                  const activityImage = activity.images && activity.images.length > 0
                    ? activity.images[0]
                    : '/images/fallback-image.png';

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex-shrink-0 w-[420px] bg-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-border overflow-hidden group"
                    >
                      <div className="flex flex-row h-full">
                        {/* Activity Image - Left Side */}
                        <div className="relative w-2/5 overflow-hidden">
                          <Image
                            src={activityImage}
                            alt={activity.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10"></div>
                          {activity.isIncluded && (
                            <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                              <Check className="h-3.5 w-3.5" />
                              Included
                            </div>
                          )}
                        </div>

                        {/* Activity Content - Right Side */}
                        <div className="flex-1 p-5 flex flex-col justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-card-foreground mb-2 line-clamp-2 leading-tight">{activity.name}</h3>

                            {activity.duration && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                                <Clock className="h-4 w-4 text-primary" />
                                <span className="font-medium">{activity.duration} hours</span>
                              </div>
                            )}

                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{activity.description}</p>
                          </div>

                          {!activity.isIncluded && activity.extraCost > 0 && (
                            <div className="mt-4 pt-3 border-t border-border">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Price per group</span>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-xs font-semibold text-primary">NPR</span>
                                  <span className="text-xl font-bold text-primary">{activity.extraCost}</span>
                                </div>
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

          {/* Homestays Section - Gallery Format */}
          {homestayDetails.length > 0 && (
            <section>
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full mb-4">
                  <Home className="h-4 w-4" />
                  <span className="text-sm font-semibold">{homestayDetails.length} Family Homestays</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-card-foreground mb-4">
                  Meet Your Host Families
                </h2>
                <div className="max-w-3xl mx-auto mb-8">
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Our community homestay brings together {homestayDetails.length} welcoming families who will host you during your stay.
                    Each family opens their home to share authentic Nepali culture, home-cooked meals, and warm hospitality.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    When you book with our community, you'll be matched with one of these wonderful families based on availability and your preferences.
                    Every homestay offers a unique experience while maintaining the high standards of comfort and authenticity we're known for.
                  </p>
                </div>
              </div>

              {/* Staggered Gallery Grid */}
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                {homestayDetails.map((homestay, index) => {
                  const mainImage = homestay.images?.find(img => img.isMain)?.url || homestay.images?.[0]?.url || homestay.imageSrc;
                  // Vary heights for staggered effect
                  const heights = ['h-64', 'h-72', 'h-80', 'h-64', 'h-72', 'h-80'];
                  const heightClass = heights[index % heights.length];

                  return (
                    <motion.div
                      key={homestay.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="break-inside-avoid mb-4"
                    >
                      <div className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer">
                        <div className={`relative ${heightClass} overflow-hidden`}>
                          {mainImage ? (
                            <Image
                              src={mainImage}
                              alt={homestay.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-700"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/20 to-muted/20 flex items-center justify-center">
                              <Home className="h-16 w-16 text-muted-foreground opacity-50" />
                            </div>
                          )}

                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                          {/* Verification Badge */}
                          <div className="absolute top-3 right-3">
                            <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                              <div className="flex items-center gap-1.5">
                                <Award className="h-3 w-3 text-primary" />
                                <span className="text-xs font-bold text-primary">Verified</span>
                              </div>
                            </div>
                          </div>

                          {/* Homestay Name - Bottom */}
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-lg font-bold text-white mb-2 drop-shadow-lg line-clamp-2">
                            {homestay.name}
                          </h3>
                          <div className="flex items-center gap-2 text-white/90">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="text-xs line-clamp-1">{homestay.address}</span>
                            {homestay.rating && homestay.rating > 0 && (
                              <div className="flex items-center gap-1 mt-2">
                                <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                                <span className="text-sm font-semibold text-white">{homestay.rating.toFixed(1)}</span>
                                <span className="text-xs text-white/70 ml-1">• Hosted by {homestay.ownerId || 'Family'}</span>
                              </div>
                            )}
                            </div>
                          </div>
  
                            {/* Hover Overlay with Quick Info */}
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6">
                            <div className="text-center space-y-3">
                              <div className="flex items-center justify-center gap-6">
                                    <div className="text-center">
                                      <p className="text-2xl font-bold text-white">{homestay.rooms?.length || 0}</p>
                                      <p className="text-xs text-white/80">Rooms</p>
                                    </div>
                                    <div className="h-8 w-px bg-white/30"></div>
                                    <div className="text-center">
                                      <p className="text-2xl font-bold text-white">
                                        {homestay.rooms?.reduce((sum, room) => sum + (((room as any)?.capacity || 0)), 0) || 0}
                                      </p>
                                      <p className="text-xs text-white/80">Guests</p>
                                    </div>
                                    <div className="h-8 w-px bg-white/30"></div>
                                    <div className="text-center">
                                      <p className="text-2xl font-bold text-white">{homestay.facilities?.length || 0}</p>
                                      <p className="text-xs text-white/80">Amenities</p>
                                    </div>
                                  </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Homestay Highlights Section */}
          {community && (
            <section>
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full mb-4">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-semibold">What Makes Us Special</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-card-foreground mb-3">
                  Community Highlights
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Discover what makes our community homestay experience truly authentic and memorable
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Highlight 1: Local Cuisine */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0 }}
                  className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-2xl p-6 border border-orange-500/20 hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Utensils className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-bold text-card-foreground mb-2">Authentic Cuisine</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Enjoy traditional {community.meals.length}+ meal options prepared with locally sourced ingredients and family recipes passed down through generations.
                  </p>
                </motion.div>

                {/* Highlight 2: Cultural Activities */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl p-6 border border-blue-500/20 hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-card-foreground mb-2">Cultural Experiences</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Participate in {community.activities.length}+ authentic activities including traditional dances, local crafts, and village tours.
                  </p>
                </motion.div>

                {/* Highlight 3: Community Living */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-2xl p-6 border border-green-500/20 hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-card-foreground mb-2">Community Living</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Experience life as part of a {community.totalCapacity}-person community with {homestayDetails.length} welcoming families working together.
                  </p>
                </motion.div>

                {/* Highlight 4: Sustainable Tourism */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-2xl p-6 border border-purple-500/20 hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-card-foreground mb-2">Sustainable Tourism</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your stay directly supports local families and preserves cultural heritage while promoting responsible travel practices.
                  </p>
                </motion.div>
              </div>
            </section>
          )}

          {/* Nearby Attractions Section */}
          <section>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full mb-4">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-semibold">Explore the Area</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-card-foreground mb-3">
                Nearby Attractions
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover amazing places and experiences within reach of our community
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Attraction 1 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="group relative bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-border"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="relative md:w-2/5 h-48 md:h-auto overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&h=600&fit=crop"
                      alt="Chitwan National Park"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      unoptimized
                    />
                    <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-xs font-bold text-white">5 km</span>
                    </div>
                  </div>
                  <div className="flex-1 p-6">
                    <h3 className="text-xl font-bold text-card-foreground mb-2">Chitwan National Park</h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      UNESCO World Heritage Site famous for rhinoceros, Bengal tigers, and diverse wildlife. Enjoy jungle safaris, canoe rides, and bird watching.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>15 min drive</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">4.8</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Attraction 2 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="group relative bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-border"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="relative md:w-2/5 h-48 md:h-auto overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&h=600&fit=crop"
                      alt="Rapti River"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      unoptimized
                    />
                    <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-xs font-bold text-white">2 km</span>
                    </div>
                  </div>
                  <div className="flex-1 p-6">
                    <h3 className="text-xl font-bold text-card-foreground mb-2">Rapti River</h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      Scenic river perfect for canoeing, boat rides, and sunset views. Watch crocodiles basking and enjoy peaceful riverside walks.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>5 min walk</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">4.6</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Attraction 3 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="group relative bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-border"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="relative md:w-2/5 h-48 md:h-auto overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop"
                      alt="Tharu Cultural Museum"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      unoptimized
                    />
                    <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-xs font-bold text-white">3 km</span>
                    </div>
                  </div>
                  <div className="flex-1 p-6">
                    <h3 className="text-xl font-bold text-card-foreground mb-2">Tharu Cultural Museum</h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      Learn about indigenous Tharu culture, traditional lifestyle, and heritage. Experience authentic dance performances and cultural exhibits.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>10 min drive</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">4.5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Attraction 4 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="group relative bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-border"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="relative md:w-2/5 h-48 md:h-auto overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1551244072-5d12893278ab?w=800&h=600&fit=crop"
                      alt="Elephant Breeding Center"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      unoptimized
                    />
                    <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-xs font-bold text-white">8 km</span>
                    </div>
                  </div>
                  <div className="flex-1 p-6">
                    <h3 className="text-xl font-bold text-card-foreground mb-2">Elephant Breeding Center</h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      Visit baby elephants and learn about conservation efforts. Observe elephants bathing in the river and enjoy close encounters.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>20 min drive</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">4.7</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

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

              {/* Google Maps Direction */}
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
                    <div className="p-6 w-full space-y-4">
                      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <MapPin className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-bold text-card-foreground">{community?.name}</p>
                            <p className="text-sm text-muted-foreground">Madi, Chitwan, Nepal</p>
                          </div>
                        </div>
                        <a
                          href={getGoogleMapsDirectionUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                        >
                          <Navigation className="h-5 w-5" />
                          <span>Get Directions</span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
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

          {/* Related Blogs Section - Real Data */}
          {relatedBlogs.length > 0 && (
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
                    <Link href={`/blogs/${blog.slug}`} className="block">
                      <div className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border h-full">
                        {/* Blog Image */}
                        <div className="relative h-48 overflow-hidden">
                          {blog.featuredImage ? (
                            <Image
                              src={blog.featuredImage}
                              alt={blog.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                              <BookOpen className="h-16 w-16 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        </div>

                        {/* Blog Content */}
                        <div className="p-5">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                            <BookOpen className="h-4 w-4" />
                            <span>{new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
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
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
