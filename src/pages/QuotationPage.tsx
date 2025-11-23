'use client'

import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, ArrowRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { categories, Product } from '../data/products';

interface QuotePageProps {
  onNavigate: (page: 'home' | 'quote' | 'order') => void;
}

interface QuoteItem {
  product: Product;
  quantity: number;
}

export default function QuotePage({ onNavigate }: QuotePageProps) {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    businessName: '',
    gstin: ''
  });

  // Helper function to map admin category names to frontend category IDs
  const normalizeCategory = (categoryName: string): string => {
    const categoryMap: { [key: string]: string } = {
      'Plates': 'plates',
      'Lamps': 'lamps',
      'Bowls': 'bowls',
      'Glasses': 'glasses',
      'Kamakshi': 'kamakshi',
      'Gift Articles': 'gift-articles',
      'Cutlery': 'cutlery',
      'Trays': 'trays',
      'Idols': 'idols',
      'Coins': 'coins',
      'Pooja Items': 'pooja-items',
      'Photo Frames': 'photo-frames',
      'Decorative Items': 'decorative',
      'Corporate Gifts': 'corporate-gifts',
      'Jewelry Boxes': 'jewelry-boxes',
      'Utensils': 'utensils',
      'Wedding Items': 'wedding-items',
    };
    return categoryMap[categoryName] || categoryName.toLowerCase().replace(/\s+/g, '-');
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Store original products with original category names
  const [originalProducts, setOriginalProducts] = useState<any[]>([]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        // Store original products for category lookup
        setOriginalProducts(data.products || []);
        const transformedProducts: Product[] = (data.products || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          category: normalizeCategory(p.category || ''),
          image: p.image || '/assets/placeholder.jpg',
          weightRange: p.weightRange || '',
          variants: (p.variants || []).map((v: any) => ({
            id: v.id,
            weight: v.weight || '',
            dimensions: v.dimensions || '',
            description: v.description || '',
          })),
        }));
        setProducts(transformedProducts);
        } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Simple filtering: if 'all' is selected, show all products, otherwise filter by category
  const displayedProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const addToQuote = (product: Product) => {
    const existingItem = quoteItems.find((item) => item.product.id === product.id);
    if (existingItem) {
      // If product already exists, increment quantity
    setQuoteItems(
        quoteItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
    );
    } else {
      // Add new product to quote
      setQuoteItems([...quoteItems, { product, quantity: 1 }]);
    }
  };

  const removeQuoteItem = (productId: string) => {
    setQuoteItems(quoteItems.filter((item) => item.product.id !== productId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prepare quote data
      const quoteData = {
        name: session?.user?.name || formData.name,
        email: session?.user?.email || formData.email,
        phone: formData.phone || null,
        businessName: session?.user?.companyName || formData.businessName || null,
        gstin: session?.user?.gstNo || formData.gstin || null,
        items: quoteItems.map(item => {
          // Get the original product data to get the original category name from database
          const originalProduct = originalProducts.find((p: any) => p.id === item.product.id);
          // Use the original category from the database (e.g., "Cutlery"), not the normalized one (e.g., "cutlery")
          return {
            productId: item.product.id,
            productName: item.product.name,
            category: originalProduct?.category || item.product.name, // Use original category from DB
            quantity: item.quantity,
          };
        }),
      };

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit quote');
      }

    setShowQuoteForm(false);
    setShowConfirmation(true);
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-explosion';
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 3000);
    }, 100);
    } catch (error) {
      console.error('Error submitting quote:', error);
      toast.error('Failed to submit quote. Please try again.');
    }
  };

  return (
    <div className="bg-[#FAF9F7] min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0B24]/20 via-transparent to-transparent z-0"></div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-[#1A1A1A] leading-tight">
              Place Your <span className="text-[#D4AF37]">Silverware Quote</span>
            </h1>
            <p className="text-xl text-[#6F6F6F] leading-relaxed">
              Choose the articles you need and complete your quote for fast delivery.
            </p>
            <button
              onClick={() => document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-[#D4AF37] text-[#1A1A1A] rounded-lg font-medium hover:bg-[#D4AF37]/90 transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center gap-2"
            >
              Explore Products
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <div className="relative h-[400px] rounded-lg overflow-hidden shadow-2xl">
            <img
              src="https://images.pexels.com/photos/5691551/pexels-photo-5691551.jpeg?auto=compress&cs=tinysrgb&w=1600"
              alt="Silver manufacturing"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section id="categories-section" className="py-12 px-6 bg-[#F4F4F4]">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-[#1A1A1A] mb-6">
            Browse by Category
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                selectedCategory === 'all'
                  ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-lg scale-105'
                  : 'bg-white text-[#6F6F6F] hover:bg-gray-100'
              }`}
            >
              All Products
            </button>
            {categories.map((category) => (
                <button
                key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    selectedCategory === category.id
                    ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-lg scale-105'
                    : 'bg-white text-[#6F6F6F] hover:bg-gray-100'
                }`}
              >
                {category.name}
                </button>
              ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
              <p className="text-[#6F6F6F]">Loading products...</p>
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-[#6F6F6F] mb-4">No products found</p>
              <p className="text-sm text-[#6F6F6F]">
                {products.length === 0 
                  ? "No products available. Please check back later."
                  : `No products found in "${selectedCategory === 'all' ? 'All Categories' : categories.find(c => c.id === selectedCategory)?.name || selectedCategory}" category.`}
              </p>
            </div>
          ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedProducts.map((product, index) => (
              <div
                key={product.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-[#1A1A1A]">{product.name}</h3>
                  <button
                      onClick={() => addToQuote(product)}
                    className="w-full px-6 py-3 bg-[#D4AF37] text-[#1A1A1A] rounded-lg font-medium hover:bg-[#D4AF37]/90 transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
                  >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Quote
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Quote Sidebar */}
      {showSidebar && (
        <>
          {/* Backdrop - closes sidebar when clicked */}
          <div 
            className="fixed inset-0 bg-[#1A1A1A]/50 backdrop-blur-sm z-40"
            onClick={() => setShowSidebar(false)}
          />
          {/* Sidebar */}
          <div 
            className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[#C0C0C0]/20 flex items-center justify-between bg-gradient-to-r from-[#D4AF37]/10 to-transparent">
              <h2 className="text-2xl font-bold text-[#1A1A1A]">Your Quote</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="text-[#6F6F6F] hover:text-[#1A1A1A] transition-colors p-2 hover:bg-gray-100 rounded-full"
                aria-label="Close sidebar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          <div className="p-6 space-y-4">
            {quoteItems.length === 0 ? (
              <p className="text-[#6F6F6F] text-center py-8">Your quote is empty</p>
            ) : (
              quoteItems.map((item) => (
                <div key={item.product.id} className="border border-[#C0C0C0]/20 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    {item.product.image && (
                      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#1A1A1A]">{item.product.name}</h4>
                        <p className="text-sm text-[#D4AF37] font-medium mt-2">Qty: {item.quantity}</p>
                      </div>
                      <button
                        onClick={() => removeQuoteItem(item.product.id)}
                        className="text-red-500 hover:text-red-700 transition-colors ml-4"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {quoteItems.length > 0 && (
            <div className="p-6 border-t border-[#C0C0C0]/20">
              <button
                onClick={() => setShowQuoteForm(true)}
                className="w-full px-6 py-3 bg-[#D4AF37] text-[#1A1A1A] rounded-lg font-medium hover:bg-[#D4AF37]/90 transition-all"
              >
                Request Quote
              </button>
            </div>
          )}
        </div>
        </>
      )}

      {/* Floating Cart Button */}
      {quoteItems.length > 0 && !showSidebar && (
        <button
          onClick={() => setShowSidebar(true)}
          className="fixed bottom-8 right-8 bg-[#D4AF37] text-[#1A1A1A] rounded-full p-4 shadow-2xl hover:scale-110 transition-all z-30"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {quoteItems.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </button>
      )}

      {/* Quote Form Modal */}
      {showQuoteForm && (
        <div className="fixed inset-0 bg-[#1A1A1A]/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl">
            <div className="p-6 border-b border-[#C0C0C0]/20 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#1A1A1A]">Request Quote</h2>
            <button
              onClick={() => setShowQuoteForm(false)}
                className="text-[#6F6F6F] hover:text-[#1A1A1A] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!session?.user && (
                <>
              <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-[#C0C0C0]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                      required
                />
              </div>
              <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-[#C0C0C0]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                      required
                />
              </div>
              <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-[#C0C0C0]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                      required
                />
              </div>
              <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Business Name (Optional)</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full px-4 py-2 border border-[#C0C0C0]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>
              <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-2">GSTIN (Optional)</label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                      className="w-full px-4 py-2 border border-[#C0C0C0]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>
                </>
              )}
              {session?.user && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm text-[#6F6F6F]">Using your account information:</p>
                  <p className="font-medium text-[#1A1A1A]">Name: {session.user.name}</p>
                  <p className="font-medium text-[#1A1A1A]">Email: {session.user.email}</p>
                </div>
              )}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowQuoteForm(false)}
                  className="flex-1 px-6 py-3 border-2 border-[#1A1A1A] text-[#1A1A1A] rounded-lg font-medium hover:bg-[#1A1A1A] hover:text-white transition-all"
                >
                  Cancel
                </button>
              <button
                type="submit"
                  className="flex-1 px-6 py-3 bg-[#D4AF37] text-[#1A1A1A] rounded-lg font-medium hover:bg-[#D4AF37]/90 transition-all"
              >
                  Submit Quote
              </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-[#1A1A1A]/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Quote Requested!</h2>
            <p className="text-[#6F6F6F] mb-6">We'll get back to you soon with a detailed quote.</p>
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setQuoteItems([]);
                setFormData({ name: '', phone: '', email: '', businessName: '', gstin: '' });
                  setShowSidebar(false);
                }}
              className="px-6 py-3 bg-[#D4AF37] text-[#1A1A1A] rounded-lg font-medium hover:bg-[#D4AF37]/90 transition-all"
              >
              Close
              </button>
          </div>
        </div>
      )}
    </div>
  );
}

