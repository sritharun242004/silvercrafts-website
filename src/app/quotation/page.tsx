"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  X,
  ShoppingCart,
  Sparkles,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { categories, products, Product } from "@/data/products";
import BackButton from "@/components/BackButton";
import { QUOTE_STEPS, CAROUSEL_CONFIG } from "@/config/constants";

interface QuoteItem {
  product: Product;
  quantity: number;
}

export default function QuotationPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // State Management
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPurity, setSelectedPurity] = useState<string>("80");
  const categoryCarouselRef = useRef<HTMLDivElement>(null);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    yourName: "",
    designation: "",
    phone: "",
    email: "",
    gstin: "",
  });

  const handleNavigate = (page: "home" | "quote") => {
    if (page === "home") {
      router.push("/");
    } else {
      router.push("/quotation");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        const fetchedProducts: Product[] = (data.products || []).map(
          (p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            image: p.image || "/logos/Main logo.png",
            weightRange: p.weightRange || "",
            variants: (p.variants || []).map((v: any) => ({
              id: v.id,
              weight: v.weight,
              dimensions: v.dimensions,
              width: v.width,
              height: v.height,
              diameter: v.diameter,
              description: v.description,
              purities: v.purities || [],
            })),
          })
        );
        setAllProducts(fetchedProducts);
      } else {
        console.error("Failed to fetch products");
        // Fallback to static products if API fails
        setAllProducts(products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      // Fallback to static products if API fails
      setAllProducts(products);
    } finally {
      setLoading(false);
    }
  };

  // Filter products by category only (no purity filtering for quotation page)
  useEffect(() => {
    let filtered = allProducts;

    // Filter by category only
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [allProducts, selectedCategory]);

  const handleCategoryClick = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);

    setTimeout(() => {
      const productsSection = document.getElementById("products-section");
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }, []);

  const addToQuote = useCallback((product: Product) => {
    setQuoteItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.product.id === product.id
      );
      if (existingItem) {
        return prevItems;
      }
      return [...prevItems, { product, quantity: 1 }];
    });
  }, []);

  const selectAllFiltered = useCallback(() => {
    const newItems = filteredProducts.filter(
      (product) => !quoteItems.some((item) => item.product.id === product.id)
    );

    if (newItems.length > 0) {
      setQuoteItems((prevItems) => [
        ...prevItems,
        ...newItems.map((product) => ({ product, quantity: 1 })),
      ]);
    }
  }, [filteredProducts, quoteItems]);

  const deselectAllFiltered = useCallback(() => {
    const filteredProductIds = filteredProducts.map((p) => p.id);
    setQuoteItems((prevItems) =>
      prevItems.filter((item) => !filteredProductIds.includes(item.product.id))
    );
  }, [filteredProducts]);

  const allFilteredSelected = filteredProducts.every((product) =>
    quoteItems.some((item) => item.product.id === product.id)
  );

  const anyFilteredSelected = filteredProducts.some((product) =>
    quoteItems.some((item) => item.product.id === product.id)
  );

  const uniqueProductCount = quoteItems.length;

  const removeItem = useCallback((productId: string) => {
    setQuoteItems((prevItems) =>
      prevItems.filter((item) => item.product.id !== productId)
    );
  }, []);

  const submitQuote = async (quoteData: any) => {
    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quoteData),
      });

      if (response.ok) {
        setShowQuoteForm(false);
        setShowConfirmation(true);
        setTimeout(() => {
          const confetti = document.createElement("div");
          confetti.className = "confetti-explosion";
          document.body.appendChild(confetti);
          setTimeout(() => confetti.remove(), 3000);
        }, 100);
      } else {
        alert("Failed to submit quote request. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting quote:", error);
      alert("Failed to submit quote request. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const quoteData = {
      name: formData.yourName,
      email: formData.email,
      phone: formData.phone,
      businessName: formData.businessName,
      designation: formData.designation,
      gstin: formData.gstin,
      items: quoteItems.map((item) => ({
        productName: item.product.name,
        quantity: item.quantity,
        category: item.product.category,
        purity: selectedPurity,
      })),
    };

    await submitQuote(quoteData);
  };

  const handleGetQuote = () => {
    if (session?.user) {
      // User is logged in, submit directly without form
      const quoteData = {
        name: session.user.name || "",
        email: session.user.email || "",
        phone: null,
        businessName: session.user.companyName || null,
        designation: null,
        gstin: session.user.gstNo || null,
        items: quoteItems.map((item) => ({
          productName: item.product.name,
          quantity: item.quantity,
          category: item.product.category,
          purity: selectedPurity,
        })),
      };
      submitQuote(quoteData);
    } else {
      // User is not logged in, show form
      setShowQuoteForm(true);
    }
  };

  const categoriesWithAll = [
    { id: "all", name: "All Categories", image: null },
    ...categories,
  ];

  return (
    <div className="bg-[#FAF9F7] min-h-screen">
      <BackButton onNavigate={handleNavigate} />

      <section
        id="quote-hero"
        className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-14 md:pb-16 px-4 sm:px-6 bg-[#FDFBF7] border-b border-[#EDEAE2]"
      >
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-[#1C1C1C] leading-tight">
              Silver Crafts
              <sup
                className="text-xs ml-0.5"
                style={{ fontSize: "0.4em", verticalAlign: "super" }}
              >
                ™
              </sup>
            </h1>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal text-[#1C1C1C] leading-snug">
              Your quotation request list is a few clicks away
            </h2>

            <div className="flex flex-col gap-2.5 sm:gap-3 py-3 sm:py-4">
              {QUOTE_STEPS.map((milestone, index) => (
                <div key={index} className="flex items-start gap-2 sm:gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#a8bba3] text-white flex items-center justify-center font-medium text-xs flex-shrink-0">
                      {milestone.step}
                    </div>
                    {index < 2 && (
                      <div className="w-0.5 h-5 sm:h-6 bg-[#E8E4DA] mt-1"></div>
                    )}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <h3 className="text-xs sm:text-sm font-medium text-[#1C1C1C] mb-0.5">
                      {milestone.title}
                    </h3>
                    <p className="text-xs text-[#5A5A5A] leading-relaxed">
                      {milestone.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-64 sm:h-80 md:h-96 lg:h-[420px] rounded-xl sm:rounded-2xl overflow-hidden border border-[#E8E4DA] bg-white">
            <img
              src="/albums/Second page.jpg"
              alt="Silver manufacturing"
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        </div>
      </section>

      <section
        id="categories-section"
        className="py-10 sm:py-12 md:py-14 px-4 sm:px-6 bg-[#FAF9F7] border-b border-[#EDEAE2]"
      >
        <div className="max-w-7xl mx-auto">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-light text-center text-[#1C1C1C] mb-8 sm:mb-9 md:mb-10 px-4">
            Select Category
          </h3>

          <div
            className="relative"
            style={{ position: "relative", minHeight: "200px" }}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                const carousel = categoryCarouselRef.current;
                if (carousel) {
                  carousel.scrollBy({
                    left: -CAROUSEL_CONFIG.scrollAmount,
                    behavior: "smooth",
                  });
                }
              }}
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 border-2 border-[#a8bba3] rounded-full p-2 sm:p-2.5 md:p-3 shadow-xl transition-all duration-300 hover:scale-110 cursor-pointer"
              aria-label="Scroll categories left"
              type="button"
            >
              <ChevronLeft className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#a8bba3]" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                const carousel = categoryCarouselRef.current;
                if (carousel) {
                  carousel.scrollBy({
                    left: CAROUSEL_CONFIG.scrollAmount,
                    behavior: "smooth",
                  });
                }
              }}
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 border-2 border-[#a8bba3] rounded-full p-2 sm:p-2.5 md:p-3 shadow-xl transition-all duration-300 hover:scale-110 cursor-pointer"
              aria-label="Scroll categories right"
              type="button"
            >
              <ChevronRight className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#a8bba3]" />
            </button>

            <div className="overflow-hidden">
              <div
                ref={categoryCarouselRef}
                className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide px-10 sm:px-11 md:px-12"
                style={{
                  scrollBehavior: "smooth",
                  position: "relative",
                  zIndex: 1,
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {categoriesWithAll.map((category, index) => {
                  const isSelected = selectedCategory === category.id;
                  return (
                    <button
                      key={`${category.id}-${index}`}
                      type="button"
                      onClick={() => handleCategoryClick(category.id)}
                      className={`group relative flex-shrink-0 w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48 rounded-lg sm:rounded-xl overflow-hidden border-2 ${
                        isSelected
                          ? "border-[#a8bba3] bg-[#F3F7F1] shadow-lg"
                          : "border-[#E8E4DA] bg-white"
                      } transition-all duration-300 cursor-pointer hover:shadow-lg min-h-[44px]`}
                      aria-label={`Select ${category.name} category`}
                    >
                      {category.image ? (
                        <>
                          <img
                            src={category.image}
                            alt={category.name}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent) {
                                parent.style.backgroundColor = "#F5F5F5";
                              }
                            }}
                          />
                          <div className="absolute inset-x-2 sm:inset-x-3 bottom-1 sm:bottom-1.5 rounded-full bg-white/90 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-[#1C1C1C] tracking-wide shadow-sm">
                            {category.name}
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#C06014]/10 to-[#C06014]/5">
                          <span className="text-xs sm:text-sm font-medium text-[#a8bba3] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border-2 border-[#a8bba3] bg-white">
                            All
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="products-section"
        className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 sm:mb-10 md:mb-12 px-4">
            {/* Title Section */}
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-normal text-[#1C1C1C] mb-2">
                {selectedCategory === "all"
                  ? "All Products"
                  : categories.find((c) => c.id === selectedCategory)?.name ||
                    "Products"}
              </h2>
              <p className="text-sm sm:text-base text-[#5A5A5A]">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "product" : "products"}{" "}
                available
              </p>
            </div>

            {/* Controls Section - Left: Purity, Right: Action buttons */}
            {filteredProducts.length > 0 && (
              <div className="flex items-center justify-between gap-3 flex-wrap">
                {/* Left Side: Purity Label and Toggle */}
                <div className="flex flex-col items-start gap-1">
                  <span className="text-xs sm:text-sm text-[#6F6F6F] font-medium">
                    Purity
                  </span>
                  <div className="flex items-center gap-0 bg-white border border-[#E8E4DA] rounded-full px-1 min-h-[44px]">
                    <button
                      onClick={() => setSelectedPurity("80")}
                      className={`px-3 sm:px-5 py-2.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 h-full flex items-center justify-center ${
                        selectedPurity === "80"
                          ? "bg-[#a8bba3] text-white"
                          : "text-[#6F6F6F] hover:bg-gray-100"
                      }`}
                    >
                      80%
                    </button>
                    <button
                      onClick={() => setSelectedPurity("92.5")}
                      className={`px-3 sm:px-5 py-2.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 h-full flex items-center justify-center ${
                        selectedPurity === "92.5"
                          ? "bg-[#a8bba3] text-white"
                          : "text-[#6F6F6F] hover:bg-gray-100"
                      }`}
                    >
                      92.5%
                    </button>
                  </div>
                  {/* Note for 92.5% purity - positioned below without affecting toggle */}
                  {selectedPurity === "92.5" && (
                    <div className="mt-2 bg-[#F5EFE6] rounded-lg px-3 py-2 max-w-xs">
                      <p className="text-xs sm:text-sm text-[#5A5A5A] leading-relaxed">
                        <span className="font-medium">Note:</span> 80% purity items are available from ready stock. 92.5% purity is made to order and requires additional production time.
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Side: Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <button
                    onClick={selectAllFiltered}
                    disabled={allFilteredSelected}
                    className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm font-medium transition-all duration-300 min-h-[44px] inline-flex items-center gap-2 ${
                      allFilteredSelected
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-[#a8bba3] text-white hover:bg-[#93a991] hover:shadow-lg"
                    }`}
                  >
                    {allFilteredSelected ? (
                      <>
                        <span className="text-lg">✓</span>
                        All Selected
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Select All
                      </>
                    )}
                  </button>

                  {anyFilteredSelected && (
                    <button
                      onClick={deselectAllFiltered}
                      className="px-5 sm:px-6 py-2.5 sm:py-3 border-2 border-[#a8bba3] text-[#a8bba3] rounded-full text-sm font-medium transition-all duration-300 hover:bg-[#a8bba3] hover:text-white min-h-[44px] inline-flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Deselect All
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 sm:py-16 md:py-20 px-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a8bba3]"></div>
              </div>
              <p className="text-sm sm:text-base text-[#5A5A5A]">
                Loading products...
              </p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {filteredProducts.map((product) => {
                // Check if product is already in quote
                const isInQuote = quoteItems.some((item) => item.product.id === product.id);
                
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg sm:rounded-xl overflow-hidden border-2 border-[#E8E4DA] hover:border-[#a8bba3] hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="relative h-48 sm:h-52 md:h-56 overflow-hidden bg-gradient-to-br from-[#FDFBF7] to-[#F5F5F5] flex items-center justify-center p-3 sm:p-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 max-w-full"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/logos/Main logo.png";
                          target.className =
                            "w-full h-full object-contain opacity-30";
                        }}
                      />
                    </div>
                    <div className="p-4 sm:p-5">
                      <h3 className="text-sm sm:text-base font-normal text-[#1C1C1C] mb-3 min-h-[40px] sm:min-h-[48px] text-center">
                        {product.name}
                      </h3>
                      <div className="relative">
                        <button
                          onClick={() => addToQuote(product)}
                          disabled={isInQuote}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 min-h-[44px] ${
                            isInQuote
                              ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                              : "bg-[#a8bba3] text-white hover:bg-[#93a991] hover:shadow-lg"
                          }`}
                        >
                          {isInQuote ? (
                            <>
                              <span className="text-base">✓</span>
                              Added
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              Add to Quote
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16 md:py-20 px-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-[#a8bba3] opacity-40" />
              </div>
              <h3 className="text-lg sm:text-xl font-normal text-[#1C1C1C] mb-2">
                No Products Available
              </h3>
              <p className="text-sm sm:text-base text-[#5A5A5A] mb-4 sm:mb-6">
                No products found in this category.
              </p>
              <button
                onClick={() => handleCategoryClick("all")}
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-[#a8bba3] text-white rounded-full text-sm font-medium hover:bg-[#93a991] transition-colors min-h-[44px]"
              >
                View All Products
              </button>
            </div>
          )}
        </div>
      </section>

      {quoteItems.length > 0 && (
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="fixed right-3 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-40 bg-[#a8bba3] text-white px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 rounded-l-xl sm:rounded-l-2xl shadow-lg hover:bg-[#93a991] transition-colors duration-300 flex flex-col items-center gap-1.5 sm:gap-2 min-w-[80px] sm:min-w-[90px] md:min-w-[100px]"
        >
          <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
          <div className="text-center">
            <p className="text-xs font-medium">{uniqueProductCount}</p>
            <p className="text-[10px] sm:text-xs opacity-90">Products</p>
          </div>
        </button>
      )}

      {showSidebar && (
        <div
          className="fixed inset-0 bg-[#1A1A1A]/50 z-40"
          onClick={() => setShowSidebar(false)}
        ></div>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[90vw] md:w-[450px] bg-white border-l border-[#E8E4DA] z-50 transform transition-transform duration-300 ${
          showSidebar ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 sm:p-5 md:p-6 border-b border-[#E8E4DA] flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-[#a8bba3]" />
              <h3 className="text-lg sm:text-xl font-normal text-[#1C1C1C]">
                Quote Summary
              </h3>
            </div>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-[#6F6F6F] hover:text-[#1A1A1A] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 bg-[#FDFBF7]">
            {quoteItems.length === 0 ? (
              <div className="text-center py-12 text-[#86837D]">
                <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-40" />
                <p className="text-sm sm:text-base">Your quote is empty</p>
              </div>
            ) : (
              quoteItems.map((item) => (
                <div
                  key={item.product.id}
                  className="relative flex gap-3 sm:gap-4 p-3 sm:p-4 bg-white border border-[#E8E4DA] rounded-lg sm:rounded-xl"
                >
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="absolute top-2 right-2 text-[#A7A29A] hover:text-[#a8bba3] transition-colors z-10 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 pr-8">
                    <h4 className="font-normal text-[#1A1A1A] text-sm sm:text-base mb-1">
                      {item.product.name}
                    </h4>
                  </div>
                </div>
              ))
            )}
          </div>

          {quoteItems.length > 0 && (
            <div className="p-4 sm:p-5 md:p-6 border-t border-[#E8E4DA] bg-white">
              <div className="mb-4 space-y-2">
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-[#86837D] mb-1">
                    Total Products
                  </p>
                  <p className="text-lg sm:text-xl font-normal text-[#1C1C1C]">
                    {uniqueProductCount}
                  </p>
                </div>
              </div>
              <button
                onClick={handleGetQuote}
                className="w-full px-5 sm:px-6 py-3 bg-[#a8bba3] text-white rounded-full text-sm font-medium transition-colors duration-300 hover:bg-[#93a991] min-h-[44px]"
              >
                Get Quote
              </button>
            </div>
          )}
        </div>
      </div>

      {showQuoteForm && (
        <div className="fixed inset-0 bg-[#1A1A1A]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 max-w-md w-full relative animate-scale-in border border-[#E8E4DA] shadow-lg max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowQuoteForm(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-[#A7A29A] hover:text-[#1C1C1C] min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <h3 className="text-xl sm:text-2xl md:text-3xl font-light text-[#1C1C1C] mb-5 sm:mb-6 pr-8">
              Add business details
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-1.5 sm:mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData({ ...formData, businessName: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E8E4DA] rounded-lg focus:outline-none focus:border-[#a8bba3] transition-colors text-sm sm:text-base"
                  placeholder="Your business name"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-1.5 sm:mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.yourName}
                  onChange={(e) =>
                    setFormData({ ...formData, yourName: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E8E4DA] rounded-lg focus:outline-none focus:border-[#a8bba3] transition-colors text-sm sm:text-base"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-1.5 sm:mb-2">
                  Your Designation *
                </label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E8E4DA] rounded-lg focus:outline-none focus:border-[#a8bba3] transition-colors text sm sm:text-base"
                  placeholder="e.g. Owner, Manager, Buyer"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-1.5 sm:mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E8E4DA] rounded-lg focus:outline-none focus:border-[#a8bba3] transition-colors text-sm sm:text-base"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-1.5 sm:mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E8E4DA] rounded-lg focus:outline-none focus:border-[#a8bba3] transition-colors text-sm sm:text-base"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#1A1A1A] mb-1.5 sm:mb-2">
                  GSTIN (Optional)
                </label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) =>
                    setFormData({ ...formData, gstin: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E8E4DA] rounded-lg focus:outline-none focus:border-[#a8bba3] transition-colors text-sm sm:text-base"
                  placeholder="GST Number"
                />
              </div>

              <button
                type="submit"
                className="w-full px-5 sm:px-6 py-3 bg-[#a8bba3] text-white rounded-full text-sm font-medium transition-colors duration-300 hover:bg-[#93a991] mt-4 sm:mt-6 min-h-[44px]"
              >
                Submit Quote Request
              </button>
            </form>
          </div>
        </div>
      )}

      {showConfirmation && (
        <div className="fixed inset-0 bg-[#1A1A1A]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 max-w-lg w-full text-center relative animate-scale-in border border-[#E8E4DA] shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#a8bba3]/12 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-[#a8bba3]" />
            </div>

            <h3 className="text-xl sm:text-2xl font-normal text-[#1C1C1C] mb-3 sm:mb-4 px-2">
              Your quotation has been received successfully!
            </h3>

            <p className="text-sm sm:text-base text-[#5A5A5A] mb-2 sm:mb-3 px-2">
              Our team will review and contact you within 48 hours.
            </p>

            <p className="text-xs sm:text-sm text-[#86837D] mb-6 sm:mb-8 px-2">
              Once approved, you'll receive your login credentials to manage
              future orders.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setQuoteItems([]);
                  setShowSidebar(false);
                  handleNavigate("home");
                }}
                className="flex-1 px-5 sm:px-6 py-3 bg-[#a8bba3] text-white rounded-full text-sm font-medium transition-colors duration-300 hover:bg-[#93a991] min-h-[44px]"
              >
                Back to Home
              </button>
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setQuoteItems([]);
                  setShowSidebar(false);
                }}
                className="flex-1 px-5 sm:px-6 py-3 border border-[#a8bba3] text-[#a8bba3] rounded-full text-sm font-medium transition-colors duration-300 hover:bg-[#a8bba3]/5 min-h-[44px]"
              >
                Explore More Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
