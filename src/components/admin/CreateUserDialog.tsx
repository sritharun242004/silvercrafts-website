"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
  mode?: 'create' | 'reset';
  resetUserData?: {
    user: any;
    temporaryPassword: string;
  } | null;
}

export default function CreateUserDialog({
  open,
  onOpenChange,
  onUserCreated,
  mode = 'create',
  resetUserData = null,
}: CreateUserDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [companyName, setCompanyName] = useState("");
  const [gstNo, setGstNo] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState<{
    user: any;
    temporaryPassword: string;
  } | null>(null);

  // When resetUserData is provided, show it immediately
  useEffect(() => {
    if (resetUserData && mode === 'reset') {
      setCreatedUser(resetUserData);
    } else if (!resetUserData && mode === 'reset') {
      setCreatedUser(null);
    }
  }, [resetUserData, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          role,
          companyName: companyName.trim() || undefined,
          gstNo: gstNo.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create user");
      } else {
        setCreatedUser(data);
        toast.success("User created successfully!");
        // Don't close dialog yet, show the temporary password
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setEmail("");
    setRole("USER");
    setCompanyName("");
    setGstNo("");
    setError("");
    setCreatedUser(null);
    onOpenChange(false);
    if (createdUser || resetUserData) {
      onUserCreated();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const isResetMode = mode === 'reset';
  const showUserData = createdUser || (isResetMode && resetUserData);
  const displayData = createdUser || resetUserData;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        {!showUserData ? (
          <>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a new user account with a temporary password.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Enter user's full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Enter user's email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Account Type</Label>
                <Select
                  value={role}
                  onValueChange={(value: "USER" | "ADMIN") => setRole(value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name (Optional)</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={isLoading}
                  placeholder="Enter company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstNo">GST Number (Optional)</Label>
                <Input
                  id="gstNo"
                  value={gstNo}
                  onChange={(e) => setGstNo(e.target.value)}
                  disabled={isLoading}
                  placeholder="Enter GST number"
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create User"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                {isResetMode ? 'Password Reset Successfully!' : 'User Created Successfully!'}
              </DialogTitle>
              <DialogDescription>
                {isResetMode 
                  ? 'The password has been reset. Please share the temporary password with the user.'
                  : 'The user account has been created. Please share the temporary password with the user.'}
              </DialogDescription>
            </DialogHeader>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-gray-600">
                    {displayData?.user.name}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-600">
                      {displayData?.user.email}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(displayData?.user.email || '')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <p className="text-sm text-gray-600">
                    {displayData?.user.role === 'ADMIN' ? 'Admin' : 'User'}
                  </p>
                </div>

                {displayData?.user.companyName && (
                  <div>
                    <Label className="text-sm font-medium">Company Name</Label>
                    <p className="text-sm text-gray-600">
                      {displayData.user.companyName}
                    </p>
                  </div>
                )}

                {displayData?.user.gstNo && (
                  <div>
                    <Label className="text-sm font-medium">GST Number</Label>
                    <p className="text-sm text-gray-600">
                      {displayData.user.gstNo}
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">
                    Temporary Password
                  </Label>
                  <div className="flex items-center space-x-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                      {displayData?.temporaryPassword}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(displayData?.temporaryPassword || '')
                      }
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertDescription>
                <strong>Important:</strong> The user must change their password
                on first login. They will not be able to access the system until
                they set a new password.
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
