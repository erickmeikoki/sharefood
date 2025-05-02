import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Food categories
export const foodCategories = [
  { id: "fresh", name: "Fresh Produce" },
  { id: "canned", name: "Canned Goods" },
  { id: "baked", name: "Baked Goods" },
  { id: "prepared", name: "Prepared Meals" },
  { id: "other", name: "Other" }
];

// Food listings table
export const foodListings = pgTable("food_listings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  location: text("location").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Insert schema for food listings
export const foodListingInsertSchema = createInsertSchema(foodListings, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters"),
  category: (schema) => schema.refine(
    (val) => foodCategories.some(cat => cat.id === val),
    "Please select a valid category"
  ),
  location: (schema) => schema.min(3, "Location must be at least 3 characters"),
  email: (schema) => schema.email("Please provide a valid email address"),
  phone: (schema) => schema.optional()
});

// Schema for frontend forms with validation
export const foodListingFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().refine(
    (val) => foodCategories.some(cat => cat.id === val),
    "Please select a valid category"
  ),
  location: z.string().min(3, "Location must be at least 3 characters"),
  email: z.string().email("Please provide a valid email address"),
  phone: z.string().optional(),
  imageUrl: z.string().optional()
});

// Types
export type FoodListing = typeof foodListings.$inferSelect;
export type InsertFoodListing = z.infer<typeof foodListingInsertSchema>;
export type FoodListingForm = z.infer<typeof foodListingFormSchema>;

// Search Params type
export type SearchParams = {
  query?: string;
  category?: string;
  page?: number;
  limit?: number;
};

// Pagination result type
export type PaginatedResult<T> = {
  data: T[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  }
};
