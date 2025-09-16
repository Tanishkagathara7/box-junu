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
          <div className="flex items-center justify-between h-16 pl-4 pr-4 sm:pr-6 lg:pr-8">
            
            {/* Logo - Farest Top Left */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <Link to="/" className="flex items-center group">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center mr-3 group-hover:scale-105 transition-transform duration-200 shadow-lg">
                  <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                    <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-emerald-700 transition-colors duration-200">
                    BoxCric
                  </h1>
                  <p className="text-xs text-emerald-600 font-semibold -mt-1 tracking-wide">PREMIUM GROUNDS</p>
                </div>
              </Link>
            </div>

            {/* Navigation Items - Properly Centered */}
            <div className="hidden lg:flex items-center justify-center space-x-10 flex-1 ml-64">
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
            <div className="flex items-center space-x-4">
              
              {/* Location Selector - Sleek Pill */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="hidden md:flex items-center space-x-2 h-10 px-4 bg-white/80 backdrop-blur border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/50 rounded-full transition-all duration-200 shadow-sm"
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

              {/* Centered Search Bar */}
              <div className="hidden md:block">
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search cricket grounds…"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        // Trigger search on every keystroke for instant results
                        onSearch?.(e.target.value);
                      }}
                      className="w-80 pl-10 pr-10 h-10 bg-white/90 border-gray-200 focus:border-emerald-300 focus:ring-emerald-200 rounded-xl shadow-sm focus:shadow-md transition-all duration-200 placeholder:text-gray-400"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          onSearch?.("");
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Filters CTA Button */}
              {onFilterToggle && (
                <Button
                  onClick={onFilterToggle}
                  className="hidden md:flex items-center space-x-2 h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                </Button>
              )}

              {/* Notification Bell */}
              {isAuthenticated && user && (
                <NotificationPanel />
              )}

              {/* User Profile - Far Right */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 h-10 px-3 py-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-emerald-600 text-white text-sm font-semibold">
                          {getUserInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="w-3 h-3 text-gray-500 hidden lg:block" />
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
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    onClick={() => handleAuthClick("login")}
                    className="h-10 px-4 text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => handleAuthClick("register")}
                    className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 h-10 w-10 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40">
              <div className="px-4 py-6 space-y-4">
                {/* Mobile Search */}
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search cricket grounds…"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        // Trigger search on every keystroke for instant results
                        onSearch?.(e.target.value);
                      }}
                      className="w-full pl-10 pr-10 h-10 bg-white border-gray-200 focus:border-emerald-300 focus:ring-emerald-200 rounded-xl"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          onSearch?.("");
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </form>

                {/* Mobile Location */}
                <Button
                  variant="outline"
                  onClick={onCitySelect}
                  className="w-full justify-start h-10 bg-white border-emerald-200 hover:bg-emerald-50"
                >
                  <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
                  {selectedCity || "Select Location"}
                </Button>

                {/* Mobile Navigation */}
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className="flex items-center px-4 py-3 text-gray-700 hover:text-emerald-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                {/* Mobile Auth */}
                {isAuthenticated && user ? (
                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 text-gray-700 hover:text-emerald-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 w-full text-left"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleAuthClick("login");
                        setIsMenuOpen(false);
                      }}
                      className="w-full justify-start h-10 text-gray-700 hover:text-emerald-600"
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => {
                        handleAuthClick("register");
                        setIsMenuOpen(false);
                      }}
                      className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
                    >
                      Sign Up
                    </Button>
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