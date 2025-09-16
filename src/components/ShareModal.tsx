import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Copy, 
  MessageCircle, 
  Twitter, 
  Facebook,
  Mail,
  CheckCircle2,
  Share
} from 'lucide-react';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  ground: {
    _id: string;
    name: string;
    location: { address: string };
    rating: { average: number; count: number };
    price?: { ranges?: Array<{ perHour: number }> };
    features?: { capacity?: number };
  };
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, ground }) => {
  const [copied, setCopied] = useState(false);
  
  // Generate share URL
  const generateShareUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/ground/${ground._id}`;
  };

  // Calculate average price
  const averagePrice = Array.isArray(ground.price?.ranges) && ground.price.ranges.length > 0
    ? Math.round(ground.price.ranges.reduce((sum, range) => sum + range.perHour, 0) / ground.price.ranges.length)
    : 0;

  // Generate share text
  const shareText = `🏏 Check out ${ground.name}!\n📍 ${ground.location.address}\n⭐ ${ground.rating.average}/5 (${ground.rating.count} reviews)${averagePrice > 0 ? `\n💰 From ₹${averagePrice}/hr` : ''}${ground.features?.capacity ? `\n👥 Up to ${ground.features.capacity} players` : ''}\n\nBook your cricket session now! 🎯`;

  // Handle copy link with animation
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generateShareUrl());
      setCopied(true);
      toast.success('Link copied to clipboard! 📋', {
        duration: 2000,
      });
      
      // Reset copied state after animation
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  // WhatsApp share
  const handleWhatsAppShare = () => {
    const shareUrl = generateShareUrl();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n🔗 ${shareUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Instagram share (using Web Share API or fallback)
  const handleInstagramShare = async () => {
    const shareUrl = generateShareUrl();
    const fullText = `${shareText}\n\n🔗 ${shareUrl}`;
    
    try {
      // Try Web Share API first (works on mobile)
      if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        await navigator.share({
          title: `${ground.name} - Cricket Ground`,
          text: fullText,
          url: shareUrl
        });
        return;
      }
      
      // Fallback: Copy to clipboard and guide user
      await navigator.clipboard.writeText(fullText);
      toast.success('📋 Content copied! Open Instagram and paste to share', {
        duration: 4000
      });
      
      // Try to open Instagram
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = 'instagram://camera';
        setTimeout(() => {
          window.open('https://www.instagram.com/', '_blank');
        }, 1000);
      } else {
        window.open('https://www.instagram.com/', '_blank');
      }
    } catch (error) {
      toast.error('Please copy the link manually and share on Instagram');
    }
  };

  // Twitter share
  const handleTwitterShare = () => {
    const shareUrl = generateShareUrl();
    const twitterText = `🏏 Discovered an amazing cricket ground!\n\n${ground.name}\n⭐ ${ground.rating.average}/5 rating\n📍 ${ground.location.address}${averagePrice > 0 ? `\n💰 From ₹${averagePrice}/hr` : ''}\n\n#Cricket #BoxCricket #SportBooking #PlayCricket`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  // Facebook share
  const handleFacebookShare = () => {
    const shareUrl = generateShareUrl();
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank');
  };

  // Email share
  const handleEmailShare = () => {
    const shareUrl = generateShareUrl();
    const subject = `Check out ${ground.name} - Cricket Ground`;
    const body = `${shareText}\n\nBook now: ${shareUrl}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  // Reset copied state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-white',
      onClick: handleWhatsAppShare,
      description: 'Share with friends'
    },
    {
      name: 'Instagram',
      icon: Share,
      color: 'bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500',
      textColor: 'text-white',
      onClick: handleInstagramShare,
      description: 'Share to stories'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white',
      onClick: handleFacebookShare,
      description: 'Post on timeline'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      textColor: 'text-white',
      onClick: handleTwitterShare,
      description: 'Tweet about it'
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      textColor: 'text-white',
      onClick: handleEmailShare,
      description: 'Send via email'
    },
    {
      name: 'Maps',
      icon: () => (
        <div className="text-white font-bold text-lg">🗺️</div>
      ),
      color: 'bg-orange-500 hover:bg-orange-600',
      textColor: 'text-white',
      onClick: () => {
        window.open(`https://maps.google.com/?q=${encodeURIComponent(ground.location.address)}`, '_blank');
      },
      description: 'Open in maps'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[85vh] p-0 bg-white border-0 rounded-3xl overflow-hidden shadow-2xl [&>button]:hidden">
        <DialogTitle className="sr-only">Share {ground.name}</DialogTitle>
        <DialogDescription className="sr-only">
          Share this cricket ground with your friends and teammates
        </DialogDescription>
        
        {/* Modal Container with proper scrolling */}
        <div className="flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 flex items-center justify-center group"
          >
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          </button>
          
          <div className="pr-12">
            <h2 className="text-3xl font-bold mb-4">Share this ground</h2>
            <p className="text-green-100 text-lg opacity-90 font-medium">
              {ground.name}
            </p>
            <p className="text-green-200 text-sm mt-2 opacity-75">
              📍 {ground.location.address}
            </p>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
        </div>

        {/* Copy Link Section */}
        <div className="p-8 pb-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 bg-gray-50 rounded-2xl px-6 py-4 border border-gray-200">
              <p className="text-sm text-gray-600 truncate font-mono">
                {generateShareUrl()}
              </p>
            </div>
            <Button
              onClick={handleCopyLink}
              className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 touch-manipulation whitespace-nowrap ${
                copied 
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-200'
              }`}
            >
              {copied ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Copied!</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Share Options */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
          <div className="px-6 py-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Share via social media</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
            {shareOptions.map((option, index) => (
              <button
                key={option.name}
                onClick={option.onClick}
                className="group flex flex-col items-center p-4 rounded-3xl border-2 border-gray-200 hover:border-transparent hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 active:scale-95 touch-manipulation min-h-[120px] bg-white"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: isOpen ? 'fadeInUp 0.4s ease-out forwards' : 'none'
                }}
              >
                <div className={`w-12 h-12 rounded-2xl ${option.color} ${option.textColor} flex items-center justify-center mb-3 shadow-xl group-hover:shadow-2xl transition-all duration-300`}>
                  {typeof option.icon === 'function' ? (
                    <option.icon />
                  ) : (
                    <option.icon className="w-6 h-6" />
                  )}
                </div>
                <span className="text-sm font-bold text-gray-900 mb-1">
                  {option.name}
                </span>
                <span className="text-xs text-gray-600 text-center leading-tight">
                  {option.description}
                </span>
              </button>
            ))}
            </div>
            
            {/* Footer */}
            <div className="px-6 pb-6">
              <div className="text-center">
                <p className="text-base text-gray-500 font-medium">
                  Share the love of cricket! 🏏✨
                </p>
              </div>
            </div>
          </div>
        </div>
        
        </div> {/* End of modal container */}
      </DialogContent>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Custom scrollbar for the share modal */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </Dialog>
  );
};

export default ShareModal;
