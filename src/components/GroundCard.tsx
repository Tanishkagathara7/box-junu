import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { Star, MapPin, Car, Eye, Zap, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ShareModal from "@/components/ShareModal";

interface GroundCardProps {
  ground: any; // API ground data structure
  onBook?: (groundId: string) => void;
  onViewDetails?: (groundId: string) => void;
}

const GroundCard = ({ ground, onBook, onViewDetails }: GroundCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);


  const handleImageNavigation = (direction: "prev" | "next") => {
    if (direction === "next") {
      setCurrentImageIndex((prev) =>
        prev === ground.images.length - 1 ? 0 : prev + 1,
      );
    } else {
      setCurrentImageIndex((prev) =>
        prev === 0 ? ground.images.length - 1 : prev - 1,
      );
    }
  };

  // Swipe handlers for image carousel
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleImageNavigation("next"),
    onSwipedRight: () => handleImageNavigation("prev"),
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  const getAmenityIcon = (amenity: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      Floodlights: <Zap className="w-3 h-3 text-yellow-500" />,
      Parking: <Car className="w-3 h-3 text-blue-500" />,
      Washroom: <span className="text-blue-400">🚿</span>,
      "Changing Room": <span className="text-gray-500">👕</span>,
      "AC Changing Room": <span className="text-blue-400">❄️👕</span>,
      "Drinking Water": <span className="text-blue-400">💧</span>,
      "First Aid": <span className="text-red-400">🏥</span>,
      "Equipment Rental": <span className="text-orange-400">🏏</span>,
      Cafeteria: <span className="text-brown-400">☕</span>,
      Scoreboard: <span className="text-green-400">📊</span>,
      Referee: <span className="text-purple-400">👨‍⚖️</span>,
      "Equipment Storage": <span className="text-gray-400">📦</span>,
    };
    return iconMap[amenity] || <span className="text-gray-400">✨</span>;
  };

  // Removed slot-related calculations as per request

  // Calculate average price
  const averagePrice = Array.isArray(ground.price?.ranges) && ground.price.ranges.length > 0
    ? Math.round(ground.price.ranges.reduce((sum: number, range: any) => sum + range.perHour, 0) / ground.price.ranges.length)
    : ground.price?.perHour || 0;
    
  // Get available slots or default to 1 if not available
  const availableSlots = ground.availableSlots ?? 1;


  return (
    <Card
      className="group hover:shadow-2xl hover:shadow-cricket-green/10 transition-all duration-300 border-2 border-transparent hover:border-cricket-green/20 bg-white/90 backdrop-blur-sm hover:bg-white w-full max-w-full relative overflow-hidden transform hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98] active:shadow-lg cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails?.(ground._id)}
    >
      <div className="relative">
        {/* Image Carousel with swipe support */}
        <div
          className="relative h-48 xs:h-52 sm:h-56 md:h-48 lg:h-56 overflow-hidden cursor-pointer bg-gradient-to-br from-cricket-green/5 to-transparent"
          {...swipeHandlers}
        >
          <img
            src={
              ground.images?.[currentImageIndex]?.url ||
              ground.images?.[currentImageIndex] ||
              "/placeholder.svg"
            }
            alt={ground.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            draggable={false}
          />
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Image Navigation */}
          {ground.images && ground.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageNavigation("prev");
                }}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/80 text-lg sm:text-xl"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageNavigation("next");
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/80 text-lg sm:text-xl"
                aria-label="Next image"
              >
                ›
              </button>
              {/* Image Indicators */}
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {ground.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all duration-200",
                      index === currentImageIndex ? "bg-white" : "bg-white/50",
                    )}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
          {/* Share Button */}
          <div className="absolute top-3 right-3 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsShareModalOpen(true);
              }}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 group/share hover:scale-110"
              aria-label="Share ground"
            >
              <Share2 className="w-4 h-4 text-gray-600 group-hover/share:text-cricket-green transition-all duration-200 group-hover/share:rotate-12" />
            </button>
          </div>
          
          {/* Price Display */}
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
            <div className="text-gray-600 text-right">
              <div className="text-xs">From</div>
              <div className="text-lg font-bold text-cricket-green">₹{averagePrice}/hr</div>
            </div>
          </div>
        </div>
        <CardContent className="p-4 sm:p-5 lg:p-6">
          {/* Header */}
          <div className="mb-3 sm:mb-4">
            <h3 
              className="font-bold text-lg sm:text-xl lg:text-xl text-gray-900 group-hover:text-cricket-green transition-all duration-300 mb-2 sm:mb-3 cursor-pointer transform group-hover:translate-x-1"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(ground._id);
              }}
            >
              {ground.name}
            </h3>
            <div className="flex flex-col xs:flex-row items-start xs:items-center space-y-1 xs:space-y-0 xs:space-x-2 text-sm text-gray-600 mb-2">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{ground.location.address}</span>
              </div>
              {ground.distance && (
                <span className="text-cricket-green font-medium text-sm">
                  • {ground.distance.toFixed(1)} km away
                </span>
              )}
            </div>
          </div>
          {/* Rating */}
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-lg sm:text-xl">{ground.rating.average}</span>
              <span className="text-sm text-gray-500">
                ({ground.rating.count})
              </span>
            </div>
          </div>
          {/* Enhanced Amenities */}
          <div className="mb-3 sm:mb-4">
            <div className="flex flex-wrap gap-2">
              {ground.amenities.slice(0, 4).map((amenity, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs flex items-center space-x-1 bg-gray-100 hover:bg-cricket-green/10 hover:border-cricket-green/20 hover:text-cricket-green transition-all duration-200 px-2 py-1 cursor-pointer transform hover:scale-105"
                >
                  {getAmenityIcon(amenity)}
                  <span className="text-xs">{amenity}</span>
                </Badge>
              ))}
              {ground.amenities.length > 4 && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  +{ground.amenities.length - 4} more
                </Badge>
              )}
            </div>
          </div>
          {/* Features */}
          <div className="mb-4 text-sm text-gray-600">
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between space-y-2 xs:space-y-0">
              <span className="font-medium">Pitch: {ground.features.pitchType}</span>
              <div className="flex items-center space-x-2">
                {ground.features.lighting && (
                  <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-200 px-2 py-1">
                    <Zap className="w-3 h-3 mr-1" />
                    Night Play
                  </Badge>
                )}
                {ground.features.parking && (
                  <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 px-2 py-1">
                    <Car className="w-3 h-3 mr-1" />
                    Parking
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {/* Actions - View Details and Book Now buttons always visible below features */}
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 border-gray-300 hover:border-cricket-green hover:text-cricket-green hover:bg-cricket-green/5 py-3 h-12 text-base transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(ground._id);
              }}
            >
              <Eye className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              View Details
            </Button>
            <Button
              size="lg"
              className="flex-1 bg-cricket-green hover:bg-cricket-green/90 text-white font-semibold py-3 h-12 text-base transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-cricket-green/25"
              onClick={(e) => {
                e.stopPropagation();
                onBook?.(ground._id);
              }}
              disabled={availableSlots === 0}
            >
              {availableSlots === 0 ? "Fully Booked" : "Book Now"}
            </Button>
          </div>
        </CardContent>
      </div>
      
      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        ground={ground}
      />
    </Card>
  );
};

export default GroundCard;
