import { db } from "./index";
import { foodListings, foodListingInsertSchema } from "@shared/schema";

async function seed() {
  try {
    // Check if there are already food listings in the database
    const existingListings = await db.select({ count: { value: foodListings.id } })
      .from(foodListings);
    
    const count = existingListings[0]?.count?.value || 0;
    
    // Only seed if there are no listings yet
    if (count === 0) {
      console.log("Seeding food listings...");
      
      const mockListings = [
        {
          title: "Fresh Garden Vegetables",
          description: "Extra vegetables from my garden harvest including tomatoes, cucumbers, and zucchini.",
          category: "fresh",
          location: "Mission District, San Francisco",
          name: "Maria Garcia",
          email: "maria@example.com",
          phone: "(555) 123-4567",
          imageUrl: "https://images.unsplash.com/photo-1576021182211-9ea8dced3690?ixlib=rb-1.2.1&auto=format&fit=crop&w=640&h=360&q=80"
        },
        {
          title: "Homemade Sourdough Bread",
          description: "Freshly baked sourdough bread. Made too much for my family. 3 loaves available.",
          category: "baked",
          location: "Noe Valley, San Francisco",
          name: "James Johnson",
          email: "james@example.com",
          phone: "(555) 987-6543",
          imageUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=640&h=360&q=80"
        },
        {
          title: "Canned Goods Assortment",
          description: "Moving soon and clearing out my pantry. Various canned vegetables, beans, and soups available.",
          category: "canned",
          location: "Richmond District, San Francisco",
          name: "Alex Chen",
          email: "alex@example.com",
          phone: "(555) 456-7890",
          imageUrl: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=640&h=360&q=80"
        }
      ];
      
      // Validate and insert seed data
      for (const listing of mockListings) {
        const validatedListing = foodListingInsertSchema.parse(listing);
        await db.insert(foodListings).values(validatedListing);
      }
      
      console.log("Seed data inserted successfully!");
    } else {
      console.log(`Skipping seed: ${count} food listings already exist`);
    }
  } catch (error) {
    console.error("Error seeding food listings:", error);
  }
}

seed();
