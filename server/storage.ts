import { db } from "@db";
import { 
  foodListings,
  type InsertFoodListing,
  type FoodListing,
  type SearchParams
} from "@shared/schema";
import { eq, and, desc, ilike, or } from "drizzle-orm";

export const storage = {
  // Create a new food listing
  async createFoodListing(listing: InsertFoodListing): Promise<FoodListing> {
    const [newListing] = await db.insert(foodListings)
      .values(listing)
      .returning();
    
    return newListing;
  },

  // Get all food listings (with optional search filtering)
  async getFoodListings(params: SearchParams = {}): Promise<FoodListing[]> {
    let query = db.select().from(foodListings);
    
    // Apply search/filter if provided
    if (params.query) {
      query = query.where(
        or(
          ilike(foodListings.title, `%${params.query}%`),
          ilike(foodListings.description, `%${params.query}%`),
          ilike(foodListings.location, `%${params.query}%`)
        )
      );
    }
    
    // Apply category filter if provided and not "all"
    if (params.category && params.category !== 'all') {
      query = query.where(eq(foodListings.category, params.category));
    }
    
    // Order by most recent first
    query = query.orderBy(desc(foodListings.createdAt));
    
    return await query;
  },

  // Get a single food listing by ID
  async getFoodListingById(id: number): Promise<FoodListing | null> {
    const [listing] = await db.select()
      .from(foodListings)
      .where(eq(foodListings.id, id));
    
    return listing || null;
  }
};
