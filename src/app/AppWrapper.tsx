'use client'

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

interface AppWrapperProps {
  children: React.ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<'home' | 'quote' | 'order'>(
    pathname === '/quotation' ? 'quote' : pathname === '/orders' ? 'order' : 'home'
  );

  useEffect(() => {
    if (pathname === '/quotation') {
      setCurrentPage('quote');
    } else if (pathname === '/orders') {
      setCurrentPage('order');
    } else {
      setCurrentPage('home');
    }
  }, [pathname]);

  const handleNavigate = (page: 'home' | 'quote' | 'order') => {
    setCurrentPage(page);
    if (page === 'home') {
      router.push('/');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }, 0);
    } else if (page === 'quote') {
      router.push('/quotation');
    } else {
      router.push('/orders');
    }
  };

  useEffect(() => {
    if (currentPage === 'home' && pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [currentPage, pathname]);

  // Don't show Navbar/Footer on admin routes
  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/studio') || pathname?.startsWith('/auth');
  
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      {(currentPage === 'home' || currentPage === 'order') && (
        <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
      )}
      {children}
      <Footer />
      <ScrollToTop />
    </div>
  );
}

