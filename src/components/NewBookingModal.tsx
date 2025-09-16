import React, { useState, useEffect, useMemo, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  DollarSign, 
  Star, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  Check, 
  Phone, 
  Mail, 
  User,
  Filter,
  Wifi,
  Car,
  Coffee,
  Zap,
  Shield,
  X,
  ExternalLink
} from "lucide-react";
import { format, addDays } from "date-fns";
import { groundsApi, bookingsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import PaymentModal from "@/components/PaymentModal";
import { isMongoObjectId } from "@/lib/utils";
import "./NewBookingModal.css";

interface Ground {
  _id: string;
  name: string;
  location: { 
    address: string;
    city?: string;
    area?: string;
  };
  price: {
    ranges: {
      start: string;
      end: string;
      perHour: number;
    }[];
    currency: string;
    discount?: number;
  };
  features: { 
    capacity: number;
    type?: 'indoor' | 'outdoor';
    amenities?: string[];
  };
  rating?: number;
  totalReviews?: number;
  images?: string[];
  description?: string;
}

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  grounds?: Ground[]; // Now accepts multiple grounds
  selectedGround?: Ground | null;
  onBookingCreated: (booking: any) => void;
}

interface TimeSlot {
  slot: string;
  label: string;
  isAvailable: boolean;
}

// Helper to format 24-hour slots to AM/PM
function formatSlotLabel(startHour: number): string {
  const start = new Date(2000, 0, 1, startHour, 0);
  const end = new Date(2000, 0, 1, (startHour + 1) % 24, 0);
  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${formatTime(start)} – ${formatTime(end)}`;
}

const ALL_24H_SLOTS = Array.from({ length: 24 }, (_, i) => {
  return {
    slot: `${i.toString().padStart(2, '0')}:00-${((i + 1) % 24).toString().padStart(2, '0')}:00`,
    label: formatSlotLabel(i),
  };
});

// Ground Selection Step Component
interface GroundSelectionStepProps {
  grounds: Ground[];
  selectedGround: Ground | null;
  onGroundSelect: (ground: Ground) => void;
  expandedGround: string | null;
  setExpandedGround: (id: string | null) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filters: any;
  setFilters: (filters: any) => void;
}

const GroundSelectionStep: React.FC<GroundSelectionStepProps> = ({
  grounds,
  selectedGround,
  onGroundSelect,
  expandedGround,
  setExpandedGround,
  showFilters,
  setShowFilters,
  filters,
  setFilters
}) => {
  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'parking': return <Car className="w-4 h-4" />;
      case 'cafeteria': return <Coffee className="w-4 h-4" />;
      case 'floodlights': return <Zap className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      default: return <Check className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Filters Bar */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              {grounds.length} grounds found
            </span>
            {filters.location && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {filters.location}
              </Badge>
            )}
            {filters.type !== 'all' && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {filters.type}
              </Badge>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <Input
                placeholder="Search location..."
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                className="h-9"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ground Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full h-9 px-3 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</label>
              <select
                value={filters.minRating}
                onChange={(e) => setFilters({...filters, minRating: Number(e.target.value)})}
                className="w-full h-9 px-3 border border-gray-300 rounded-md text-sm"
              >
                <option value={0}>Any Rating</option>
                <option value={3}>3+ Stars</option>
                <option value={4}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
              </select>
            </div>
          </div>
        )}
      </div>
      
      {/* Grounds List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {grounds.map((ground) => (
          <div key={ground._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{ground.name}</h3>
                    {ground.features.type && (
                      <Badge 
                        variant={ground.features.type === 'indoor' ? 'default' : 'secondary'}
                        className={ground.features.type === 'indoor' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}
                      >
                        {ground.features.type}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {ground.location.area || ground.location.address}
                    </div>
                    
                    {ground.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{ground.rating}</span>
                        {ground.totalReviews && (
                          <span className="text-gray-400">({ground.totalReviews})</span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Max {ground.features.capacity}
                    </div>
                  </div>
                  
                  {ground.features.amenities && ground.features.amenities.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      {ground.features.amenities.slice(0, 4).map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {getAmenityIcon(amenity)}
                          <span>{amenity}</span>
                        </div>
                      ))}
                      {ground.features.amenities.length > 4 && (
                        <span className="text-xs text-gray-500">+{ground.features.amenities.length - 4} more</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {Array.isArray(ground?.price?.ranges) && ground.price.ranges.length > 0
                      ? `₹${Math.min(...ground.price.ranges.map(r => r.perHour))}`
                      : 'Custom'}
                  </div>
                  <div className="text-sm text-gray-500 mb-3">per hour</div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedGround(expandedGround === ground._id ? null : ground._id)}
                      className="text-xs"
                    >
                      {expandedGround === ground._id ? 'Less' : 'More'}
                    </Button>
                    <Button
                      onClick={() => onGroundSelect(ground)}
                      className="bg-green-600 hover:bg-green-700 text-white px-6"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Expanded Details */}
              {expandedGround === ground._id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  {ground.description && (
                    <p className="text-sm text-gray-600">{ground.description}</p>
                  )}
                  
                  {ground.price.ranges && ground.price.ranges.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-2">Pricing</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {ground.price.ranges.map((range, idx) => (
                          <div key={idx} className="text-sm">
                            <span className="text-gray-600">{range.start} - {range.end}:</span>
                            <span className="font-semibold ml-1">₹{range.perHour}/hr</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                    <button className="text-sm text-green-600 hover:underline">
                      View on Map
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {grounds.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No grounds found</h3>
            <p className="text-gray-600">Try adjusting your filters or search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Date Time Selection Step Component
interface DateTimeSelectionStepProps {
  ground: Ground;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  selectedTimeSlots: string[];
  onTimeSlotSelect: (slot: string) => void;
  availableSlots: TimeSlot[];
  isLoadingSlots: boolean;
  onNext: () => void;
  onBack: () => void;
}

const DateTimeSelectionStep: React.FC<DateTimeSelectionStepProps> = ({
  ground,
  selectedDate,
  onDateSelect,
  selectedTimeSlots,
  onTimeSlotSelect,
  availableSlots,
  isLoadingSlots,
  onNext,
  onBack
}) => {
  const [dateScrollPosition, setDateScrollPosition] = useState(0);
  const dateContainerRef = useRef<HTMLDivElement>(null);
  
  const bookingDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 14; i++) { // Show 2 weeks
      const date = addDays(new Date(), i);
      dates.push({
        date,
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : format(date, 'EEE'),
        dayLabel: format(date, 'd'),
        monthLabel: format(date, 'MMM'),
        fullLabel: format(date, 'EEE, MMM d')
      });
    }
    return dates;
  }, []);
  
  const scrollDates = (direction: 'left' | 'right') => {
    if (dateContainerRef.current) {
      const scrollAmount = 200;
      const newPosition = direction === 'left' 
        ? dateScrollPosition - scrollAmount 
        : dateScrollPosition + scrollAmount;
      
      dateContainerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setDateScrollPosition(newPosition);
    }
  };
  
  const getSlotAvailability = (slot: TimeSlot) => {
    if (!slot.isAvailable) return 'booked';
    // You could add logic here to determine 'limited' slots
    return 'available';
  };
  
  // Helper function to handle multi-slot selection
  const handleSlotClick = (clickedSlot: string) => {
    if (!availableSlots.find(s => s.slot === clickedSlot)?.isAvailable) return;
    
    const currentSlots = [...selectedTimeSlots];
    
    if (currentSlots.length === 0) {
      // First slot selection
      onTimeSlotSelect(clickedSlot);
    } else if (currentSlots.includes(clickedSlot)) {
      // Deselecting a slot - remove it and all slots after it
      const clickedIndex = currentSlots.indexOf(clickedSlot);
      const newSlots = currentSlots.slice(0, clickedIndex);
      onTimeSlotSelect(newSlots[newSlots.length - 1] || '');
    } else {
      // Adding a new slot - must be consecutive
      const allSlots = availableSlots.map(s => s.slot).sort((a, b) => {
        const hourA = parseInt(a.split(':')[0], 10);
        const hourB = parseInt(b.split(':')[0], 10);
        return hourA - hourB;
      });
      
      const lastSelected = currentSlots[currentSlots.length - 1];
      const lastIndex = allSlots.indexOf(lastSelected);
      const clickedIndex = allSlots.indexOf(clickedSlot);
      
      // Allow selection only if it's the next consecutive slot
      if (clickedIndex === lastIndex + 1) {
        onTimeSlotSelect(clickedSlot);
      }
    }
  };
  
  const getSlotStyle = (availability: string, isSelected: boolean, isInRange: boolean) => {
    if (availability === 'booked') {
      return 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed';
    }
    
    if (isSelected) {
      return 'bg-green-600 text-white border-green-600 shadow-lg transform scale-105';
    }
    
    if (isInRange) {
      return 'bg-green-100 text-green-700 border-green-400';
    }
    
    switch (availability) {
      case 'available':
        return 'bg-white border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 hover:shadow-md';
      case 'limited':
        return 'bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100';
      default:
        return 'bg-white border-gray-300 text-gray-700';
    }
  };
  
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Ground Info Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{ground.name}</h2>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {ground.location.address}
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {Array.isArray(ground?.price?.ranges) && ground.price.ranges.length > 0
                ? `₹${Math.min(...ground.price.ranges.map(r => r.perHour))}`
                : 'Custom'}
            </div>
            <div className="text-sm text-gray-500">per hour</div>
          </div>
        </div>
      </div>
      
      {/* BookMyShow-style Date Carousel */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Select Date
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => scrollDates('left')}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200"
              disabled={dateScrollPosition <= 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollDates('right')}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div 
          ref={dateContainerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {bookingDates.map((dateInfo, index) => {
            const isSelected = format(selectedDate, 'yyyy-MM-dd') === format(dateInfo.date, 'yyyy-MM-dd');
            const isToday = dateInfo.label === 'Today';
            
            return (
              <button
                key={index}
                onClick={() => onDateSelect(dateInfo.date)}
                className={`flex-shrink-0 w-20 h-24 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-200 transform hover:scale-105 ${
                  isSelected
                    ? 'bg-green-600 text-white border-green-600 shadow-lg scale-105'
                    : isToday
                      ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100 font-semibold'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-green-300'
                }`}
              >
                <div className={`text-xs font-bold mb-1 ${
                  isSelected ? 'text-white' : isToday ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {dateInfo.label}
                </div>
                <div className={`text-xl font-bold ${
                  isSelected ? 'text-white' : isToday ? 'text-green-700' : 'text-gray-900'
                }`}>
                  {dateInfo.dayLabel}
                </div>
                <div className={`text-xs ${
                  isSelected ? 'text-white/80' : isToday ? 'text-green-500' : 'text-gray-400'
                }`}>
                  {dateInfo.monthLabel}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Time Slots Section */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 min-h-0" style={{ scrollbarWidth: 'thin' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Select Time Slot
          </h3>
          
          {/* Availability Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-200 border border-green-400"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-200 border border-yellow-400"></div>
              <span>Limited</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gray-200 border border-gray-400"></div>
              <span>Booked</span>
            </div>
          </div>
        </div>
        
        {isLoadingSlots ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"></div>
            <span className="ml-4 text-gray-600 font-medium">Loading available slots...</span>
          </div>
        ) : availableSlots.filter(s => s.isAvailable).length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-600 mb-2">No Available Slots</h4>
            <p className="text-gray-500">Please select a different date</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Morning Slots */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                Morning (6 AM - 12 PM)
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {availableSlots
                  .filter(slot => {
                    const hour = parseInt(slot.slot.split(':')[0], 10);
                    return hour >= 6 && hour < 12;
                  })
                  .map(slot => {
                    const availability = getSlotAvailability(slot);
                    const isSelected = selectedTimeSlots.includes(slot.slot);
                    const isInRange = selectedTimeSlots.length > 1 && selectedTimeSlots.includes(slot.slot);
                    
                    return (
                      <button
                        key={slot.slot}
                        onClick={() => handleSlotClick(slot.slot)}
                        disabled={availability === 'booked'}
                        className={`px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all duration-200 hover:scale-105 ${
                          getSlotStyle(availability, isSelected, isInRange)
                        }`}
                      >
                        {slot.label.split(' - ')[0]}
                      </button>
                    );
                  })}
              </div>
            </div>
            
            {/* Afternoon Slots */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                Afternoon (12 PM - 6 PM)
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {availableSlots
                  .filter(slot => {
                    const hour = parseInt(slot.slot.split(':')[0], 10);
                    return hour >= 12 && hour < 18;
                  })
                  .map(slot => {
                    const availability = getSlotAvailability(slot);
                    const isSelected = selectedTimeSlots.includes(slot.slot);
                    const isInRange = selectedTimeSlots.length > 1 && selectedTimeSlots.includes(slot.slot);
                    
                    return (
                      <button
                        key={slot.slot}
                        onClick={() => handleSlotClick(slot.slot)}
                        disabled={availability === 'booked'}
                        className={`px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all duration-200 hover:scale-105 ${
                          getSlotStyle(availability, isSelected, isInRange)
                        }`}
                      >
                        {slot.label.split(' - ')[0]}
                      </button>
                    );
                  })}
              </div>
            </div>
            
            {/* Evening Slots */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                Evening (6 PM - 12 AM)
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {availableSlots
                  .filter(slot => {
                    const hour = parseInt(slot.slot.split(':')[0], 10);
                    return hour >= 18 && hour < 24;
                  })
                  .sort((a, b) => {
                    const hourA = parseInt(a.slot.split(':')[0], 10);
                    const hourB = parseInt(b.slot.split(':')[0], 10);
                    return hourA - hourB;
                  })
                  .map(slot => {
                    const availability = getSlotAvailability(slot);
                    const isSelected = selectedTimeSlots.includes(slot.slot);
                    const isInRange = selectedTimeSlots.length > 1 && selectedTimeSlots.includes(slot.slot);
                    
                    return (
                      <button
                        key={slot.slot}
                        onClick={() => handleSlotClick(slot.slot)}
                        disabled={availability === 'booked'}
                        className={`px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all duration-200 hover:scale-105 ${
                          getSlotStyle(availability, isSelected, isInRange)
                        }`}
                      >
                        {slot.label.split(' - ')[0]}
                      </button>
                    );
                  })}
              </div>
            </div>
            
            {/* Late Night Slots */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                Late Night (12 AM - 6 AM)
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {availableSlots
                  .filter(slot => {
                    const hour = parseInt(slot.slot.split(':')[0], 10);
                    return hour >= 0 && hour < 6;
                  })
                  .sort((a, b) => {
                    const hourA = parseInt(a.slot.split(':')[0], 10);
                    const hourB = parseInt(b.slot.split(':')[0], 10);
                    return hourA - hourB;
                  })
                  .map(slot => {
                    const availability = getSlotAvailability(slot);
                    const isSelected = selectedTimeSlots.includes(slot.slot);
                    const isInRange = selectedTimeSlots.length > 1 && selectedTimeSlots.includes(slot.slot);
                    
                    return (
                      <button
                        key={slot.slot}
                        onClick={() => handleSlotClick(slot.slot)}
                        disabled={availability === 'booked'}
                        className={`px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all duration-200 hover:scale-105 ${
                          getSlotStyle(availability, isSelected, isInRange)
                        }`}
                      >
                        {slot.label.split(' - ')[0]}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

// Booking Details Step Component
interface BookingDetailsStepProps {
  ground: Ground;
  selectedDate: Date;
  selectedTimeSlots: string[];
  playerCount: string;
  setPlayerCount: (count: string) => void;
  teamName: string;
  setTeamName: (name: string) => void;
  contactName: string;
  setContactName: (name: string) => void;
  contactPhone: string;
  setContactPhone: (phone: string) => void;
  contactEmail: string;
  setContactEmail: (email: string) => void;
  onBack: () => void;
  onBook: () => void;
  isCreatingBooking: boolean;
}

const BookingDetailsStep: React.FC<BookingDetailsStepProps> = ({
  ground,
  selectedDate,
  selectedTimeSlots,
  playerCount,
  setPlayerCount,
  teamName,
  setTeamName,
  contactName,
  setContactName,
  contactPhone,
  setContactPhone,
  contactEmail,
  setContactEmail,
  onBack,
  onBook,
  isCreatingBooking
}) => {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 p-4 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
          <p className="text-sm text-gray-600">
            {ground.name} • {format(selectedDate, 'EEE, MMM d')} • 
            {selectedTimeSlots.length > 1 
              ? `${selectedTimeSlots[0].split('-')[0]} - ${selectedTimeSlots[selectedTimeSlots.length - 1].split('-')[1]}` 
              : selectedTimeSlots[0]
            }
          </p>
        </div>
      </div>
      
      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0" style={{ scrollbarWidth: 'thin' }}>
        {/* Team Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            Team Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Players *
              </label>
              <Input
                type="number"
                min={1}
                max={ground.features.capacity}
                placeholder="Enter number of players"
                value={playerCount}
                onChange={(e) => setPlayerCount(e.target.value)}
                className="h-12 text-base"
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum {ground.features.capacity} players allowed
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Name (Optional)
              </label>
              <Input
                placeholder="Enter your team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="h-12 text-base"
              />
            </div>
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-600" />
            Contact Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <Input
                placeholder="Contact person name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <Input
                type="tel"
                placeholder="Contact phone number"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address (Optional)
              </label>
              <Input
                type="email"
                placeholder="Contact email address"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="h-12 text-base"
              />
            </div>
          </div>
        </div>
        
        {/* Extra padding to prevent content hiding behind sticky footer */}
        <div className="h-24"></div>
      </div>
    </div>
  );
};

// Custom Select Component
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, placeholder, disabled, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 text-left bg-white min-h-[56px] ${
          disabled 
            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
            : isOpen 
              ? 'border-green-500 shadow-lg ring-2 ring-green-500/20' 
              : 'border-gray-200 hover:border-green-300 hover:shadow-md'
        }`}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-green-600">{icon}</span>}
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                if (!option.disabled) {
                  onChange(option.value);
                  setIsOpen(false);
                }
              }}
              className={`w-full flex items-center justify-between p-4 text-left hover:bg-green-50 transition-colors duration-150 first:rounded-t-2xl last:rounded-b-2xl ${
                option.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-900'
              } ${
                value === option.value ? 'bg-green-50 text-green-700' : ''
              }`}
              disabled={option.disabled}
            >
              <span>{option.label}</span>
              {value === option.value && <Check className="w-5 h-5 text-green-600" />}
            </button>
          ))}
        </div>
      )}
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
const NewBookingModal: React.FC<NewBookingModalProps> = ({ 
  isOpen, 
  onClose, 
  grounds = [], 
  selectedGround: initialGround,
  onBookingCreated 
}) => {
  const { user } = useAuth();
  
  // 2-step booking flow: datetime -> details
  const [step, setStep] = useState<'datetime' | 'details'>('datetime');
  const [selectedGround, setSelectedGround] = useState<Ground | null>(initialGround || null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  
  // User details
  const [playerCount, setPlayerCount] = useState("");
  const [teamName, setTeamName] = useState("");
  const [contactName, setContactName] = useState(user?.name || "");
  const [contactPhone, setContactPhone] = useState(user?.phone || "");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  
  // UI State (simplified for 2-step flow)
  
  // Payment state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  // Update contact info when user changes
  useEffect(() => {
    if (user) {
      setContactName(user.name || "");
      setContactPhone(user.phone || "");
      setContactEmail(user.email || "");
    }
  }, [user]);


  const handlePaymentSuccess = (booking: any) => {
    toast.success("Payment successful! Your booking is confirmed.");
    onBookingCreated(booking);
    onClose();
    setIsPaymentModalOpen(false);
    setCreatedBooking(null);
  };

  const handlePaymentModalClose = async () => {
    setIsPaymentModalOpen(false);
    setCreatedBooking(null);
    
    // Refresh availability to show updated slots
    if (selectedGround && selectedDate) {
      await fetchAvailability();
    }
  };

  // Fetch availability for selected ground and date
  const fetchAvailability = async () => {
    if (!selectedGround || !selectedDate) return;
    setIsLoadingSlots(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      
      // Use the new bookings endpoint that excludes temporary holds
      const response = await bookingsApi.getGroundAvailability(selectedGround._id, dateStr);
      let bookedSlots: string[] = [];
      
      if (response && (response as any).success && (response as any).availability) {
        bookedSlots = (response as any).availability.bookedSlots || [];
      }
      
      const now = new Date();
      const isSelectedToday = format(selectedDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");
      
      setAvailableSlots(
        ALL_24H_SLOTS.map((slot) => {
          const slotHour = parseInt(slot.slot.split(":")[0], 10);
          
          // Fix logic for early morning slots (0-5 AM)
          // These should be considered "next day" slots when booking for today
          let isPast = false;
          if (isSelectedToday) {
            if (slotHour >= 6) {
              // Regular hours (6 AM - 11 PM): past if slot hour <= current hour
              isPast = slotHour <= now.getHours();
            } else {
              // Early morning hours (12 AM - 5 AM): these are "next day" slots, so never past
              isPast = false;
            }
          }
          
          const isBooked = bookedSlots.includes(slot.slot);
          return {
            ...slot,
            isAvailable: !isPast && !isBooked,
          };
        })
      );
    } catch (e) {
      console.warn("Failed to fetch availability, showing all slots as available:", e);
      setAvailableSlots(
        ALL_24H_SLOTS.map((slot) => ({ ...slot, isAvailable: true }))
      );
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Handle booking creation
  const handleBook = async () => {
    if (!selectedGround || !selectedDate || selectedTimeSlots.length === 0 || !playerCount || !contactName || !contactPhone) return;
    if (!user) {
      toast.error("Please login to create a booking");
      return;
    }
    
    // Prevent multiple rapid clicks
    if (isCreatingBooking) {
      console.log("Already creating booking, ignoring duplicate click");
      return;
    }
    
    try {
      const API = import.meta.env.VITE_API_URL || "https://box-junu.onrender.com/api";
      const healthResponse = await fetch(`${API}/health`);
      if (!healthResponse.ok) throw new Error('Server not responding');
    } catch {
      toast.error("Server is not running. Please start the server first.");
      return;
    }

    setIsCreatingBooking(true);
    
    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      
      // Create the booking with time range for multiple slots
      let timeRange;
      if (selectedTimeSlots.length > 1) {
        // For multiple consecutive slots, create a single time range
        // from the start of the first slot to the end of the last slot
        const firstSlotStart = selectedTimeSlots[0].split('-')[0]; // Get start time of first slot
        const lastSlotEnd = selectedTimeSlots[selectedTimeSlots.length - 1].split('-')[1]; // Get end time of last slot
        timeRange = `${firstSlotStart}-${lastSlotEnd}`;
      } else {
        timeRange = selectedTimeSlots[0];
      }
      
      const bookingData = {
        groundId: selectedGround._id,
        bookingDate: formattedDate,
        timeSlot: timeRange,
        playerDetails: {
          teamName: teamName || undefined,
          playerCount: parseInt(playerCount),
          contactPerson: {
            name: contactName,
            phone: contactPhone,
            email: contactEmail || undefined,
          },
        },
        requirements: undefined,
      };
      
      console.log("Creating booking:", bookingData);
      const bookingResponse = await bookingsApi.createBooking(bookingData);
      
      if (bookingResponse && (bookingResponse as any).success) {
        toast.success("Booking created! Please complete payment to confirm.");
        
        // Manually attach the ground object to the booking for PaymentModal
        const bookingWithGroundData = {
          ...(bookingResponse as any).booking,
          groundId: selectedGround,
          ground: selectedGround
        };
        
        console.log("Booking created successfully:", bookingWithGroundData);
        setCreatedBooking(bookingWithGroundData);
        setIsPaymentModalOpen(true);
      } else {
        throw new Error((bookingResponse as any)?.message || "Failed to create booking");
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      let errorMessage = "Failed to create booking. Please try again.";
      
      if (error.response?.status === 409) {
        // Conflict error - slot is taken
        errorMessage = error.response?.data?.message || "This slot is no longer available. Please select a different time.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      // Refresh availability to show updated slots
      await fetchAvailability();
    } finally {
      setIsCreatingBooking(false);
    }
  };


  // Handle multi-slot selection
  const handleTimeSlotSelect = (slot: string) => {
    const currentSlots = [...selectedTimeSlots];
    
    if (currentSlots.length === 0) {
      // First slot selection
      setSelectedTimeSlots([slot]);
    } else if (currentSlots.includes(slot)) {
      // Deselecting a slot - remove it and all slots after it
      const clickedIndex = currentSlots.indexOf(slot);
      const newSlots = currentSlots.slice(0, clickedIndex);
      setSelectedTimeSlots(newSlots);
    } else {
      // Adding a new slot - must be consecutive
      const allSlots = availableSlots.map(s => s.slot).sort((a, b) => {
        const hourA = parseInt(a.split(':')[0], 10);
        const hourB = parseInt(b.split(':')[0], 10);
        return hourA - hourB;
      });
      
      const lastSelected = currentSlots[currentSlots.length - 1];
      const lastIndex = allSlots.indexOf(lastSelected);
      const clickedIndex = allSlots.indexOf(slot);
      
      // Allow selection only if it's the next consecutive slot
      if (clickedIndex === lastIndex + 1) {
        setSelectedTimeSlots([...currentSlots, slot]);
      }
    }
  };

  // Fetch availability when ground or date changes
  useEffect(() => {
    if (selectedGround && selectedDate) {
      fetchAvailability();
    }
  }, [selectedGround, selectedDate]);


  const resetBookingState = () => {
    setSelectedDate(new Date());
    setSelectedTimeSlots([]);
    setPlayerCount('');
    setTeamName('');
    setStep('datetime');
  };

  // Reset when modal opens/closes
  useEffect(() => {
    if (isOpen && initialGround) {
      setSelectedGround(initialGround);
      resetBookingState();
    }
  }, [isOpen, initialGround]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[98vw] sm:w-full h-[95vh] max-h-[95vh] p-0 bg-white border-0 rounded-2xl overflow-hidden flex flex-col [&>button]:hidden">
        <DialogTitle className="sr-only">New Booking</DialogTitle>
        <DialogDescription className="sr-only">Select date, time, and details to create a booking</DialogDescription>
        {/* BookMyShow-style Header */}
        <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-emerald-400 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">
                  {step === 'datetime' ? 'Select Date & Time' : 'Confirm Booking'}
                </h1>
                <p className="text-green-100 text-sm">
                  {selectedGround ? selectedGround.name : 'Cricket ground booking'}
                </p>
              </div>
            </div>
            
            {/* Step Indicator */}
            <div className="hidden sm:flex items-center gap-2">
              {['datetime', 'details'].map((stepName, index) => (
                <div key={stepName} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step === stepName ? 'bg-white text-green-600' :
                    ['datetime', 'details'].indexOf(step) > index ? 'bg-green-400 text-white' :
                    'bg-white/20 text-white/60'
                  }`}>
                    {index + 1}
                  </div>
                  {index < 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      ['datetime', 'details'].indexOf(step) > index ? 'bg-white' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {step === 'datetime' && selectedGround && (
            <DateTimeSelectionStep 
              ground={selectedGround}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              selectedTimeSlots={selectedTimeSlots}
              onTimeSlotSelect={handleTimeSlotSelect}
              availableSlots={availableSlots}
              isLoadingSlots={isLoadingSlots}
              onNext={() => setStep('details')}
              onBack={() => onClose()}
            />
          )}
          
          {step === 'details' && selectedGround && (
            <BookingDetailsStep 
              ground={selectedGround}
              selectedDate={selectedDate}
              selectedTimeSlots={selectedTimeSlots}
              playerCount={playerCount}
              setPlayerCount={setPlayerCount}
              teamName={teamName}
              setTeamName={setTeamName}
              contactName={contactName}
              setContactName={setContactName}
              contactPhone={contactPhone}
              setContactPhone={setContactPhone}
              contactEmail={contactEmail}
              setContactEmail={setContactEmail}
              onBack={() => setStep('datetime')}
              onBook={handleBook}
              isCreatingBooking={isCreatingBooking}
            />
          )}
        </div>
        
        {/* BookMyShow-style Sticky Summary Footer */}
        {selectedGround && selectedDate && selectedTimeSlots.length > 0 && (
          <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 text-white p-4 shadow-2xl">
            <div className="flex items-center justify-between">
              {/* Booking Summary */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{selectedGround.name}</div>
                    <div className="text-xs text-green-100">{selectedGround.location.area || selectedGround.location.address}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{format(selectedDate, 'EEE, MMM d')}</div>
                    <div className="text-xs text-green-100">
                      {selectedTimeSlots.length > 1 
                        ? `${selectedTimeSlots[0].split('-')[0]} - ${selectedTimeSlots[selectedTimeSlots.length - 1].split('-')[1]}` 
                        : selectedTimeSlots[0]
                      }
                    </div>
                  </div>
                </div>
                
                {playerCount && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{playerCount} Players</div>
                      <div className="text-xs text-green-100">Team size</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                {Array.isArray(selectedGround?.price?.ranges) && selectedGround.price.ranges.length > 0 && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      ₹{Math.min(...selectedGround.price.ranges.map(r => r.perHour))}
                    </div>
                    <div className="text-xs text-green-100">per hour</div>
                  </div>
                )}
                
                {step === 'details' ? (
                  <Button
                    onClick={handleBook}
                    disabled={!playerCount || !contactName || !contactPhone || isCreatingBooking}
                    className="bg-white text-green-600 hover:bg-green-50 font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                  >
                    {isCreatingBooking ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      <span>Proceed to Payment</span>
                    )}
                  </Button>
                ) : step === 'datetime' && selectedTimeSlots.length > 0 ? (
                  <Button
                    onClick={() => setStep('details')}
                    className="bg-white text-green-600 hover:bg-green-50 font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <div className="flex items-center gap-2">
                      <span>Continue to Booking Details</span>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </Button>
                ) : (
                  <div className="text-right">
                    <div className="text-sm text-green-100 mb-1">
                      Select date & time to continue
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Payment Modal */}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={handlePaymentModalClose}
          booking={createdBooking}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};

export default NewBookingModal;
