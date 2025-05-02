import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { foodListingInsertSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new food listing
  app.post("/api/listings", async (req, res) => {
    try {
      // Validate request body
      const validatedData = foodListingInsertSchema.parse(req.body);
      
      // Create the listing
      const newListing = await storage.createFoodListing(validatedData);
      
      return res.status(201).json(newListing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      console.error("Error creating food listing:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all food listings with optional search/filters
  app.get("/api/listings", async (req, res) => {
    try {
      const { query, category } = req.query;
      
      const listings = await storage.getFoodListings({
        query: typeof query === "string" ? query : undefined,
        category: typeof category === "string" ? category : undefined
      });
      
      return res.status(200).json(listings);
    } catch (error) {
      console.error("Error getting food listings:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get a single food listing by ID
  app.get("/api/listings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const listing = await storage.getFoodListingById(id);
      
      if (!listing) {
        return res.status(404).json({ message: "Food listing not found" });
      }
      
      return res.status(200).json(listing);
    } catch (error) {
      console.error("Error getting food listing:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
