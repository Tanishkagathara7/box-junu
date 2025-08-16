import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Shield, Clock, MapPin, Calendar, Users, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { paymentsApi, bookingsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { startHoldTimer, confirmBookingAfterPayment } from "@/utils/bookingUtils";

// Utility functions
const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${period}`;
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Declare Cashfree types
declare global {
  interface Window {
    Cashfree: any;
  }
}

interface Booking {
  _id?: string; // MongoDB ID
  id: string; // Legacy ID for compatibility
  bookingId: string;
  groundId?: any;
  ground?: any;
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
    };
  };
  pricing?: {
    baseAmount?: number;
    discount?: number;
    taxes?: number;
    totalAmount?: number;
    duration?: number;
  };
  amount?: number;
  status?: string;
}

interface BookingData {
  ground?: {
    name?: string;
    location?: string;
    images?: string[];
  };
  firstImage?: string;
  address?: string;
  baseAmount: number;
  discount: number;
  taxes: number;
  totalAmount: number;
  duration: number;
  pricing?: {
    baseAmount?: number;
    discount?: number;
    taxes?: number;
    totalAmount?: number;
    duration?: number;
  };
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onPaymentSuccess: (booking: Booking) => void;
  bookingData?: BookingData;
}

const PaymentModal = ({
  isOpen,
  onClose,
  booking,
  onPaymentSuccess,
}: PaymentModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const holdTimerRef = useRef<() => void>();

  // Clean up hold timer on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        holdTimerRef.current();
      }
    };
  }, []);

  const bookingData = useMemo(() => {
    if (!booking) return null;

    // Enhanced ground data selection logic
    let ground = null;

    // Priority 1: Check if groundId is an object (populated from backend)
    if (booking.groundId && typeof booking.groundId === "object" && booking.groundId.name) {
      ground = booking.groundId;
    }
    // Priority 2: Check if ground property exists and has data
    else if (booking.ground && typeof booking.ground === "object" && booking.ground.name) {
      ground = booking.ground;
      console.log("PaymentModal: Using booking.ground");
    }
    // Priority 3: Try groundId if it has name property (backward compatibility)
    else if (booking.groundId && booking.groundId.name) {
      ground = booking.groundId;
      console.log("PaymentModal: Using booking.groundId (fallback)");
    }
    // Priority 4: Create a ground object using fallback data if we only have string ID
    else {
      const groundId = booking.groundId || booking.ground;

      // Define city-specific fallback ground data
      const getFallbackGroundData = (groundId: string) => {
        // Try to determine city from ground ID or use city-specific fallbacks
        let cityFallback = {
          name: "Cricket Ground",
          cityName: "Unknown City",
          state: "India",
          address: "Cricket Ground Location",
        };

        // Detect city from ground ID or common patterns
        if (groundId && typeof groundId === "string") {
          const lowerId = groundId.toLowerCase();
          if (
            lowerId.includes("mumbai") ||
            lowerId.includes("marine")
          ) {
            cityFallback = {
              name: "Marine Drive Cricket Arena",
              cityName: "Mumbai",
              state: "Maharashtra",
              address: "Marine Drive, Mumbai, Maharashtra",
            };
          } else if (
            lowerId.includes("delhi") ||
            lowerId.includes("cp") ||
            lowerId.includes("dwarka")
          ) {
            cityFallback = {
              name: "Delhi Cricket Arena",
              cityName: "Delhi",
              state: "Delhi",
              address: "Central Delhi, New Delhi, Delhi",
            };
          } else if (
            lowerId.includes("ahmedabad") ||
            lowerId.includes("gujarat")
          ) {
            cityFallback = {
              name: "Ahmedabad Cricket Stadium",
              cityName: "Ahmedabad",
              state: "Gujarat",
              address: "Ahmedabad, Gujarat",
            };
          } else if (
            lowerId.includes("bangalore") ||
            lowerId.includes("bengaluru") ||
            lowerId.includes("karnataka")
          ) {
            cityFallback = {
              name: "Bangalore Cricket Ground",
              cityName: "Bangalore",
              state: "Karnataka",
              address: "Bangalore, Karnataka",
            };
          } else if (
            lowerId.includes("chennai") ||
            lowerId.includes("tamil")
          ) {
            cityFallback = {
              name: "Chennai Cricket Ground",
              cityName: "Chennai",
              state: "Tamil Nadu",
              address: "Chennai, Tamil Nadu",
            };
          } else if (
            lowerId.includes("hyderabad") ||
            lowerId.includes("telangana")
          ) {
            cityFallback = {
              name: "Hyderabad Cricket Ground",
              cityName: "Hyderabad",
              state: "Telangana",
              address: "Hyderabad, Telangana",
            };
          } else if (
            lowerId.includes("kolkata") ||
            lowerId.includes("bengal")
          ) {
            cityFallback = {
              name: "Kolkata Cricket Ground",
              cityName: "Kolkata",
              state: "West Bengal",
              address: "Kolkata, West Bengal",
            };
          } else if (
            lowerId.includes("pune") ||
            lowerId.includes("maharashtra")
          ) {
            cityFallback = {
              name: "Pune Cricket Ground",
              cityName: "Pune",
              state: "Maharashtra",
              address: "Pune, Maharashtra",
            };
          }
        }

        return {
          _id: groundId,
          name: cityFallback.name,
          description: "Premium cricket ground with excellent facilities for competitive matches.",
          location: {
            address: cityFallback.address,
            cityName: cityFallback.cityName,
            state: cityFallback.state,
          },
          price: {
            perHour: 1500,
            currency: "INR",
            discount: 0,
          },
          images: [
            {
              url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop",
              alt: `${cityFallback.name} - Main View`,
              isPrimary: true,
            },
          ],
          amenities: ["Floodlights", "Parking", "Washroom", "Changing Room", "Drinking Water"],
          features: {
            pitchType: "Artificial Turf",
            capacity: 22,
            lighting: true,
            parking: true,
          },
          rating: {
            average: 4.7,
            count: 89,
          },
          owner: {
            name: "Ground Owner",
            contact: "N/A",
            email: "owner@example.com",
          },
        };
      };

      ground = getFallbackGroundData(groundId);
      console.log("PaymentModal: Using city-specific fallback ground data for ID:", groundId);
    }

    console.log("PaymentModal: Final selected ground data:", ground);
    console.log("PaymentModal: Ground name:", ground?.name);
    console.log("PaymentModal: Ground location:", ground?.location);
    console.log("PaymentModal: Ground address:", ground?.location?.address);

    let firstImage = "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";
    if (
      ground.images &&
      Array.isArray(ground.images) &&
      ground.images.length > 0
    ) {
      const imgItem = ground.images[0];
      if (typeof imgItem === "string") {
        firstImage = imgItem.startsWith("http") ? imgItem : "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";
      } else if (imgItem && typeof imgItem === "object" && "url" in imgItem) {
        firstImage = imgItem.url && imgItem.url.startsWith("http") ? imgItem.url : "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";
      }
    }

    const address =
      ground?.location?.address ||
      (ground?.location ? ground.location : "") ||
      "No address available";

    // --- Dynamic baseAmount calculation ---
    let baseAmount = booking?.pricing?.baseAmount ?? 0;
    let perHour = ground?.price?.perHour || 0;
    let duration = booking?.timeSlot?.duration || 1;
    // If price ranges exist, pick the correct perHour based on startTime
    if (
      Array.isArray(ground?.price?.ranges) &&
      ground.price.ranges.length > 0 &&
      booking?.timeSlot?.startTime
    ) {
      const slot = ground.price.ranges.find(
        (r) => r.start === booking.timeSlot.startTime
      );
      if (slot) {
        perHour = slot.perHour;
      } else {
        perHour = ground.price.ranges[0].perHour;
      }
    }
    if (!baseAmount || baseAmount === 0) {
      baseAmount = perHour * duration;
    }

    const discount = booking?.pricing?.discount ?? 0;
    // --- Dynamic taxes and totalAmount calculation ---
    let taxes = booking?.pricing?.taxes ?? 0;
    if (!taxes && baseAmount > 0) {
      taxes = Math.round((baseAmount - discount) * 0.02);
    }
    let totalAmount = booking?.pricing?.totalAmount ?? 0;
    if (!totalAmount && baseAmount > 0) {
      totalAmount = (baseAmount - discount) + taxes;
    }

    return {
      ground,
      firstImage,
      address,
      baseAmount,
      discount,
      taxes,
      totalAmount,
      duration,
    };
  }, [booking]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup hold timer on unmount
      if (holdTimerRef.current) {
        holdTimerRef.current();
        holdTimerRef.current = undefined;
      }
    };
  }, []);

  const handlePayment = useCallback(async () => {
    if (!booking || !user || !bookingData) {
      console.error('Missing required data for payment:', { booking, user, bookingData });
      return;
    }

    try {
      console.log('Starting payment process...');
      setIsProcessing(true);
      setPaymentStatus('processing');

      // Start the hold timer when payment is initiated
      const bookingId = booking._id || booking.id;
      console.log('Booking ID for payment:', bookingId);
      
      if (bookingId) {
        // Release any existing timer
        if (holdTimerRef.current) {
          console.log('Clearing existing hold timer');
          holdTimerRef.current();
        }
        // Start new hold timer (15 minutes)
        console.log('Starting new hold timer');
        holdTimerRef.current = startHoldTimer(bookingId, () => {
          // This callback runs if the hold expires
          console.log('Hold timer expired');
          if (paymentStatus === 'processing') {
            console.log('Payment still processing, marking as failed');
            setPaymentStatus('failed');
            toast.error('Payment session expired. Please try again.');
            onClose();
          }
        });
      }

      // Create payment order
      console.log('Creating payment order...');
      let response;
      try {
        response = await paymentsApi.createOrder({
          bookingId: booking._id || booking.id,
        });
        console.log('Payment order response:', response);
      } catch (apiError) {
        console.error('Error creating payment order:', {
          message: apiError.message,
          response: apiError.response?.data,
          status: apiError.response?.status,
          config: {
            url: apiError.config?.url,
            method: apiError.config?.method,
            data: apiError.config?.data
          }
        });
        throw new Error(`Failed to create payment order: ${apiError.message}`);
      }

      if (!response?.data?.paymentSessionId) {
        console.error('Invalid payment order response:', response);
        throw new Error('Failed to initialize payment: Invalid response from server');
      }

      // Initialize Cashfree
      console.log('Initializing Cashfree...');
      if (!window.Cashfree) {
        console.error('Cashfree SDK not loaded');
        throw new Error('Payment processor not available. Please refresh the page and try again.');
      }

      console.log('Creating Cashfree instance...');
      const cashfree = window.Cashfree({
        mode: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
      });
      console.log('Cashfree instance created:', !!cashfree);

      // Set up payment success handler
      const handlePaymentSuccess = async (data: any) => {
        try {
          // Verify payment with backend
          await paymentsApi.verifyPayment({
            order_id: data.orderId,
            payment_session_id: data.paymentSessionId,
            bookingId: booking._id || booking.id,
          });

          // Confirm booking after successful payment
          await confirmBookingAfterPayment(
            booking._id || booking.id,
            () => {
              setPaymentStatus('success');
              onPaymentSuccess(booking);
              toast.success('Payment successful! Your booking is confirmed.');
              
              // Clear the hold timer on success
              if (holdTimerRef.current) {
                holdTimerRef.current();
                holdTimerRef.current = undefined;
              }
              
              // Close the modal after a short delay
              setTimeout(() => {
                onClose();
              }, 2000);
            },
            (error) => {
              console.error('Booking confirmation failed:', error);
              setPaymentStatus('failed');
              toast.error('Booking confirmation failed. Please contact support.');
            }
          );
        } catch (error) {
          console.error('Payment verification failed:', error);
          setPaymentStatus('failed');
          toast.error('Payment verification failed. Please contact support.');
        } finally {
          setIsProcessing(false);
        }
      };

      // Set up payment failure handler
      const handlePaymentFailure = (error: any) => {
        console.error('Payment failed:', error);
        setPaymentStatus('failed');
        toast.error('Payment failed. Please try again or contact support.');
        setIsProcessing(false);
      };

      // Set up payment handlers
      window.Cashfree.on('paymentSuccess', handlePaymentSuccess);
      window.Cashfree.on('paymentFailure', handlePaymentFailure);

      // Start checkout
      const checkoutOptions = {
        paymentSessionId: response.data.paymentSessionId,
        redirectTarget: '_self',
      };

      console.log('Opening Cashfree checkout with:', checkoutOptions);
      cashfree.checkout(checkoutOptions);

    } catch (error) {
      console.error('Payment initialization failed:', error);
      setPaymentStatus('failed');
      toast.error('Failed to initialize payment. Please try again.');
      setIsProcessing(false);
    }

  }, [booking, user, bookingData, onPaymentSuccess, onClose, paymentStatus]);

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      if (window.Cashfree) {
        window.Cashfree.off('paymentSuccess');
        window.Cashfree.off('paymentFailure');
      }
    };
  }, []);

  if (!booking || !bookingData) return null;

  // Safely extract values from bookingData with proper type checking
  const getSafeValue = <T,>(value: T | undefined, defaultValue: T): T => {
    return value !== undefined ? value : defaultValue;
  };

  // Calculate pricing details with fallbacks
  const baseAmount = getSafeValue(
    (bookingData as any)?.pricing?.baseAmount ?? bookingData.baseAmount,
    0
  );
  const discount = getSafeValue(
    (bookingData as any)?.pricing?.discount ?? bookingData.discount,
    0
  );
  const taxes = getSafeValue(
    (bookingData as any)?.pricing?.taxes ?? bookingData.taxes,
    0
  );
  const totalAmount = getSafeValue(
    (bookingData as any)?.pricing?.totalAmount ?? bookingData.totalAmount,
    0
  );

  // Get ground details with fallbacks
  const firstImage = bookingData.firstImage || 
                    (Array.isArray(bookingData.ground?.images) && bookingData.ground.images[0]) || 
                    "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";
  
  const groundName = bookingData.ground?.name || "Sports Ground";
  const address = bookingData.address || bookingData.ground?.location || "Location not specified";
  
  // Get player count safely
  const playerCount = booking.playerDetails?.playerCount || 1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        toast.error("Payment was not completed. Please try again.");
      }
      onClose();
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="payment-description">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-cricket-green">
            Complete Your Payment
          </DialogTitle>
          <DialogDescription id="payment-description" className="sr-only">
            Complete your payment securely via Cashfree payment gateway
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Summary */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                <img
                  src={firstImage}
                  alt={groundName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {groundName}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{address}</span>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span>{formatDate(booking.bookingDate)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span>{formatTime(booking.timeSlot.startTime)} - {formatTime(booking.timeSlot.endTime)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span>{playerCount} player{playerCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Base Amount</span>
                <span>{formatCurrency(baseAmount)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Taxes & Fees</span>
                <span>{formatCurrency(taxes)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-semibold text-cricket-green">
                <span>Total Amount</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <div className="space-y-4">
            <Button
              onClick={handlePayment}
              disabled={isProcessing || totalAmount <= 0}
              className="w-full bg-gradient-to-r from-cricket-green to-green-600 hover:from-cricket-green/90 hover:to-green-600/90 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay {formatCurrency(totalAmount)}
                </>
              )}
            </Button>
            
            <div className="flex items-center justify-center text-xs text-gray-500">
              <Shield className="w-4 h-4 mr-1 text-green-500" />
              <span>Secure payment powered by Cashfree</span>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-sm text-gray-600">
                <div className="font-semibold text-green-800 mb-1">Secure Payment</div>
                <div className="text-sm text-green-700">
                  Your payment is protected by 256-bit SSL encryption and processed securely through Cashfree.
                  All major payment methods are supported.
                </div>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <div className="space-y-4">
            <Button
              onClick={handlePayment}
              disabled={isProcessing || bookingData.totalAmount <= 0}
              className="w-full bg-gradient-to-r from-cricket-green to-green-600 hover:from-cricket-green/90 hover:to-green-600/90 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isProcessing ? (
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Redirecting to Payment Gateway...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-6 h-6" />
                  <span>Pay {formatCurrency(bookingData.totalAmount)}</span>
                </div>
              )}
            </Button>

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>This booking will expire in 15 minutes if not paid</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;