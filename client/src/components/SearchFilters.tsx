import { useState, useEffect } from "react";
import { Search, ArrowUpDown, SortAsc, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { foodCategories } from "@shared/schema";
import { useFavorites } from "@/hooks/use-favorites";

export type SortOption = 'newest' | 'oldest' | 'alphabetical' | 'default';

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onSortChange?: (sortOption: SortOption) => void;
  onFavoritesChange?: (showFavoritesOnly: boolean) => void;
}

export default function SearchFilters({ 
  onSearch, 
  onCategoryChange, 
  onSortChange,
  onFavoritesChange
}: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { favorites, favoriteIds } = useFavorites();
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);
  
  // Handle favorites filter toggle
  const handleFavoritesToggle = (checked: boolean) => {
    setShowFavoritesOnly(checked);
    if (onFavoritesChange) {
      onFavoritesChange(checked);
    }
  };
  
  // For debugging
  useEffect(() => {
    console.log("Favorites in SearchFilters:", favoriteIds);
  }, [favoriteIds]);
  
  return (
    <section className="mb-8 bg-card p-4 rounded-lg shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <Search className="h-5 w-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search for food..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Select onValueChange={onCategoryChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {foodCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Options */}
            {onSortChange && (
              <Select
                onValueChange={(value) => onSortChange(value as SortOption)}
                defaultValue="default"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">
                    <div className="flex items-center">
                      <span>Default</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="newest">
                    <div className="flex items-center">
                      <ArrowUpDown className="h-4 w-4 mr-2 rotate-180" />
                      <span>Newest First</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="oldest">
                    <div className="flex items-center">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      <span>Oldest First</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="alphabetical">
                    <div className="flex items-center">
                      <SortAsc className="h-4 w-4 mr-2" />
                      <span>A-Z</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        
        {/* Favorites filter toggle - always show this */}
        {onFavoritesChange && (
          <div className="flex items-center space-x-2 pt-2 border-t border-border">
            <Switch 
              id="favorites-only" 
              checked={showFavoritesOnly}
              onCheckedChange={handleFavoritesToggle}
            />
            <div className="flex items-center">
              <Heart className={`h-4 w-4 mr-2 ${showFavoritesOnly ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
              <Label htmlFor="favorites-only" className="cursor-pointer">
                Show favorites only {favoriteIds.length > 0 ? `(${favoriteIds.length})` : ''}
              </Label>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
