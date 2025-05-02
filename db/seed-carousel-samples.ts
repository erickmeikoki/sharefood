import { db, pool } from "@db";
import { foodListings } from "@shared/schema";

// Sample food listings with multiple images for carousel testing
const carouselSampleListings = [
  {
    title: "Fresh Fruit Basket",
    description: "A variety of seasonal fruits including apples, oranges, bananas, and berries. Perfect for a healthy snack or dessert option.",
    category: "fresh",
    location: "Downtown Community Center",
    name: "Maria Garcia",
    email: "maria.garcia@example.com",
    phone: "555-123-4567",
    imageUrl: "https://images.unsplash.com/photo-1610397962076-02407a169a5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1610397962076-02407a169a5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1519996529931-28324d5a630e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    title: "Homemade Bread Collection",
    description: "Assortment of freshly baked breads including sourdough, whole wheat, and herb focaccia. Made yesterday in my home bakery.",
    category: "baked",
    location: "Sunset Neighborhood Pantry",
    name: "David Chen",
    email: "david.chen@example.com",
    phone: "555-987-6543",
    imageUrl: "https://images.unsplash.com/photo-1549931319-a545dcf3bc7c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1549931319-a545dcf3bc7c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    title: "Vegetable Garden Surplus",
    description: "Fresh vegetables from my garden including tomatoes, zucchini, bell peppers, and leafy greens. Organic and pesticide-free.",
    category: "fresh",
    location: "Greenfield Farmers Market",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "555-456-7890",
    imageUrl: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1607305387299-a3d9611cd469?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1518843875459-f738682238a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1574316071802-0d684ece9697?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    title: "Home-Cooked Meal Prep",
    description: "Prepared meals ready for pickup including chicken stir-fry, pasta primavera, and vegetable curry. Each meal serves 2-3 people.",
    category: "prepared",
    location: "Riverside Community Kitchen",
    name: "James Wilson",
    email: "james.wilson@example.com",
    phone: "555-789-0123",
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    title: "Canned Food Assortment",
    description: "Collection of canned goods including soups, vegetables, fruits, and beans. All items within expiration date and in excellent condition.",
    category: "canned",
    location: "Oakwood Food Bank",
    name: "Emma Rodriguez",
    email: "emma.rodriguez@example.com",
    phone: "555-234-5678",
    imageUrl: "https://images.unsplash.com/photo-1584263347416-85a696b87e93?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1584263347416-85a696b87e93?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1531928719516-2b98c42ec25d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1588012841069-68e3f7254e98?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    ]
  }
];

// Function to seed the database with sample listings
async function seedCarouselSamples() {
  try {
    console.log("🌱 Seeding carousel sample food listings...");
    
    // Insert all the sample listings
    await db.insert(foodListings).values(carouselSampleListings);
    
    console.log("✅ Successfully seeded carousel sample food listings!");
    
  } catch (error) {
    console.error("❌ Error seeding carousel sample food listings:", error);
  } finally {
    // We don't need to close the pool in a long-running application
    // Keeping connection open for subsequent requests
  }
}

// Run the seed function
seedCarouselSamples().catch(console.error);

export { seedCarouselSamples };