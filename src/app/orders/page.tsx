"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  X,
  ShoppingCart,
  Sparkles,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowUp,
} from "lucide-react";
import { categories } from "@/data/products";
import { QUOTE_STEPS, CAROUSEL_CONFIG } from "@/config/constants";

interface ProductVariant {
  id: string;
  weight: string;
  dimensions?: string;
  width?: string;
  height?: string;
  diameter?: string;
  description?: string;
  purities: string[];
}

interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  images?: string[];
  weightRange?: string;
  variants?: ProductVariant[];
}

interface OrderItem {
  product: Product;
  variant: ProductVariant;
  purity: string; // Store the specific purity for this item
  quantity: number;
}

// Expanded variant interface for display (one per purity)
interface ExpandedVariant {
  baseVariant: ProductVariant;
  purity: string;
  key: string; // Composite key: variantId-purity
}

export default function OrdersPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // State Management
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPurity, setSelectedPurity] = useState<string>("80");
  const categoryCarouselRef = useRef<HTMLDivElement>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [variantQuantities, setVariantQuantities] = useState<{
    [key: string]: number;
  }>({});
  const hasFetchedRef = useRef(false);
  const [formData, setFormData] = useState({
    businessName: "",
    yourName: "",
    designation: "",
    phone: "",
    email: "",
    gstin: "",
  });

  const handleNavigate = (page: "home" | "quote" | "order") => {
    if (page === "home") {
      router.push("/");
    } else if (page === "quote") {
      router.push("/quotation");
    } else {
      router.push("/orders");
    }
  };

  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (session === null) {
      // Session is loaded but user is not authenticated
      router.push(`/auth?callbackUrl=${encodeURIComponent("/orders")}`);
    }
  }, [session, router]);

  useEffect(() => {
    // Only fetch products once when user is authenticated
    if (session?.user && !hasFetchedRef.current && allProducts.length === 0) {
      hasFetchedRef.current = true;
      fetchProducts();
    }
  }, [session?.user?.id]); // Only depend on user ID

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Filter products by category and purity
  useEffect(() => {
    let filtered = allProducts;

    // Filter by category
    if (selectedCategory !== "all") {
      const categoryName = normalizeCategory(selectedCategory);
      filtered = filtered.filter((p) => p.category === categoryName);
    }

    // Filter by purity - only show products that have variants with the selected purity
    filtered = filtered.filter((product) => {
      if (product.variants && Array.isArray(product.variants)) {
        return product.variants.some((variant) => {
          if (variant.purities && Array.isArray(variant.purities)) {
            return variant.purities.includes(selectedPurity);
          }
          return false;
        });
      }
      // If no variants, don't show the product
      return false;
    });

    setFilteredProducts(filtered);
  }, [allProducts, selectedCategory, selectedPurity]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products", {
        cache: "no-store", // Prevent caching issues
      });
      if (response.ok) {
        const data = await response.json();
        const products: Product[] = (data.products || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          image: p.image || "/logos/Main logo.png",
          images:
            p.images && p.images.length > 0
              ? p.images
              : [p.image || "/logos/Main logo.png"],
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
        }));
        setAllProducts(products);
      } else {
        console.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies - function is stable

  // Helper function to normalize category names
  const normalizeCategory = (categoryName: string): string => {
    const categoryMap: { [key: string]: string } = {
      vessels: "Vessels",
      lamps: "Lamps",
      coins: "Coins & Bars",
      bowl: "Bowl",
      boxes: "Boxes",
      chombu: "Chombu",
      cups: "Cups",
      glass: "Glass",
      kamakshi: "Kamakshi",
      kodam: "Kodam",
      others: "Others",
      panchapathram: "Panchapathram",
      plates: "Plates",
      simil: "Simil",
      trays: "Trays",
      vel: "Vel",
    };
    return categoryMap[categoryName] || categoryName;
  };

  const handleCategoryClick = useCallback(
    (categoryId: string) => {
      setSelectedCategory(categoryId);

      if (categoryId === "all") {
        setFilteredProducts(allProducts);
      } else {
        const categoryName = normalizeCategory(categoryId);
        const filtered = allProducts.filter((p) => p.category === categoryName);
        setFilteredProducts(filtered);
      }

      setTimeout(() => {
        const productsSection = document.getElementById("products-section");
        if (productsSection) {
          productsSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    },
    [allProducts]
  );

  // Helper function to expand variants by purity, filtered by selected purity
  const expandVariantsByPurity = useCallback(
    (variants: ProductVariant[]): ExpandedVariant[] => {
      const expanded: ExpandedVariant[] = [];
      variants.forEach((variant) => {
        if (variant.purities && variant.purities.length > 0) {
          // Only include variants that have the selected purity
          if (variant.purities.includes(selectedPurity)) {
            expanded.push({
              baseVariant: variant,
              purity: selectedPurity,
              key: `${variant.id}-${selectedPurity}`,
            });
          }
        }
        // If no purities, don't show the variant (we require purity filtering)
      });
      return expanded;
    },
    [selectedPurity]
  );

  const openVariantDialog = useCallback(
    (product: Product) => {
      setSelectedProduct(product);
      setSelectedImageIndex(0); // Reset to first image
      setShowVariantDialog(true);
      // Initialize variant quantities from existing order items
      const initialQuantities: { [key: string]: number } = {};
      const expandedVariants = expandVariantsByPurity(product.variants || []);
      expandedVariants.forEach((expanded) => {
        const existing = orderItems.find(
          (item) =>
            item.product.id === product.id &&
            item.variant.id === expanded.baseVariant.id &&
            item.purity === expanded.purity
        );
        initialQuantities[expanded.key] = existing ? existing.quantity : 0;
      });
      setVariantQuantities(initialQuantities);
    },
    [orderItems, expandVariantsByPurity]
  );

  const updateVariantQuantity = useCallback(
    (variantId: string, delta: number) => {
      setVariantQuantities((prev) => {
        const current = prev[variantId] || 0;
        const newValue = Math.max(0, current + delta);
        return { ...prev, [variantId]: newValue };
      });
    },
    []
  );

  const handleQuantityChange = useCallback(
    (variantId: string, value: string) => {
      // Allow empty string for better UX while typing
      if (value === "") {
        setVariantQuantities((prev) => ({ ...prev, [variantId]: 0 }));
        return;
      }
      // Only allow positive integers
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 0) {
        setVariantQuantities((prev) => ({ ...prev, [variantId]: numValue }));
      }
    },
    []
  );

  const addVariantsToCart = useCallback(() => {
    if (!selectedProduct) return;

    const newItems: OrderItem[] = [];
    const expandedVariants = expandVariantsByPurity(
      selectedProduct.variants || []
    );

    expandedVariants.forEach((expanded) => {
      const quantity = variantQuantities[expanded.key] || 0;
      if (quantity > 0) {
        newItems.push({
          product: selectedProduct,
          variant: expanded.baseVariant,
          purity: expanded.purity,
          quantity,
        });
      }
    });

    // Remove existing items for this product and add new ones
    const updatedItems = orderItems.filter(
      (item) => item.product.id !== selectedProduct.id
    );
    setOrderItems([...updatedItems, ...newItems]);
    setShowVariantDialog(false);
    setVariantQuantities({});
    setSelectedProduct(null);
    setSelectedImageIndex(0);
  }, [selectedProduct, variantQuantities, orderItems, expandVariantsByPurity]);

  const uniqueProductCount = orderItems.length;

  const removeItem = useCallback(
    (productId: string, variantId: string, purity: string) => {
      setOrderItems((prevItems) =>
        prevItems.filter(
          (item) =>
            !(
              item.product.id === productId &&
              item.variant.id === variantId &&
              item.purity === purity
            )
        )
      );
    },
    []
  );

  const submitOrder = async (orderData: any) => {
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        setShowOrderForm(false);
        setShowConfirmation(true);
        setTimeout(() => {
          const confetti = document.createElement("div");
          confetti.className = "confetti-explosion";
          document.body.appendChild(confetti);
          setTimeout(() => confetti.remove(), 3000);
        }, 100);
      } else {
        alert("Failed to submit order request. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Failed to submit order request. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const orderData = {
      name: formData.yourName,
      email: formData.email,
      phone: formData.phone,
      businessName: formData.businessName,
      designation: formData.designation,
      gstin: formData.gstin,
      items: orderItems.map((item) => ({
        productId: item.product.id,
        variantId: item.variant.id,
        productName: item.product.name,
        variantDetails: {
          weight: item.variant.weight,
          dimensions: item.variant.dimensions,
          width: item.variant.width,
          height: item.variant.height,
          diameter: item.variant.diameter,
          purity: item.purity || null,
        },
        quantity: item.quantity,
        category: item.product.category,
      })),
    };

    await submitOrder(orderData);
  };

  const handlePlaceOrder = () => {
    if (session?.user) {
      // User is logged in, submit directly without form
      const orderData = {
        name: session.user.name || "",
        email: session.user.email || "",
        phone: null,
        businessName: session.user.companyName || null,
        designation: null,
        gstin: session.user.gstNo || null,
        items: orderItems.map((item) => ({
          productId: item.product.id,
          variantId: item.variant.id,
          productName: item.product.name,
          variantDetails: {
            weight: item.variant.weight,
            dimensions: item.variant.dimensions,
            width: item.variant.width,
            height: item.variant.height,
            diameter: item.variant.diameter,
            purity: item.purity || null,
          },
          quantity: item.quantity,
          category: item.product.category,
        })),
      };
      submitOrder(orderData);
    } else {
      // User is not logged in, show form
      setShowOrderForm(true);
    }
  };

  const categoriesWithAll = [
    { id: "all", name: "All Categories", image: null },
    ...categories,
  ];

  // Show loading state while checking authentication
  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a8bba3]"></div>
          </div>
          <p className="text-sm text-[#5A5A5A]">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show nothing (redirect will happen via useEffect)
  if (!session?.user) {
    return null;
  }

  return (
    <div className="bg-[#FAF9F7] min-h-screen">
      <section
        id="order-hero"
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
              Your order list is a few clicks away
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
            style={{ position: "relative", minHeight: "140px" }}
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
                      className={`group relative flex-shrink-0 w-28 h-28 sm:w-30 sm:h-30 md:w-32 md:h-32 rounded-lg sm:rounded-xl overflow-hidden border-2 ${
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
                          <div className="absolute inset-x-2 sm:inset-x-3 bottom-0.5 rounded-full bg-white/90 px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-medium text-[#1C1C1C] tracking-wide shadow-sm">
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

            {/* Controls Section - Left: Purity, Right: (empty for now, can add controls later) */}
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
                </div>

                {/* Right Side: Reserved for future controls */}
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {/* Add any additional controls here in the future */}
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
              {filteredProducts.map((product) => (
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
                    <h3 className="text-sm sm:text-base font-normal text-[#1C1C1C] mb-3 min-h-[40px] sm:min-h-[48px]">
                      {product.name}
                    </h3>
                    <button
                      onClick={() => openVariantDialog(product)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-[#a8bba3] text-white rounded-full text-xs sm:text-sm font-medium transition-all duration-300 hover:bg-[#93a991] hover:shadow-lg flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      View Options
                    </button>
                  </div>
                </div>
              ))}
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

      {orderItems.length > 0 && (
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
                Order Summary
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
            {orderItems.length === 0 ? (
              <div className="text-center py-12 text-[#86837D]">
                <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-40" />
                <p className="text-sm sm:text-base">Your order is empty</p>
              </div>
            ) : (
              orderItems.map((item) => (
                <div
                  key={`${item.product.id}-${item.variant.id}-${item.purity}`}
                  className="relative flex gap-3 sm:gap-4 p-3 sm:p-4 bg-white border border-[#E8E4DA] rounded-lg sm:rounded-xl"
                >
                  <button
                    onClick={() =>
                      removeItem(item.product.id, item.variant.id, item.purity)
                    }
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
                    <p className="text-xs text-[#6F6F6F] mb-1">
                      Weight: {item.variant.weight}
                      {item.purity && (
                        <span className="ml-1 text-[#86837D]">
                          ({item.purity}% Purity)
                        </span>
                      )}
                    </p>
                    {item.variant.dimensions && (
                      <p className="text-xs text-[#6F6F6F] mb-1">
                        {item.variant.dimensions}
                      </p>
                    )}
                    {(item.variant.width ||
                      item.variant.height ||
                      item.variant.diameter) && (
                      <div className="text-xs text-[#6F6F6F] space-y-0.5">
                        {item.variant.width && (
                          <p>Width: {item.variant.width}</p>
                        )}
                        {item.variant.height && (
                          <p>Height: {item.variant.height}</p>
                        )}
                        {item.variant.diameter && (
                          <p>Diameter: {item.variant.diameter}</p>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-[#86837D] mt-1">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {orderItems.length > 0 && (
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
                onClick={handlePlaceOrder}
                className="w-full px-5 sm:px-6 py-3 bg-[#a8bba3] text-white rounded-full text-sm font-medium transition-colors duration-300 hover:bg-[#93a991] min-h-[44px]"
              >
                Place Order
              </button>
            </div>
          )}
        </div>
      </div>

      {showOrderForm && (
        <div className="fixed inset-0 bg-[#1A1A1A]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 max-w-md w-full relative animate-scale-in border border-[#E8E4DA] shadow-lg max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowOrderForm(false)}
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
                Submit Order
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
              Your order has been received successfully!
            </h3>

            <p className="text-sm sm:text-base text-[#5A5A5A] mb-2 sm:mb-3 px-2">
              Our team will process your order and contact you soon.
            </p>

            <p className="text-xs sm:text-sm text-[#86837D] mb-6 sm:mb-8 px-2">
              You'll receive order confirmation and tracking details via email.
            </p>

            <div className="flex justify-center">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setOrderItems([]);
                  setShowSidebar(false);
                }}
                className="px-5 sm:px-6 py-3 border border-[#a8bba3] text-[#a8bba3] rounded-full text-sm font-medium transition-colors duration-300 hover:bg-[#a8bba3]/5 min-h-[44px]"
              >
                Explore More Products
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Variant Options Dialog */}
      {showVariantDialog && selectedProduct && (
        <div className="fixed inset-0 bg-[#1A1A1A]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-2xl w-full relative animate-scale-in border border-[#E8E4DA] shadow-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 md:p-6 border-b border-[#E8E4DA] flex items-center justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-normal text-[#1C1C1C]">
                  {selectedProduct.name}
                </h3>
                <p className="text-sm text-[#6F6F6F] mt-1">
                  Select variants and quantities
                </p>
              </div>
              <button
                onClick={() => {
                  setShowVariantDialog(false);
                  setVariantQuantities({});
                  setSelectedProduct(null);
                }}
                className="text-[#A7A29A] hover:text-[#1C1C1C] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6">
              {/* Product Image Carousel */}
              {selectedProduct.image && (
                <div className="mb-6">
                  {/* Main Image with Navigation */}
                  <div className="relative w-full max-w-[400px] mx-auto mb-4">
                    <div className="relative w-full h-[300px] sm:h-[400px] rounded-lg overflow-hidden bg-gray-100 border border-[#E8E4DA]">
                      <img
                        src={
                          selectedProduct.images &&
                          selectedProduct.images.length > 0
                            ? selectedProduct.images[selectedImageIndex]
                            : selectedProduct.image
                        }
                        alt={selectedProduct.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/logos/Main logo.png";
                          target.className =
                            "w-full h-full object-contain opacity-30";
                        }}
                      />

                      {/* Left/Right Arrow Buttons - Only show if more than one image */}
                      {selectedProduct.images &&
                        selectedProduct.images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImageIndex((prev) =>
                                  prev === 0
                                    ? selectedProduct.images!.length - 1
                                    : prev - 1
                                );
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border border-[#E8E4DA] rounded-full p-2 shadow-md transition-all hover:shadow-lg min-h-[44px] min-w-[44px] flex items-center justify-center z-10"
                              aria-label="Previous image"
                            >
                              <ChevronLeft className="w-5 h-5 text-[#1C1C1C]" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImageIndex((prev) =>
                                  prev === selectedProduct.images!.length - 1
                                    ? 0
                                    : prev + 1
                                );
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border border-[#E8E4DA] rounded-full p-2 shadow-md transition-all hover:shadow-lg min-h-[44px] min-w-[44px] flex items-center justify-center z-10"
                              aria-label="Next image"
                            >
                              <ChevronRight className="w-5 h-5 text-[#1C1C1C]" />
                            </button>
                          </>
                        )}
                    </div>
                  </div>

                  {/* Thumbnail Images - Only show if more than one image */}
                  {selectedProduct.images &&
                    selectedProduct.images.length > 1 && (
                      <div className="flex justify-center gap-2 overflow-x-auto pb-2 px-2">
                        {selectedProduct.images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                              selectedImageIndex === idx
                                ? "border-[#a8bba3] shadow-md"
                                : "border-[#E8E4DA] hover:border-[#a8bba3]"
                            }`}
                          >
                            <img
                              src={img}
                              alt={`${selectedProduct.name} - Image ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/logos/Main logo.png";
                                target.className =
                                  "w-full h-full object-contain opacity-30";
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              )}

              {/* Variants List */}
              <div className="space-y-4">
                {expandVariantsByPurity(selectedProduct.variants || []).map(
                  (expanded) => {
                    const variant = expanded.baseVariant;
                    return (
                      <div
                        key={expanded.key}
                        className="border border-[#E8E4DA] rounded-lg p-4 bg-white"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-[#1C1C1C] text-sm sm:text-base">
                              {variant.weight}
                            </p>
                            {/* Dimensions */}
                            {(variant.width ||
                              variant.height ||
                              variant.diameter) && (
                              <div className="mt-1 text-xs sm:text-sm text-[#6F6F6F] space-y-0.5">
                                {variant.width && (
                                  <p>
                                    Width:{" "}
                                    <span className="font-medium">
                                      {variant.width}
                                    </span>
                                  </p>
                                )}
                                {variant.height && (
                                  <p>
                                    Height:{" "}
                                    <span className="font-medium">
                                      {variant.height}
                                    </span>
                                  </p>
                                )}
                                {variant.diameter && (
                                  <p>
                                    Diameter:{" "}
                                    <span className="font-medium">
                                      {variant.diameter}
                                    </span>
                                  </p>
                                )}
                              </div>
                            )}
                            {variant.dimensions && (
                              <p className="text-xs text-[#6F6F6F] mt-1">
                                {variant.dimensions}
                              </p>
                            )}
                            {variant.description && (
                              <p className="text-xs sm:text-sm text-[#6F6F6F] mt-1">
                                {variant.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            <button
                              onClick={() =>
                                updateVariantQuantity(expanded.key, -1)
                              }
                              className="w-8 h-8 rounded-full border-2 border-[#a8bba3] text-[#a8bba3] flex items-center justify-center hover:bg-[#a8bba3] hover:text-white transition-colors min-h-[44px] min-w-[44px]"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={variantQuantities[expanded.key] || 0}
                              onChange={(e) =>
                                handleQuantityChange(
                                  expanded.key,
                                  e.target.value
                                )
                              }
                              onBlur={(e) => {
                                // Ensure value is at least 0 on blur
                                const value = parseInt(e.target.value, 10);
                                if (isNaN(value) || value < 0) {
                                  setVariantQuantities((prev) => ({
                                    ...prev,
                                    [expanded.key]: 0,
                                  }));
                                }
                              }}
                              className="w-16 text-center font-semibold text-[#1C1C1C] text-sm sm:text-base border border-[#E8E4DA] rounded-lg px-2 py-1 focus:outline-none focus:border-[#a8bba3] focus:ring-1 focus:ring-[#a8bba3] min-h-[44px]"
                            />
                            <button
                              onClick={() =>
                                updateVariantQuantity(expanded.key, 1)
                              }
                              className="w-8 h-8 rounded-full border-2 border-[#a8bba3] text-[#a8bba3] flex items-center justify-center hover:bg-[#a8bba3] hover:text-white transition-colors min-h-[44px] min-w-[44px]"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            <div className="p-4 sm:p-5 md:p-6 border-t border-[#E8E4DA] flex gap-3 sm:gap-4 bg-white">
              <button
                onClick={() => {
                  setShowVariantDialog(false);
                  setVariantQuantities({});
                  setSelectedProduct(null);
                }}
                className="flex-1 px-5 sm:px-6 py-3 border-2 border-[#E8E4DA] text-[#1C1C1C] rounded-full text-sm font-medium transition-colors duration-300 hover:bg-[#F5F5F5] min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={addVariantsToCart}
                className="flex-1 px-5 sm:px-6 py-3 bg-[#a8bba3] text-white rounded-full text-sm font-medium transition-colors duration-300 hover:bg-[#93a991] min-h-[44px]"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-[#a8bba3] text-white p-3 rounded-full shadow-lg hover:bg-[#93a991] transition-all duration-300 hover:scale-110 flex items-center justify-center min-h-[44px] min-w-[44px]"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
