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
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with validation schema
  const form = useForm<z.infer<typeof foodListingFormSchema>>({
    resolver: zodResolver(foodListingFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: "",
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
      setUploadedImage(data.imageUrl);
      form.setValue("imageUrl", data.imageUrl);
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

  // Create food listing mutation
  const createListingMutation = useMutation({
    mutationFn: async (values: z.infer<typeof foodListingFormSchema>) => {
      const response = await apiRequest("POST", "/api/listings", values);
      return response.json();
    },
    onSuccess: () => {
      // Reset form and close modal
      form.reset();
      setUploadedImage(null);
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
    <div className="fixed inset-0 bg-neutral-darkest/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto mx-4" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-foreground">Share Your Food</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
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
                    <div className="mt-1">
                      {uploadedImage ? (
                        <div className="relative w-full h-48 bg-neutral-light rounded-md overflow-hidden">
                          <img 
                            src={uploadedImage} 
                            alt="Food preview" 
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute top-2 right-2 bg-card p-1 rounded-full shadow-sm border border-border"
                            onClick={() => {
                              setUploadedImage(null);
                              form.setValue("imageUrl", "");
                            }}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="border-2 border-dashed border-border bg-card rounded-md p-8 text-center cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {isUploading ? (
                            <div className="flex flex-col items-center justify-center">
                              <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
                              <p className="text-muted-foreground text-sm">Uploading image...</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center">
                              <Image className="h-10 w-10 text-muted-foreground mb-2" />
                              <p className="text-muted-foreground text-sm">
                                Click to upload an image of your food
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                JPG, PNG, WebP up to 5MB
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Display upload error if any */}
                    {uploadError && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription>{uploadError}</AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Manual URL Input Option */}
                    {!uploadedImage && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">
                          Or enter an image URL manually:
                        </p>
                        <Input 
                          placeholder="https://example.com/image.jpg" 
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            if (e.target.value) {
                              setUploadedImage(e.target.value);
                            }
                          }}
                        />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="border-t border-border pt-4">
                <h3 className="text-lg font-bold text-foreground mb-3">Contact Information</h3>
                
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="pt-2">
                <Button 
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark" 
                  disabled={createListingMutation.isPending}
                >
                  {createListingMutation.isPending ? "Creating..." : "Create Listing"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
