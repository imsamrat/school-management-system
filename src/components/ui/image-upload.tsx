"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, X, User, Camera, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  label?: string;
  currentImage?: string;
  onImageChange: (imageUrl: string | null) => void;
  className?: string;
  disabled?: boolean;
  maxSizeKB?: number;
  acceptedTypes?: string[];
}

export default function ImageUpload({
  label = "Profile Image",
  currentImage,
  onImageChange,
  className,
  disabled = false,
  maxSizeKB = 2048, // 2MB default
  acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Please upload: ${acceptedTypes.join(", ")}`;
    }

    // Check file size
    const sizeInKB = file.size / 1024;
    if (sizeInKB > maxSizeKB) {
      return `File size too large. Maximum ${maxSizeKB}KB allowed.`;
    }

    return null;
  };

  const handleFileSelect = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
      };
      reader.readAsDataURL(file);

      // In a real app, you would upload to a service like:
      // - AWS S3, Cloudinary, or similar
      // - Your own server endpoint
      // For now, we'll simulate and use base64 for demo

      const formData = new FormData();
      formData.append("image", file);

      // Upload to server
      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await response.json();
      onImageChange(result.url);
    } catch (err) {
      setError("Failed to upload image. Please try again.");
      console.error("Image upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setError(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs font-medium text-center block">{label}</Label>

      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          isDragOver && "ring-2 ring-blue-500 ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <CardContent className="p-0">
          {preview ? (
            // Image Preview
            <div className="relative group">
              <div className="aspect-square w-full max-w-[150px] mx-auto overflow-hidden bg-gray-100 rounded-lg">
                <img
                  src={preview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              </div>

              {!disabled && (
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleClick}
                    disabled={isUploading}
                    className="bg-white/90 hover:bg-white text-black"
                  >
                    <Camera className="w-4 h-4 mr-1" />
                    Change
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={handleRemoveImage}
                    disabled={isUploading}
                    className="bg-red-500/90 hover:bg-red-500"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              )}

              {isUploading && (
                <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              )}
            </div>
          ) : (
            // Upload Area
            <div
              className={cn(
                "aspect-square w-full max-w-[150px] mx-auto border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-4 cursor-pointer hover:border-gray-400 transition-colors",
                isDragOver && "border-blue-500 bg-blue-50",
                disabled && "cursor-not-allowed"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleClick}
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                  <span className="text-xs text-gray-600">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                  <Upload className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-xs font-medium text-gray-700 mb-1">
                    Click to upload
                  </span>
                  <span className="text-xs text-gray-500">
                    Max {maxSizeKB}KB
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
