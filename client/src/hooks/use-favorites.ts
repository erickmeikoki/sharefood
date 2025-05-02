import { useState, useEffect } from 'react';
import { FoodListing } from '@shared/schema';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FoodListing[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  
  // Load favorites from local storage on mount
  useEffect(() => {
    const loadFavoritesFromStorage = () => {
      console.log('Loading favorites from localStorage');
      const savedFavorites = localStorage.getItem('favorites');
      if (savedFavorites) {
        try {
          const parsed = JSON.parse(savedFavorites);
          setFavorites(parsed);
          const ids = parsed.map((fav: FoodListing) => fav.id);
          setFavoriteIds(ids);
          console.log('Loaded favorites:', ids);
        } catch (error) {
          console.error('Failed to parse favorites from localStorage:', error);
          // Reset if there's an error
          localStorage.removeItem('favorites');
        }
      } else {
        console.log('No favorites found in localStorage');
      }
    };
    
    loadFavoritesFromStorage();
  }, []);
  
  // Save favorites to local storage whenever they change
  useEffect(() => {
    console.log('Saving favorites to localStorage:', favoriteIds);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites, favoriteIds]);
  
  // Add a listing to favorites
  const addFavorite = (listing: FoodListing) => {
    console.log('Adding to favorites:', listing.id);
    if (!favoriteIds.includes(listing.id)) {
      const newFavorites = [...favorites, listing];
      setFavorites(newFavorites);
      setFavoriteIds(prev => [...prev, listing.id]);
      console.log('Added to favorites, new IDs:', [...favoriteIds, listing.id]);
    } else {
      console.log('Already in favorites');
    }
  };
  
  // Remove a listing from favorites
  const removeFavorite = (listingId: number) => {
    console.log('Removing from favorites:', listingId);
    const newFavorites = favorites.filter(fav => fav.id !== listingId);
    setFavorites(newFavorites);
    setFavoriteIds(prev => prev.filter(id => id !== listingId));
    console.log('Removed from favorites, remaining:', favoriteIds.filter(id => id !== listingId));
  };
  
  // Check if a listing is in favorites
  const isFavorite = (listingId: number) => {
    const result = favoriteIds.includes(listingId);
    // console.log('Checking if', listingId, 'is favorite:', result, 'Current favorites:', favoriteIds);
    return result;
  };
  
  // Toggle a listing in favorites
  const toggleFavorite = (listing: FoodListing) => {
    console.log('Toggling favorite for:', listing.id);
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