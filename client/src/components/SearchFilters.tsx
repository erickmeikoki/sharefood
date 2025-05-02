import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { foodCategories } from "@shared/schema";

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: string) => void;
}

export default function SearchFilters({ onSearch, onCategoryChange }: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);
  
  return (
    <section className="mb-8 bg-card p-4 rounded-lg shadow-sm">
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
        
        <div className="flex gap-2">
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
        </div>
      </div>
    </section>
  );
}
