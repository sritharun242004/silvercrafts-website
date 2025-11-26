"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Shield, Home, ChevronDown } from "lucide-react";
import Link from "next/link";

const AdminHeader = () => {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="flex h-16 items-center px-6">
        {/* Left section - Logo & Admin Badge */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-heading text-xl text-primary font-semibold tracking-wide hover:opacity-80 transition-opacity"
          >
            SilverCrafts
          </Link>
          <div className="flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-xs font-medium">
            <Shield className="h-3 w-3" />
            Admin Portal
          </div>
        </div>

        {/* Center section - Navigation */}
        <nav className="flex-1 flex items-center justify-center gap-1">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              Back to Site
            </Button>
          </Link>
        </nav>

        {/* Right section - Actions & Profile */}
        <div className="flex items-center gap-3">
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 hover:bg-gray-100"
              >
                <Avatar className="h-8 w-8 bg-black">
                  <AvatarFallback className="bg-black text-white text-xs">
                    {session?.user?.name
                      ? getInitials(session.user.name)
                      : "AD"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900">
                    {session?.user?.name || "Admin"}
                  </span>
                  <span className="text-xs text-gray-500">Administrator</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
