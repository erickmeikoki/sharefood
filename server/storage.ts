import { db } from "@db";
import { 
  foodListings,
  type InsertFoodListing,
  type FoodListing,
  type SearchParams,
  type PaginatedResult
} from "@shared/schema";
import { eq, and, desc, asc, ilike, or, count, sql } from "drizzle-orm";

export const storage = {
  // Create a new food listing
  async createFoodListing(listing: InsertFoodListing): Promise<FoodListing> {
    const [newListing] = await db.insert(foodListings)
      .values(listing)
      .returning();
    
    return newListing;
  },

  // Get all food listings (with optional search filtering and pagination)
  async getFoodListings(params: SearchParams = {}): Promise<PaginatedResult<FoodListing>> {
    // Default pagination values
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;
    
    // Build query conditions
    let conditions = undefined;
    
    // Apply search/filter if provided
    if (params.query) {
      const searchCondition = or(
        ilike(foodListings.title, `%${params.query}%`),
        ilike(foodListings.description, `%${params.query}%`),
        ilike(foodListings.location, `%${params.query}%`)
      );
      conditions = searchCondition;
    }
    
    // Apply category filter if provided and not "all"
    if (params.category && params.category !== 'all') {
      const categoryCondition = eq(foodListings.category, params.category);
      conditions = conditions ? and(conditions, categoryCondition) : categoryCondition;
    }
    
    // Get total count with applied filters
    let countResult;
    if (conditions) {
      countResult = await db.select({ value: count() })
        .from(foodListings)
        .where(conditions);
    } else {
      countResult = await db.select({ value: count() }).from(foodListings);
    }
    
    const totalItems = countResult[0] ? countResult[0].value : 0;
    const totalPages = Math.ceil(totalItems / limit);
    
    // Build the query
    let orderByField, orderDirection;
    
    // Determine sort order
    if (params.sortBy === 'oldest') {
      orderByField = foodListings.createdAt;
      orderDirection = 'asc';
    } else if (params.sortBy === 'alphabetical') {
      orderByField = foodListings.title;
      orderDirection = 'asc';
    } else {
      // Default or 'newest'
      orderByField = foodListings.createdAt;
      orderDirection = 'desc';
    }
    
    // Execute query with all options
    let data;
    if (conditions) {
      if (orderDirection === 'asc') {
        data = await db.select()
          .from(foodListings)
          .where(conditions)
          .orderBy(asc(orderByField))
          .limit(limit)
          .offset(offset);
      } else {
        data = await db.select()
          .from(foodListings)
          .where(conditions)
          .orderBy(desc(orderByField))
          .limit(limit)
          .offset(offset);
      }
    } else {
      if (orderDirection === 'asc') {
        data = await db.select()
          .from(foodListings)
          .orderBy(asc(orderByField))
          .limit(limit)
          .offset(offset);
      } else {
        data = await db.select()
          .from(foodListings)
          .orderBy(desc(orderByField))
          .limit(limit)
          .offset(offset);
      }
    }
    
    // Return paginated result
    return {
      data,
      meta: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit
      }
    };
  },

  // Get a single food listing by ID
  async getFoodListingById(id: number): Promise<FoodListing | null> {
    const [listing] = await db.select()
      .from(foodListings)
      .where(eq(foodListings.id, id));
    
    return listing || null;
  }
};
