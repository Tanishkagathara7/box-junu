import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Filter, Menu, X, User, MapPin, LogOut, Heart, BookOpen, Bell, Home, Info, HelpCircle, Settings } from "lucide-react";
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

interface NavbarProps {
  selectedCity?: string;
  onCitySelect?: () => void;
  onSearch?: (query: string) => void;
  onFilterToggle?: () => void;
  notifications?: any[];
  showNotifDropdown?: boolean;
  setShowNotifDropdown?: (v: boolean) => void;
  clearNotifications?: () => void;
}

const Navbar = ({
  selectedCity,
  onCitySelect,
  onSearch,
  onFilterToggle,
  notifications = [],
  showNotifDropdown = false,
  setShowNotifDropdown = () => {},
  clearNotifications = undefined,
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
    { name: "Home", path: "/", icon: Home },
    { name: "About Us", path: "/about", icon: Info },
    { name: "Help & Support", path: "/help", icon: HelpCircle },
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
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* BoxCric Logo - Positioned at the far left */}
            <div className="flex-shrink-0 mr-4">
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-cricket rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-cricket-green rounded-md"></div>
                  </div>
                </div>
                <div className="text-left">
                  <h1 className="text-xl sm:text-2xl font-bold font-display text-cricket-green group-hover:text-cricket-green/80 transition-colors">
                    BoxCric
                  </h1>
                  <p className="hidden xs:block text-xs text-gray-500 -mt-0.5 sm:-mt-1 font-medium">Book. Play. Win.</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation - Centered */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-8 flex-1 justify-center">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-gray-700 hover:text-cricket-green transition-colors duration-200 font-medium relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cricket-green transition-all duration-200 group-hover:w-full"></span>
                </Link>
              ))}
            </div>

            {/* Mobile menu button placeholder - actual menu is at the bottom */}

            {/* Search Bar and Actions - Right side */}
            <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
              {/* Location Selector */}
              <Button
                variant="outline"
                size="sm"
                onClick={onCitySelect}
                className="flex items-center space-x-2 hover:bg-cricket-green/5 hover:border-cricket-green/20 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">{selectedCity || "Select City"}</span>
              </Button>

              {/* Search */}
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search grounds..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-72 pl-10 pr-4 border-gray-200 focus:border-cricket-green focus:ring-cricket-green/20"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </form>

              {/* Filter */}
              {onFilterToggle && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onFilterToggle}
                  className="flex items-center space-x-2 hover:bg-cricket-green/5 hover:border-cricket-green/20 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden lg:inline">Filters</span>
                </Button>
              )}

              {/* Auth Section */}
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3">
                  {/* Notification Bell */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowNotifDropdown(!showNotifDropdown);
                        // Stop the pulse animation when dropdown is opened
                        if (!showNotifDropdown && notifications.length > 0) {
                          const badge = document.querySelector('.animate-pulse');
                          if (badge) {
                            badge.classList.remove('animate-pulse');
                          }
                        }
                      }}
                      className="relative bg-white rounded-full shadow-lg p-2 hover:bg-gray-100 transition-all"
                      aria-label="Show notifications"
                    >
                      <Bell className="w-6 h-6 text-cricket-green" />
                      {notifications.length > 0 && (
                        <span className={`absolute -top-1 -right-1 text-white text-xs rounded-full px-1.5 py-0.5 font-bold animate-pulse ${
                          notifications.some(n => n.status === 'pending') ? 'bg-yellow-500' :
                          notifications.some(n => n.status === 'cancelled') ? 'bg-red-500' :
                          'bg-green-500'
                        }`}>
                          {notifications.length}
                        </span>
                      )}
                    </button>
                    {/* Notification Dropdown with overlay and improved style */}
                    {showNotifDropdown && (
                      <>
                        {/* Overlay */}
                        <div
                          className="fixed inset-0 bg-black/20 z-40"
                          onClick={() => setShowNotifDropdown(false)}
                        />
                        {/* Dropdown - responsive positioning and sizing */}
                        <div className="fixed top-20 right-4 sm:right-8 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-fade-in flex flex-col">
                          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
                            <span className="font-semibold text-base sm:text-lg text-gray-900">Notifications</span>
                            <button onClick={() => setShowNotifDropdown(false)} className="text-gray-400 hover:text-gray-700 text-xl font-bold p-1">&times;</button>
                          </div>
                          <div className="overflow-y-auto max-h-80 sm:max-h-96 px-3 sm:px-4 py-2">
                            {notifications.length === 0 && (
                              <div className="text-center text-gray-500 py-8">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <Bell className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium text-sm sm:text-base">No notifications yet</p>
                                <p className="text-gray-400 text-xs sm:text-sm mt-1">We'll notify you about booking updates</p>
                              </div>
                            )}
                            {notifications.map((notif) => {
                              // Get status-specific styling and content
                              const getStatusConfig = (status: string) => {
                                switch (status) {
                                  case 'pending':
                                    return {
                                      bgColor: 'bg-yellow-50 border-l-4 border-yellow-500',
                                      icon: '⏳',
                                      iconBg: 'bg-yellow-100 text-yellow-700',
                                      title: 'Booking Pending',
                                      textColor: 'text-yellow-800'
                                    };
                                  case 'confirmed':
                                    return {
                                      bgColor: 'bg-green-50 border-l-4 border-green-500',
                                      icon: '✔️',
                                      iconBg: 'bg-green-100 text-green-700',
                                      title: 'Booking Confirmed!',
                                      textColor: 'text-green-800'
                                    };
                                  case 'cancelled':
                                    return {
                                      bgColor: 'bg-red-50 border-l-4 border-red-500',
                                      icon: '❌',
                                      iconBg: 'bg-red-100 text-red-700',
                                      title: 'Booking Cancelled',
                                      textColor: 'text-red-800'
                                    };
                                  case 'completed':
                                    return {
                                      bgColor: 'bg-blue-50 border-l-4 border-blue-500',
                                      icon: '✅',
                                      iconBg: 'bg-blue-100 text-blue-700',
                                      title: 'Booking Completed',
                                      textColor: 'text-blue-800'
                                    };
                                  default:
                                    return {
                                      bgColor: 'bg-gray-50 border-l-4 border-gray-500',
                                      icon: '📋',
                                      iconBg: 'bg-gray-100 text-gray-700',
                                      title: 'Booking Update',
                                      textColor: 'text-gray-800'
                                    };
                                }
                              };

                              const statusConfig = getStatusConfig(notif.status);
                              
                              return (
                                <div 
                                  key={notif.id} 
                                  className={`rounded-lg p-3 sm:p-4 mb-2 flex items-center gap-3 sm:gap-4 hover:bg-gray-50 transition-colors cursor-pointer ${statusConfig.bgColor}`}
                                  onClick={() => {
                                    // Navigate to booking details if we have a booking ID
                                    if (notif.id && notif.id !== 'unknown') {
                                      window.location.href = `/booking/${notif.id}`;
                                    }
                                    setShowNotifDropdown(false);
                                  }}
                                >
                                  <div className="flex-shrink-0">
                                    <span className={`inline-block w-8 h-8 ${statusConfig.iconBg} rounded-full flex items-center justify-center text-lg sm:text-xl`}>
                                      {statusConfig.icon}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className={`font-semibold text-base sm:text-lg ${statusConfig.textColor}`}>
                                      {statusConfig.title}
                                    </div>
                                    <div className="text-gray-700 text-xs sm:text-sm mt-1 space-y-1">
                                      <div><b>Ground:</b> {notif.ground}</div>
                                      <div><b>Date:</b> {notif.date ? new Date(notif.date).toLocaleDateString() : 'Not specified'}</div>
                                      <div><b>Time:</b> {notif.time}</div>
                                      {notif.status === 'cancelled' && notif.reason && (
                                        <div className="text-red-700"><b>Reason:</b> {notif.reason}</div>
                                      )}
                                    </div>
                                    {notif.createdAt && (
                                      <div className="text-xs text-gray-400 mt-2">
                                        {new Date(notif.createdAt).toLocaleString()}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {clearNotifications && notifications.length > 0 && (
                            <button
                              onClick={() => { clearNotifications(); setShowNotifDropdown(false); }}
                              className="text-gray-500 hover:text-red-600 text-sm py-3 border-t border-gray-100 w-full bg-transparent font-medium rounded-b-2xl transition-colors hover:bg-red-50"
                            >
                              Clear All Notifications
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center space-x-3 h-10 hover:bg-gray-100"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-cricket-green text-white text-sm font-semibold">
                            {getUserInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden lg:block text-left">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name.split(" ")[0]}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-cricket-green text-white">
                              {getUserInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </div>
                      <DropdownMenuItem onClick={() => navigate("/profile")}>
                        <User className="w-4 h-4 mr-3" />
                        My Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/profile/bookings")}>
                        <BookOpen className="w-4 h-4 mr-3" />
                        My Bookings
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Heart className="w-4 h-4 mr-3" />
                        Favorites
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/settings")}>
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAuthClick("login")}
                    className="hover:text-cricket-green transition-colors"
                  >
                    Login
                  </Button>
                  <Button
                    size="sm"
                    className="bg-cricket-green hover:bg-cricket-green/90 text-white font-semibold px-6"
                    onClick={() => handleAuthClick("register")}
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
              className="md:hidden flex items-center justify-center p-3 rounded-full bg-cricket-green/20 hover:bg-cricket-green/30 transition-colors shadow-md absolute top-3 right-4 z-[201]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMenuOpen ? (
                <X className="w-7 h-7 text-cricket-green" />
              ) : (
                <Menu className="w-7 h-7 text-cricket-green" />
              )}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden fixed inset-0 z-[200] overflow-y-auto bg-white/95 backdrop-blur-lg shadow-xl">
              <div className="space-y-6 px-4 py-6 pt-20 max-h-screen overflow-y-auto relative">
                <button 
                  onClick={() => setIsMenuOpen(false)} 
                  className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                  <X className="w-6 h-6 text-gray-700" />
                </button>
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="text"
                    placeholder="Search grounds..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-gray-200 focus:border-cricket-green text-base"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </form>

                {/* Mobile Location and Filter */}
                <div className="flex flex-col space-y-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onCitySelect}
                    className="flex items-center justify-center space-x-3 py-3 h-12"
                  >
                    <MapPin className="w-5 h-5" />
                    <span className="text-base font-medium">
                      {selectedCity || "Select City"}
                    </span>
                  </Button>
                  {onFilterToggle && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={onFilterToggle}
                      className="flex items-center justify-center space-x-3 py-3 h-12"
                    >
                      <Filter className="w-5 h-5" />
                      <span className="text-base">Filters</span>
                    </Button>
                  )}
                </div>

                {/* Mobile Auth */}
                {isAuthenticated && user ? (
                  <div className="space-y-4 pt-6 border-t border-gray-200">
                    {/* User Info at Top */}
                    <div className="flex items-center space-x-4 px-4 py-3 bg-gray-50 rounded-lg">
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-cricket-green text-white font-semibold text-lg">
                          {getUserInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-gray-900 text-base">{user.name}</div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    
                    {/* Combined Navigation Items */}
                    <div className="grid grid-cols-1 gap-2">
                      {navItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          className="flex items-center px-4 py-4 text-gray-700 hover:text-cricket-green hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium text-base shadow-sm border border-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <item.icon className="w-5 h-5 mr-3 text-cricket-green" />
                          {item.name}
                        </Link>
                      ))}
                    </div>

                    <div className="border-t border-gray-200 my-2"></div>

                    {/* User-specific links */}
                    <div className="grid grid-cols-1 gap-2">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-4 text-gray-700 hover:text-cricket-green hover:bg-gray-50 rounded-lg transition-colors duration-200 text-base shadow-sm border border-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="w-5 h-5 mr-3 text-cricket-green" />
                        My Profile
                      </Link>
                      <Link
                        to="/profile/bookings"
                        className="flex items-center px-4 py-4 text-gray-700 hover:text-cricket-green hover:bg-gray-50 rounded-lg transition-colors duration-200 text-base shadow-sm border border-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <BookOpen className="w-5 h-5 mr-3 text-cricket-green" />
                        My Bookings
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-4 text-gray-700 hover:text-cricket-green hover:bg-gray-50 rounded-lg transition-colors duration-200 text-base shadow-sm border border-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="w-5 h-5 mr-3 text-cricket-green" />
                        Settings
                      </Link>
                    </div>

                    <div className="border-t border-gray-200 my-2"></div>

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full text-left px-4 py-4 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 text-base shadow-sm border border-red-100 mt-2"
                    >
                      <LogOut className="w-5 h-5 mr-3 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 pt-6 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="lg"
                      className="py-3 h-12 text-base shadow-sm border border-gray-200 hover:border-cricket-green/50 hover:text-cricket-green transition-all"
                      onClick={() => {
                        handleAuthClick("login");
                        setIsMenuOpen(false);
                      }}
                    >
                      <User className="w-5 h-5 mr-3 text-cricket-green" />
                      Login
                    </Button>
                    <Button
                      size="lg"
                      className="py-3 h-12 bg-cricket-green hover:bg-cricket-green/90 text-white font-semibold text-base shadow-sm"
                      onClick={() => {
                        handleAuthClick("register");
                        setIsMenuOpen(false);
                      }}
                    >
                      <User className="w-5 h-5 mr-3 text-white" />
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