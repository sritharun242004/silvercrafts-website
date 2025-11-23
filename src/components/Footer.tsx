'use client'

import { Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#1A1A1A] text-[#FAF9F7] py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/logos/Main logo white.png"
              alt="Silver Crafts Logo"
              className="h-24 sm:h-28 md:h-32 lg:h-40 xl:h-48 w-auto object-contain max-w-full"
              loading="lazy"
            />
          </div>
          <p className="text-base md:text-lg text-[#C0C0C0] max-w-2xl mx-auto mb-6 md:mb-8 px-4">
            We make silver sourcing the easiest part of your business
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8 mb-6 md:mb-8">
          <a 
            href="mailto:info@silvercrafts.in"
            className="flex items-center gap-2 text-[#C0C0C0] hover:text-[#a8bba3] transition-colors duration-200 min-h-[44px] px-4"
          >
            <Mail className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm md:text-base break-all">info@silvercrafts.in</span>
          </a>
          <a 
            href="tel:+919876543210"
            className="flex items-center gap-2 text-[#C0C0C0] hover:text-[#a8bba3] transition-colors duration-200 min-h-[44px] px-4"
          >
            <Phone className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm md:text-base">+91 98765 43210</span>
          </a>
        </div>

        <div className="text-center text-xs md:text-sm text-[#6F6F6F] pt-6 md:pt-8 border-t border-[#C0C0C0]/20">
          <p>&copy; {new Date().getFullYear()} Silver Crafts. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
