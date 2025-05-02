import { useState, useRef } from "react";
import { X, Upload, Image, Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { foodListingFormSchema, foodCategories } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreateListingFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateListingForm({ isOpen, onClose }: CreateListingFormProps) {
  const { toast } = useToast();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Hidden form field for image URLs array
  const [imageUrlsField, setImageUrlsField] = useState<string[]>([]);

  // Initialize form with validation schema
  const form = useForm<z.infer<typeof foodListingFormSchema>>({
    resolver: zodResolver(foodListingFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: "",
      name: "",
      email: "",
      phone: "",
      imageUrl: ""
    }
  });

  // Image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload image");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Add the new image URL to the array of uploaded images
      const newImages = [...uploadedImages, data.imageUrl];
      setUploadedImages(newImages);
      
      // Set the first image as the main imageUrl for backward compatibility
      if (newImages.length === 1) {
        form.setValue("imageUrl", data.imageUrl);
      }
      
      // Set the full array of images
      form.setValue("imageUrls", newImages);
      
      setIsUploading(false);
      setUploadError(null);
    },
    onError: (error: Error) => {
      console.error("Image upload error:", error);
      setUploadError(error.message || "Failed to upload image");
      setIsUploading(false);
    }
  });

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Limit to maximum 5 images
    if (uploadedImages.length >= 5) {
      setUploadError("Maximum 5 images allowed per listing");
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5MB");
      return;
    }
    
    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Only JPEG, PNG, and WebP images are allowed");
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    uploadImageMutation.mutate(file);
  };
  
  // Remove an image
  const removeImage = (index: number) => {
    const newImages = [...uploadedImages];
    newImages.splice(index, 1);
    setUploadedImages(newImages);
    
    if (newImages.length === 0) {
      // If no images left, clear imageUrl
      form.setValue("imageUrl", "");
      form.setValue("imageUrls", []);
    } else {
      // Otherwise update the main imageUrl to be the first remaining image
      form.setValue("imageUrl", newImages[0]);
      form.setValue("imageUrls", newImages);
    }
  };

  // Create food listing mutation
  const createListingMutation = useMutation({
    mutationFn: async (values: z.infer<typeof foodListingFormSchema>) => {
      const response = await apiRequest("POST", "/api/listings", values);
      return response.json();
    },
    onSuccess: () => {
      // Reset form and close modal
      form.reset();
      setUploadedImages([]);
      onClose();
      
      // Show success message
      toast({
        title: "Success!",
        description: "Your food listing has been created.",
        variant: "default",
      });
      
      // Invalidate listings query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
    },
    onError: (error) => {
      console.error("Error creating listing:", error);
      
      // Show error message
      toast({
        title: "Error",
        description: "Failed to create your food listing. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const onSubmit = (values: z.infer<typeof foodListingFormSchema>) => {
    createListingMutation.mutate(values);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto mx-4" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-display font-semibold text-foreground">Share Your Food</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted p-1">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Food Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="What food are you sharing?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category*</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {foodCategories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the food you're sharing. Include quantity, when it was made/purchased, etc."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup Location*</FormLabel>
                    <FormControl>
                      <Input placeholder="Neighborhood, City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Food Image</FormLabel>
                    
                    {/* Hidden input field for image URL */}
                    <input type="hidden" {...field} />
                    
                    {/* Hidden file input */}
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept="image/jpeg,image/png,image/webp" 
                      onChange={handleFileChange}
                    />
                    
                    {/* Image Preview or Upload Area */}
                    <div className="mt-2">
                      {/* Display image previews if available */}
                      {uploadedImages.length > 0 ? (
                        <div className="space-y-3">
                          {/* Image previews */}
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            {uploadedImages.map((imageUrl, index) => (
                              <div key={index} className="relative bg-muted rounded-lg overflow-hidden shadow-sm border border-border/40 aspect-square">
                                <img 
                                  src={imageUrl} 
                                  alt={`Food preview ${index + 1}`} 
                                  className="w-full h-full object-cover"
                                  onError={() => {
                                    setUploadError(`Image ${index + 1} failed to load.`);
                                    removeImage(index);
                                  }}
                                />
                                <button
                                  type="button"
                                  className="absolute top-2 right-2 bg-card p-1.5 rounded-full shadow-md border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                  onClick={() => removeImage(index)}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                            
                            {/* Add more images button (if less than 5) */}
                            {uploadedImages.length < 5 && (
                              <div 
                                className="border-2 border-dashed border-border hover:border-primary/50 bg-card hover:bg-muted/50 rounded-lg p-4 text-center cursor-pointer transition-colors duration-200 aspect-square flex flex-col items-center justify-center"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <div className="bg-primary/10 p-2 rounded-full mb-2">
                                  <Image className="h-6 w-6 text-primary" />
                                </div>
                                <p className="text-sm font-medium">Add more photos</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {5 - uploadedImages.length} remaining
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="border-2 border-dashed border-border hover:border-primary/50 bg-card hover:bg-muted/50 rounded-lg p-8 text-center cursor-pointer transition-colors duration-200"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {isUploading ? (
                            <div className="flex flex-col items-center justify-center py-4">
                              <Loader2 className="h-12 w-12 text-primary animate-spin mb-3" />
                              <p className="text-foreground font-medium">Processing image...</p>
                              <p className="text-muted-foreground text-sm mt-1">This may take a moment</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-4">
                              <div className="bg-primary/10 p-3 rounded-full mb-3">
                                <Image className="h-10 w-10 text-primary" />
                              </div>
                              <p className="text-foreground font-medium">
                                Add photos of your food
                              </p>
                              <p className="text-muted-foreground text-sm mt-2 max-w-xs">
                                Photos help others see what you're sharing and increases the chance of your food being claimed
                              </p>
                              <p className="text-xs text-muted-foreground mt-3 bg-muted px-2 py-1 rounded-md">
                                JPG, PNG, WebP up to 5MB (max 5 images)
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Display upload error if any */}
                    {uploadError && (
                      <Alert variant="destructive" className="mt-3">
                        <AlertDescription className="flex items-center text-sm py-1">{uploadError}</AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Manual URL Input Option */}
                    {uploadedImages.length === 0 && !isUploading && (
                      <div className="mt-3">
                        <div className="flex items-center">
                          <div className="h-px flex-1 bg-border"></div>
                          <p className="text-xs text-muted-foreground mx-2 font-medium">OR</p>
                          <div className="h-px flex-1 bg-border"></div>
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-sm text-foreground font-medium mb-2">
                            Enter an image URL:
                          </p>
                          <div className="relative">
                            <Input 
                              placeholder="https://example.com/food-image.jpg" 
                              value={field.value}
                              onChange={(e) => {
                                const url = e.target.value.trim();
                                field.onChange(url);
                                setUploadError(null);
                                
                                if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                                  // Add the URL to the array of images
                                  const newImages = [...uploadedImages, url];
                                  setUploadedImages(newImages);
                                  form.setValue("imageUrls", newImages);
                                } else if (url) {
                                  setUploadError("Please enter a valid image URL starting with http:// or https://");
                                }
                              }}
                              className="pr-10"
                            />
                            {field.value && (
                              <button 
                                type="button"
                                onClick={() => {
                                  field.onChange("");
                                  setUploadError(null);
                                }}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1.5">
                            Links should be direct URLs to images (.jpg, .png, .webp)
                          </p>
                        </div>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="border-t border-border pt-5 mt-2">
                <h3 className="text-lg font-display font-semibold text-foreground mb-4">Contact Information</h3>
                
                <div className="bg-muted/50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-muted-foreground">
                    Your contact information will be visible to anyone viewing your listing.
                    This allows interested people to reach out about the food you're sharing.
                  </p>
                </div>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Full Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email*</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="youremail@example.com" 
                          {...field} 
                          className="focus-visible:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
                          placeholder="(555) 123-4567" 
                          {...field} 
                          className="focus-visible:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="pt-4 mt-2">
                <Button 
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark text-white font-medium text-base py-6 shadow-lg hover:shadow-xl transition-all" 
                  disabled={createListingMutation.isPending}
                >
                  {createListingMutation.isPending ? (
                    <span className="flex items-center">
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Creating Listing...
                    </span>
                  ) : (
                    "Share Your Food"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
