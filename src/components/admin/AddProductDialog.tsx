"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface ProductVariant {
  id: string;
  width?: string;
  height?: string;
  diameter?: string;
  weight: string;
  purities: string[]; // Can be ["80"], ["92.5"], or ["80", "92.5"]
}

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductAdded: (product: any) => void;
  onProductUpdated?: (product: any) => void;
  categories: string[];
  editProduct?: any;
}

const AddProductDialog = ({
  open,
  onOpenChange,
  onProductAdded,
  onProductUpdated,
  categories,
  editProduct,
}: AddProductDialogProps) => {
  const isEditMode = !!editProduct;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [weightRange, setWeightRange] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([
    {
      id: "1",
      width: "",
      height: "",
      diameter: "",
      weight: "",
      purities: ["80"], // Default to 80% only
    },
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing or reset when adding new
  useEffect(() => {
    if (editProduct && open) {
      setName(editProduct.name || "");
      setDescription(editProduct.description || "");
      setCategory(editProduct.category || "");
      setWeightRange(editProduct.weightRange || "");
      setImages(editProduct.images || [editProduct.image]);
      setVariants(
        editProduct.variants || [
          {
            id: "1",
            width: "",
            height: "",
            diameter: "",
            weight: "",
            purities: ["80"],
          },
        ]
      );
    } else if (!editProduct && open) {
      // Reset form when opening for new product
      setName("");
      setDescription("");
      setCategory("");
      setWeightRange("");
      setImages([]);
      setVariants([
        {
          id: "1",
          width: "",
          height: "",
          diameter: "",
          weight: "",
          purities: ["80"],
        },
      ]);
    }
  }, [editProduct, open]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    [images]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (images.length + imageFiles.length > 10) {
      toast.error("You can only upload up to 10 images");
      return;
    }

    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImages((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      width: "",
      height: "",
      diameter: "",
      weight: "",
      purities: ["80"], // Default to 80% only
    };
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (id: string) => {
    if (variants.length === 1) {
      toast.error("You must have at least one variant");
      return;
    }
    setVariants(variants.filter((v) => v.id !== id));
  };

  const updateVariant = (
    id: string,
    field: keyof ProductVariant,
    value: string | string[]
  ) => {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!name.trim()) {
      toast.error("Product name is required");
      setIsSubmitting(false);
      return;
    }

    if (!category) {
      toast.error("Please select a category");
      setIsSubmitting(false);
      return;
    }

    // Check if all variants have weight
    const invalidVariants = variants.filter((v) => !v.weight.trim());
    if (invalidVariants.length > 0) {
      toast.error("Weight is required for all variants");
      setIsSubmitting(false);
      return;
    }

    // Check if all variants have at least one purity selected
    const variantsWithoutPurity = variants.filter(
      (v) => !v.purities || v.purities.length === 0
    );
    if (variantsWithoutPurity.length > 0) {
      toast.error("Please select at least one purity option for all variants");
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEditMode) {
        // Update existing product
        const updatedProduct = {
          ...editProduct,
          name,
          description,
          category,
          weightRange,
          images,
          variants,
          image: images[0] || editProduct.image,
          updatedAt: new Date().toISOString(),
        };

        onProductUpdated?.(updatedProduct);
        toast.success("Product updated successfully!");
      } else {
        // Create new product
        const newProduct = {
          id: Date.now().toString(),
          name,
          description,
          category,
          weightRange,
          images,
          variants,
          price: 0,
          image: images[0] || "/assets/placeholder.jpg",
          createdAt: new Date().toISOString(),
        };

        onProductAdded(newProduct);
        toast.success("Product added successfully!");
      }

      // Reset form
      setName("");
      setDescription("");
      setCategory("");
      setWeightRange("");
      setImages([]);
      setVariants([
        {
          id: "1",
          width: "",
          height: "",
          diameter: "",
          weight: "",
          purities: ["80"],
        },
      ]);
      onOpenChange(false);
    } catch (error) {
      toast.error(
        isEditMode ? "Failed to update product" : "Failed to add product"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription>
            Fill in the product details below. Weight is required for all
            variants.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>Product Images (up to 10)</Label>
            
            {/* Image URL Input */}
            <div className="mb-4">
              <Label htmlFor="image-url" className="text-sm text-gray-600 mb-2 block">
                Add Image URL (from /assets/ folder)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="image-url"
                  type="text"
                  placeholder="/assets/fork-elegance.jpg"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const url = (e.target as HTMLInputElement).value.trim();
                      if (url && !images.includes(url)) {
                        if (images.length < 10) {
                          setImages([...images, url]);
                          (e.target as HTMLInputElement).value = "";
                        } else {
                          toast.error("You can only add up to 10 images");
                        }
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const input = document.getElementById("image-url") as HTMLInputElement;
                    const url = input.value.trim();
                    if (url) {
                      if (images.length < 10) {
                        if (!images.includes(url)) {
                          setImages([...images, url]);
                          input.value = "";
                        } else {
                          toast.error("Image already added");
                        }
                      } else {
                        toast.error("You can only add up to 10 images");
                      }
                    }
                  }}
                >
                  Add URL
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter image paths like: /assets/fork-elegance.jpg
              </p>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? "border-black bg-gray-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop images here, or click to select
              </p>
              <p className="text-xs text-gray-500 mb-4">
                {images.length}/10 images uploaded
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("file-upload")?.click()}
                disabled={images.length >= 10}
              >
                Select Images
              </Button>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-5 gap-4 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
                      <Image
                        src={image}
                        alt={`Product ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Product Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Product Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter product description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              required
            >
              <option value="">Select a category</option>
              {categories
                .filter((cat) => cat !== "All Categories")
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
          </div>

          {/* Weight Range */}
          <div className="space-y-2">
            <Label htmlFor="weightRange">Weight Range (optional)</Label>
            <Input
              id="weightRange"
              placeholder="e.g., 50-100g per piece or 200-300g total"
              value={weightRange}
              onChange={(e) => setWeightRange(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Provide a weight range for the product (e.g., "50-100g per piece" or "200-300g total")
            </p>
          </div>

          {/* Variants Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Product Variants</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVariant}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Variant
              </Button>
            </div>

            {variants.map((variant, index) => (
              <div
                key={variant.id}
                className="border border-gray-200 rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Variant {index + 1}</h4>
                  {variants.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariant(variant.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`width-${variant.id}`}>
                      Width (optional)
                    </Label>
                    <Input
                      id={`width-${variant.id}`}
                      placeholder="e.g., 10cm"
                      value={variant.width}
                      onChange={(e) =>
                        updateVariant(variant.id, "width", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`height-${variant.id}`}>
                      Height (optional)
                    </Label>
                    <Input
                      id={`height-${variant.id}`}
                      placeholder="e.g., 20cm"
                      value={variant.height}
                      onChange={(e) =>
                        updateVariant(variant.id, "height", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`diameter-${variant.id}`}>
                      Diameter (optional)
                    </Label>
                    <Input
                      id={`diameter-${variant.id}`}
                      placeholder="e.g., 5cm"
                      value={variant.diameter}
                      onChange={(e) =>
                        updateVariant(variant.id, "diameter", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`weight-${variant.id}`}>
                      Weight <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`weight-${variant.id}`}
                      placeholder="e.g., 100g"
                      value={variant.weight}
                      onChange={(e) =>
                        updateVariant(variant.id, "weight", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                {/* Purity Checkboxes */}
                <div className="space-y-2 mt-4">
                  <Label>
                    Purity <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">
                    Select one or both purity options for this variant
                  </p>
                  <div className="flex gap-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={variant.purities.includes("80")}
                        onChange={(e) => {
                          const newPurities = e.target.checked
                            ? [...variant.purities, "80"]
                            : variant.purities.filter((p) => p !== "80");
                          updateVariant(variant.id, "purities", newPurities);
                        }}
                        className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                      />
                      <span className="text-sm">80% Purity</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={variant.purities.includes("92.5")}
                        onChange={(e) => {
                          const newPurities = e.target.checked
                            ? [...variant.purities, "92.5"]
                            : variant.purities.filter((p) => p !== "92.5");
                          updateVariant(variant.id, "purities", newPurities);
                        }}
                        className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                      />
                      <span className="text-sm">92.5% Purity</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Adding..."
                : isEditMode
                  ? "Update Product"
                  : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
