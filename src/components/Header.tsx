"use client";

import { Search, ShoppingCart, User, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const Header = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleSignOut = async () => {
    try {
      // Sign out without redirect first
      await signOut({ 
        callbackUrl: "/",
        redirect: false 
      });
      // Then manually redirect to home page - more reliable
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
      // Force redirect to home page on any error
      window.location.href = "/";
    }
  };

  return (
    <header>
      {/* Top Bar */}
      <div className="bg-muted/30 py-2">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Free shipping on silverware orders over ₹16,000{" "}
            <span className="text-primary">•</span>
          </p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left Menu */}
            <div className="hidden md:flex space-x-8">
              <Link
                href="/products"
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                Products
              </Link>
              <a
                href="#cutlery"
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                Cutlery
              </a>
              <a
                href="#serving"
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                Serving Sets
              </a>
            </div>

            {/* Logo */}
            <div className="flex-1 flex justify-center">
              <Link
                href="/"
                className="font-serif text-2xl text-primary font-semibold tracking-wide hover:opacity-80 transition-opacity"
              >
                SilverCrafts
              </Link>
            </div>

            {/* Right Menu */}
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex space-x-6">
                <Link
                  href="/about"
                  className="text-foreground hover:text-primary transition-colors text-sm"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="text-foreground hover:text-primary transition-colors text-sm"
                >
                  Contact
                </Link>
                {/* Only show Admin link for admin users */}
                {session?.user?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="text-foreground hover:text-primary transition-colors text-sm"
                  >
                    Admin
                  </Link>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <Search className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                <ShoppingCart className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />

                {/* Show Login/Logout based on authentication status */}
                {status === "loading" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="flex items-center space-x-1"
                  >
                    <User className="w-4 h-4" />
                    <span>Loading...</span>
                  </Button>
                ) : session?.user ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground hidden md:block">
                      Welcome, {session.user.name}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSignOut}
                      className="flex items-center space-x-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/auth")}
                    className="flex items-center space-x-1"
                  >
                    <User className="w-4 h-4" />
                    <span>Login</span>
                  </Button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Menu className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
