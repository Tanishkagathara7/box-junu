import { useState, useEffect } from "react";
import { User, Mail, Phone, Calendar, MapPin, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { bookingsApi } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface BookingData {
  _id: string;
  bookingId: string;
  groundId: {
    _id: string;
    name: string;
    location: {
      address: string;
    };
  };
  bookingDate: string;
  timeSlot: {
    startTime: string;
    endTime: string;
    duration: number;
  };
  playerDetails: {
    teamName?: string;
    playerCount: number;
    contactPerson: {
      name: string;
      phone: string;
      email: string;
    };
    requirements?: string;
  };
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  pricing: {
    baseAmount: number;
    discount: number;
    taxes: number;
    totalAmount: number;
    currency: string;
  };
  createdAt: string;
}

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserBookings();
    }
  }, [isAuthenticated]);

  const fetchUserBookings = async () => {
    try {
      setIsLoadingBookings(true);
      const response: any = await bookingsApi.getMyBookings();
      //@ts-ignore
      if (response.success) {
        //@ts-ignore
        setBookings(response.bookings || []);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Failed to load your bookings");
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const getStatusColor = (status: BookingData["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeSlot: { startTime: string; endTime: string }) => {
    return `${timeSlot.startTime} to ${timeSlot.endTime}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-grass-light via-white to-sky-blue/10">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Please login to view your profile
              </h3>
              <p className="text-gray-600 mb-4">
                You need to be logged in to access your profile and bookings.
              </p>
              <Button 
                className="bg-cricket-green hover:bg-cricket-green/90"
                onClick={() => navigate("/")}
              >
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-grass-light via-white to-sky-blue/10">
      <Navbar />

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center bg-gradient-to-br from-cricket-green/5 to-sky-blue/5 pb-4 sm:pb-6">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 mx-auto mb-4 sm:mb-6">
                  <div className="w-full h-full bg-gradient-to-br from-cricket-green to-emerald-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white" />
                    )}
                  </div>
                  {user?.isVerified && (
                    <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center ring-2 sm:ring-3 ring-white">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">{user?.name}</CardTitle>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-cricket-green rounded-full animate-pulse"></div>
                  <p className="text-sm sm:text-base text-cricket-green font-medium">Cricket Enthusiast</p>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wide">Contact Info</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-2.5 sm:p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors min-h-[44px]">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-700 font-medium break-all">{user?.email}</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2.5 sm:p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors min-h-[44px]">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">{user?.phone}</span>
                    </div>
                    {user?.location && (
                      <div className="flex items-center space-x-3 p-2.5 sm:p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors min-h-[44px]">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                        </div>
                        <span className="text-xs sm:text-sm text-gray-700 font-medium">{user.location.cityName}, {user.location.state}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-3 p-2.5 sm:p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors min-h-[44px]">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">Member since {formatDate(user?.createdAt || new Date().toISOString())}</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Statistics */}
                <div className="space-y-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wide">Statistics</h3>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-gradient-to-br from-cricket-green/10 to-emerald-50 p-3 sm:p-4 rounded-xl border border-cricket-green/20">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-cricket-green mb-1">{bookings.length}</div>
                        <div className="text-xs text-gray-600 font-medium">Total Bookings</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-3 sm:p-4 rounded-xl border border-blue-200">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
                          {bookings.filter(b => b.status === "confirmed" || b.status === "pending").length}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Active Bookings</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Booking Status Breakdown */}
                  <div className="space-y-2">
                    {[
                      { status: 'confirmed', label: 'Confirmed', color: 'bg-green-500' },
                      { status: 'pending', label: 'Pending', color: 'bg-yellow-500' },
                      { status: 'completed', label: 'Completed', color: 'bg-blue-500' },
                      { status: 'cancelled', label: 'Cancelled', color: 'bg-red-500' }
                    ].map(({ status, label, color }) => {
                      const count = bookings.filter(b => b.status === status).length;
                      const percentage = bookings.length > 0 ? (count / bookings.length) * 100 : 0;
                      return count > 0 ? (
                        <div key={status} className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${color}`}></div>
                            <span className="text-gray-600">{label}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{count}</span>
                            <span className="text-gray-500">({percentage.toFixed(0)}%)</span>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    className="w-full bg-gradient-to-r from-cricket-green to-emerald-600 hover:from-cricket-green/90 hover:to-emerald-600/90 text-white font-medium py-3 sm:py-3 h-12 sm:h-auto shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                    onClick={() => navigate("/")}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book New Ground
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full border-2 border-gray-200 hover:border-cricket-green/30 hover:bg-cricket-green/5 text-gray-700 font-medium py-3 sm:py-3 h-12 sm:h-auto transition-all duration-200 text-sm sm:text-base"
                    onClick={() => {/* Add edit profile functionality */}}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="bookings" className="space-y-3 sm:space-y-4">
              <TabsList className="grid w-full grid-cols-2 h-12 sm:h-10">
                <TabsTrigger value="bookings" className="text-sm sm:text-base">My Bookings</TabsTrigger>
                <TabsTrigger value="favorites" className="text-sm sm:text-base">Favorites</TabsTrigger>
              </TabsList>

              {/* Bookings Tab */}
              <TabsContent value="bookings" className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    My Bookings
                  </h2>
                  <Button 
                    className="bg-cricket-green hover:bg-cricket-green/90 h-12 sm:h-auto text-sm sm:text-base w-full sm:w-auto"
                    onClick={() => navigate("/")}
                  >
                    Book New Ground
                  </Button>
                </div>

                {isLoadingBookings ? (
                  <div className="space-y-3 sm:space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-4 sm:p-6">
                          <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="space-y-2">
                              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : bookings.filter(b => b.groundId).length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {bookings.filter(b => b.groundId).map((booking) => (
                      <Card key={booking._id}>
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-3">
                                <h3 className="font-semibold text-base sm:text-lg">
                                  {booking.groundId ? booking.groundId.name : "Unknown Ground"}
                                </h3>
                                <Badge
                                  className={`${getStatusColor(booking.status)} text-xs`}
                                >
                                  {booking.status.charAt(0).toUpperCase() +
                                    booking.status.slice(1)}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 flex-shrink-0" />
                                  <span>{formatDate(booking.bookingDate)}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 flex-shrink-0" />
                                  <span>{formatTime(booking.timeSlot)}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4 flex-shrink-0" />
                                  <span>{booking.playerDetails.playerCount} players</span>
                                </div>
                              </div>

                              {booking.playerDetails.teamName && (
                                <div className="mt-2 text-xs sm:text-sm text-gray-600">
                                  Team: {booking.playerDetails.teamName}
                                </div>
                              )}

                              <div className="mt-3 text-xs sm:text-sm text-gray-600">
                                Booked on {formatDate(booking.createdAt)}
                              </div>
                            </div>

                            <div className="text-center sm:text-right">
                              <div className="text-lg sm:text-xl font-bold text-cricket-green">
                                ₹{booking.pricing.totalAmount}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600">
                                Total Amount
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 mt-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-10 sm:h-8 text-sm flex-1 sm:flex-none"
                              onClick={() => navigate(`/booking/${booking._id}`)}
                            >
                              View Details
                            </Button>
                            {booking.status === "confirmed" && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-10 sm:h-8 text-sm flex-1 sm:flex-none"
                              >
                                Reschedule
                              </Button>
                            )}
                            {booking.status === "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-600 hover:bg-red-50 h-10 sm:h-8 text-sm flex-1 sm:flex-none"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 sm:p-12 text-center">
                      <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                        No bookings yet
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-4">
                        Start exploring cricket grounds and make your first
                        booking!
                      </p>
                      <Button 
                        className="bg-cricket-green hover:bg-cricket-green/90 h-12 sm:h-auto text-sm sm:text-base w-full sm:w-auto"
                        onClick={() => navigate("/")}
                      >
                        Explore Grounds
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Favorites Tab */}
              <TabsContent value="favorites" className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Favorite Grounds
                  </h2>
                </div>

                <Card>
                  <CardContent className="p-8 sm:p-12 text-center">
                    <Star className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                      No favorites yet
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">
                      Add cricket grounds to your favorites for quick access.
                    </p>
                    <Button
                      variant="outline"
                      className="text-cricket-green border-cricket-green hover:bg-cricket-green/10 h-12 sm:h-auto text-sm sm:text-base w-full sm:w-auto"
                      onClick={() => navigate("/")}
                    >
                      Browse Grounds
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>


            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

