"use client";

import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import Image from "next/image";

const NewHeroSection = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showLoginButton, setShowLoginButton] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.querySelector("section");
      if (heroSection) {
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        setShowLoginButton(window.scrollY < heroBottom - 100);
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
    <section className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* 60% Left Side - SilverCrafts Name */}
      <div className="w-3/5 flex items-center justify-center px-12 lg:px-20 relative z-10 pt-16">
        <div className="text-center lg:text-left max-w-2xl">
          {/* <div className="inline-block bg-gold px-4 py-2 rounded-full">
            <AnimatedShinyText
              className="text-white font-bold text-sm uppercase tracking-wide font-heading"
              shimmerWidth={150}
            >
              Since 1985
            </AnimatedShinyText>
          </div> */}
          <h1 className="font-heading text-6xl lg:text-8xl xl:text-9xl font-bold text-navy mb-8 leading-tight">
            SilverCrafts
          </h1>
          <p className="font-sans text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed">
            India&apos;s Premier B2B Silverware Manufacturer
            <br />
            <span className="text-gold font-semibold">
              Crafting Excellence Since Generations
            </span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button
              size="lg"
              className="px-8 py-4 text-lg bg-navy text-white hover:bg-gold hover:text-navy font-sans shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Explore Our Collection
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-4 text-lg border-navy text-navy hover:bg-navy hover:text-black font-sans shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Place Order
            </Button>
          </div>
        </div>
      </div>

      {/* 40% Right Side - Manufacturing Image */}
      <div className="w-2/5 relative h-screen overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80"
          alt="Silver manufacturing process"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-l from-white/30 via-white/10 to-transparent" />

        {/* Login Button - Fixed on top right, only visible in hero section */}
        <div
          className={`fixed top-4 right-4 z-50 transition-all duration-300 ${showLoginButton ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          {status === "loading" ? (
            <Button
              size="sm"
              disabled
              className="flex items-center space-x-1 bg-primary text-white transition-all duration-300 hover:bg-yellow-400"
            >
              <User className="w-4 h-4" />
              <span>Loading...</span>
            </Button>
          ) : session?.user ? (
            <Button
              size="sm"
              onClick={handleSignOut}
              className="flex items-center space-x-1 bg-primary text-white transition-all duration-300 hover:bg-yellow-400"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => router.push("/auth")}
              className="flex items-center space-x-1 bg-primary text-white transition-all duration-300 hover:bg-yellow-400"
            >
              <User className="w-4 h-4" />
              <span>Login</span>
            </Button>
          )}
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-16 h-16 bg-gold/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 right-32 w-24 h-24 bg-navy/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 right-10 w-12 h-12 bg-gold/30 rounded-full blur-lg"></div>
      </div>
    </section>
  );
};

export default NewHeroSection;
