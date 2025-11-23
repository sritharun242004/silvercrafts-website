"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Copy, Mail, Building2, Hash, Calendar, User, Shield } from "lucide-react";
import { toast } from "sonner";

interface UserDetails {
  id: string;
  name: string;
  email: string;
  role: string;
  companyName?: string | null;
  gstNo?: string | null;
  isActive: boolean;
  isTemporary: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDetails | null;
}

const UserDetailsDialog = ({
  open,
  onOpenChange,
  user,
}: UserDetailsDialogProps) => {
  if (!user) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about this user account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Status Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
              <Shield className="h-3 w-3 mr-1" />
              {user.role}
            </Badge>
            <Badge variant={user.isActive ? "default" : "secondary"}>
              {user.isActive ? "Active" : "Inactive"}
            </Badge>
            {user.isTemporary && (
              <Badge variant="destructive">Temporary Password</Badge>
            )}
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Basic Information</h3>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Full Name</Label>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <p className="text-sm">{user.name}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(user.name, "Name")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <p className="text-sm">{user.email}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(user.email, "Email")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">User ID</Label>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-mono text-xs">{user.id}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(user.id, "User ID")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Company Information */}
          {(user.companyName || user.gstNo) && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Company Information</h3>
              
              {user.companyName && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Company Name
                  </Label>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <p className="text-sm">{user.companyName}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(user.companyName || "", "Company Name")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {user.gstNo && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    GST Number
                  </Label>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-mono">{user.gstNo}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(user.gstNo || "", "GST Number")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Account Information</h3>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Account Created
              </Label>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm">{formatDate(user.createdAt)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Last Updated
              </Label>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm">{user.updatedAt ? formatDate(user.updatedAt) : "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;

