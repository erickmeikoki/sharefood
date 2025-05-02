import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { foodListingInsertSchema } from "@shared/schema";
import { z } from "zod";
import { UploadedFile } from "express-fileupload";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload image
  app.post("/api/upload", async (req, res) => {
    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ message: "No file was uploaded" });
      }

      const imageFile = req.files.image as UploadedFile;
      
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!validTypes.includes(imageFile.mimetype)) {
        return res.status(400).json({ 
          message: "Invalid file type. Only JPEG, PNG, and WebP images are allowed." 
        });
      }
      
      // Generate unique filename
      const fileExt = path.extname(imageFile.name);
      const fileName = `${uuidv4()}${fileExt}`;
      const uploadPath = path.join(__dirname, "..", "uploads", fileName);
      
      // Move file to uploads directory
      await imageFile.mv(uploadPath);
      
      // Return the image URL
      const imageUrl = `/uploads/${fileName}`;
      return res.status(201).json({ imageUrl });
    } catch (error) {
      console.error("Error uploading image:", error);
      return res.status(500).json({ message: "Failed to upload image" });
    }
  });

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

  // Get all food listings with optional search/filters and pagination
  app.get("/api/listings", async (req, res) => {
    try {
      const { query, category, page, limit } = req.query;
      
      // Parse pagination parameters
      const pageNumber = typeof page === "string" ? parseInt(page) : undefined;
      const limitNumber = typeof limit === "string" ? parseInt(limit) : undefined;
      
      const result = await storage.getFoodListings({
        query: typeof query === "string" ? query : undefined,
        category: typeof category === "string" ? category : undefined,
        page: pageNumber && !isNaN(pageNumber) ? pageNumber : 1,
        limit: limitNumber && !isNaN(limitNumber) ? limitNumber : 10
      });
      
      return res.status(200).json(result);
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
