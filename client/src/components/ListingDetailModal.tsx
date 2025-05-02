import { useEffect, useState } from "react";
import { X, MapPin, Clock, Mail, Phone, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FoodListing, foodCategories } from "@shared/schema";

interface ListingDetailModalProps {
  listing: FoodListing | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ListingDetailModal({ listing, isOpen, onClose }: ListingDetailModalProps) {
  const [imageError, setImageError] = useState(false);

  // Reset image error state when listing changes
  useEffect(() => {
    setImageError(false);
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
        {listing.imageUrl && !imageError ? (
          <div className="relative w-full h-64 sm:h-72 md:h-80 overflow-hidden">
            <img 
              src={listing.imageUrl} 
              alt={listing.title} 
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white/70 hover:text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 left-4">
              <Badge className={`${getCategoryColor(listing.category)} text-white mb-2`}>
                {getCategoryName(listing.category)}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="relative h-36 bg-muted flex flex-col items-center justify-center">
            <div className="absolute top-4 right-4">
              <button 
                onClick={onClose} 
                className="rounded-full bg-card p-1.5 shadow-sm border border-border text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
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