'use client'

import { useState, useEffect } from 'react';
import StaggeredMenu from './StaggeredMenu';
import { smoothScrollToElement } from '@/utils/animations';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

interface NavbarProps {
  onNavigate: (page: 'home' | 'quote' | 'order') => void;
  currentPage: 'home' | 'quote' | 'order';
}

export default function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isWhiteBackground, setIsWhiteBackground] = useState(false);
  const [, setIsScrolled] = useState(false);

  useEffect(() => {
    if (currentPage !== 'home') {
      setIsWhiteBackground(true);
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      
      setIsScrolled(scrollPosition > 50);
      
      const heroSection = document.querySelector('section.min-h-screen');
      const secondSection = document.querySelector('section.h-\\[90vh\\]') || 
                           document.querySelector('section.md\\:h-\\[95vh\\]');
      
      if (!heroSection) {
        setIsWhiteBackground(true);
        return;
      }

      const heroRect = heroSection.getBoundingClientRect();
      const heroBottom = heroRect.bottom;
      
      let secondBottom = heroBottom;
      if (secondSection) {
        const secondRect = secondSection.getBoundingClientRect();
        secondBottom = secondRect.bottom;
      }
      
      const threshold = 50;
      setIsWhiteBackground(secondBottom < threshold);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = entry.target as HTMLElement;
            const isWhite = section.classList.contains('bg-white') || 
                           section.classList.contains('bg-[#FAF9F7]') ||
                           section.classList.contains('bg-[#FDFBF7]');
            if (isWhite) {
              setIsWhiteBackground(true);
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '-100px 0px' }
    );

    const sections = document.querySelectorAll('section');
    sections.forEach((section) => observer.observe(section));

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [currentPage]);

  const menuItems = [
    { 
      label: 'Home', 
      ariaLabel: 'Go to home page', 
      onClick: () => onNavigate('home')
    },
    { 
      label: 'Categories', 
      ariaLabel: 'View categories', 
      onClick: () => {
        if (currentPage === 'home') {
          document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
        } else {
          onNavigate('home');
          setTimeout(() => {
            document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    },
    { 
      label: 'Get Quote', 
      ariaLabel: 'Get a quote', 
      onClick: () => {
        onNavigate('quote');
        setTimeout(() => {
          smoothScrollToElement('quote-hero');
        }, 100);
      }
    },
    { 
      label: 'Order Products', 
      ariaLabel: 'Order products', 
      onClick: () => {
        onNavigate('order');
        setTimeout(() => {
          smoothScrollToElement('order-hero');
        }, 100);
      }
    },
    { 
      label: 'Contact', 
      ariaLabel: 'Contact us', 
      onClick: () => {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    // Add Admin Dashboard menu item if user is admin
    ...(session?.user?.role === 'ADMIN' ? [{
      label: 'Admin Dashboard',
      ariaLabel: 'Go to admin dashboard',
      onClick: () => {
        // Double-check user is admin before navigating
        if (session?.user?.role === 'ADMIN') {
          router.push('/admin');
        } else {
          // If somehow a non-admin user triggers this, redirect to homepage
          onNavigate('home');
        }
      }
    }] : [])
  ];

  const defaultMenuColor = isWhiteBackground ? '#a8bba3' : '#fff';
  const openMenuColor = '#a8bba3';

  const handleLoginClick = async () => {
    if (session) {
      // User is logged in, sign them out
      await signOut({ callbackUrl: '/' });
    } else {
      // User is not logged in, redirect to login
      router.push('/auth');
    }
  };

  return (
    <StaggeredMenu
      position="right"
      items={menuItems}
      displaySocials={false}
      displayItemNumbering={true}
      menuButtonColor={defaultMenuColor}
      openMenuButtonColor={openMenuColor}
      changeMenuColorOnOpen={true}
      colors={['#1A1A1A', '#2A2A2A']}
      accentColor="#a8bba3"
      isFixed={true}
      onLogoClick={() => onNavigate('home')}
      navbarLayout="option3"
      onLoginClick={handleLoginClick}
      onNavigate={onNavigate}
      loginButtonText={session ? 'Logout' : 'Login'}
    />
  );
}
