"use client";

import { User, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

const NewHeader = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [showSecondNavbar, setShowSecondNavbar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.querySelector("section");
      if (heroSection) {
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        setShowSecondNavbar(window.scrollY > heroBottom - 100);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <>
      {/* First Navbar - 60% width, only visible in hero section */}
      <header
        className={`fixed top-0 left-0 w-3/5 z-50 transition-all duration-300 ${showSecondNavbar ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        {/* Main Navigation */}
        <nav className="bg-background/95 backdrop-blur-sm">
          <div className="max-w-full mx-auto px-4">
            <div className="flex items-center h-16">
              {/* Logo and Navigation Menu */}
              <div className="flex items-center space-x-8">
                <Link
                  href="/"
                  className="font-heading text-2xl text-primary font-semibold tracking-wide hover:opacity-80 transition-opacity ml-4"
                >
                  SilverCrafts
                </Link>

                <div className="hidden md:flex space-x-6">
                  <Link
                    href="/products"
                    className="text-foreground hover:text-primary transition-colors font-medium font-sans"
                  >
                    Products
                  </Link>
                  <Link
                    href="/about"
                    className="text-foreground hover:text-primary transition-colors font-medium font-sans"
                  >
                    About
                  </Link>
                  <Link
                    href="/contact"
                    className="text-foreground hover:text-primary transition-colors font-medium font-sans"
                  >
                    Contact
                  </Link>
                  {/* Only show Admin link for admin users */}
                  {session?.user?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="text-foreground hover:text-primary transition-colors font-medium font-sans"
                    >
                      Admin
                    </Link>
                  )}
                </div>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden ml-auto">
                <Menu className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Second Navbar - Full width, appears after scroll */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${showSecondNavbar ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"}`}
      >
        <nav className="bg-white/95 backdrop-blur-sm shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link
                  href="/"
                  className="font-heading text-2xl text-primary font-semibold tracking-wide hover:opacity-80 transition-opacity"
                >
                  SilverCrafts
                </Link>
              </div>

              {/* Center Menu */}
              <div className="hidden md:flex space-x-8">
                <Link
                  href="/products"
                  className="text-foreground hover:text-primary transition-colors font-medium font-sans"
                >
                  Products
                </Link>
                <Link
                  href="/about"
                  className="text-foreground hover:text-primary transition-colors font-medium font-sans"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="text-foreground hover:text-primary transition-colors font-medium font-sans"
                >
                  Contact
                </Link>
                {session?.user?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="text-foreground hover:text-primary transition-colors font-medium font-sans"
                  >
                    Admin
                  </Link>
                )}
              </div>

              {/* Right Menu */}
              <div className="flex items-center space-x-4">
                {session?.user ? (
                  <Button
                    size="sm"
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 bg-primary text-white transition-all duration-300 hover:bg-yellow-400"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => router.push("/auth")}
                    className="flex items-center space-x-1 bg-primary text-white transition-all duration-300 hover:bg-yellow-400"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Login</span>
                  </Button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Menu className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default NewHeader;
