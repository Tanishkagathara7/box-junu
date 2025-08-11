import { useState, useEffect, useMemo, useRef } from "react";
import { MapPin, Zap, Star, Clock, Sparkles, Search, Play, Trophy, Users, Shield, ChevronLeft, ChevronRight, Bell, Target, Filter, Smartphone, Phone, Mail, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";


import Footer from "@/components/Footer";
import LocationSelector from "@/components/LocationSelector";
import GroundCard from "@/components/GroundCard";
import FilterPanel from "@/components/FilterPanel";
import NewBookingModal from "@/components/NewBookingModal";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { City } from "@/lib/cities";
import { groundsApi } from "@/lib/api";
import type { FilterOptions } from "@/components/FilterPanel";
import { calculateDistance } from "@/lib/cities";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { isMongoObjectId } from "@/lib/utils";
import { bookingsApi } from "@/lib/api";

// Demo data for testimonials
const testimonials = [
  {
    name: "Amit Sharma",
    city: "Mumbai",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    review: "Booking a ground was super easy and the facilities were top-notch! Highly recommend BoxCric to all cricket lovers.",
  },
  {
    name: "Priya Verma",
    city: "Delhi",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    review: "Loved the instant confirmation and the variety of grounds available. The support team was very helpful!",
  },
  {
    name: "Rahul Singh",
    city: "Bangalore",
    photo: "https://randomuser.me/api/portraits/men/65.jpg",
    review: "The best platform for booking cricket grounds. The reviews and ratings helped me pick the perfect pitch.",
  },
  {
    name: "Sneha Patel",
    city: "Ahmedabad",
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
    review: "Great experience! The booking process was smooth and the ground was exactly as described.",
  },
];

// Demo data for recent bookings
const recentBookings = [
  "Amit booked Marine Drive Arena, Mumbai",
  "Priya booked Andheri Sports Complex, Mumbai",
  "Rahul booked Powai Cricket Club, Mumbai",
  "Sneha booked Delhi Cricket Stadium, Delhi",
  "Vikram booked Eden Gardens, Kolkata",
  "Anjali booked Chinnaswamy Stadium, Bangalore",
  "Rohit booked Rajiv Gandhi Stadium, Hyderabad",
];

// Helper to merge and deduplicate notifications by id and status
function mergeNotifications(oldNotifs: any[], newNotifs: any[]) {
  const map = new Map();
  
  // Process old notifications first
  oldNotifs.forEach(n => {
    const key = n.id + '-' + n.status;
    map.set(key, n);
  });
  
  // Process new notifications, overwriting old ones if they have the same key
  newNotifs.forEach(n => {
    const key = n.id + '-' + n.status;
    // If this notification exists in the database, remove the isLocal flag
    if (map.has(key) && map.get(key).isLocal) {
      n.isLocal = false;
    }
    map.set(key, n);
  });
  
  return Array.from(map.values());
}

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState<City | undefined>();
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedGround, setSelectedGround] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [grounds, setGrounds] = useState<any[]>([]);
  const [isLoadingGrounds, setIsLoadingGrounds] = useState(false);
  const [heroStats, setHeroStats] = useState({ grounds: 0, players: 0, bookings: 0 });
  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const [isHowItWorksVisible, setIsHowItWorksVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const [isFloatingSearchVisible, setIsFloatingSearchVisible] = useState(false);

  // State for testimonials carousel
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [notifications, setNotifications] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('boxcric_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Auto-advance testimonials every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const defaultFilters: FilterOptions = {
    priceRange: [500, 2000],
    distance: 25,
    amenities: [],
    pitchType: "all",
    lighting: false,
    parking: false,
    rating: 0,
    availability: "all",
  };

  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);

  // Animate stats when they come into view with cricket-themed progression
  const animateStats = () => {
    const targets = { grounds: 500, players: 50000, bookings: 25000 };
    const duration = 2500; // Slightly longer for dramatic effect
    const steps = 80;
    const increment = {
      grounds: targets.grounds / steps,
      players: targets.players / steps,
      bookings: targets.bookings / steps,
    };

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      // Add some bounce effect to make it feel like cricket ball bouncing
      const easeOut = 1 - Math.pow(1 - currentStep / steps, 3);
      setHeroStats({
        grounds: Math.min(Math.floor(increment.grounds * easeOut), targets.grounds),
        players: Math.min(Math.floor(increment.players * easeOut), targets.players),
        bookings: Math.min(Math.floor(increment.bookings * easeOut), targets.bookings),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);
  };

  useEffect(() => {
    if (isStatsVisible) {
      animateStats();
    }
  }, [isStatsVisible]);

  // Add loading state for initial page load
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Simulate initial page load
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Dark mode toggle
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Test API connection on mount
  useEffect(() => {
    const API = import.meta.env.VITE_API_URL || "https://box-cash.onrender.com/api";
    const testAPI = async () => {
      try {
        console.log("🧪 Testing API connection...");
        const response = await fetch(`${API}/test`);
        const data = await response.json();
        console.log("✅ API Test Result:", data);
      } catch (error) {
        console.error("❌ API Test Failed:", error);
      }
    };
    testAPI();
  }, []);

  // Auto-open location selector on first visit
  useEffect(() => {
    if (!selectedCity) {
      const timer = setTimeout(() => {
        setIsLocationSelectorOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedCity]);

  // Add smooth scroll behavior
  useEffect(() => {
    const smoothScroll = (e: any) => {
      if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    };

    document.addEventListener('click', smoothScroll);
    return () => document.removeEventListener('click', smoothScroll);
  }, []);

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.3,
      rootMargin: '-50px 0px'
    };

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isStatsVisible) {
          setIsStatsVisible(true);
          animateStats();
        }
      });
    }, observerOptions);

    const howItWorksObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsHowItWorksVisible(true);
          // Animate steps sequentially
          setTimeout(() => setActiveStep(1), 300);
          setTimeout(() => setActiveStep(2), 600);
          setTimeout(() => setActiveStep(3), 900);
        }
      });
    }, observerOptions);

    if (statsRef.current) statsObserver.observe(statsRef.current);
    if (howItWorksRef.current) howItWorksObserver.observe(howItWorksRef.current);

    // Floating search visibility on scroll
    const handleScroll = () => {
      setIsFloatingSearchVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      if (statsRef.current) statsObserver.unobserve(statsRef.current);
      if (howItWorksRef.current) howItWorksObserver.unobserve(howItWorksRef.current);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isStatsVisible]);

  // Fetch grounds when city or filters change
  useEffect(() => {
    if (selectedCity) {
      fetchGrounds();
    }
  }, [selectedCity, searchQuery, filters]);

  // Restore selected city from localStorage on mount
  useEffect(() => {
    const savedCity = localStorage.getItem("boxcric_selected_city");
    if (savedCity) {
      setSelectedCity(JSON.parse(savedCity));
    }
  }, []);

  // Fetch user booking notifications
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    const fetchNotifications = async () => {
      try {
        const res = await bookingsApi.getMyBookings();
        console.log('Notifications API response:', res);
        
        // Handle different response structures
        let bookings = [];
        if (res.data && res.data.success && Array.isArray(res.data.bookings)) {
          bookings = res.data.bookings;
        } else if (res.data && res.data.success && Array.isArray(res.data.bookings)) {
          bookings = res.data.bookings;
        } else if (Array.isArray(res.data)) {
          bookings = res.data;
        }
        
        if (bookings.length > 0) {
          const newNotifs = bookings
            .filter(b => ["pending", "confirmed", "cancelled", "completed"].includes(b.status))
            .map(b => ({
              id: b._id || b.id,
              status: b.status,
              ground: b.groundId?.name || b.groundId || 'Unknown Ground',
              date: b.bookingDate,
              time: b.timeSlot ? `${b.timeSlot.startTime} - ${b.timeSlot.endTime}` : 'Time not specified',
              reason: b.cancellation?.reason || '',
              createdAt: b.createdAt || new Date().toISOString(),
            }));
          
          setNotifications(prevNotifs => {
            // Keep any local notifications (newly created) and merge with API notifications
            const localNotifs = prevNotifs.filter(n => n.isLocal);
            const merged = mergeNotifications([...localNotifs, ...newNotifs], []);
            localStorage.setItem('boxcric_notifications', JSON.stringify(merged));
            return merged;
          });
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);
  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('boxcric_notifications');
  };

  const fetchGrounds = async () => {
    if (!selectedCity) return;

    try {
      setIsLoadingGrounds(true);
      console.log(
        "🔍 Fetching grounds for city:",
        selectedCity.name,
        selectedCity.id,
      );

      const params: any = {
        cityId: selectedCity.id,
        page: 1,
        limit: 20,
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (filters.priceRange[0] !== 500 || filters.priceRange[1] !== 2000) {
        params.minPrice = filters.priceRange[0];
        params.maxPrice = filters.priceRange[1];
      }

      if (filters.amenities.length > 0) {
        params.amenities = filters.amenities;
      }

      if (filters.pitchType !== "all") {
        params.pitchType = filters.pitchType;
      }

      if (filters.lighting) {
        params.lighting = true;
      }

      if (filters.parking) {
        params.parking = true;
      }

      if (filters.rating > 0) {
        params.minRating = filters.rating;
      }

      if (filters.distance < 25) {
        params.maxDistance = filters.distance;
        params.lat = selectedCity.latitude;
        params.lng = selectedCity.longitude;
      }

      console.log("📡 API Request params:", params);
      const response = await groundsApi.getGrounds(params) as any;
      console.log("📥 API Response:", response);

      if (response.success) {
        console.log("✅ Found grounds:", response.grounds?.length);
        setGrounds(response.grounds || []);
      } else {
        console.log("❌ API returned error:", response.message);
        setGrounds([]);
      }
    } catch (error: any) {
      console.error("❌ Failed to fetch grounds:", error);
      toast.error("Failed to load grounds. Please try again.");
      setGrounds([]);
    } finally {
      setIsLoadingGrounds(false);
    }
  };

  // Replace displayGrounds with only real MongoDB grounds
  const realGrounds = useMemo(() => grounds.filter(g => isMongoObjectId(g._id)), [grounds]);

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    localStorage.setItem("boxcric_selected_city", JSON.stringify(city));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
  };

  const handleBookGround = (groundId: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to book a ground");
      return;
    }
    if (!isMongoObjectId(groundId)) {
      toast.error("This ground cannot be booked online.");
      return;
    }
    const ground = grounds.find((g) => g._id === groundId);
    if (ground) {
      setSelectedGround(ground);
      setIsBookingModalOpen(true);
    }
  };

  const handleViewDetails = (groundId: string) => {
    console.log("View details clicked for ground ID:", groundId);
    console.log("Ground data:", realGrounds.find(g => g._id === groundId));
    navigate(`/ground/${groundId}`);
  };

  const handleBookingCreated = (booking: any) => {
    toast.success("Booking created successfully!");
    
    // Add notification for new booking
    const newNotification = {
      id: booking._id || booking.id || Date.now().toString(),
      status: booking.status || 'pending', // Use actual booking status
      ground: booking.groundId?.name || selectedGround?.name || 'Unknown Ground',
      date: booking.bookingDate,
      time: booking.timeSlot ? `${booking.timeSlot.startTime} - ${booking.timeSlot.endTime}` : 'Time not specified',
      reason: '',
      createdAt: new Date().toISOString(),
      isLocal: true, // Mark as local notification
    };
    
    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      localStorage.setItem('boxcric_notifications', JSON.stringify(updated));
      return updated;
    });
    
    navigate(`/booking/${booking._id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-grass-light via-white to-sky-blue/10">
      {/* Page Loading Overlay */}
      {isPageLoading && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cricket-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading BoxCric</h2>
            <p className="text-gray-600">Finding the best cricket grounds for you...</p>
          </div>
        </div>
      )}

      <Navbar
        selectedCity={selectedCity?.name}
        onCitySelect={() => setIsLocationSelectorOpen(true)}
        onSearch={handleSearch}
        onFilterToggle={() => setIsFilterPanelOpen(true)}
        notifications={notifications}
        showNotifDropdown={showNotifDropdown}
        setShowNotifDropdown={setShowNotifDropdown}
        clearNotifications={clearNotifications}
      />

      {/* Enhanced Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cricket-green/20 via-transparent to-sky-blue/20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2322c55e%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        </div>
        
        {/* Animated Cricket Elements */}
        <div className="absolute top-10 left-2 animate-float hidden sm:block">
          <div className="w-12 h-12 bg-gradient-to-br from-cricket-green/20 to-emerald-200 rounded-full flex items-center justify-center">
            <span className="text-xl">🏏</span>
          </div>
        </div>
        <div className="absolute top-32 right-4 animate-float hidden sm:block" style={{ animationDelay: '1s' }}>
          <div className="w-10 h-10 bg-cricket-yellow/20 rounded-full flex items-center justify-center">
            <span className="text-lg">⚾</span>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/4 animate-float hidden sm:block" style={{ animationDelay: '2s' }}>
          <div className="w-8 h-8 bg-sky-blue/20 rounded-full flex items-center justify-center">
            <span className="text-base">🏟️</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Main Heading */}
          <div className="relative mb-6 sm:mb-8">
            <div className="absolute inset-0 bg-gradient-cricket opacity-20 blur-3xl rounded-full"></div>
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold font-display text-gray-900 mb-4 sm:mb-6 leading-tight">
              Book Your Perfect{" "}
              <span className="text-transparent bg-gradient-to-r from-cricket-green via-cricket-yellow to-sky-blue bg-clip-text animate-pulse">
                Cricket Ground
              </span>
            </h1>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-4">
              Discover amazing box cricket grounds near you. From premium facilities to budget-friendly options, 
              find the perfect pitch for your game in just a few clicks.
            </p>
          </div>

          {/* Animated Stats with Textured Cards */}
          <div ref={statsRef} className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 max-w-4xl mx-auto px-4">
            <Card className="border-0 bg-gradient-to-br from-white via-cricket-green/5 to-emerald-50 backdrop-blur-sm hover:from-white hover:via-cricket-green/10 hover:to-emerald-100 transition-all duration-500 hover:scale-110 hover:shadow-2xl group relative overflow-hidden">
              {/* Textured overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent opacity-50"></div>
              <CardContent className="p-4 sm:p-5 lg:p-6 text-center relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-cricket-green/20 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Trophy className="w-6 h-6 text-cricket-green group-hover:animate-pulse" />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cricket-green to-emerald-600 bg-clip-text text-transparent mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">{heroStats.grounds}+</h3>
                <p className="text-gray-700 font-semibold text-xs sm:text-sm lg:text-base">Premium Cricket Grounds</p>
                {/* Cricket stars rating */}
                <div className="flex justify-center mt-2 space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-cricket-green fill-current animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-white via-cricket-yellow/5 to-orange-50 backdrop-blur-sm hover:from-white hover:via-cricket-yellow/10 hover:to-orange-100 transition-all duration-500 hover:scale-110 hover:shadow-2xl group relative overflow-hidden">
              {/* Textured overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent opacity-50"></div>
              <CardContent className="p-4 sm:p-5 lg:p-6 text-center relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-cricket-yellow/20 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="w-6 h-6 text-cricket-yellow group-hover:animate-bounce" />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cricket-yellow to-orange-500 bg-clip-text text-transparent mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">{heroStats.players}+</h3>
                <p className="text-gray-700 font-semibold text-xs sm:text-sm lg:text-base">Happy Players</p>
                {/* Cricket stars rating */}
                <div className="flex justify-center mt-2 space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-cricket-yellow fill-current animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-white via-sky-blue/5 to-blue-50 backdrop-blur-sm hover:from-white hover:via-sky-blue/10 hover:to-blue-100 transition-all duration-500 hover:scale-110 hover:shadow-2xl group relative overflow-hidden xs:col-span-2 sm:col-span-1">
              {/* Textured overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent opacity-50"></div>
              <CardContent className="p-4 sm:p-5 lg:p-6 text-center relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-sky-blue/20 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Play className="w-6 h-6 text-sky-blue group-hover:animate-spin" />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-sky-blue to-blue-600 bg-clip-text text-transparent mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">{heroStats.bookings}+</h3>
                <p className="text-gray-700 font-semibold text-xs sm:text-sm lg:text-base">Successful Bookings</p>
                {/* Cricket stars rating */}
                <div className="flex justify-center mt-2 space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-sky-blue fill-current animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-0 px-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-cricket-green" />
              <span>100% Secure Booking</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cricket-green" />
              <span>Instant Confirmation</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-cricket-green" />
              <span>Verified Grounds</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Bookings Ticker */}
      <div className="w-full bg-white/80 border-y border-gray-100 py-2 overflow-hidden">
        <div className="flex items-center space-x-2 max-w-7xl mx-auto px-2 animate-marquee whitespace-nowrap text-sm text-gray-700 font-medium">
          <Sparkles className="w-4 h-4 text-cricket-green mr-2" />
          {recentBookings.map((booking, i) => (
            <span key={i} className="mx-4 inline-block hover:text-cricket-green transition-colors cursor-pointer">
              {booking}
            </span>
          ))}
        </div>
      </div>

      {/* Grounds Listing */}
      {selectedCity && (
        <section className="py-8 sm:py-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Cricket Grounds in {selectedCity.name}
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  {realGrounds.length} amazing grounds available for booking
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {Object.values(filters).some((value, index) =>
                  index === 0
                    ? (value as [number, number])[0] !== 500 ||
                      (value as [number, number])[1] !== 2000
                    : index === 1
                      ? value !== 25
                      : index === 2
                        ? (value as string[]).length > 0
                        : index === 3
                          ? value !== "all"
                          : index >= 4 && index <= 5
                            ? value === true
                            : index === 6
                              ? value > 0
                              : value !== "all",
                ) && (
                  <Badge variant="secondary" className="text-sm">
                    Filters Applied
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsFilterPanelOpen(true)}
                  className="flex items-center space-x-2 py-2 px-4 h-10 sm:h-11"
                >
                  <span className="text-sm sm:text-base">Filters</span>
                </Button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFilters({ ...filters, priceRange: [500, 1000] })
                }
                className={cn(
                  "text-xs sm:text-sm py-2 px-3 h-9 sm:h-10",
                  filters.priceRange[1] <= 1000 &&
                    "bg-cricket-green/10 border-cricket-green text-cricket-green",
                )}
              >
                Budget Friendly
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ ...filters, lighting: true })}
                className={cn(
                  "text-xs sm:text-sm py-2 px-3 h-9 sm:h-10",
                  filters.lighting &&
                    "bg-cricket-green/10 border-cricket-green text-cricket-green",
                )}
              >
                Night Games
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ ...filters, rating: 4.5 })}
                className={cn(
                  "text-xs sm:text-sm py-2 px-3 h-9 sm:h-10",
                  filters.rating >= 4.5 &&
                    "bg-cricket-green/10 border-cricket-green text-cricket-green",
                )}
              >
                Highly Rated
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ ...filters, distance: 5 })}
                className={cn(
                  "text-xs sm:text-sm py-2 px-3 h-9 sm:h-10",
                  filters.distance <= 5 &&
                    "bg-cricket-green/10 border-cricket-green text-cricket-green",
                )}
              >
                Nearby
              </Button>
            </div>

            {/* Enhanced Grounds Grid with Live Availability */}
            {isLoadingGrounds ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse border-0 bg-gradient-to-br from-white to-gray-50 shadow-xl">
                    <div className="h-48 sm:h-52 bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-lg relative">
                      <div className="absolute top-4 right-4 w-16 h-6 bg-gray-300 rounded-full"></div>
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : realGrounds.length > 0 ? (
              <div className="space-y-8">
                {/* Featured Grounds Carousel */}
                <div className="relative">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Trophy className="w-6 h-6 text-cricket-green mr-2" />
                    🏆 Featured Championship Grounds
                  </h3>
                  <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
                    {realGrounds.slice(0, 3).map((ground, index) => (
                      <div key={ground._id} className="flex-none w-80 group">
                        <Card className="border-0 bg-gradient-to-br from-white via-cricket-green/5 to-emerald-50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 relative overflow-hidden">
                          {/* Live availability pulse */}
                          <div className="absolute top-4 right-4 z-20">
                            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 animate-pulse">
                              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                              <span>LIVE</span>
                            </div>
                          </div>
                          
                          {/* Enhanced ground card content */}
                          <div className="h-48 bg-gradient-to-br from-cricket-green/20 to-emerald-100 relative overflow-hidden">
                            {ground.images?.[0] ? (
                              <img src={ground.images[0]} alt={ground.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cricket-green/10 to-emerald-50">
                                <div className="text-center">
                                  <div className="w-16 h-16 bg-cricket-green/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <span className="text-2xl">🏏</span>
                                  </div>
                                  <p className="text-cricket-green font-semibold">Cricket Ground</p>
                                </div>
                              </div>
                            )}
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          </div>
                          
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="text-lg font-bold text-gray-900 group-hover:text-cricket-green transition-colors">{ground.name}</h4>
                              {/* Cricket star rating */}
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 text-cricket-yellow fill-current animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                                ))}
                                <span className="text-sm text-gray-600 ml-1">{(Math.random() * 1 + 4).toFixed(1)}</span>
                              </div>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{ground.description || "Premium cricket ground with modern facilities and professional pitch."}</p>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-cricket-green font-bold text-lg">
                                ₹{ground.pricePerHour || 1200}/hr
                              </div>
                              <Button 
                                onClick={() => handleBookGround(ground._id)}
                                className="bg-gradient-to-r from-cricket-green to-emerald-600 hover:from-cricket-green/90 hover:to-emerald-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 group"
                              >
                                <Play className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                                Book Now
                              </Button>
                            </div>
                            
                            {/* Available slots indicator */}
                            <div className="mt-4 flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-green-600 font-medium">{Math.floor(Math.random() * 5) + 3} slots available today</span>
                              </div>
                              <span className="text-gray-500">{ground.location?.area || "Premium Location"}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* All Grounds Grid */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Target className="w-6 h-6 text-cricket-green mr-2" />
                    🎯 All Available Grounds
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {realGrounds.map((ground) => (
                      <GroundCard
                        key={ground._id}
                        ground={ground}
                        onBook={handleBookGround}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 sm:py-20">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-cricket-green/10 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <div className="text-3xl animate-bounce">🏏</div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  No Cricket Grounds Found
                </h3>
                <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto leading-relaxed">
                  {selectedCity
                    ? `No cricket grounds found in ${selectedCity.name}. Try adjusting your filters to discover more options.`
                    : "Select a city to discover amazing cricket grounds near you and start your cricket journey!"}
                </p>
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleClearFilters}
                    className="text-cricket-green border-2 border-cricket-green hover:bg-cricket-green hover:text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                  >
                    <Target className="w-5 h-5 mr-2" />
                    Clear Filters & Search Again
                  </Button>
                  {!selectedCity && (
                    <Button
                      size="lg"
                      onClick={() => setIsLocationSelectorOpen(true)}
                      className="bg-gradient-to-r from-cricket-green to-emerald-600 hover:from-cricket-green/90 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ml-4"
                    >
                      <MapPin className="w-5 h-5 mr-2" />
                      Select Your City
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* How It Works - Cricket Match Progression */}
      <section ref={howItWorksRef} className="py-16 sm:py-20 bg-gradient-to-br from-cricket-green/5 via-white to-emerald-50 relative overflow-hidden">
        {/* Cricket Field Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border-4 border-cricket-green rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-1 bg-cricket-green"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center space-x-2 bg-cricket-green/10 border border-cricket-green/20 rounded-full px-6 py-3 mb-6">
              <Trophy className="w-5 h-5 text-cricket-green animate-pulse" />
              <span className="text-cricket-green font-semibold">Your Cricket Journey</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              From Search to <span className="text-transparent bg-gradient-to-r from-cricket-green to-emerald-600 bg-clip-text">Sixer!</span>
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              Experience the thrill of booking your perfect cricket ground in 3 exciting innings
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 ${
                    activeStep >= step 
                      ? 'bg-gradient-to-r from-cricket-green to-emerald-600 text-white scale-110 shadow-lg' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 mx-2 transition-all duration-500 ${
                      activeStep > step ? 'bg-gradient-to-r from-cricket-green to-emerald-600' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {/* Step 1: Search & Select */}
            <div className={`text-center transform transition-all duration-700 ${
              isHowItWorksVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-cricket-green to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl hover:scale-110 transition-transform duration-300">
                  <Search className="w-10 h-10 text-white animate-pulse" />
                </div>
                {/* Cricket bat animation */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-cricket-yellow/20 rounded-full flex items-center justify-center">
                  <span className="text-lg animate-bounce">🏏</span>
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">🔍 Search & Discover</h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Explore amazing cricket grounds near you. Filter by location, price, and amenities to find your perfect pitch for the ultimate match experience.
              </p>
              <div className="mt-4 inline-flex items-center text-cricket-green font-semibold text-sm">
                <Target className="w-4 h-4 mr-2" />
                Find Your Ground
              </div>
            </div>
            
            {/* Step 2: Choose Time Slot */}
            <div className={`text-center transform transition-all duration-700 delay-300 ${
              isHowItWorksVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-cricket-yellow to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl hover:scale-110 transition-transform duration-300">
                  <Clock className="w-10 h-10 text-white animate-spin" style={{ animationDuration: '3s' }} />
                </div>
                {/* Cricket ball animation */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                  <span className="text-lg animate-bounce" style={{ animationDelay: '0.5s' }}>⚾</span>
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">⏰ Pick Your Slot</h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Choose your preferred date and time slot from real-time availability. Book morning practice sessions or evening matches under the lights.
              </p>
              <div className="mt-4 inline-flex items-center text-cricket-yellow font-semibold text-sm">
                <Clock className="w-4 h-4 mr-2" />
                Live Availability
              </div>
            </div>
            
            {/* Step 3: Book & Play */}
            <div className={`text-center transform transition-all duration-700 delay-600 ${
              isHowItWorksVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-sky-blue to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl hover:scale-110 transition-transform duration-300">
                  <Play className="w-10 h-10 text-white animate-pulse" />
                </div>
                {/* Trophy animation */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400/20 rounded-full flex items-center justify-center">
                  <span className="text-lg animate-bounce" style={{ animationDelay: '1s' }}>🏆</span>
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">🎯 Book & Dominate</h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Complete secure payment and get instant confirmation. Show up, warm up, and play the match of your dreams. Victory awaits!
              </p>
              <div className="mt-4 inline-flex items-center text-sky-blue font-semibold text-sm">
                <Trophy className="w-4 h-4 mr-2" />
                Game Time!
              </div>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="text-center mt-12">
            <Button 
              size="lg"
              onClick={() => setIsLocationSelectorOpen(true)}
              className="bg-gradient-to-r from-cricket-green to-emerald-600 hover:from-cricket-green/90 hover:to-emerald-700 text-white px-8 py-4 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
            >
              <Play className="w-6 h-6 mr-3 group-hover:animate-pulse" />
              Start Your Cricket Journey Now!
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Enhanced with Cricket Theme */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-cricket-green/10 via-emerald-50 to-sky-blue/10 relative overflow-hidden">
        {/* Stadium-style background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2322c55e%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center space-x-2 bg-cricket-green/10 border border-cricket-green/20 rounded-full px-6 py-3 mb-6">
              <Shield className="w-5 h-5 text-cricket-green animate-pulse" />
              <span className="text-cricket-green font-semibold">Championship Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Why Choose <span className="text-transparent bg-gradient-to-r from-cricket-green to-emerald-600 bg-clip-text">BoxCric?</span>
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              We're the MVP of cricket ground booking - simple, secure, and designed for champions like you!
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-gradient-to-br from-white via-blue-50/50 to-sky-blue/10 rounded-2xl p-6 sm:p-8 shadow-xl text-center group hover:scale-105 transition-all duration-500 hover:shadow-2xl border border-blue-100/50 relative overflow-hidden">
              {/* Textured overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent opacity-50"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-sky-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-white group-hover:animate-pulse" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">⚡ Instant Booking</h3>
                <p className="text-gray-600 text-sm mb-4">Book your slot instantly with real-time availability. No waiting, no delays - just pure cricket action!</p>
                {/* Cricket stars */}
                <div className="flex justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-blue-500 fill-current animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-white via-green-50/50 to-cricket-green/10 rounded-2xl p-6 sm:p-8 shadow-xl text-center group hover:scale-105 transition-all duration-500 hover:shadow-2xl border border-green-100/50 relative overflow-hidden">
              {/* Textured overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent opacity-50"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-cricket-green to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white group-hover:animate-bounce" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">🛡️ Verified Grounds</h3>
                <p className="text-gray-600 text-sm mb-4">All grounds are verified for quality and safety. Play with confidence on championship-level pitches!</p>
                {/* Cricket stars */}
                <div className="flex justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-cricket-green fill-current animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-white via-purple-50/50 to-purple-100/10 rounded-2xl p-6 sm:p-8 shadow-xl text-center group hover:scale-105 transition-all duration-500 hover:shadow-2xl border border-purple-100/50 relative overflow-hidden">
              {/* Textured overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent opacity-50"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white group-hover:animate-spin" style={{ animationDuration: '2s' }} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">🔒 Secure Payments</h3>
                <p className="text-gray-600 text-sm mb-4">Multiple secure payment options available. Your money is as safe as a wicket-keeper's gloves!</p>
                {/* Cricket stars */}
                <div className="flex justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-purple-500 fill-current animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-white via-orange-50/50 to-orange-100/10 rounded-2xl p-6 sm:p-8 shadow-xl text-center group hover:scale-105 transition-all duration-500 hover:shadow-2xl border border-orange-100/50 relative overflow-hidden">
              {/* Textured overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent opacity-50"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-8 h-8 text-white group-hover:animate-pulse" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">🏆 24/7 Support</h3>
                <p className="text-gray-600 text-sm mb-4">Round-the-clock customer support for any queries. We're always here for your cricket journey!</p>
                {/* Cricket stars */}
                <div className="flex justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-orange-500 fill-current animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Prompt */}
      {!selectedCity && (
        <section className="py-8 px-4 bg-white/50">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-cricket-green/5 border border-cricket-green/20 rounded-full px-6 py-3">
              <MapPin className="w-5 h-5 text-cricket-green animate-pulse" />
              <span className="text-cricket-green font-medium">
                Select your city to discover nearby cricket grounds
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Stadium-Style Newsletter Signup */}
      <section className="py-20 bg-gradient-to-br from-cricket-green via-emerald-600 to-green-700 relative overflow-hidden">
        {/* Stadium background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M60 60m-30 0a30 30 0 1 1 60 0a30 30 0 1 1 -60 0'/%3E%3Cpath d='M30 60h60M60 30v60' stroke='%23ffffff' stroke-width='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Stadium lights effect */}
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/20 rounded-full px-6 py-3 mb-8 backdrop-blur-sm">
              <Trophy className="w-5 h-5 text-white animate-pulse" />
              <span className="text-white font-semibold">Join the Championship League</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Stay in the Game! 🏆
            </h2>
            <p className="text-green-100 mb-10 text-lg leading-relaxed">
              Get exclusive access to new grounds, championship offers, and cricket events. 
              Be the first to know about premium pitches in your area!
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email to join"
                  className="flex-1 px-6 py-4 rounded-xl border-0 bg-white/90 backdrop-blur-sm focus:ring-2 focus:ring-white/50 focus:outline-none text-gray-900 placeholder-gray-500 font-medium"
                />
                <Button className="bg-gradient-to-r from-cricket-yellow to-orange-500 hover:from-cricket-yellow/90 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg">
                  <Bell className="w-5 h-5 mr-2" />
                  Subscribe
                </Button>
              </div>
              <p className="text-green-100 text-sm mt-6 flex items-center justify-center">
                <Shield className="w-4 h-4 mr-2" />
                100% Privacy Protected • Unsubscribe anytime
              </p>
            </div>
            
            {/* Cricket stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">10K+</div>
                <div className="text-green-100 text-sm">Active Players</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">500+</div>
                <div className="text-green-100 text-sm">Premium Grounds</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">25+</div>
                <div className="text-green-100 text-sm">Cities Covered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stadium-Style Footer */}
      <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
        {/* Stadium background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='100' cy='100' r='80'/%3E%3Ccircle cx='100' cy='100' r='60'/%3E%3Ccircle cx='100' cy='100' r='40'/%3E%3Ccircle cx='100' cy='100' r='20'/%3E%3Cpath d='M20 100h160M100 20v160' stroke='%23ffffff' stroke-width='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Stadium floodlights */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-cricket-yellow/30 to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-cricket-yellow/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-cricket-yellow/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10">
          {/* Championship Banner */}
          <div className="bg-gradient-to-r from-cricket-green via-emerald-600 to-cricket-green py-6">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Trophy className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">🏆 India's #1 Cricket Booking Platform</h3>
                    <p className="text-green-100 text-sm">Join thousands of cricket enthusiasts nationwide</p>
                  </div>
                </div>
                
                {/* Live stats ticker */}
                <div className="flex items-center space-x-6 text-white">
                  <div className="text-center">
                    <div className="text-2xl font-bold">50K+</div>
                    <div className="text-xs text-green-100">Matches Played</div>
                  </div>
                  <div className="w-px h-8 bg-white/20"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">500+</div>
                    <div className="text-xs text-green-100">Grounds</div>
                  </div>
                  <div className="w-px h-8 bg-white/20"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-ping mr-2"></div>
                      LIVE
                    </div>
                    <div className="text-xs text-green-100">Bookings Active</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Footer Content */}
          <div className="py-16">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                {/* Brand Section */}
                <div className="lg:col-span-1">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-cricket-green to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">🏏</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">BoxCric</h3>
                      <p className="text-gray-400 text-sm">Your Cricket Journey Starts Here</p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    India's premier cricket ground booking platform. From weekend warriors to championship teams, 
                    we connect cricket lovers with the perfect pitches across the nation.
                  </p>
                  
                  {/* App Download */}
                  <div className="space-y-3">
                    <p className="text-white font-semibold flex items-center">
                      <Smartphone className="w-4 h-4 mr-2" />
                      Download the App
                    </p>
                    <div className="flex space-x-3">
                      <a href="#" className="inline-block group">
                        <div className="bg-white text-black px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-100 transition-colors text-sm">
                          <span>📱 App Store</span>
                        </div>
                      </a>
                      <a href="#" className="inline-block group">
                        <div className="bg-white text-black px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-100 transition-colors text-sm">
                          <span>📱 Play Store</span>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Quick Links */}
                <div>
                  <h4 className="text-white font-bold text-lg mb-6 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-cricket-green" />
                    Quick Links
                  </h4>
                  <ul className="space-y-3">
                    <li><a href="#" className="text-gray-300 hover:text-cricket-green transition-colors flex items-center group">
                      <ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                      Find Grounds
                    </a></li>
                    <li><a href="#" className="text-gray-300 hover:text-cricket-green transition-colors flex items-center group">
                      <ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                      Book Instantly
                    </a></li>
                    <li><a href="#" className="text-gray-300 hover:text-cricket-green transition-colors flex items-center group">
                      <ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                      Tournament Booking
                    </a></li>
                    <li><a href="#" className="text-gray-300 hover:text-cricket-green transition-colors flex items-center group">
                      <ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                      Ground Partnerships
                    </a></li>
                  </ul>
                </div>
                
                {/* Support */}
                <div>
                  <h4 className="text-white font-bold text-lg mb-6 flex items-center">
                    <HelpCircle className="w-5 h-5 mr-2 text-cricket-green" />
                    Support
                  </h4>
                  <ul className="space-y-3">
                    <li><a href="#" className="text-gray-300 hover:text-cricket-green transition-colors flex items-center group">
                      <ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                      Help Center
                    </a></li>
                    <li><a href="#" className="text-gray-300 hover:text-cricket-green transition-colors flex items-center group">
                      <ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                      Contact Support
                    </a></li>
                    <li><a href="#" className="text-gray-300 hover:text-cricket-green transition-colors flex items-center group">
                      <ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                      Booking Guidelines
                    </a></li>
                    <li><a href="#" className="text-gray-300 hover:text-cricket-green transition-colors flex items-center group">
                      <ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                      Safety Protocols
                    </a></li>
                  </ul>
                </div>
                
                {/* Connect */}
                <div>
                  <h4 className="text-white font-bold text-lg mb-6 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-cricket-green" />
                    Connect
                  </h4>
                  
                  {/* Social Media */}
                  <div className="flex space-x-4 mb-6">
                    <a href="#" className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center hover:scale-110 transition-transform group">
                      <span className="text-white text-sm">📘</span>
                    </a>
                    <a href="#" className="w-10 h-10 bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg flex items-center justify-center hover:scale-110 transition-transform group">
                      <span className="text-white text-sm">💼</span>
                    </a>
                    <a href="#" className="w-10 h-10 bg-gradient-to-br from-pink-600 to-purple-600 rounded-lg flex items-center justify-center hover:scale-110 transition-transform group">
                      <span className="text-white text-sm">📸</span>
                    </a>
                    <a href="#" className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center hover:scale-110 transition-transform group">
                      <span className="text-white text-sm">📺</span>
                    </a>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-300">
                      <Phone className="w-4 h-4 mr-3 text-cricket-green" />
                      <span className="text-sm">+91 98765 43210</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Mail className="w-4 h-4 mr-3 text-cricket-green" />
                      <span className="text-sm">support@boxcric.com</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <MapPin className="w-4 h-4 mr-3 text-cricket-green" />
                      <span className="text-sm">Mumbai, India</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom Section */}
              <div className="mt-12 pt-8 border-t border-gray-700">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="flex items-center space-x-6 mb-4 md:mb-0">
                    <p className="text-gray-400 text-sm">
                      &copy; 2024 BoxCric. All rights reserved.
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <a href="#" className="text-gray-400 hover:text-cricket-green transition-colors">Privacy Policy</a>
                      <span className="text-gray-600">•</span>
                      <a href="#" className="text-gray-400 hover:text-cricket-green transition-colors">Terms of Service</a>
                      <span className="text-gray-600">•</span>
                      <a href="#" className="text-gray-400 hover:text-cricket-green transition-colors">Cookie Policy</a>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <span>Made with</span>
                    <span className="text-red-500 animate-pulse">❤️</span>
                    <span>for Cricket Lovers</span>
                    <span className="text-cricket-green">🏏</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Components */}
      <LocationSelector
        isOpen={isLocationSelectorOpen}
        onClose={() => setIsLocationSelectorOpen(false)}
        onCitySelect={handleCitySelect}
        selectedCity={selectedCity}
      />

      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      <NewBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        ground={selectedGround}
        onBookingCreated={handleBookingCreated}
      />

      {/* Floating Quick Search Button */}
      {isFloatingSearchVisible && (
        <div className="fixed bottom-24 right-6 z-50 animate-fade-in-up">
          <Button
            onClick={() => setIsLocationSelectorOpen(true)}
            className="bg-gradient-to-r from-cricket-green to-emerald-600 hover:from-cricket-green/90 hover:to-emerald-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 group"
            aria-label="Quick search"
          >
            <Search className="w-6 h-6 group-hover:animate-spin" />
          </Button>
          <div className="absolute -top-12 right-0 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Quick Search
          </div>
        </div>
      )}

      {/* Floating Filter Button */}
      {isFloatingSearchVisible && selectedCity && (
        <div className="fixed bottom-24 right-20 z-50 animate-fade-in-up animation-delay-200">
          <Button
            onClick={() => setIsFilterPanelOpen(true)}
            className="bg-gradient-to-r from-cricket-yellow to-orange-500 hover:from-cricket-yellow/90 hover:to-orange-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 group"
            aria-label="Quick filters"
          >
            <Filter className="w-6 h-6 group-hover:animate-pulse" />
          </Button>
        </div>
      )}

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-cricket-green hover:bg-cricket-green/90 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-40 group"
        aria-label="Scroll to top"
      >
        <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
};

export default Index;
