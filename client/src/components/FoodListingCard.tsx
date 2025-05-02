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
      {listing.imageUrl ? (
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={listing.imageUrl} 
            alt={listing.title} 
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-muted flex items-center justify-center">
          <span className="text-muted-foreground">No image available</span>
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-foreground">{listing.title}</h3>
          <Badge className={`${getCategoryColor(listing.category)} text-white`}>
            {getCategoryName(listing.category)}
          </Badge>
        </div>
        
        <p className="text-muted-foreground mb-4">{listing.description}</p>
        
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <MapPin className="h-5 w-5 mr-1 text-muted-foreground" />
          <span>{listing.location}</span>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Clock className="h-5 w-5 mr-1 text-muted-foreground" />
          <span>{formatDate(listing.createdAt)}</span>
        </div>
        
        <div className="border-t border-border pt-4">
          <h4 className="font-bold text-muted-foreground mb-2">Contact Info:</h4>
          
          <div className="flex items-center mb-2">
            <Mail className="h-5 w-5 mr-1 text-muted-foreground" />
            <a href={`mailto:${listing.email}`} className="text-primary hover:underline">
              {listing.email}
            </a>
          </div>
          
          {listing.phone && (
            <div className="flex items-center">
              <Phone className="h-5 w-5 mr-1 text-muted-foreground" />
              <a href={`tel:${listing.phone}`} className="text-primary hover:underline">
                {listing.phone}
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
