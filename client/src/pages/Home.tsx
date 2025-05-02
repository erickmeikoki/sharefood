import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import SearchFilters from "@/components/SearchFilters";
import FoodListingCard from "@/components/FoodListingCard";
import CreateListingForm from "@/components/CreateListingForm";
import ListingDetailModal from "@/components/ListingDetailModal";
import { FoodListing, PaginatedResult } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useState({
    query: "",
    category: "",
    page: 1,
    limit: 9 // Show 9 items per page (3x3 grid)
  });

  // Fetch food listings with search params
  const { data: paginatedResult, isLoading } = useQuery<PaginatedResult<FoodListing>>({
    queryKey: [
      "/api/listings", 
      searchParams.query, 
      searchParams.category,
      searchParams.page,
      searchParams.limit
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
      
      url.searchParams.append("page", searchParams.page.toString());
      url.searchParams.append("limit", searchParams.limit.toString());
      
      return fetch(url.toString()).then(res => res.json());
    }
  });
  
  // Extract listings and pagination meta data
  const listings = paginatedResult?.data || [];
  const pagination = paginatedResult?.meta || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: searchParams.limit
  };
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setCurrentPage(newPage);
    setSearchParams(prev => ({ ...prev, page: newPage }));
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  
  // Handle opening detail modal
  const handleOpenDetailModal = (listing: FoodListing) => {
    setSelectedListing(listing);
    setIsDetailModalOpen(true);
  };
  
  // Handle closing detail modal
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    // Clear the selected listing after animation completes
    setTimeout(() => setSelectedListing(null), 300);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header onCreateClick={handleOpenModal} />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Hero onCreateClick={handleOpenModal} />
        
        <SearchFilters 
          onSearch={(query) => {
            setSearchParams(prev => ({ ...prev, query, page: 1 })); // Reset to page 1 when search changes
            setCurrentPage(1);
          }}
          onCategoryChange={(category) => {
            setSearchParams(prev => ({ ...prev, category, page: 1 })); // Reset to page 1 when category changes
            setCurrentPage(1);
          }}
        />
        
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Available Food</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="bg-card rounded-lg shadow-md p-4 h-96 animate-pulse">
                  <div className="bg-muted h-48 rounded-md mb-4"></div>
                  <div className="bg-muted h-4 rounded w-3/4 mb-2"></div>
                  <div className="bg-muted h-4 rounded w-1/2 mb-4"></div>
                  <div className="bg-muted h-20 rounded mb-4"></div>
                </div>
              ))}
            </div>
          ) : listings && listings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing: FoodListing) => (
                  <FoodListingCard key={listing.id} listing={listing} />
                ))}
              </div>
              
              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    disabled={pagination.currentPage <= 1}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {/* Generate page buttons with intelligent display for many pages */}
                    {Array.from({ length: pagination.totalPages }).map((_, i) => {
                      const pageNum = i + 1;
                      
                      // Always show current page, first page, last page
                      // and one page before and after current page
                      const showPageNum = 
                        pageNum === 1 || 
                        pageNum === pagination.totalPages ||
                        Math.abs(pageNum - pagination.currentPage) <= 1;
                        
                      // Show ellipsis for page breaks
                      const showEllipsisBefore = pageNum === pagination.currentPage - 2 && pagination.currentPage > 3;
                      const showEllipsisAfter = pageNum === pagination.currentPage + 2 && pagination.currentPage < pagination.totalPages - 2;
                      
                      if (showEllipsisBefore) {
                        return <div key={`ellipsis-${pageNum}`} className="px-2">...</div>;
                      } else if (showEllipsisAfter) {
                        return <div key={`ellipsis-${pageNum}`} className="px-2">...</div>;
                      } else if (showPageNum) {
                        return (
                          <Button
                            key={pageNum}
                            variant={pagination.currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                      
                      return null;
                    })}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="icon"
                    disabled={pagination.currentPage >= pagination.totalPages}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <div className="text-center mt-4 text-sm text-muted-foreground">
                Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to {
                  Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)
                } of {pagination.totalItems} food listings
              </div>
            </>
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
