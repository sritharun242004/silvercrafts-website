'use client'

import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart, ArrowRight, Eye, LogIn } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { categories, Product } from '../data/products';

interface OrderPageProps {
  onNavigate: (page: 'home' | 'quote' | 'order') => void;
}

interface ProductVariant {
  id: string;
  weight: string;
  dimensions?: string;
  description?: string;
  width?: string;
  height?: string;
  diameter?: string;
  purities: string[];
}

interface ProductWithVariants extends Product {
  variants?: ProductVariant[];
}

interface OrderItem {
  product: ProductWithVariants;
  variant: ProductVariant;
  quantity: number;
}

export default function OrderPage({ onNavigate }: OrderPageProps) {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const status = sessionResult?.status;
  const router = useRouter();
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithVariants | null>(null);
  const [variantQuantities, setVariantQuantities] = useState<{ [key: string]: number }>({});
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
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
    if (status !== 'loading') {
      fetchProducts();
    }
  }, [status]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        const transformedProducts: ProductWithVariants[] = (data.products || []).map((p: any) => ({
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
            width: v.width || '',
            height: v.height || '',
            diameter: v.diameter || '',
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

  const openVariantModal = (product: ProductWithVariants) => {
    setSelectedProduct(product);
    setShowVariantModal(true);
    const initialQuantities: { [key: string]: number } = {};
    (product.variants || []).forEach((variant) => {
      const existing = orderItems.find(
        (item) => item.product.id === product.id && item.variant.id === variant.id
      );
      initialQuantities[variant.id] = existing ? existing.quantity : 0;
    });
    setVariantQuantities(initialQuantities);
  };

  const updateVariantQuantity = (variantId: string, delta: number) => {
    setVariantQuantities((prev) => {
      const current = prev[variantId] || 0;
      const newValue = Math.max(0, current + delta);
      return { ...prev, [variantId]: newValue };
    });
  };

  const addVariantsToOrder = () => {
    if (!selectedProduct) return;

    const newItems: OrderItem[] = [];
    (selectedProduct.variants || []).forEach((variant) => {
      const quantity = variantQuantities[variant.id] || 0;
      if (quantity > 0) {
        newItems.push({
          product: selectedProduct,
          variant,
          quantity,
        });
      }
    });

    // Remove existing items for this product and add new ones
    const updatedItems = orderItems.filter(
      (item) => item.product.id !== selectedProduct.id
    );
    setOrderItems([...updatedItems, ...newItems]);
    setShowVariantModal(false);
    setVariantQuantities({});
  };

  const removeOrderItem = (productId: string, variantId: string) => {
    setOrderItems(orderItems.filter((item) => !(item.product.id === productId && item.variant.id === variantId)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      toast.error('Please login to place an order');
      return;
    }

    try {
      // Prepare order data
      const orderData = {
        name: session.user.name || '',
        email: session.user.email || '',
        phone: null,
        gstin: null,
        items: orderItems.map(item => ({
          productId: item.product.id,
          variantId: item.variant.id,
          productName: item.product.name,
          variantDetails: {
            weight: item.variant.weight,
            dimensions: item.variant.dimensions,
            width: item.variant.width,
            height: item.variant.height,
            diameter: item.variant.diameter,
          },
          quantity: item.quantity,
        })),
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit order');
      }

    setShowOrderForm(false);
    setShowConfirmation(true);
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-explosion';
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 3000);
    }, 100);
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Failed to submit order. Please try again.');
    }
  };

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="bg-[#FAF9F7] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-[#6F6F6F]">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!session || !session.user) {
    return (
      <div className="bg-[#FAF9F7] min-h-screen">
        <section className="pt-32 pb-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B0B24]/20 via-transparent to-transparent z-0"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="bg-white rounded-lg shadow-2xl p-12 md:p-16 space-y-8">
              <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto">
                <LogIn className="w-10 h-10 text-[#D4AF37]" />
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A]">
                  Please Login to View Products
                </h1>
                <p className="text-xl text-[#6F6F6F] leading-relaxed max-w-2xl mx-auto">
                  You need to be logged in to access our product catalog and place orders. 
                  Sign in to continue browsing our exclusive silverware collection.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <button
                  onClick={() => {
                    sessionStorage.setItem('redirectToOrder', 'true');
                    router.push('/auth?callbackUrl=/');
                  }}
                  className="px-8 py-4 bg-[#D4AF37] text-[#1A1A1A] rounded-lg font-medium hover:bg-[#D4AF37]/90 transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center gap-2 text-lg"
                >
                  <LogIn className="w-5 h-5" />
                  Login to Continue
                </button>
                <button
                  onClick={() => onNavigate('home')}
                  className="px-8 py-4 border-2 border-[#1A1A1A] text-[#1A1A1A] rounded-lg font-medium hover:bg-[#1A1A1A] hover:text-white transition-all duration-300"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F7] min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0B24]/20 via-transparent to-transparent z-0"></div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-[#1A1A1A] leading-tight">
              Place Your <span className="text-[#D4AF37]">Silverware Order</span>
            </h1>
            <p className="text-xl text-[#6F6F6F] leading-relaxed">
              Choose the articles you need and complete your order for fast delivery.
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
                    onClick={() => openVariantModal(product)}
                    className="w-full px-6 py-3 bg-[#D4AF37] text-[#1A1A1A] rounded-lg font-medium hover:bg-[#D4AF37]/90 transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    View Options
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Variant Modal */}
      {showVariantModal && selectedProduct && (
        <div className="fixed inset-0 bg-[#1A1A1A]/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#C0C0C0]/20 flex items-center justify-between bg-gradient-to-r from-[#D4AF37]/10 to-transparent">
              <div>
                <h2 className="text-2xl font-bold text-[#1A1A1A]">{selectedProduct.name}</h2>
                <p className="text-sm text-[#6F6F6F] mt-1">{selectedProduct.weightRange}</p>
              </div>
              <button
                onClick={() => {
                  setShowVariantModal(false);
                  setVariantQuantities({});
                }}
                className="text-[#6F6F6F] hover:text-[#1A1A1A] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Product Image */}
              {selectedProduct.image && (
                <div className="w-[300px] h-[300px] mx-auto mb-6 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              )}
              <div className="space-y-4">
                {(selectedProduct.variants || []).map((variant) => (
                  <div key={variant.id} className="border border-[#C0C0C0]/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                        <p className="font-semibold text-[#1A1A1A]">
                            {variant.weight}
                          </p>
                        {/* Dimensions - shown directly below weight */}
                        {(variant.width || variant.height || variant.diameter) && (
                          <div className="mt-1 text-sm text-[#6F6F6F] space-y-1">
                            {variant.width && (
                              <p>Width: <span className="font-medium">{variant.width}</span></p>
                            )}
                            {variant.height && (
                              <p>Height: <span className="font-medium">{variant.height}</span></p>
                            )}
                            {variant.diameter && (
                              <p>Diameter: <span className="font-medium">{variant.diameter}</span></p>
                            )}
                        </div>
                        )}
                        {variant.dimensions && (
                          <p className="text-xs text-[#6F6F6F] mt-1">{variant.dimensions}</p>
                        )}
                        {variant.description && (
                          <p className="text-sm text-[#6F6F6F] mt-1">{variant.description}</p>
                        )}
                      </div>
                    <div className="flex items-center gap-3 ml-4">
                      <button
                        onClick={() => updateVariantQuantity(variant.id, -1)}
                          className="w-8 h-8 rounded-full border-2 border-[#D4AF37] text-[#D4AF37] flex items-center justify-center hover:bg-[#D4AF37] hover:text-white transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                        <span className="w-12 text-center font-semibold text-[#1A1A1A]">
                        {variantQuantities[variant.id] || 0}
                      </span>
                      <button
                        onClick={() => updateVariantQuantity(variant.id, 1)}
                          className="w-8 h-8 rounded-full border-2 border-[#D4AF37] text-[#D4AF37] flex items-center justify-center hover:bg-[#D4AF37] hover:text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-[#C0C0C0]/20 flex gap-4">
              <button
                onClick={() => {
                  setShowVariantModal(false);
                  setVariantQuantities({});
                }}
                className="flex-1 px-6 py-3 border-2 border-[#1A1A1A] text-[#1A1A1A] rounded-lg font-medium hover:bg-[#1A1A1A] hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={addVariantsToOrder}
                className="flex-1 px-6 py-3 bg-[#D4AF37] text-[#1A1A1A] rounded-lg font-medium hover:bg-[#D4AF37]/90 transition-all"
              >
                Add to Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Sidebar */}
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
              <h2 className="text-2xl font-bold text-[#1A1A1A]">Your Order</h2>
            <button
              onClick={() => setShowSidebar(false)}
                className="text-[#6F6F6F] hover:text-[#1A1A1A] transition-colors p-2 hover:bg-gray-100 rounded-full"
                aria-label="Close sidebar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            {orderItems.length === 0 ? (
              <p className="text-[#6F6F6F] text-center py-8">Your order is empty</p>
            ) : (
              orderItems.map((item) => (
                <div key={`${item.product.id}-${item.variant.id}`} className="border border-[#C0C0C0]/20 rounded-lg p-4">
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
                        <p className="text-sm text-[#6F6F6F] mt-1">
                          {item.variant.weight} {item.variant.dimensions && `- ${item.variant.dimensions}`}
                        </p>
                        <p className="text-sm text-[#D4AF37] font-medium mt-2">Qty: {item.quantity}</p>
                      </div>
                      <button
                        onClick={() => removeOrderItem(item.product.id, item.variant.id)}
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
          {orderItems.length > 0 && (
            <div className="p-6 border-t border-[#C0C0C0]/20">
              <button
                onClick={() => setShowOrderForm(true)}
                className="w-full px-6 py-3 bg-[#D4AF37] text-[#1A1A1A] rounded-lg font-medium hover:bg-[#D4AF37]/90 transition-all"
              >
                Place Order
              </button>
            </div>
          )}
        </div>
        </>
      )}

      {/* Floating Cart Button */}
      {orderItems.length > 0 && !showSidebar && (
        <button
          onClick={() => setShowSidebar(true)}
          className="fixed bottom-8 right-8 bg-[#D4AF37] text-[#1A1A1A] rounded-full p-4 shadow-2xl hover:scale-110 transition-all z-30"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </button>
      )}

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-[#1A1A1A]/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl">
            <div className="p-6 border-b border-[#C0C0C0]/20 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#1A1A1A]">Place Order</h2>
            <button
              onClick={() => setShowOrderForm(false)}
                className="text-[#6F6F6F] hover:text-[#1A1A1A] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
              </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-sm text-[#6F6F6F]">Order will be placed using your account information:</p>
                <p className="font-medium text-[#1A1A1A]">Name: {session?.user?.name || 'N/A'}</p>
                <p className="font-medium text-[#1A1A1A]">Email: {session?.user?.email || 'N/A'}</p>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowOrderForm(false)}
                  className="flex-1 px-6 py-3 border-2 border-[#1A1A1A] text-[#1A1A1A] rounded-lg font-medium hover:bg-[#1A1A1A] hover:text-white transition-all"
                >
                  Cancel
                </button>
              <button
                type="submit"
                  className="flex-1 px-6 py-3 bg-[#D4AF37] text-[#1A1A1A] rounded-lg font-medium hover:bg-[#D4AF37]/90 transition-all"
              >
                Confirm Order
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
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Order Placed!</h2>
            <p className="text-[#6F6F6F] mb-6">We'll process your order and get back to you soon.</p>
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setOrderItems([]);
                setFormData({ name: '', phone: '', email: '', gstin: '' });
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

