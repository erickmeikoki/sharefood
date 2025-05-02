import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import SearchFilters from "@/components/SearchFilters";
import FoodListingCard from "@/components/FoodListingCard";
import CreateListingForm from "@/components/CreateListingForm";
import { FoodListing } from "@shared/schema";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useState({
    query: "",
    category: ""
  });

  // Fetch food listings with search params
  const { data: listings, isLoading } = useQuery({
    queryKey: [
      "/api/listings", 
      searchParams.query, 
      searchParams.category
    ],
    queryFn: async () => {
      // Build URL with search params
      const url = new URL("/api/listings", window.location.origin);
      
      if (searchParams.query) {
        url.searchParams.append("query", searchParams.query);
      }
      
      if (searchParams.category) {
        url.searchParams.append("category", searchParams.category);
      }
      
      return fetch(url.toString()).then(res => res.json());
    }
  });

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header onCreateClick={handleOpenModal} />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Hero onCreateClick={handleOpenModal} />
        
        <SearchFilters 
          onSearch={(query) => setSearchParams(prev => ({ ...prev, query }))}
          onCategoryChange={(category) => setSearchParams(prev => ({ ...prev, category }))}
        />
        
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Available Food</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-lg shadow-md p-4 h-96 animate-pulse">
                  <div className="bg-muted h-48 rounded-md mb-4"></div>
                  <div className="bg-muted h-4 rounded w-3/4 mb-2"></div>
                  <div className="bg-muted h-4 rounded w-1/2 mb-4"></div>
                  <div className="bg-muted h-20 rounded mb-4"></div>
                </div>
              ))}
            </div>
          ) : listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing: FoodListing) => (
                <FoodListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">No food listings found</h3>
              <p className="text-muted-foreground mb-6">
                {searchParams.query || searchParams.category 
                  ? "Try adjusting your search filters" 
                  : "Be the first to share food with your community!"}
              </p>
              <button 
                onClick={handleOpenModal}
                className="bg-primary hover:bg-primary-dark text-primary-foreground font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Share Food
              </button>
            </div>
          )}
        </section>
      </main>
      
      <Footer />
      
      <CreateListingForm 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </div>
  );
}
