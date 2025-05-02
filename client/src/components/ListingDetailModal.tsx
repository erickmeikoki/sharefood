import { useEffect, useState } from "react";
import { X, MapPin, Clock, Mail, Phone, User, ChevronLeft, ChevronRight, Share2, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FoodListing, foodCategories } from "@shared/schema";
import { useFavorites } from "@/hooks/use-favorites";
import { canUseNativeShare, useNativeShare, shareListing } from "@/lib/share";

interface ListingDetailModalProps {
  listing: FoodListing | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ListingDetailModal({ listing, isOpen, onClose }: ListingDetailModalProps) {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showShareOptions, setShowShareOptions] = useState(false);

  // Get all available images
  const getImages = () => {
    if (!listing) return [];
    
    if (listing.imageUrls && listing.imageUrls.length > 0) {
      return listing.imageUrls;
    } else if (listing.imageUrl) {
      return [listing.imageUrl];
    }
    
    return [];
  };
  
  const images = getImages();
  const hasMultipleImages = images.length > 1;

  // Navigate to the next image
  const nextImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  // Navigate to the previous image
  const prevImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  // Handle share action
  const handleShare = async () => {
    if (!listing) return;
    
    // Try using native sharing if available
    const shared = await useNativeShare(listing);
    
    // If native sharing is not available or failed, show sharing options
    if (!shared) {
      setShowShareOptions(!showShareOptions);
    }
  };

  // Share via specific platform
  const shareVia = (platform: 'facebook' | 'twitter' | 'email' | 'whatsapp' | 'clipboard') => {
    if (listing) {
      shareListing(listing, platform);
      setShowShareOptions(false);
    }
  };

  // Reset image error state and current image index when listing changes
  useEffect(() => {
    setImageError(false);
    setCurrentImageIndex(0);
    setShowShareOptions(false);
  }, [listing]);

  // Don't render anything if the modal is closed or no listing
  if (!isOpen || !listing) return null;

  // Format date for display
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;
    
    if (diffInHours < 1) {
      return "Posted just now";
    } else if (diffInHours < 24) {
      return `Posted ${Math.floor(diffInHours)} hour${Math.floor(diffInHours) === 1 ? '' : 's'} ago`;
    } else if (diffInDays < 7) {
      return `Posted ${Math.floor(diffInDays)} day${Math.floor(diffInDays) === 1 ? '' : 's'} ago`;
    } else {
      return `Posted on ${date.toLocaleDateString()}`;
    }
  };
  
  // Get category display name
  const getCategoryName = (categoryId: string) => {
    const category = foodCategories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };
  
  // Get badge color based on category
  const getCategoryColor = (categoryId: string) => {
    switch (categoryId) {
      case "fresh":
        return "bg-primary-light";
      case "baked":
        return "bg-secondary";
      case "canned":
        return "bg-accent";
      case "prepared":
        return "bg-secondary-dark";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <Card 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Section */}
        {images.length > 0 && !imageError ? (
          <div className="relative w-full h-64 sm:h-72 md:h-80 overflow-hidden">
            {/* Image Carousel */}
            <img 
              src={images[currentImageIndex]} 
              alt={`${listing.title} - image ${currentImageIndex + 1}`} 
              className="w-full h-full object-cover transition-opacity duration-300"
              onError={() => setImageError(true)}
              loading="lazy"
            />
            
            {/* Overlay with gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            {/* Navigation arrows for multiple images */}
            {hasMultipleImages && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/70 hover:text-white hover:bg-black/70 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/70 hover:text-white hover:bg-black/70 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                
                {/* Image counter */}
                <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
            
            {/* Close button */}
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white/70 hover:text-white hover:bg-black/70 transition-colors z-10"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            
            {/* Action buttons */}
            <div className="absolute top-4 right-16 flex space-x-2">
              {/* Share button */}
              <button 
                onClick={(e) => { e.stopPropagation(); handleShare(); }}
                className="rounded-full bg-black/50 p-2 text-white/70 hover:text-white hover:bg-black/70 transition-colors"
                aria-label="Share"
              >
                <Share2 className="h-5 w-5" />
              </button>
              
              {/* Favorite button */}
              <button 
                onClick={(e) => { e.stopPropagation(); toggleFavorite(listing); }}
                className={`rounded-full ${isFavorite(listing.id) ? 'bg-primary text-white' : 'bg-black/50 text-white/70'} p-2 hover:text-white hover:bg-black/70 transition-colors`}
                aria-label={isFavorite(listing.id) ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={`h-5 w-5 ${isFavorite(listing.id) ? 'fill-current' : ''}`} />
              </button>
            </div>
            
            {/* Share options popup */}
            {showShareOptions && (
              <div className="absolute top-16 right-4 bg-card shadow-xl rounded-lg p-3 z-20 border border-border">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => shareVia('facebook')} className="flex items-center justify-center gap-2 p-2 rounded-md bg-muted hover:bg-muted-foreground/10 text-foreground">
                    <span>Facebook</span>
                  </button>
                  <button onClick={() => shareVia('twitter')} className="flex items-center justify-center gap-2 p-2 rounded-md bg-muted hover:bg-muted-foreground/10 text-foreground">
                    <span>Twitter</span>
                  </button>
                  <button onClick={() => shareVia('email')} className="flex items-center justify-center gap-2 p-2 rounded-md bg-muted hover:bg-muted-foreground/10 text-foreground">
                    <span>Email</span>
                  </button>
                  <button onClick={() => shareVia('whatsapp')} className="flex items-center justify-center gap-2 p-2 rounded-md bg-muted hover:bg-muted-foreground/10 text-foreground">
                    <span>WhatsApp</span>
                  </button>
                  <button onClick={() => shareVia('clipboard')} className="flex items-center justify-center gap-2 p-2 rounded-md bg-muted hover:bg-muted-foreground/10 text-foreground col-span-2">
                    <span>Copy Link</span>
                  </button>
                </div>
              </div>
            )}
            
            <div className="absolute bottom-4 left-4">
              <Badge className={`${getCategoryColor(listing.category)} text-white`}>
                {getCategoryName(listing.category)}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="relative h-48 bg-muted flex flex-col items-center justify-center">
            <div className="absolute top-4 right-4 flex space-x-2">
              <button 
                onClick={onClose} 
                className="rounded-full bg-card p-1.5 shadow-sm border border-border text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="absolute top-4 right-16 flex space-x-2">
              {/* Share button */}
              <button 
                onClick={(e) => { e.stopPropagation(); handleShare(); }}
                className="rounded-full bg-card p-1.5 shadow-sm border border-border text-muted-foreground hover:text-foreground"
                aria-label="Share"
              >
                <Share2 className="h-5 w-5" />
              </button>
              
              {/* Favorite button */}
              <button 
                onClick={(e) => { e.stopPropagation(); toggleFavorite(listing); }}
                className={`rounded-full p-1.5 shadow-sm border border-border ${isFavorite(listing.id) ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
                aria-label={isFavorite(listing.id) ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={`h-5 w-5 ${isFavorite(listing.id) ? 'fill-current' : ''}`} />
              </button>
            </div>
            
            {/* Share options popup */}
            {showShareOptions && (
              <div className="absolute top-16 right-4 bg-card shadow-xl rounded-lg p-3 z-20 border border-border">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => shareVia('facebook')} className="flex items-center justify-center gap-2 p-2 rounded-md bg-muted hover:bg-muted-foreground/10 text-foreground">
                    <span>Facebook</span>
                  </button>
                  <button onClick={() => shareVia('twitter')} className="flex items-center justify-center gap-2 p-2 rounded-md bg-muted hover:bg-muted-foreground/10 text-foreground">
                    <span>Twitter</span>
                  </button>
                  <button onClick={() => shareVia('email')} className="flex items-center justify-center gap-2 p-2 rounded-md bg-muted hover:bg-muted-foreground/10 text-foreground">
                    <span>Email</span>
                  </button>
                  <button onClick={() => shareVia('whatsapp')} className="flex items-center justify-center gap-2 p-2 rounded-md bg-muted hover:bg-muted-foreground/10 text-foreground">
                    <span>WhatsApp</span>
                  </button>
                  <button onClick={() => shareVia('clipboard')} className="flex items-center justify-center gap-2 p-2 rounded-md bg-muted hover:bg-muted-foreground/10 text-foreground col-span-2">
                    <span>Copy Link</span>
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex flex-col items-center">
              <Badge className={`${getCategoryColor(listing.category)} text-white mb-4`}>
                {getCategoryName(listing.category)}
              </Badge>
              <span className="text-muted-foreground">No image available</span>
            </div>
          </div>
        )}
        
        {/* Content Section */}
        <div className="p-6">
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-foreground mb-2">
            {listing.title}
          </h2>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Clock className="h-4 w-4" />
            <span>{formatDate(listing.createdAt)}</span>
            <span className="mx-1">•</span>
            <MapPin className="h-4 w-4" />
            <span>{listing.location}</span>
          </div>
          
          <div className="flex items-center mb-5">
            <User className="h-5 w-5 text-muted-foreground mr-2" />
            <span className="font-medium text-foreground">{listing.name}</span>
          </div>
          
          <Separator className="mb-5" />
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-line mb-6">
              {listing.description}
            </p>
          </div>
          
          <div className="bg-muted p-5 rounded-lg">
            <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-primary" />
                <a 
                  href={`mailto:${listing.email}`} 
                  className="text-primary hover:text-primary-dark hover:underline transition-colors"
                >
                  {listing.email}
                </a>
              </div>
              
              {listing.phone && (
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-primary" />
                  <a 
                    href={`tel:${listing.phone}`} 
                    className="text-primary hover:text-primary-dark hover:underline transition-colors"
                  >
                    {listing.phone}
                  </a>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <Button 
              onClick={onClose}
              variant="outline" 
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}