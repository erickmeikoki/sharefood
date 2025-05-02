import { MapPin, Clock, Mail, Phone, ImageOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FoodListing, foodCategories } from "@shared/schema";
import { useState } from "react";

interface FoodListingCardProps {
  listing: FoodListing;
}

export default function FoodListingCard({ listing }: FoodListingCardProps) {
  const [imageError, setImageError] = useState(false);
  // Format creation date
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
        return "bg-status-info";
      case "prepared":
        return "bg-secondary-dark";
      default:
        return "bg-muted";
    }
  };
  
  return (
    <Card className="overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
      {listing.imageUrl && !imageError ? (
        <div className="w-full h-48 overflow-hidden relative bg-muted">
          <img 
            src={listing.imageUrl} 
            alt={listing.title} 
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      ) : (
        <div className="w-full h-48 bg-muted flex flex-col items-center justify-center">
          <ImageOff className="h-10 w-10 text-muted-foreground/50 mb-2" />
          <span className="text-muted-foreground font-medium">No image available</span>
        </div>
      )}
      
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-display font-semibold text-foreground leading-tight">{listing.title}</h3>
          <Badge className={`${getCategoryColor(listing.category)} text-white ml-2 shrink-0`}>
            {getCategoryName(listing.category)}
          </Badge>
        </div>
        
        <p className="text-muted-foreground mb-5 line-clamp-3">{listing.description}</p>
        
        <div className="flex items-center text-sm text-muted-foreground mb-3 group">
          <MapPin className="h-4 w-4 mr-2 text-primary/70 group-hover:text-primary transition-colors" />
          <span className="group-hover:text-foreground transition-colors">{listing.location}</span>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground mb-5 group">
          <Clock className="h-4 w-4 mr-2 text-primary/70 group-hover:text-primary transition-colors" />
          <span className="group-hover:text-foreground transition-colors">{formatDate(listing.createdAt)}</span>
        </div>
        
        <div className="border-t border-border pt-4">
          <h4 className="font-display font-semibold text-foreground mb-3">Contact Info:</h4>
          
          <div className="flex items-center mb-3 group">
            <Mail className="h-4 w-4 mr-2 text-primary/70 group-hover:text-primary transition-colors" />
            <a href={`mailto:${listing.email}`} className="text-primary hover:text-primary-dark hover:underline transition-colors">
              {listing.email}
            </a>
          </div>
          
          {listing.phone && (
            <div className="flex items-center group">
              <Phone className="h-4 w-4 mr-2 text-primary/70 group-hover:text-primary transition-colors" />
              <a href={`tel:${listing.phone}`} className="text-primary hover:text-primary-dark hover:underline transition-colors">
                {listing.phone}
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
