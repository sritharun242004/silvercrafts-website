'use client'

import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onNavigate: (page: 'home' | 'quote') => void;
  label?: string;
}

export default function BackButton({ onNavigate, label = 'Back to Home' }: BackButtonProps) {
  return (
    <button
      onClick={() => onNavigate('home')}
      className="fixed top-6 sm:top-8 md:top-10 left-3 sm:left-4 md:left-6 z-[70] flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-white/90 backdrop-blur-sm border border-[#a8bba3]/30 rounded-full text-[#1a1a1a] font-normal hover:bg-[#a8bba3] hover:text-white hover:border-[#a8bba3] transition-all duration-300 shadow-lg hover:shadow-xl group min-h-[40px]"
      aria-label="Go back to home page"
    >
      <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4 md:h-4 transition-transform duration-300 group-hover:-translate-x-1 flex-shrink-0" />
      <span className="text-xs sm:text-xs md:text-sm whitespace-nowrap">{label}</span>
    </button>
  );
}

