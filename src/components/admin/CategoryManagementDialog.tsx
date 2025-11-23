"use client";

import { useState, useEffect } from "react";
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
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CategoryManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  onCategoriesUpdate: (categories: string[]) => void;
}

const CategoryManagementDialog = ({
  open,
  onOpenChange,
  categories,
  onCategoriesUpdate,
}: CategoryManagementDialogProps) => {
  const [localCategories, setLocalCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [deleteCategoryDialog, setDeleteCategoryDialog] = useState<{ open: boolean; index: number | null }>({ open: false, index: null });

  useEffect(() => {
    // Filter out "All Categories" and initialize local state
    setLocalCategories(categories.filter((cat) => cat !== "All Categories"));
  }, [categories, open]);

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    if (localCategories.includes(newCategory.trim())) {
      toast.error("Category already exists");
      return;
    }

    setLocalCategories([...localCategories, newCategory.trim()]);
    setNewCategory("");
    toast.success("Category added");
  };

  const handleStartEdit = (index: number, category: string) => {
    setEditingIndex(index);
    setEditingValue(category);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;

    if (!editingValue.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    if (
      localCategories.includes(editingValue.trim()) &&
      editingValue.trim() !== localCategories[editingIndex]
    ) {
      toast.error("Category already exists");
      return;
    }

    const updated = [...localCategories];
    updated[editingIndex] = editingValue.trim();
    setLocalCategories(updated);
    setEditingIndex(null);
    setEditingValue("");
    toast.success("Category updated");
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  const handleDeleteCategory = (index: number) => {
    setDeleteCategoryDialog({ open: true, index });
  };

  const confirmDeleteCategory = () => {
    if (deleteCategoryDialog.index === null) return;

    const updated = localCategories.filter((_, i) => i !== deleteCategoryDialog.index);
    setLocalCategories(updated);
    toast.success("Category deleted");
    setDeleteCategoryDialog({ open: false, index: null });
  };

  const handleSaveChanges = () => {
    // Add "All Categories" back to the beginning
    const updatedCategories = ["All Categories", ...localCategories];
    onCategoriesUpdate(updatedCategories);
    toast.success("Categories saved successfully!");
    onOpenChange(false);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>
            Add, edit, or delete product categories. These will appear in the
            dropdown when adding products.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Category */}
          <div className="space-y-2">
            <Label htmlFor="new-category">Add New Category</Label>
            <div className="flex gap-2">
              <Input
                id="new-category"
                placeholder="Enter category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddCategory();
                  }
                }}
              />
              <Button onClick={handleAddCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          {/* Categories List */}
          <div className="space-y-2">
            <Label>Existing Categories ({localCategories.length})</Label>
            <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
              {localCategories.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No categories yet. Add your first category above.
                </div>
              ) : (
                localCategories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 hover:bg-gray-50"
                  >
                    {editingIndex === index ? (
                      // Edit Mode
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleSaveEdit();
                            } else if (e.key === "Escape") {
                              handleCancelEdit();
                            }
                          }}
                          autoFocus
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleSaveEdit}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      // View Mode
                      <>
                        <span className="font-medium">{category}</span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartEdit(index, category)}
                          >
                            <Edit2 className="h-4 w-4 text-gray-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteCategory(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Delete Category Alert Dialog */}
    <AlertDialog open={deleteCategoryDialog.open} onOpenChange={(open) => setDeleteCategoryDialog({ open, index: null })}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Category</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this category? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDeleteCategory} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
};

export default CategoryManagementDialog;


