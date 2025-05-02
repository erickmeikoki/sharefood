import { useState, useEffect } from 'react';
import { FoodListing } from '@shared/schema';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FoodListing[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  
  // Load favorites from local storage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites);
        setFavorites(parsed);
        setFavoriteIds(parsed.map((fav: FoodListing) => fav.id));
      } catch (error) {
        console.error('Failed to parse favorites from localStorage:', error);
        // Reset if there's an error
        localStorage.removeItem('favorites');
      }
    }
  }, []);
  
  // Save favorites to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);
  
  // Add a listing to favorites
  const addFavorite = (listing: FoodListing) => {
    if (!favoriteIds.includes(listing.id)) {
      const newFavorites = [...favorites, listing];
      setFavorites(newFavorites);
      setFavoriteIds([...favoriteIds, listing.id]);
    }
  };
  
  // Remove a listing from favorites
  const removeFavorite = (listingId: number) => {
    const newFavorites = favorites.filter(fav => fav.id !== listingId);
    setFavorites(newFavorites);
    setFavoriteIds(favoriteIds.filter(id => id !== listingId));
  };
  
  // Check if a listing is in favorites
  const isFavorite = (listingId: number) => {
    return favoriteIds.includes(listingId);
  };
  
  // Toggle a listing in favorites
  const toggleFavorite = (listing: FoodListing) => {
    if (isFavorite(listing.id)) {
      removeFavorite(listing.id);
    } else {
      addFavorite(listing);
    }
  };
  
  return {
    favorites,
    favoriteIds,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite
  };
}