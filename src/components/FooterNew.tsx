'use client'

import { Mail, Phone, Sparkles } from 'lucide-react';

export default function FooterNew() {
  return (
    <footer id="contact" className="bg-[#1A1A1A] text-[#FAF9F7] py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-[#D4AF37]" />
            <h3 className="text-3xl font-bold">Silver Crafts</h3>
          </div>
          <p className="text-lg text-[#C0C0C0] max-w-2xl mx-auto mb-8">
            Crafting purity and perfection in every silver piece.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
          <div className="flex items-center gap-2 text-[#C0C0C0] hover:text-[#D4AF37] transition-colors duration-200">
            <Mail className="w-5 h-5" />
            <a href="mailto:info@silvercrafts.in">info@silvercrafts.in</a>
          </div>
          <div className="flex items-center gap-2 text-[#C0C0C0] hover:text-[#D4AF37] transition-colors duration-200">
            <Phone className="w-5 h-5" />
            <a href="tel:+919876543210">+91 98765 43210</a>
          </div>
        </div>

        <div className="text-center text-sm text-[#6F6F6F] pt-8 border-t border-[#C0C0C0]/20">
          <p>&copy; {new Date().getFullYear()} Silver Crafts. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}


