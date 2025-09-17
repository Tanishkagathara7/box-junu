import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Menu, X, User, MapPin, LogOut, Settings, Bell, Home, Info, HelpCircle, ChevronDown, Heart, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "./AuthModal";
import NotificationPanel from "./NotificationPanel";

interface NavbarProps {
  selectedCity?: string;
  onCitySelect?: () => void;
  onSearch?: (query: string) => void;
  onFilterToggle?: () => void;
}

const Navbar = ({
  selectedCity,
  onCitySelect,
  onSearch,
  onFilterToggle,
}: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">(
    "login",
  );

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleAuthClick = (tab: "login" | "register") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Help & Support", path: "/help" },
  ];

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Premium Minimal Cricket Navbar */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 backdrop-blur-xl border-b border-emerald-100/50 shadow-lg">
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
        
        <div className="w-full relative">
          <div className="flex items-center justify-between h-16 lg:h-20 px-4 lg:px-6 relative">
            
            {/* Logo & Mobile Search - Mobile Responsive */}
            <div className="flex items-center flex-1 lg:flex-initial">
              <Link to="/" className="flex items-center group flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 rounded-xl flex items-center justify-center mr-3 sm:mr-4 group-hover:scale-110 transition-all duration-300 shadow-xl hover:shadow-2xl">
                  <div className="w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-white rounded-lg flex items-center justify-center">
                    <div className="w-2.5 h-2.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full shadow-sm"></div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900 bg-clip-text text-transparent tracking-tight group-hover:from-emerald-600 group-hover:via-emerald-700 group-hover:to-emerald-800 transition-all duration-300">
                    BoxCric
                  </h1>
                  <p className="text-xs sm:text-sm lg:text-base text-emerald-600 font-bold -mt-1 tracking-wider drop-shadow-sm">PREMIUM GROUNDS</p>
                </div>
                {/* Mobile Logo Text */}
                <div className="block sm:hidden">
                  <h1 className="text-xl font-black bg-gradient-to-r from-emerald-700 to-emerald-900 bg-clip-text text-transparent tracking-tight group-hover:from-emerald-600 group-hover:to-emerald-800 transition-all duration-300">
                    BoxCric
                  </h1>
                  <p className="text-xs text-emerald-600 font-bold -mt-0.5 tracking-wide">PREMIUM</p>
                </div>
              </Link>
              
              {/* Mobile Search Bar & Notification - Next to Logo */}
              <div className="flex items-center flex-1 mx-3 lg:hidden gap-2 relative">
                <form onSubmit={handleSearch} className="relative flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search grounds..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        onSearch?.(e.target.value);
                      }}
                      className="w-full pl-9 pr-9 h-10 bg-white/90 border-gray-200 focus:border-emerald-300 focus:ring-emerald-200 rounded-lg shadow-sm focus:shadow-md transition-all duration-200 placeholder:text-gray-400 text-sm"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          onSearch?.("");
                        }}
                        className="absolute right-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </form>
                
                {/* Mobile Notification Bell */}
                {isAuthenticated && user && (
                  <div className="flex-shrink-0 relative z-50">
                    <NotificationPanel />
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Items - Desktop Only */}
            <div className="hidden lg:flex items-center justify-center space-x-8 flex-1 ml-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200 relative group py-2"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300 ease-out"></span>
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              
              {/* Location Selector - Sleek Pill */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="hidden md:flex items-center space-x-2 h-11 px-3 bg-white/80 backdrop-blur border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/50 rounded-full transition-all duration-200 shadow-sm"
                  >
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-700">{selectedCity || "Location"}</span>
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={onCitySelect}>
                    Select City
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Optimized Central Search Bar */}
              <div className="hidden md:block">
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-500 group-focus-within:text-emerald-600 transition-colors" />
                    <Input
                      type="text"
                      placeholder="🔍 Search grounds…"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        // Trigger search on every keystroke for instant results
                        onSearch?.(e.target.value);
                      }}
                      className="w-64 lg:w-80 xl:w-96 pl-10 pr-10 h-11 bg-gradient-to-r from-white via-white to-emerald-50/30 border-2 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-300 focus:ring-2 rounded-xl shadow-lg focus:shadow-xl transition-all duration-300 placeholder:text-gray-500 text-sm font-medium hover:shadow-md"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          onSearch?.("");
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-emerald-600 hover:bg-emerald-100 rounded-full p-0.5 transition-all duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                    {/* Search glow effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/20 to-blue-400/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
                  </div>
                </form>
              </div>

              {/* Optimized Filters CTA Button - Desktop */}
              {onFilterToggle && (
                <Button
                  onClick={onFilterToggle}
                  className="hidden md:flex items-center space-x-2 h-11 px-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 hover:from-emerald-700 hover:via-emerald-800 hover:to-emerald-900 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-sm transform hover:scale-105 active:scale-95"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                  <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse"></div>
                </Button>
              )}
              
              {/* Enhanced Filters Button - Mobile */}
              {onFilterToggle && (
                <Button
                  onClick={onFilterToggle}
                  className="md:hidden p-3 h-12 w-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </Button>
              )}
              
              {/* Mobile Login/Signup Buttons - Only show when not authenticated */}
              {!isAuthenticated && (
                <div className="flex items-center space-x-2 md:hidden">
                  <Button
                    variant="outline"
                    onClick={() => handleAuthClick("login")}
                    className="h-10 px-3 text-xs font-medium text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 rounded-lg transition-all duration-200"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => handleAuthClick("register")}
                    className="h-10 px-3 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    Sign Up
                  </Button>
                </div>
              )}

              {/* Notification Bell - Visible on medium and up */}
              {isAuthenticated && user && (
                <div className="hidden md:block relative z-50">
                  <div className="transform scale-105 hover:scale-110 transition-transform duration-200">
                    <NotificationPanel />
                  </div>
                </div>
              )}

              {/* User Profile - Optimized visibility */}
              {isAuthenticated && user ? (
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center space-x-1 h-12 px-2 py-2 rounded-full hover:bg-emerald-50 hover:shadow-md border border-transparent hover:border-emerald-200 transition-all duration-200"
                      >
                      <Avatar className="w-10 h-10 ring-2 ring-emerald-200 hover:ring-emerald-400 transition-all duration-200">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white text-sm font-bold">
                          {getUserInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="w-3 h-3 text-gray-600 hidden xl:block" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-4 py-3 border-b">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="w-4 h-4 mr-2" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/profile/bookings")}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      My Bookings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/favorites")}>
                      <Heart className="w-4 h-4 mr-2" />
                      Favorites
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => handleAuthClick("login")}
                    className="h-11 px-4 text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => handleAuthClick("register")}
                    className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
              {/* Mobile Menu Button - Optimized */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 h-12 w-12 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-200 ml-1 border-2 border-transparent bg-gray-50/80"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden absolute top-16 lg:top-20 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-emerald-100/50 shadow-2xl z-40">
              <div className="px-4 py-6 space-y-5 max-h-[calc(100vh-5rem)] lg:max-h-[calc(100vh-7rem)] overflow-y-auto">
                {/* Mobile Auth - At Top */}
                {isAuthenticated && user && (
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-100">
                    {/* User Info Header */}
                    <div className="flex items-center mb-4 pb-3 border-b border-emerald-200">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-base">{user.name}</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    
                    {/* User Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/profile/bookings"
                        className="flex flex-col items-center px-3 py-3 text-gray-700 hover:text-emerald-600 hover:bg-white/60 active:bg-emerald-100 rounded-xl transition-all duration-200 group text-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <BookOpen className="w-5 h-5 mb-1 text-gray-500 group-hover:text-emerald-600 transition-colors" />
                        <span className="text-xs font-medium">Bookings</span>
                      </Link>
                      <Link
                        to="/favorites"
                        className="flex flex-col items-center px-3 py-3 text-gray-700 hover:text-emerald-600 hover:bg-white/60 active:bg-emerald-100 rounded-xl transition-all duration-200 group text-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Heart className="w-5 h-5 mb-1 text-gray-500 group-hover:text-emerald-600 transition-colors" />
                        <span className="text-xs font-medium">Favorites</span>
                      </Link>
                      <Link
                        to="/profile"
                        className="flex flex-col items-center px-3 py-3 text-gray-700 hover:text-emerald-600 hover:bg-white/60 active:bg-emerald-100 rounded-xl transition-all duration-200 group text-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="w-5 h-5 mb-1 text-gray-500 group-hover:text-emerald-600 transition-colors" />
                        <span className="text-xs font-medium">Profile</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex flex-col items-center px-3 py-3 text-gray-700 hover:text-emerald-600 hover:bg-white/60 active:bg-emerald-100 rounded-xl transition-all duration-200 group text-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="w-5 h-5 mb-1 text-gray-500 group-hover:text-emerald-600 transition-colors" />
                        <span className="text-xs font-medium">Settings</span>
                      </Link>
                    </div>
                    
                    {/* Sign Out Button */}
                    <div className="mt-4 pt-3 border-t border-emerald-200">
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center justify-center w-full px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 active:bg-red-100 rounded-xl transition-all duration-200 group"
                      >
                        <LogOut className="w-4 h-4 mr-2 text-red-500 group-hover:text-red-600 transition-colors" />
                        <span className="text-sm font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Mobile Location & Filters Section */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-100">
                  <div className="text-sm font-semibold text-emerald-700 flex items-center mb-3">
                    <MapPin className="w-4 h-4 mr-2" />
                    Location & Filters
                  </div>
                  
                  <div className="flex space-x-2">
                    {/* Mobile Location */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        onCitySelect?.();
                        setIsMenuOpen(false);
                      }}
                      className="flex-1 justify-center h-11 bg-white/80 backdrop-blur border-emerald-200 hover:bg-white hover:border-emerald-400 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-center"
                    >
                      <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
                      <span className="text-sm font-medium truncate">{selectedCity || "Location"}</span>
                    </Button>

                    {/* Mobile Filters */}
                    {onFilterToggle && (
                      <Button
                        onClick={() => {
                          onFilterToggle();
                          setIsMenuOpen(false);
                        }}
                        className="flex-1 justify-center h-11 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        <span className="text-sm font-semibold">Filters</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Navigation Section */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border border-gray-100 space-y-2">
                  <div className="text-sm font-semibold text-gray-700 flex items-center mb-3">
                    <Home className="w-4 h-4 mr-2" />
                    Quick Navigation
                  </div>
                  {/* Mobile Navigation */}
                  {navItems.map((item, index) => {
                    const icons = [Home, Info, HelpCircle];
                    const Icon = icons[index] || Home;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        className="flex items-center px-4 py-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50/80 active:bg-emerald-100 rounded-xl transition-all duration-200 group bg-white border border-gray-100/60 shadow-sm hover:shadow-md hover:border-emerald-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                        <span className="text-base font-medium group-hover:font-semibold transition-all">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Non-authenticated users */}
                {!isAuthenticated && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                    <div className="text-center mb-4">
                      <h4 className="font-semibold text-gray-900 mb-1">Welcome to BoxCric!</h4>
                      <p className="text-sm text-gray-600">Sign in to book your favorite grounds</p>
                    </div>
                    <div className="space-y-3">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          handleAuthClick("login");
                          setIsMenuOpen(false);
                        }}
                        className="w-full h-12 text-gray-700 hover:text-blue-600 hover:bg-white/60 font-medium rounded-xl border border-gray-200 transition-all duration-200"
                      >
                        <User className="w-5 h-5 mr-2" />
                        Login
                      </Button>
                      <Button
                        onClick={() => {
                          handleAuthClick("register");
                          setIsMenuOpen(false);
                        }}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <User className="w-5 h-5 mr-2" />
                        Sign Up
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </>
  );
};

export default Navbar;