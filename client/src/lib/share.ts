import { FoodListing } from '@shared/schema';

type SharePlatform = 'facebook' | 'twitter' | 'email' | 'whatsapp' | 'clipboard';

// Function to generate URLs for various sharing platforms
export function getShareURL(listing: FoodListing, platform: SharePlatform): string {
  // Create the base URL for sharing (current location + listing ID)
  const shareURL = `${window.location.origin}?id=${listing.id}`;
  
  // Create the title and description for sharing
  const title = `Free Food: ${listing.title}`;
  const description = `${listing.description.substring(0, 100)}${listing.description.length > 100 ? '...' : ''}`;
  
  // Generate platform-specific URLs
  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareURL)}`;
    
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareURL)}`;
    
    case 'email':
      return `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\nCheck out this free food listing: ${shareURL}`)}`;
    
    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(`${title}: ${description}\n${shareURL}`)}`;
    
    case 'clipboard':
      return shareURL;
      
    default:
      return shareURL;
  }
}

// Function to handle share action
export function shareListing(listing: FoodListing, platform: SharePlatform): void {
  const url = getShareURL(listing, platform);
  
  if (platform === 'clipboard') {
    // Handle clipboard copy
    navigator.clipboard.writeText(url)
      .then(() => {
        // You might want to show a toast notification here
        console.log('URL copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy URL: ', err);
      });
  } else {
    // Open the share URL in a new window
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

// Function to check if Web Share API is available
export function canUseNativeShare(): boolean {
  return !!navigator.share;
}

// Function to use native share dialog if available
export async function useNativeShare(listing: FoodListing): Promise<boolean> {
  if (!canUseNativeShare()) {
    return false;
  }
  
  try {
    await navigator.share({
      title: `Free Food: ${listing.title}`,
      text: listing.description.substring(0, 100),
      url: `${window.location.origin}?id=${listing.id}`
    });
    return true;
  } catch (error) {
    console.error('Error sharing:', error);
    return false;
  }
}