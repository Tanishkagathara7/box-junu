import { useState, useEffect, useMemo } from "react";
import { MapPin, Zap, Star, Clock, Sparkles, Search, Play, Trophy, Users, Shield, ChevronLeft, ChevronRight, Bell } from "lucide-react";
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

  // Animated stats counter
  useEffect(() => {
    const animateStats = () => {
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setHeroStats({
          grounds: Math.floor(500 * progress),
          players: Math.floor(50000 * progress),
          bookings: Math.floor(10000 * progress),
        });
        
        if (currentStep >= steps) {
          clearInterval(interval);
        }
      }, stepDuration);
    };

    animateStats();
  }, []);

  // Add loading state for initial page load
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

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

  // Scroll event listener for back to top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowBackToTop(scrollTop > 300); // Show button when scrolled more than 300px
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledHandleScroll);
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

  // Debounced search effect
  useEffect(() => {
    if (!selectedCity) return;
    
    const timeoutId = setTimeout(() => {
      fetchGrounds();
    }, 300); // Wait 300ms after user stops typing
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Fetch grounds when city or filters change (immediate)
  useEffect(() => {
    if (selectedCity) {
      fetchGrounds();
    }
  }, [selectedCity, filters]);

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

  const MAX_RETRIES = 2;
  const RETRY_DELAY = 2000; // 2 seconds

  const fetchGrounds = async (retryCount = 0) => {
    if (!selectedCity) return;

    try {
      setIsLoadingGrounds(true);
      console.log(
        `🔍 Fetching grounds for city: ${selectedCity.name} (${selectedCity.id})`,
        `Attempt ${retryCount + 1}/${MAX_RETRIES + 1}`
      );

      const params: any = {
        cityId: selectedCity.id,
        page: 1,
        limit: 20,
        _t: new Date().getTime(), // Cache buster
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
    // Provide immediate visual feedback
    if (query.trim() === '') {
      // If search is cleared, reset to show all grounds
      console.log('🔍 Search cleared, showing all grounds');
    } else {
      console.log('🔍 Searching for:', query);
    }
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

      {/* Simplified Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 overflow-hidden">
        {/* Simplified Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-white to-blue-50/30"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Main Heading - Consistent Design */}
          <div className="relative mb-8 sm:mb-10 md:mb-12">
            <h1 className="relative text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-gray-900 mb-6 sm:mb-8 md:mb-10 leading-tight px-4 sm:px-6">
              Book Your Perfect{" "}
              <span className="block xs:inline text-transparent bg-gradient-to-r from-emerald-600 via-emerald-700 to-blue-600 bg-clip-text">
                Cricket Ground
              </span>
            </h1>
            <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl text-gray-700 font-medium mb-8 sm:mb-10 md:mb-12 max-w-md xs:max-w-lg sm:max-w-4xl lg:max-w-5xl mx-auto leading-relaxed px-6 sm:px-8">
              Discover amazing box cricket grounds near you. From premium facilities to budget-friendly options, 
              find the perfect pitch for your game in just a few clicks.
            </p>
          </div>

          {/* Enhanced Stat Cards with Better Hierarchy */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-6 xs:gap-8 sm:gap-10 lg:gap-12 mb-10 sm:mb-12 md:mb-16 max-w-5xl mx-auto px-4 sm:px-6">
            <Card className="border-0 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 rounded-2xl overflow-hidden">
              <CardContent className="p-4 xs:p-5 sm:p-6 lg:p-8 text-center relative">
                <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-3 xs:mb-4 sm:mb-6 shadow-lg">
                  <Trophy className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-2 sm:mb-3 drop-shadow-sm">{heroStats.grounds}+</h3>
                <p className="text-gray-700 font-bold text-sm xs:text-base lg:text-lg">Premium Cricket Grounds</p>
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-100/30 rounded-full -mr-8 -mt-8"></div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 rounded-2xl overflow-hidden">
              <CardContent className="p-4 xs:p-5 sm:p-6 lg:p-8 text-center relative">
                <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-3 xs:mb-4 sm:mb-6 shadow-lg">
                  <Users className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-orange-600" />
                </div>
                <h3 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-2 sm:mb-3 drop-shadow-sm">{heroStats.players}+</h3>
                <p className="text-gray-700 font-bold text-sm xs:text-base lg:text-lg">Happy Players</p>
                <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-100/30 rounded-full -mr-8 -mt-8"></div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 rounded-2xl overflow-hidden xs:col-span-2 sm:col-span-1">
              <CardContent className="p-4 xs:p-5 sm:p-6 lg:p-8 text-center relative">
                <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-3 xs:mb-4 sm:mb-6 shadow-lg">
                  <Play className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-2 sm:mb-3 drop-shadow-sm">{heroStats.bookings}+</h3>
                <p className="text-gray-700 font-bold text-sm xs:text-base lg:text-lg">Successful Bookings</p>
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100/30 rounded-full -mr-8 -mt-8"></div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-x-6 xs:gap-x-8 gap-y-4 text-sm sm:text-base px-3 sm:px-4">
            <div className="flex items-center space-x-3 bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                <Shield className="w-5 h-5 text-white flex-shrink-0" />
              </div>
              <span className="whitespace-nowrap font-bold text-gray-800">100% Secure Booking</span>
            </div>
            <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-sky-50 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                <Clock className="w-5 h-5 text-white flex-shrink-0" />
              </div>
              <span className="whitespace-nowrap font-bold text-gray-800">Instant Confirmation</span>
            </div>
            <div className="flex items-center space-x-3 bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
                <Star className="w-5 h-5 text-white flex-shrink-0" />
              </div>
              <span className="whitespace-nowrap font-bold text-gray-800">Verified Grounds</span>
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

      {/* Grounds Listing - Premium Enhanced */}
      {selectedCity && (
        <section className="py-16 sm:py-20 px-6 sm:px-8 bg-gradient-to-br from-emerald-50/30 via-white to-blue-50/20 relative overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23059669%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
          
          {/* Floating Cricket Elements */}
          <div className="absolute top-10 right-10 animate-float hidden lg:block">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">🏟️</span>
            </div>
          </div>
          <div className="absolute bottom-20 left-10 animate-float hidden lg:block" style={{ animationDelay: '1s' }}>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-xl">🏏</span>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            {/* Premium Section Header */}
            <div className="mb-12 sm:mb-16">
              <div className="text-center mb-8 sm:mb-10">
                {/* City Badge */}
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full text-sm font-bold mb-6 shadow-lg transform hover:scale-105 transition-all duration-300">
                  <span className="text-lg">📍</span>
                  <span>{selectedCity.name}</span>
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                </div>
                
                {/* Main Heading with Enhanced Design */}
                <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 mb-6 leading-tight">
                  <span className="block text-2xl sm:text-3xl font-medium text-gray-600 mb-2">Discover Amazing</span>
                  <span className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-blue-600 bg-clip-text text-transparent">
                    Cricket Grounds
                  </span>
                </h2>
                
                {/* Results Counter with Animation */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="bg-white rounded-2xl px-6 py-4 shadow-lg border border-emerald-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-emerald-700">{realGrounds.length}</span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-900">Available Grounds</p>
                        <p className="text-xs text-gray-500">Ready to book now</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Trust Indicators */}
                <div className="flex justify-center items-center gap-3 sm:gap-5 lg:gap-8 px-4 py-2">
                  <div className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-white to-green-50 backdrop-blur-sm rounded-full px-4 sm:px-5 py-2.5 sm:py-3 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex-shrink-0 min-w-fit">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white font-bold text-sm">✓</span>
                    </div>
                    <span className="text-xs sm:text-sm lg:text-base font-bold text-gray-800 whitespace-nowrap">Verified</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-white to-yellow-50 backdrop-blur-sm rounded-full px-4 sm:px-5 py-2.5 sm:py-3 shadow-lg border border-yellow-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex-shrink-0 min-w-fit">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white text-sm font-bold">⚡</span>
                    </div>
                    <span className="text-xs sm:text-sm lg:text-base font-bold text-gray-800 whitespace-nowrap">Instant</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-white to-blue-50 backdrop-blur-sm rounded-full px-4 sm:px-5 py-2.5 sm:py-3 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex-shrink-0 min-w-fit">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white text-sm font-bold">🔒</span>
                    </div>
                    <span className="text-xs sm:text-sm lg:text-base font-bold text-gray-800 whitespace-nowrap">Secure</span>
                  </div>
                </div>
              </div>
              
              {/* Filter Status Badge - Enhanced */}
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
                <div className="flex justify-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-200 rounded-full shadow-md">
                    <span className="text-orange-600">🔍</span>
                    <span className="text-sm font-semibold text-orange-700">Filters Applied</span>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Filters - Enhanced with icons */}
            <div className="flex flex-wrap gap-3 mb-8 sm:mb-10 px-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFilters({ ...filters, priceRange: [500, 1000] })
                }
                className={cn(
                  "text-sm sm:text-base py-3 px-4 h-12 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95",
                  filters.priceRange[1] <= 1000
                    ? "bg-emerald-100 border-emerald-400 text-emerald-700 shadow-md"
                    : "bg-white border-gray-300 hover:border-emerald-300 hover:bg-emerald-50",
                )}
              >
                💰 Budget Friendly
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ ...filters, lighting: true })}
                className={cn(
                  "text-sm sm:text-base py-3 px-4 h-12 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95",
                  filters.lighting
                    ? "bg-emerald-100 border-emerald-400 text-emerald-700 shadow-md"
                    : "bg-white border-gray-300 hover:border-emerald-300 hover:bg-emerald-50",
                )}
              >
                🌙 Night Games
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ ...filters, rating: 4.5 })}
                className={cn(
                  "text-sm sm:text-base py-3 px-4 h-12 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95",
                  filters.rating >= 4.5
                    ? "bg-emerald-100 border-emerald-400 text-emerald-700 shadow-md"
                    : "bg-white border-gray-300 hover:border-emerald-300 hover:bg-emerald-50",
                )}
              >
                ⭐ Highly Rated
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ ...filters, distance: 5 })}
                className={cn(
                  "text-sm sm:text-base py-3 px-4 h-12 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95",
                  filters.distance <= 5
                    ? "bg-emerald-100 border-emerald-400 text-emerald-700 shadow-md"
                    : "bg-white border-gray-300 hover:border-emerald-300 hover:bg-emerald-50",
                )}
              >
                📍 Nearby
              </Button>
            </div>

            {/* Grounds Grid - Enhanced spacing */}
            {isLoadingGrounds ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse rounded-xl">
                    <div className="h-56 sm:h-60 bg-gray-200 rounded-t-xl"></div>
                    <CardContent className="p-6 space-y-4">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : realGrounds.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                {realGrounds.map((ground) => (
                  <GroundCard
                    key={ground._id}
                    ground={ground}
                    onBook={handleBookGround}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2 sm:mb-3">
                  No grounds found
                </h3>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base max-w-md mx-auto">
                  {selectedCity
                    ? `No cricket grounds found in ${selectedCity.name}. Try adjusting your filters.`
                    : "Select a city to discover amazing cricket grounds near you."}
                </p>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleClearFilters}
                  className="text-cricket-green border-cricket-green hover:bg-cricket-green/10 py-2 px-6 h-10 sm:h-11"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 px-2">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-3">
              Book your cricket ground in just 3 simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <div className="text-center px-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6">
                <span className="text-white font-bold text-lg sm:text-xl lg:text-2xl">1</span>
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 lg:mb-4">Search & Select</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Find cricket grounds near you, filter by location, price, and amenities to find the perfect match.
              </p>
            </div>
            
            <div className="text-center px-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6">
                <span className="text-white font-bold text-lg sm:text-xl lg:text-2xl">2</span>
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 lg:mb-4">Choose Time Slot</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Pick your preferred date and time slot from the available options. Real-time availability updates.
              </p>
            </div>
            
            <div className="text-center px-2 sm:col-span-2 lg:col-span-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6">
                <span className="text-white font-bold text-lg sm:text-xl lg:text-2xl">3</span>
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 lg:mb-4">Book & Play</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Complete your payment securely and get instant confirmation. Show up and enjoy your game!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 px-2">
              Why Choose BoxCric?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-3">
              We're committed to making cricket ground booking simple, secure, and enjoyable
            </p>
          </div>
          
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-3 xs:p-4 sm:p-6 shadow-lg text-center">
              <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 xs:mb-3 sm:mb-4">
                <svg className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-gray-900 mb-1 xs:mb-2">Instant Booking</h3>
              <p className="text-gray-600 text-xs xs:text-sm leading-relaxed">Book your slot instantly with real-time availability</p>
            </div>
            
            <div className="bg-white rounded-xl p-3 xs:p-4 sm:p-6 shadow-lg text-center">
              <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 xs:mb-3 sm:mb-4">
                <svg className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-gray-900 mb-1 xs:mb-2">Verified Grounds</h3>
              <p className="text-gray-600 text-xs xs:text-sm leading-relaxed">All grounds are verified for quality and safety</p>
            </div>
            
            <div className="bg-white rounded-xl p-3 xs:p-4 sm:p-6 shadow-lg text-center">
              <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 xs:mb-3 sm:mb-4">
                <svg className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-gray-900 mb-1 xs:mb-2">Secure Payments</h3>
              <p className="text-gray-600 text-xs xs:text-sm leading-relaxed">Multiple secure payment options available</p>
            </div>
            
            <div className="bg-white rounded-xl p-3 xs:p-4 sm:p-6 shadow-lg text-center xs:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2 xs:mb-3 sm:mb-4">
                <svg className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
              </div>
              <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-gray-900 mb-1 xs:mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-xs xs:text-sm leading-relaxed">Round-the-clock customer support for any queries</p>
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

      {/* Newsletter Signup */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-r from-cricket-green to-green-600">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4 px-2">
              Stay Updated
            </h2>
            <p className="text-green-100 mb-6 sm:mb-8 text-sm sm:text-base px-3">
              Get notified about new grounds, special offers, and cricket events in your area
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto px-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-0 focus:ring-2 focus:ring-white/20 focus:outline-none text-sm sm:text-base"
              />
              <Button className="bg-white text-cricket-green hover:bg-gray-100 px-4 py-2.5 sm:py-3 text-sm sm:text-base font-semibold touch-target">
                Subscribe
              </Button>
            </div>
            <p className="text-green-100 text-xs sm:text-sm mt-3 sm:mt-4 px-3">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Mobile App Download Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Get the BoxCric App
                </h2>
                <p className="text-gray-600 mb-6 text-lg">
                  Download our mobile app for the best booking experience. Get instant notifications, 
                  manage your bookings, and discover new grounds on the go.
                </p>
                
                {/* Features */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-cricket-green/10 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-cricket-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Instant booking & notifications</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-cricket-green/10 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-cricket-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Offline ground information</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-cricket-green/10 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-cricket-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-700">GPS navigation to grounds</span>
                  </div>
                </div>

                {/* App Store Badges */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a href="#" className="inline-block">
                    <div className="bg-black text-white px-6 py-3 rounded-lg flex items-center space-x-3 hover:bg-gray-800 transition-colors">
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                      <div className="text-left">
                        <div className="text-xs">Download on the</div>
                        <div className="text-sm font-semibold">App Store</div>
                      </div>
                    </div>
                  </a>
                  <a href="#" className="inline-block">
                    <div className="bg-black text-white px-6 py-3 rounded-lg flex items-center space-x-3 hover:bg-gray-800 transition-colors">
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                      </svg>
                      <div className="text-left">
                        <div className="text-xs">GET IT ON</div>
                        <div className="text-sm font-semibold">Google Play</div>
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              {/* App Mockup */}
              <div className="relative">
                <div className="relative mx-auto lg:mx-0 w-80 h-96 bg-gradient-to-br from-cricket-green to-green-600 rounded-3xl shadow-2xl p-8">
                  <div className="bg-white rounded-2xl h-full p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-cricket-green rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">BC</span>
                        </div>
                        <span className="font-semibold text-gray-900">BoxCric</span>
                      </div>
                      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">Marine Drive Arena</h3>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">4.8</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Premium cricket ground with floodlights</p>
                        <div className="flex items-center justify-between">
                          <span className="text-cricket-green font-semibold">₹1,200/hr</span>
                          <Button size="sm" className="bg-cricket-green text-white">
                            Book Now
                          </Button>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">Andheri Sports Complex</h3>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">4.6</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Professional pitch with parking</p>
                        <div className="flex items-center justify-between">
                          <span className="text-cricket-green font-semibold">₹800/hr</span>
                          <Button size="sm" className="bg-cricket-green text-white">
                            Book Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
        selectedGround={selectedGround}
        onBookingCreated={handleBookingCreated}
      />

      {/* Scroll to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Add a small haptic feedback simulation
            navigator.vibrate && navigator.vibrate(50);
          }}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-cricket-green to-green-600 hover:from-cricket-green/90 hover:to-green-600/90 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 z-40 animate-in fade-in slide-in-from-bottom-4 backdrop-blur-sm border border-white/10"
          aria-label="Scroll to top"
          title="Back to top"
        >
          <svg className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-cricket-green opacity-20 animate-ping"></div>
        </button>
      )}
    </div>
  );
};

export default Index;

